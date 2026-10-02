/**
 * Client-side PDF processing with pdf-lib (writing) and pdf.js (rendering).
 * Both libraries are imported dynamically so they never bloat the first load.
 */

export type PageSize = 'A4' | 'Letter';
export type Orientation = 'portrait' | 'landscape';

const PAGE_DIMENSIONS: Record<PageSize, [number, number]> = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
};

/* -------------------------------------------------------------- pdf.js ---- */

let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;

export async function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((module) => {
      // The worker is copied into /public by scripts/copy-pdf-worker.mjs.
      // Only point at it from a real browser — in Node (tests, SSR) pdf.js
      // falls back to running the worker inline.
      if (typeof window !== 'undefined') {
        module.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      }
      return module;
    });
  }
  return pdfjsPromise;
}

export async function loadPdfDocument(file: Blob) {
  const pdfjs = await getPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  return pdfjs
    .getDocument({
      data,
      disableAutoFetch: true,
      // Runtime assets copied into /public by scripts/copy-pdf-worker.mjs so
      // documents that do not embed their fonts (or use CJK encodings) render
      // and extract correctly.
      standardFontDataUrl: '/pdfjs/standard_fonts/',
      cMapUrl: '/pdfjs/cmaps/',
      cMapPacked: true,
    })
    .promise;
}

export async function getPdfPageCount(file: Blob): Promise<number> {
  const pdf = await loadPdfDocument(file);
  try {
    return pdf.numPages;
  } finally {
    await pdf.destroy();
  }
}

/* ------------------------------------------------------------- pdf-lib ---- */

async function getPdfLib() {
  return import('pdf-lib');
}

export async function mergePdfs(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const { PDFDocument } = await getPdfLib();
  const merged = await PDFDocument.create();
  merged.setProducer('ToolNova AI');
  merged.setCreator('ToolNova AI PDF Merger');

  for (let index = 0; index < files.length; index += 1) {
    const bytes = new Uint8Array(await files[index].arrayBuffer());
    const source = await PDFDocument.load(bytes, { ignoreEncryption: false }).catch(() => {
      throw new Error(
        `“${files[index].name}” could not be opened. It may be password protected or damaged.`
      );
    });
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
    onProgress?.(index + 1, files.length);
  }

  return merged.save({ useObjectStreams: true });
}

export function parsePageRanges(input: string, pageCount: number): number[] {
  const pages: number[] = [];
  const parts = (input ?? '').split(',').map((part) => part.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startRaw, endRaw] = part.split('-').map((value) => value.trim());
      const start = Number.parseInt(startRaw, 10);
      const end = Number.parseInt(endRaw, 10);
      if (Number.isNaN(start) || Number.isNaN(end)) continue;
      const from = Math.max(1, Math.min(start, end));
      const to = Math.min(pageCount, Math.max(start, end));
      for (let page = from; page <= to; page += 1) pages.push(page);
    } else {
      const page = Number.parseInt(part, 10);
      if (!Number.isNaN(page)) pages.push(page);
    }
  }

  return pages.filter((page) => page >= 1 && page <= pageCount);
}

export async function splitPdf(file: File, pages: number[]): Promise<Uint8Array> {
  const { PDFDocument } = await getPdfLib();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const source = await PDFDocument.load(bytes);
  const target = await PDFDocument.create();
  target.setProducer('ToolNova AI');

  const indices = pages.map((page) => page - 1);
  const copied = await target.copyPages(source, indices);
  copied.forEach((page) => target.addPage(page));

  return target.save({ useObjectStreams: true });
}

export async function splitPdfEveryPage(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<{ name: string; bytes: Uint8Array }[]> {
  const { PDFDocument } = await getPdfLib();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const source = await PDFDocument.load(bytes);
  const results: { name: string; bytes: Uint8Array }[] = [];
  const base = file.name.replace(/\.pdf$/i, '');

  for (let index = 0; index < source.getPageCount(); index += 1) {
    const target = await PDFDocument.create();
    target.setProducer('ToolNova AI');
    const [page] = await target.copyPages(source, [index]);
    target.addPage(page);
    results.push({
      name: `${base}-page-${index + 1}.pdf`,
      bytes: await target.save({ useObjectStreams: true }),
    });
    onProgress?.(index + 1, source.getPageCount());
    // Yield to the event loop so the UI never freezes on long documents.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return results;
}

/* ------------------------------------------------------------- rendering -- */

export interface RenderOptions {
  scale: number;
  format: 'image/png' | 'image/jpeg';
  quality: number;
}

export async function renderPdfPageToBlob(
  file: Blob,
  pageNumber: number,
  options: RenderOptions
): Promise<{ blob: Blob; width: number; height: number; url: string }> {
  const pdf = await loadPdfDocument(file);
  try {
    const total = pdf.numPages;
    if (pageNumber < 1 || pageNumber > total) {
      throw new Error(`Page ${pageNumber} does not exist. This PDF has ${total} pages.`);
    }
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: options.scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not available in this browser.');

    if (options.format === 'image/jpeg') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    await page.render({ canvasContext: context, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('Rendering failed.'))),
        options.format,
        options.quality
      );
    });

    return {
      blob,
      width: canvas.width,
      height: canvas.height,
      url: URL.createObjectURL(blob),
    };
  } finally {
    await pdf.destroy();
  }
}

