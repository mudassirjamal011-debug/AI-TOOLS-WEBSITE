/**
 * Browser-side image processing built on the HTML5 canvas API.
 * Everything runs locally — no uploads, no server round-trips.
 */

export type ImageMime = 'image/jpeg' | 'image/png' | 'image/webp';

export interface LoadedImage {
  element: HTMLImageElement;
  width: number;
  height: number;
  url: string;
}

export async function loadImage(file: Blob): Promise<LoadedImage> {
  const url = URL.createObjectURL(file);
  try {
    const element = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('That file could not be read as an image.'));
      image.src = url;
    });
    const width = element.naturalWidth || element.width;
    const height = element.naturalHeight || element.height;
    if (!width || !height) {
      throw new Error('That file could not be read as an image.');
    }
    return { element, width, height, url };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: ImageMime = 'image/png',
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('The browser could not encode this image. Try another output format.'));
      },
      type,
      quality
    );
  });
}

/** Solid background fill — used when flattening transparency for JPEG output. */
export function fillBackground(canvas: HTMLCanvasElement, color = '#ffffff') {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not available in this browser.');
  context.save();
  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.restore();
}

export interface ProcessOptions {
  format: ImageMime | 'auto';
  quality: number;
  maxWidth?: number | null;
  maxHeight?: number | null;
  background?: string;
}

export interface ProcessResult {
  blob: Blob;
  width: number;
  height: number;
  url: string;
  mime: string;
}

function fitsWithin(width: number, max: number | null | undefined): boolean {
  return !max || width <= max;
}

