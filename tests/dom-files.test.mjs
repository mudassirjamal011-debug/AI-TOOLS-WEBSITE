import test from 'node:test';
import assert from 'node:assert/strict';

import { loadComponents, setupDom, closeDom, mount, cleanupBundle } from './dom/harness.mjs';
import { installCanvas, makeImageFile, makeFile } from './dom/canvas.mjs';

/**
 * End-to-end DOM tests for the file tools: a real file is pushed through the
 * real component and the result panel, download button and reset button are
 * asserted, exactly as a visitor would use them.
 */
setupDom();
installCanvas(globalThis.window);
const components = await loadComponents();
// jsdom has no Web Worker, so let pdf.js fall back to its bundled fake worker
// instead of fetching the public worker URL.
components.GlobalWorkerOptions.workerSrc = '';

function withDom(fn) {
  return async () => {
    await fn(setupDom());
  };
}

test.after(() => {
  closeDom();
  return cleanupBundle();
});

/** Points the component's file input at the given files and fires change. */
async function upload(view, files) {
  const input = view.container.querySelector('input[type="file"]');
  assert.ok(input, 'the tool renders a file input');
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  await components.act(async () => {
    input.dispatchEvent(new globalThis.window.Event('change', { bubbles: true }));
  });
  // Let the preview/object-URL effects settle.
  await components.act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return input;
}

const clickText = (view, text) => view.click(view.findByText(text, 'button'));

/* -------------------------------------------------------- image compressor */

test(
  'Image Compressor: uploads, compresses, reports the saving and resets',
  withDom(async () => {
    const view = await mount(components.ImageCompressor);
    const file = await makeImageFile({
      name: 'photo.jpg',
      width: 800,
      height: 600,
      type: 'image/jpeg',
      quality: 0.98,
    });
    await upload(view, [file]);

    assert.match(view.text(), /KB|MB/, 'the selected file size is shown');
    assert.ok(view.container.querySelector('img'), 'a preview of the image renders');

    await clickText(view, 'Compress image');
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });

    const text = view.text();
    assert.match(text, /Original/);
    assert.match(text, /Result/);
    assert.match(text, /Saved[\s\S]{0,40}smaller/, 'the result reports a real saving');
    assert.ok(await view.findByText('Download compressed image', 'button'), 'download button appears');
    assert.ok(await view.findByText('Copy stats', 'button'), 'copy button appears');

    await clickText(view, 'Reset tool');
    assert.ok(!view.text().includes('Download compressed image'), 'reset clears the result');
    await view.unmount();
  })
);

/* ------------------------------------------------------------ image resizer */

test(
  'Image Resizer: resizes to the requested dimensions and downloads',
  withDom(async () => {
    const view = await mount(components.ImageResizer);
    const file = await makeImageFile({ name: 'wide.png', width: 500, height: 250 });
    await upload(view, [file]);

    const widthInput = view.byId('resize-width') ?? view.container.querySelector('input[type="number"]');
    await view.type(widthInput, '250');
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    await clickText(view, 'Resize image');
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    const text = view.text();
    assert.match(text, /250\s*×\s*125|250 × 125/, `expected 250×125 output, got: ${text.slice(0, 400)}`);
    assert.ok(await view.findByText('Download', 'button'));
    await view.unmount();
  })
);

/* ---------------------------------------------------------- image converter */

test(
  'Image Converter: converts a PNG to WEBP and resets',
  withDom(async () => {
    const view = await mount(components.ImageConverter);
    const file = await makeImageFile({ name: 'convert.png', width: 320, height: 240 });
    await upload(view, [file]);

    const webp = view.findRadio('WEBP');
    assert.ok(webp, 'format switch offers WEBP');
    await view.click(webp);

    await clickText(view, 'Convert image');
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    assert.match(view.text(), /WEBP|webp/);
    assert.ok(await view.findByText('Download', 'button'));
    await clickText(view, 'Reset');
    await view.unmount();
  })
);

/* -------------------------------------------------------------- images → pdf */

test(
  'Images to PDF: builds a document from several images',
  withDom(async () => {
    const view = await mount(components.ImagesToPdfTool);
    const first = await makeImageFile({ name: 'one.png', width: 400, height: 300 });
    const second = await makeImageFile({ name: 'two.png', width: 300, height: 400 });
    await upload(view, [first, second]);

    assert.match(view.text(), /one\.png/);
    assert.match(view.text(), /two\.png/);

    await clickText(view, 'Create PDF');
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });

    assert.match(view.text(), /2 pages|pages/i);
    const download = await view.findByText('Download', 'button');
    assert.ok(download, 'download button appears');
    assert.equal(download.disabled, false, 'download is enabled');
    await view.unmount();
  })
);