/**
 * Compress by rasterising each page and rebuilding the document as an
 * image-only PDF. This is the only reliable way to shrink a scan-heavy file
 * entirely client-side.
 */
export async function compressPdf(
  file: Blob,
  options: { dpi: number; quality: number },
  onProgress?: (current: number, total: number) => void
): Promise<{ bytes: Uint8Array; pages: number }> {
  const { PDFDocument } = await getPdfLib();
  const pdf = await loadPdfDocument(file);
  const target = await PDFDocument.create();
  target.setProducer('ToolNova AI PDF Compressor');

  try {
    const total = pdf.numPages;
    const scale = options.dpi / 72;

    for (let pageNumber = 1; pageNumber <= total; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas is not available in this browser.');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: context, viewport }).promise;

      const dataUrl = canvas.toDataURL('image/jpeg', options.quality);
      const base64 = dataUrl.split(',')[1];
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      const image = await target.embedJpg(bytes);

      const base = page.getViewport({ scale: 1 });
      const pdfPage = target.addPage([base.width, base.height]);
      pdfPage.drawImage(image, { x: 0, y: 0, width: base.width, height: base.height });

      onProgress?.(pageNumber, total);
      // Yield so the progress bar keeps painting.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return { bytes: await target.save({ useObjectStreams: true }), pages: total };
  } finally {
    await pdf.destroy();
  }
}

export async function extractPdfText(
  file: Blob,
  onProgress?: (current: number, total: number) => void
): Promise<{ pages: string[]; text: string; empty: boolean }> {
  const pdf = await loadPdfDocument(file);
  const pages: string[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const lines: string[] = [];
      let lastY: number | null = null;
      let current = '';

      for (const item of content.items) {
        if (!('str' in item)) continue;
        const transform = (item as { transform?: number[] }).transform;
        const y = transform ? transform[5] : null;
        if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) {
          lines.push(current.trimEnd());
          current = '';
        }
        current += item.str;
        if (y !== null) lastY = y;
        if ((item as { hasEOL?: boolean }).hasEOL) {
          lines.push(current.trimEnd());
          current = '';
          lastY = null;
        }
      }
      if (current.trim()) lines.push(current.trimEnd());
      pages.push(lines.join('\n').trim());
      onProgress?.(pageNumber, pdf.numPages);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    await pdf.destroy();
  }

  const text = pages.filter(Boolean).join('\n\n');
  return { pages, text, empty: text.trim().length === 0 };
}

/* --------------------------------------------------------- images → pdf -- */

export async function imagesToPdf(
  files: File[],
  options: { pageSize: PageSize; orientation: Orientation; quality?: number } = {
    pageSize: 'A4',
    orientation: 'portrait',
  },
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const { PDFDocument } = await getPdfLib();
  const doc = await PDFDocument.create();
  doc.setProducer('ToolNova AI');

  const [baseWidth, baseHeight] = PAGE_DIMENSIONS[options.pageSize];
  const pageWidth = options.orientation === 'portrait' ? baseWidth : baseHeight;
  const pageHeight = options.orientation === 'portrait' ? baseHeight : baseWidth;
  const margin = 24;
  const quality = options.quality ?? 0.92;

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    let bytes: Uint8Array;
    let mime = file.type;

    if (mime === 'image/png') {
      bytes = new Uint8Array(await file.arrayBuffer());
    } else {
      // Normalise everything else (JPEG, WebP, GIF, AVIF…) to JPEG via canvas.
      const { loadImage, createCanvas, canvasToBlob, fillBackground } = await import('./image');
      const { element, width, height, url } = await loadImage(file);
      try {
        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas is not available in this browser.');
        fillBackground(canvas, '#ffffff');
        context.drawImage(element, 0, 0, width, height);
        const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
        bytes = new Uint8Array(await blob.arrayBuffer());
        mime = 'image/jpeg';
      } finally {
        URL.revokeObjectURL(url);
      }
    }

    const image =
      mime === 'image/png' ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);

    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;
    const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
    const drawWidth = image.width * ratio;
    const drawHeight = image.height * ratio;

    const page = doc.addPage([pageWidth, pageHeight]);
    page.drawImage(image, {
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });

    onProgress?.(index + 1, files.length);
  }

  return doc.save({ useObjectStreams: true });
}

/* ----------------------------------------------------------------- misc -- */

export function bytesToBlob(bytes: Uint8Array, type = 'application/pdf'): Blob {
  // Copy into a fresh buffer so the Blob never adopts (and later detaches) the source.
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new Blob([copy], { type });
}