export async function processImage(
  file: Blob,
  options: ProcessOptions
): Promise<ProcessResult> {
  const { element, width, height, url } = await loadImage(file);
  try {
    let targetWidth = width;
    let targetHeight = height;

    const scaleDown = Math.min(
      fitsWithin(width, options.maxWidth) ? 1 : (options.maxWidth as number) / width,
      fitsWithin(height, options.maxHeight) ? 1 : (options.maxHeight as number) / height,
      1
    );

    if (scaleDown < 1) {
      targetWidth = Math.max(1, Math.round(width * scaleDown));
      targetHeight = Math.max(1, Math.round(height * scaleDown));
    }

    const canvas = createCanvas(targetWidth, targetHeight);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not available in this browser.');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    const needsFlatten = options.format === 'image/jpeg';
    if (needsFlatten) fillBackground(canvas, options.background ?? '#ffffff');
    context.drawImage(element, 0, 0, targetWidth, targetHeight);

    let mime: ImageMime;
    if (options.format !== 'auto') {
      mime = options.format;
    } else if (file.type === 'image/webp' || file.type === 'image/jpeg') {
      mime = file.type as ImageMime;
    } else {
      mime = 'image/jpeg';
    }

    const blob = await canvasToBlob(canvas, mime, options.quality);
    return {
      blob,
      width: targetWidth,
      height: targetHeight,
      url: URL.createObjectURL(blob),
      mime: blob.type || mime,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Re-encode candidates and keep the smallest real result. */
export async function compressImage(
  file: Blob,
  options: { quality: number; maxWidth?: number | null; keepTransparency?: boolean }
): Promise<ProcessResult & { originalWidth: number; originalHeight: number }> {
  const { element, width, height, url } = await loadImage(file);
  URL.revokeObjectURL(url);

  let targetWidth = width;
  let targetHeight = height;
  if (options.maxWidth && width > options.maxWidth) {
    const ratio = options.maxWidth / width;
    targetWidth = Math.max(1, Math.round(width * ratio));
    targetHeight = Math.max(1, Math.round(height * ratio));
  }

  const canvas = createCanvas(targetWidth, targetHeight);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not available in this browser.');
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  const candidates: ImageMime[] = options.keepTransparency
    ? ['image/webp', 'image/png']
    : ['image/webp', 'image/jpeg'];

  let best: { blob: Blob; mime: ImageMime } | null = null;

  for (const mime of candidates) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (mime !== 'image/png') fillBackground(canvas, '#ffffff');
    context.drawImage(element, 0, 0, targetWidth, targetHeight);
    const blob = await canvasToBlob(canvas, mime, options.quality);
    if (!best || blob.size < best.blob.size) best = { blob, mime };
  }

  // PNG is only worth it when the source is already tiny/flat — try it too when transparency matters.
  if (!options.keepTransparency && file.type === 'image/png') {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(element, 0, 0, targetWidth, targetHeight);
    const png = await canvasToBlob(canvas, 'image/png', 1);
    if (!best || png.size < best.blob.size) best = { blob: png, mime: 'image/png' };
  }

  if (!best) throw new Error('Compression failed. Please try another image.');
  const chosen = best as { blob: Blob; mime: ImageMime };

  return {
    blob: chosen.blob,
    width: targetWidth,
    height: targetHeight,
    url: URL.createObjectURL(chosen.blob),
    mime: chosen.blob.type || chosen.mime,
    originalWidth: width,
    originalHeight: height,
  };
}

/** Crop using source-pixel coordinates. */
export async function cropImage(
  file: Blob,
  crop: { x: number; y: number; width: number; height: number },
  options: { format?: ImageMime; quality?: number; background?: string } = {}
): Promise<ProcessResult> {
  const { element, url } = await loadImage(file);
  try {
    const canvas = createCanvas(crop.width, crop.height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not available in this browser.');
    context.imageSmoothingQuality = 'high';

    const format = options.format ?? 'image/png';
    if (format === 'image/jpeg') fillBackground(canvas, options.background ?? '#ffffff');

    context.drawImage(
      element,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    const blob = await canvasToBlob(canvas, format, options.quality ?? 0.92);
    return {
      blob,
      width: crop.width,
      height: crop.height,
      url: URL.createObjectURL(blob),
      mime: blob.type || format,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number;
  angle: number;
  color: string;
  position:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'middle-left'
    | 'center'
    | 'middle-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  tiled: boolean;
  shadow: boolean;
}

const ANCHORS: Record<WatermarkOptions['position'], [number, number]> = {
  'top-left': [0, 0],
  'top-center': [0.5, 0],
  'top-right': [1, 0],
  'middle-left': [0, 0.5],
  center: [0.5, 0.5],
  'middle-right': [1, 0.5],
  'bottom-left': [0, 1],
  'bottom-center': [0.5, 1],
  'bottom-right': [1, 1],
};

export async function watermarkImage(
  file: Blob,
  options: WatermarkOptions,
  output: { format?: ImageMime; quality?: number } = {}
): Promise<ProcessResult> {
  const { element, width, height, url } = await loadImage(file);
  try {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not available in this browser.');
    context.drawImage(element, 0, 0, width, height);

    const fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
    context.globalAlpha = Math.max(0.05, Math.min(1, options.opacity));
    context.fillStyle = options.color;
    context.textBaseline = 'middle';
    context.textAlign = 'center';

    if (options.tiled) {
      const fontPx = Math.max(12, options.fontSize);
      context.font = `700 ${fontPx}px ${fontFamily}`;
      const stepX = Math.max(context.measureText(options.text).width + fontPx * 1.6, fontPx * 6);
      const stepY = fontPx * 3.2;
      context.save();
      context.translate(width / 2, height / 2);
      context.rotate((options.angle * Math.PI) / 180);
      context.translate(-width, -height);
      for (let y = 0; y < height * 2; y += stepY) {
        for (let x = 0; x < width * 2; x += stepX) {
          context.fillText(options.text, x, y);
        }
      }
      context.restore();
    } else {
      const fontPx = Math.max(10, options.fontSize);
      context.font = `700 ${fontPx}px ${fontFamily}`;
      const [ax, ay] = ANCHORS[options.position];
      const padding = Math.round(Math.min(width, height) * 0.04) + fontPx;
      const x = padding + ax * (width - padding * 2);
      const y = padding + ay * (height - padding * 2);
      context.save();
      context.translate(x, y);
      context.rotate((options.angle * Math.PI) / 180);
      if (options.shadow) {
        context.shadowColor = 'rgba(0,0,0,0.45)';
        context.shadowBlur = Math.max(2, fontPx / 4);
      }
      context.fillText(options.text, 0, 0);
      context.restore();
    }

    context.globalAlpha = 1;
    const format: ImageMime = output.format ?? 'image/png';
    const blob = await canvasToBlob(canvas, format, output.quality ?? 0.92);
    return {
      blob,
      width,
      height,
      url: URL.createObjectURL(blob),
      mime: blob.type || format,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function extensionForMime(mime: string): string {
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('png')) return 'png';
  return 'img';
}

/** Reads an image file and returns a Base64 data URI. */
export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('That file could not be read.'));
    reader.readAsDataURL(file);
  });
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, payload] = dataUrl.split(',');
  const mime = (header.match(/data:([^;]+)/)?.[1] ?? 'application/octet-stream') as string;
  const binary = atob(payload ?? '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