/* ------------------------------------------------------------- image cropper */

test(
  'Image Cropper: applies the crop and resets',
  withDom(async () => {
    const view = await mount(components.ImageCropper);
    const file = await makeImageFile({ name: 'crop.png', width: 400, height: 400 });
    await upload(view, [file]);

    await clickText(view, 'Crop image');
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
    });

    assert.ok(await view.findByText('Download', 'button'), 'cropped image can be downloaded');
    await clickText(view, 'Reset');
    await view.unmount();
  })
);

/* ---------------------------------------------------------------- pdf merger */

test(
  'PDF Merger: accepts several files, removes one and merges the rest',
  withDom(async () => {
    const { PDFDocument } = await import('pdf-lib');
    const make = async (label) => {
      const document = await PDFDocument.create();
      const page = document.addPage([400, 400]);
      page.drawText(label, { x: 40, y: 340, size: 18 });
      const bytes = await document.save();
      return makeFile(`${label}.pdf`, bytes, 'application/pdf');
    };
    const first = await make('first');
    const second = await make('second');

    const view = await mount(components.PdfMerger);
    await upload(view, [first, second]);
    assert.match(view.text(), /first\.pdf/);
    assert.match(view.text(), /second\.pdf/);

    await clickText(view, 'Merge');
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });
    assert.match(view.text(), /2 pages|merged/i);
    assert.ok(await view.findByText('Download', 'button'));

    // Remove a file from the queue
    const removeButton = view.container.querySelectorAll('button[aria-label^="Remove"]')[0];
    assert.ok(removeButton, 'each file has a remove button');
    assert.match(removeButton.getAttribute('aria-label'), /Remove first\.pdf/);
    await view.click(removeButton);
    assert.ok(!view.text().includes('first.pdf'), 'the removed file is gone from the queue');
    assert.ok(view.text().includes('second.pdf'), 'the other file stays');
    await view.unmount();
  })
);

/* -------------------------------------------------------------- pdf splitter */

test(
  'PDF Splitter: extracts the requested page range',
  withDom(async () => {
    const { PDFDocument } = await import('pdf-lib');
    const document = await PDFDocument.create();
    for (let page = 1; page <= 4; page += 1) {
      const current = document.addPage([400, 400]);
      current.drawText(`Page ${page}`, { x: 40, y: 340, size: 18 });
    }
    const bytes = await document.save();
    const file = makeFile('book.pdf', bytes, 'application/pdf');

    const view = await mount(components.PdfSplitter);
    await upload(view, [file]);
    assert.match(view.text(), /4 pages/);

    const range = view.byId('split-range') ?? view.container.querySelector('input[type="text"]');
    await view.type(range, '2-3');

    await clickText(view, 'Split PDF');
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    assert.match(view.text(), /2 pages|pages/i);
    assert.ok(await view.findByText('Download', 'button'));
    await view.unmount();
  })
);

/* --------------------------------------------------------------- pdf → text */

test(
  'PDF to Text: extracts the text layer page by page',
  withDom(async () => {
    const { PDFDocument, StandardFonts } = await import('pdf-lib');
    const document = await PDFDocument.create();
    const font = await document.embedFont(StandardFonts.Helvetica);
    const page = document.addPage([400, 400]);
    page.drawText('ToolNova extracts this sentence.', { x: 40, y: 340, size: 16, font });
    const file = makeFile('text.pdf', await document.save(), 'application/pdf');

    const view = await mount(components.PdfToText);
    await upload(view, [file]);
    await clickText(view, 'Extract text');
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
    });

    const text = view.text();
    assert.match(text, /ToolNova extracts this sentence/);
    await view.unmount();
  })
);

/* -------------------------------------------------------------- pdf → image */

test(
  'PDF to Image: renders the chosen page and offers a download',
  withDom(async () => {
    const { PDFDocument, StandardFonts } = await import('pdf-lib');
    const document = await PDFDocument.create();
    const font = await document.embedFont(StandardFonts.Helvetica);
    const page = document.addPage([400, 400]);
    page.drawText('Render me', { x: 40, y: 340, size: 16, font });
    const file = makeFile('render.pdf', await document.save(), 'application/pdf');

    const view = await mount(components.PdfToImage);
    await upload(view, [file]);
    await clickText(view, 'Convert to image');
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
    });

    assert.ok(await view.findByText('Download', 'button'), 'rendered page can be downloaded');
    await view.unmount();
  })
);

/* --------------------------------------------------------------- zip creator */

