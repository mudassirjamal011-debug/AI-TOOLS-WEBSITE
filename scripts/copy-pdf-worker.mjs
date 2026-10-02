/**
 * Copies the pdf.js runtime assets out of node_modules into /public so the
 * browser can load them from same-origin URLs (no CDN, no bundler magic):
 *
 *   public/pdf.worker.min.mjs   – the web worker
 *   public/pdfjs/standard_fonts – fonts for documents that do not embed them
 *   public/pdfjs/cmaps          – character maps for non-Latin encodings
 *
 * Runs automatically before `next dev` and `next build`.
 */
import { copyFile, mkdir, access, cp } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const workerCandidates = [
  'node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
  'node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs',
];

const assetCandidates = [
  { from: 'node_modules/pdfjs-dist/standard_fonts', to: 'public/pdfjs/standard_fonts' },
  { from: 'node_modules/pdfjs-dist/cmaps', to: 'public/pdfjs/cmaps' },
];

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

let copiedWorker = false;
for (const relative of workerCandidates) {
  const from = resolve(root, relative);
  if (await exists(from)) {
    const to = resolve(root, 'public/pdf.worker.min.mjs');
    await mkdir(dirname(to), { recursive: true });
    await copyFile(from, to);
    console.log(`[pdf-worker] copied ${relative} -> public/pdf.worker.min.mjs`);
    copiedWorker = true;
    break;
  }
}

if (!copiedWorker) {
  console.warn(
    '[pdf-worker] pdfjs-dist worker bundle not found. Run `npm install` first. ' +
      'PDF to Images / PDF Compressor will fall back to the legacy (non-worker) build.'
  );
}

for (const asset of assetCandidates) {
  const from = resolve(root, asset.from);
  if (!(await exists(from))) continue;
  try {
    await cp(from, resolve(root, asset.to), { recursive: true, force: true });
    console.log(`[pdf-worker] copied ${asset.from} -> ${asset.to}`);
  } catch (error) {
    console.warn(`[pdf-worker] could not copy ${asset.from}: ${error.message}`);
  }
}
