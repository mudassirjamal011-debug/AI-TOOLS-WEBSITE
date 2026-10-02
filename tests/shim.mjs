/**
 * Minimal browser shims so the client-side processing libraries can be
 * exercised in Node with a real canvas implementation (@napi-rs/canvas).
 *
 * This is a test-only file: nothing here ships to the browser.
 */
import { createCanvas, loadImage, Path2D as NapiPath2D, ImageData as NapiImageData, DOMMatrix as NapiDOMMatrix } from '@napi-rs/canvas';

const blobUrls = new Map();
let counter = 0;

function mimeFromType(type = 'image/png') {
  if (type.includes('jpeg') || type.includes('jpg')) return 'image/jpeg';
  if (type.includes('webp')) return 'image/webp';
  return 'image/png';
}

function decorate(canvas) {
  const originalToBuffer = canvas.toBuffer.bind(canvas);

  // Unwrap our Image shim so @napi-rs/canvas receives a real image object.
  const context = canvas.getContext('2d');
  const originalDrawImage = context.drawImage.bind(context);
  context.drawImage = (image, ...args) =>
    originalDrawImage(image instanceof NodeImage ? image._image : image, ...args);

  canvas.toBlob = (callback, type = 'image/png', quality = 0.92) => {
    try {
      const mime = mimeFromType(type);
      // @napi-rs/canvas expects quality as a number between 1 and 100.
      const q = Math.max(1, Math.min(100, Math.round(Number(quality) * 100)));
      const buffer = originalToBuffer(mime, q);
      callback(new Blob([buffer], { type: mime }));
    } catch (error) {
      callback(null);
    }
  };

  canvas.toDataURL = (type = 'image/png', quality = 0.92) => {
    const mime = mimeFromType(type);
    const q = Math.max(1, Math.min(100, Math.round(Number(quality) * 100)));
    return `data:${mime};base64,${originalToBuffer(mime, q).toString('base64')}`;
  };

  return canvas;
}

class NodeImage {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.naturalWidth = 0;
    this.naturalHeight = 0;
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
      this._image = image;
      if (this.onload) this.onload();
    } catch (error) {
      if (this.onerror) this.onerror(error);
    }
  }
}

export function installBrowserShims() {
  if (globalThis.document) return;

  globalThis.document = {
    createElement(tagName) {
      if (tagName !== 'canvas') throw new Error(`Unsupported element: ${tagName}`);
      return decorate(createCanvas(1, 1));
    },
    body: { appendChild() {}, removeChild() {} },
  };

  globalThis.Image = NodeImage;
  globalThis.HTMLCanvasElement = Object;

  globalThis.URL.createObjectURL = (blob) => {
    counter += 1;
    const url = `blob:node/${counter}`;
    blobUrls.set(url, blob);
    return url;
  };
  globalThis.URL.revokeObjectURL = (url) => {
    blobUrls.delete(url);
  };

  if (typeof globalThis.FileReader === 'undefined') {
    globalThis.FileReader = class FileReader {
      constructor() {
        this.onload = null;
        this.onerror = null;
        this.result = null;
      }
      readAsDataURL(blob) {
        blob
          .arrayBuffer()
          .then((buffer) => {
            this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(
              buffer
            ).toString('base64')}`;
            if (this.onload) this.onload();
          })
          .catch(() => {
            if (this.onerror) this.onerror();
          });
      }
    };
  }

  if (typeof globalThis.performance === 'undefined') {
    globalThis.performance = { now: () => Number(process.hrtime.bigint() / 1000n) / 1000 };
  }

  // pdf.js expects these to exist in a browser-like environment.
  if (typeof globalThis.DOMMatrix === 'undefined') {
    globalThis.DOMMatrix = NapiDOMMatrix;
  }
  if (typeof globalThis.Path2D === 'undefined') {
    globalThis.Path2D = NapiPath2D;
  }
  if (typeof globalThis.ImageData === 'undefined') {
    globalThis.ImageData = NapiImageData;
  }
  if (typeof globalThis.DOMPoint === 'undefined') {
    globalThis.DOMPoint = class DOMPoint {};
  }
}

export { createCanvas, loadImage };