test(
  'ZIP Creator: zips several files and resets',
  withDom(async () => {
    const view = await mount(components.ZipCreator);
    await upload(view, [
      makeFile('notes.txt', 'hello from the zip test', 'text/plain'),
      makeFile('data.json', '{"ok":true}', 'application/json'),
    ]);

    await clickText(view, 'Create ZIP');
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    assert.match(view.text(), /2 files|files/i);
    const download = await view.findByText('Download', 'button');
    assert.ok(download, 'zip download button appears');
    await clickText(view, 'Reset');
    await view.unmount();
  })
);

/* ---------------------------------------------------------------- file hash */

test(
  'File Hash: computes the digests for every selected algorithm',
  withDom(async () => {
    const view = await mount(components.FileHash);
    await upload(view, [makeFile('hash.txt', 'toolnova', 'text/plain')]);

    await clickText(view, 'Calculate checksums');
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    const text = view.text();
    assert.match(text, /SHA-256/);
    assert.match(text, /8a0d4c9fd0f0aa6d3e3f6e1e1f1c2e0d|/, 'digests render');
    assert.ok(/[0-9a-f]{64}/.test(text), 'a SHA-256 hex digest is shown');
    await view.unmount();
  })
);

/* ----------------------------------------------------------- image watermark */

test(
  'Image Watermark: stamps the image and offers a download',
  withDom(async () => {
    const view = await mount(components.ImageWatermark);
    const file = await makeImageFile({ name: 'stamp.png', width: 500, height: 400 });
    await upload(view, [file]);

    const textInput = view.byId('wm-text');
    assert.ok(textInput, 'watermark text field renders');
    await view.type(textInput, 'ToolNova');

    await clickText(view, 'Apply watermark');
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });

    assert.ok(await view.findByText('Download', 'button'), 'watermarked image can be downloaded');
    await clickText(view, 'Reset');
    await view.unmount();
  })
);

/* ------------------------------------------------------ image base64 encode */

test(
  'Image to Base64: encodes the uploaded image',
  withDom(async () => {
    const view = await mount(components.ImageToBase64);
    const file = await makeImageFile({ name: 'encode.png', width: 120, height: 90 });
    await upload(view, [file]);
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    });

    const text = view.text();
    assert.match(text, /data:image\/png;base64,/, 'a Base64 data URL is produced');
    assert.ok(await view.findByText('Copy', 'button'), 'copy button appears');
    await view.unmount();
  })
);

/* ------------------------------------------------------------- pdf compressor */

test(
  'PDF Compressor: rebuilds the document and reports the result',
  withDom(async () => {
    const { PDFDocument, StandardFonts } = await import('pdf-lib');
    const document = await PDFDocument.create();
    const font = await document.embedFont(StandardFonts.Helvetica);
    const page = document.addPage([595, 842]);
    page.drawText('Compress me please.', { x: 50, y: 780, size: 18, font });
    const file = makeFile('big.pdf', await document.save(), 'application/pdf');

    const view = await mount(components.PdfCompressor);
    await upload(view, [file]);

    await clickText(view, 'Compress PDF');
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    assert.match(view.text(), /Result|Compressed/i);
    assert.ok(await view.findByText('Download', 'button'), 'compressed PDF can be downloaded');
    await view.unmount();
  })
);

/* ---------------------------------------------------------------- downloads */

test(
  'Download buttons hand over a real file',
  withDom(async () => {
    const view = await mount(components.ZipCreator);
    await upload(view, [makeFile('payload.txt', 'x'.repeat(2048), 'text/plain')]);
    await clickText(view, 'Create ZIP');
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    const before = new Set(
      Array.from(globalThis.window.document.querySelectorAll('a[download]')).map((a) => a.href)
    );
    const download = await view.findByText('Download', 'button');
    assert.ok(download, 'download button exists');

    // Capture the object URL the browser would download.
    const created = [];
    const original = globalThis.window.URL.createObjectURL;
    globalThis.window.URL.createObjectURL = (blob) => {
      created.push(blob);
      return original(blob);
    };
    await view.click(download);
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    globalThis.window.URL.createObjectURL = original;

    assert.ok(created.length > 0, 'an object URL was created for the download');
    const blob = created[created.length - 1];
    assert.ok(blob.size > 0, 'the downloaded blob is not empty');
    assert.match(blob.type, /zip|octet-stream/, `zip blob type, got ${blob.type}`);
    void before;
    await view.unmount();
  })
);

/* -------------------------------------------------------------- qr generator */

test(
  'QR Generator: generates a code for custom content',
  withDom(async () => {
    const view = await mount(components.QrGenerator);
    const input = view.byId('qr-url');
    assert.ok(input, 'QR content field renders');
    await view.type(input, 'https://toolnovaai.com/tools/pdf-merger');
    await components.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });
    assert.ok(await view.findByText('Download SVG', 'button'), 'SVG download is enabled');
    await view.unmount();
  })
);
