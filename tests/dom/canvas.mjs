/**
 * Gives a jsdom window a real canvas implementation (backed by
 * @napi-rs/canvas) plus the blob/Image plumbing the browser provides, so the
 * file-processing tools can be driven end to end in tests.
 */
import {
  createCanvas,
  loadImage,
  Path2D as NapiPath2D,
  DOMMatrix as NapiDOMMatrix,
  ImageData as NapiImageData,
} from '@napi-rs/canvas';

const blobUrls = new Map();
let counter = 0;

function normaliseType(type = 'image/png') {
  if (type.includes('jpeg') || type.includes('jpg')) return 'image/jpeg';
  if (type.includes('webp')) return 'image/webp';
  return 'image/png';
}

function qualityFor(quality) {
  if (quality === undefined || quality === null) return undefined;
  // @napi-rs/canvas expects 1–100.
  return Math.max(1, Math.min(100, Math.round(Number(quality) * 100)));
}

class NodeImage {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.naturalWidth = 0;
    this.naturalHeight = 0;
    this.width = 0;
    this.height = 0;
    this._src = '';
  }

  set src(value) {
    this._src = value;
    void this._load(value);
  }

  get src() {
    return this._src;
  }

  async _load(value) {
    try {
      let source = value;
      if (value.startsWith('blob:')) {
        const blob = blobUrls.get(value);
        if (!blob) throw new Error('Unknown blob URL');
        source = Buffer.from(await blob.arrayBuffer());
      }
      const image = await loadImage(source);
      this.naturalWidth = image.width;
      this.naturalHeight = image.height;
      this.width = image.width;
      this.height = image.height;
      this._image = image;
      if (this.onload) this.onload();
    } catch (error) {
      if (this.onerror) this.onerror(error);
    }
  }
}

export function installCanvas(window) {
  const CanvasElement = window.HTMLCanvasElement;

  function backendFor(element) {
    const width = Number(element.width) || 300;
    const height = Number(element.height) || 150;
    if (!element._napiCanvas) {
      element._napiCanvas = createCanvas(width, height);
      const context = element._napiCanvas.getContext('2d');
      const originalDrawImage = context.drawImage.bind(context);
      context.drawImage = (image, ...args) =>
        originalDrawImage(image instanceof NodeImage ? image._image : image, ...args);
    } else if (element._napiCanvas.width !== width || element._napiCanvas.height !== height) {
      element._napiCanvas.width = width;
      element._napiCanvas.height = height;
      const context = element._napiCanvas.getContext('2d');
      if (!context._drawImagePatched) {
        const originalDrawImage = context.drawImage.bind(context);
        context.drawImage = (image, ...args) =>
          originalDrawImage(image instanceof NodeImage ? image._image : image, ...args);
        context._drawImagePatched = true;
      }
    }
    return element._napiCanvas;
  }

  CanvasElement.prototype.getContext = function getContext(type) {
    if (type !== '2d') return null;
    return backendFor(this).getContext('2d');
  };

  CanvasElement.prototype.toDataURL = function toDataURL(type, quality) {
    const mime = normaliseType(type);
    const q = qualityFor(quality);
    const buffer = backendFor(this).toBuffer(mime, q);
    return `data:${mime};base64,${buffer.toString('base64')}`;
  };

  CanvasElement.prototype.toBlob = function toBlob(callback, type, quality) {
    try {
      const mime = normaliseType(type);
      const q = qualityFor(quality);
      const buffer = backendFor(this).toBuffer(mime, q);
      const blob = new window.Blob([buffer], { type: mime });
      blobUrls.set(`blob:canvas/${(counter += 1)}`, blob);
      callback(blob);
    } catch {
      callback(null);
    }
  };

  // jsdom does not implement CapturedSurfaceControl/OffscreenCanvas; provide the
  // pieces the libraries actually touch.
  if (!window.OffscreenCanvas) {
    window.OffscreenCanvas = class OffscreenCanvas {
      constructor(width, height) {
        const canvas = createCanvas(width, height);
        canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this._napiCanvas = canvas;
      }

      getContext(type) {
        return type === '2d' ? this._napiCanvas.getContext('2d') : null;
      }

      convertToBlob() {
        return Promise.resolve(
          new window.Blob([this._napiCanvas.toBuffer('image/png')], { type: 'image/png' })
        );
      }
    };
  }

  window.Image = NodeImage;
  window.HTMLImageElement = NodeImage;

  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = (blob) => {
      counter += 1;
      const url = `blob:jsdom/${counter}`;
      blobUrls.set(url, blob);
      return url;
    };
    window.URL.revokeObjectURL = (url) => {
      blobUrls.delete(url);
    };
  }

  window.Path2D = window.Path2D ?? NapiPath2D;
  window.DOMMatrix = window.DOMMatrix ?? NapiDOMMatrix;
  window.ImageData = window.ImageData ?? NapiImageData;

  // The bundled library code resolves these from the global scope, so keep the
  // globals in step with the jsdom window.
  globalThis.Image = NodeImage;
  globalThis.Path2D = window.Path2D;
  globalThis.DOMMatrix = window.DOMMatrix;
  globalThis.ImageData = window.ImageData;
  if (window.OffscreenCanvas) globalThis.OffscreenCanvas = window.OffscreenCanvas;

  return { blobUrls };
}

/** Builds a real PNG/JPEG/WEBP File from scratch for upload tests. */
export async function makeImageFile({
  name = 'sample.png',
  width = 240,
  height = 180,
  type = 'image/png',
  quality,
  draw,
} = {}) {
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');

  // A photo-like image: smooth gradients plus deterministic noise, so lossy
  // re-compression actually has something to throw away.
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#ff3a5e');
  gradient.addColorStop(1, '#8b5cf6');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  let seed = 42;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const shade = Math.floor(random() * 90);
      context.fillStyle = `rgba(${shade}, ${shade}, ${shade + 60}, 0.35)`;
      context.fillRect(x, y, 2, 2);
    }
  }
  context.fillStyle = '#ffffff';
  context.fillRect(width / 2 - 30, height / 2 - 30, 60, 60);
  if (draw) draw(context, canvas);
  const mime = normaliseType(type);
  const buffer = canvas.toBuffer(mime, qualityFor(quality));
  return new File([buffer], name, { type: mime });
}

/** Builds a real in-memory File from bytes. */
export function makeFile(name, bytes, type) {
  return new File([bytes], name, { type });
}
