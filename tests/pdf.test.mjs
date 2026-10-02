import test from 'node:test';
import assert from 'node:assert/strict';
import { createCanvas } from '@napi-rs/canvas';

import { installBrowserShims } from './shim.mjs';
installBrowserShims();

const {
  mergePdfs,
  splitPdf,
  splitPdfEveryPage,
  parsePageRanges,
  imagesToPdf,
  extractPdfText,
  renderPdfPageToBlob,
  compressPdf,
  getPdfPageCount,
} = await import('../lib/pdf.ts');
const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

async function makePdf(label, pages = 2) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let index = 1; index <= pages; index += 1) {
    const page = doc.addPage([595, 842]);
    page.drawText(`${label} page ${index}`, { x: 50, y: 700, size: 24, font, color: rgb(0, 0, 0) });
  }
  const bytes = await doc.save();
  return new File([Buffer.from(bytes)], `${label}.pdf`, { type: 'application/pdf' });
}

test('mergePdfs concatenates documents in order', async () => {
  const first = await makePdf('alpha', 2);
  const second = await makePdf('beta', 1);
  const merged = await mergePdfs([first, second]);
  const document = await PDFDocument.load(merged);
  assert.equal(document.getPageCount(), 3);
});

test('mergePdfs rejects a corrupt file with a readable message', async () => {
  const broken = new File([Buffer.from('not a pdf at all')], 'broken.pdf', {
    type: 'application/pdf',
  });
  await assert.rejects(() => mergePdfs([broken]), /could not be opened/);
});

test('parsePageRanges handles ranges, singles, clamps and rejects nonsense', () => {
  assert.deepEqual(parsePageRanges('1-3, 7, 10-12', 12), [1, 2, 3, 7, 10, 11, 12]);
  assert.deepEqual(parsePageRanges('3-1', 5), [1, 2, 3]);
  assert.deepEqual(parsePageRanges('40', 12), []);
  assert.deepEqual(parsePageRanges('abc', 12), []);
  assert.deepEqual(parsePageRanges('', 12), []);
});

test('splitPdf extracts the requested pages', async () => {
  const source = await makePdf('alpha', 3);
  const bytes = await splitPdf(source, [2, 3]);
  const document = await PDFDocument.load(bytes);
  assert.equal(document.getPageCount(), 2);
});

test('splitPdfEveryPage emits one file per page', async () => {
  const source = await makePdf('alpha', 3);
  const parts = await splitPdfEveryPage(source);
  assert.equal(parts.length, 3);
  assert.equal(parts[0].name, 'alpha-page-1.pdf');
  assert.equal((await PDFDocument.load(parts[2].bytes)).getPageCount(), 1);
});

test('imagesToPdf builds a document with one page per image', async () => {
  const canvas = createCanvas(600, 400);
  const context = canvas.getContext('2d');
  context.fillStyle = '#22c55e';
  context.fillRect(0, 0, 600, 400);
  const image = new File([canvas.toBuffer('image/png')], 'pic.png', { type: 'image/png' });

  const bytes = await imagesToPdf([image, image], { pageSize: 'A4', orientation: 'landscape' });
  const document = await PDFDocument.load(bytes);
  assert.equal(document.getPageCount(), 2);
  const { width, height } = document.getPage(0).getSize();
  assert.ok(width > height, 'landscape puts the long edge first');
});

test('getPdfPageCount reports the real page count', async () => {
  assert.equal(await getPdfPageCount(await makePdf('alpha', 4)), 4);
});

test('extractPdfText reads the text layer page by page', async () => {
  const source = await makePdf('alpha', 2);
  const result = await extractPdfText(source);
  assert.equal(result.empty, false);
  assert.match(result.text, /alpha page 1/);
  assert.match(result.text, /alpha page 2/);
  assert.equal(result.pages.length, 2);
});

test('extractPdfText flags image-only documents instead of returning empty text', async () => {
  // A PDF with no text layer at all.
  const document = await PDFDocument.create();
  document.addPage([200, 200]);
  const file = new File([Buffer.from(await document.save())], 'blank.pdf', {
    type: 'application/pdf',
  });
  const result = await extractPdfText(file);
  assert.equal(result.empty, true);
  assert.equal(result.text.trim(), '');
});

test('renderPdfPageToBlob rasterises a page at the requested scale', async () => {
  const source = await makePdf('alpha', 2);
  const rendered = await renderPdfPageToBlob(source, 1, {
    scale: 2,
    format: 'image/png',
    quality: 0.9,
  });
  assert.equal(rendered.width, 1190);
  assert.equal(rendered.height, 1684);
  assert.equal(rendered.blob.type, 'image/png');

  const jpeg = await renderPdfPageToBlob(source, 2, {
    scale: 1,
    format: 'image/jpeg',
    quality: 0.8,
  });
  assert.equal(jpeg.blob.type, 'image/jpeg');
  assert.equal(jpeg.width, 595);

  await assert.rejects(
    () => renderPdfPageToBlob(source, 9, { scale: 1, format: 'image/png', quality: 1 }),
    /does not exist/
  );
});

test('compressPdf rebuilds the document with rasterised pages', async () => {
  const source = await makePdf('alpha', 2);
  const { bytes, pages } = await compressPdf(source, { dpi: 100, quality: 0.6 });
  assert.equal(pages, 2);
  const document = await PDFDocument.load(bytes);
  assert.equal(document.getPageCount(), 2);
  assert.equal(bytes.length > 0, true);
});
