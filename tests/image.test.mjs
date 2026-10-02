import test from 'node:test';
import assert from 'node:assert/strict';
import { createCanvas } from '@napi-rs/canvas';

import { installBrowserShims } from './shim.mjs';
installBrowserShims();

const { processImage, compressImage, cropImage, watermarkImage, dataUrlToBlob, fileToDataUrl } =
  await import('../lib/image.ts');

/** A noisy photo-like PNG so lossy compression has something to work with. */
function makeTestImage(width = 1200, height = 800) {
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#ff3a5e');
  gradient.addColorStop(1, '#8b5cf6');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  for (let i = 0; i < 4000; i += 1) {
    context.fillStyle = `rgba(${(i * 7) % 255},${(i * 13) % 255},${(i * 29) % 255},0.9)`;
    context.fillRect((i * 37) % width, (i * 53) % height, 6, 6);
  }
  return {
    file: new File([canvas.toBuffer('image/png')], 'photo.png', { type: 'image/png' }),
    width,
    height,
  };
}

test('compressImage produces a genuinely smaller file at the same dimensions', async () => {
  const { file, width, height } = makeTestImage();
  const result = await compressImage(file, { quality: 0.7, maxWidth: null, keepTransparency: false });

  assert.equal(result.width, width);
  assert.equal(result.height, height);
  assert.ok(
    result.blob.size < file.size,
    `expected ${result.blob.size} to be smaller than ${file.size}`
  );
  assert.ok(['image/webp', 'image/jpeg', 'image/png'].includes(result.blob.type));
  assert.ok(result.url.startsWith('blob:'));
});

test('compressImage resizes when a maximum width is given', async () => {
  const { file } = makeTestImage(2000, 1000);
  const result = await compressImage(file, { quality: 0.8, maxWidth: 500, keepTransparency: false });
  assert.equal(result.width, 500);
  assert.equal(result.height, 250);
  assert.equal(result.originalWidth, 2000);
});

test('processImage converts format and enforces exact dimensions', async () => {
  const { file } = makeTestImage(1200, 800);
  const jpeg = await processImage(file, { format: 'image/jpeg', quality: 0.8, maxWidth: 600 });
  assert.equal(jpeg.width, 600);
  assert.equal(jpeg.height, 400);
  assert.equal(jpeg.blob.type, 'image/jpeg');

  const webp = await processImage(file, { format: 'image/webp', quality: 0.9, maxWidth: 300 });
  assert.equal(webp.width, 300);
  assert.equal(webp.height, 200);
  assert.equal(webp.blob.type, 'image/webp');

  const png = await processImage(file, { format: 'image/png', quality: 1, maxHeight: 400 });
  assert.equal(png.height, 400);
  assert.equal(png.width, 600);
  assert.equal(png.blob.type, 'image/png');
});

test('processImage keeps the source format when asked for "auto"', async () => {
  const { file } = makeTestImage(400, 300);
  const auto = await processImage(file, { format: 'auto', quality: 0.85 });
  assert.equal(auto.blob.type, 'image/jpeg', 'PNG sources default to JPEG for real savings');
});

test('cropImage cuts the requested rectangle at full resolution', async () => {
  const { file } = makeTestImage(1200, 800);
  const cropped = await cropImage(file, { x: 100, y: 50, width: 400, height: 300 });
  assert.equal(cropped.width, 400);
  assert.equal(cropped.height, 300);
  assert.equal(cropped.blob.type, 'image/png');
});

test('watermarkImage keeps dimensions and writes a valid image', async () => {
  const { file, width, height } = makeTestImage(800, 600);
  const watermarked = await watermarkImage(
    file,
    {
      text: '© ToolNova AI',
      fontSize: 48,
      opacity: 0.6,
      angle: 0,
      color: '#ffffff',
      position: 'bottom-right',
      tiled: false,
      shadow: true,
    },
    { format: 'image/png' }
  );
  assert.equal(watermarked.width, width);
  assert.equal(watermarked.height, height);
  assert.ok(watermarked.blob.size > 0);

  const tiled = await watermarkImage(
    file,
    {
      text: 'CONFIDENTIAL',
      fontSize: 36,
      opacity: 0.3,
      angle: -30,
      color: '#000000',
      position: 'center',
      tiled: true,
      shadow: false,
    },
    { format: 'image/png' }
  );
  assert.ok(tiled.blob.size > 0);
});

test('data URL helpers round-trip', async () => {
  const { file } = makeTestImage(120, 80);
  const dataUrl = await fileToDataUrl(file);
  assert.ok(dataUrl.startsWith('data:image/png;base64,'));
  const blob = dataUrlToBlob(dataUrl);
  assert.equal(blob.type, 'image/png');
  assert.equal(blob.size, file.size);
});
