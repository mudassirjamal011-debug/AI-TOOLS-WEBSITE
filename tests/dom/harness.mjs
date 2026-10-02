/**
 * Mounts the real React tool components in a jsdom document so we can click
 * the same buttons a visitor clicks.
 *
 * The components are bundled with esbuild (path aliases resolved) and rendered
 * with react-dom/client inside `act`, exactly like a browser would.
 */
import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { JSDOM } from 'jsdom';

const root = resolve(dirname(new URL(import.meta.url).pathname), '../..');

let bundleUrl = null;
let tempDir = null;

export async function loadComponents() {
  if (bundleUrl) return import(bundleUrl);

  tempDir = resolve(root, 'tests/dom/.tmp');
  await mkdir(tempDir, { recursive: true });
  const entry = resolve(tempDir, 'entry.tsx');
  const outfile = resolve(tempDir, 'out.mjs');

  await writeFile(
    entry,
    `import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastProvider } from '@/components/ui/Toast';

export { React, act, createRoot, ToastProvider };
export { WordCounter, CaseConverter, TextFormatter, JsonFormatter, LoremIpsum, PasswordGenerator } from '@/components/tools/impl/TextTools';
export { RegexTester, UrlEncoder, JwtDecoder, TimestampConverter, CsvConverter, HashGenerator } from '@/components/tools/impl/DevTools';
export { Base64Tool, QrGenerator, ZipCreator, FileHash } from '@/components/tools/impl/FileTools';
export { ImageCompressor, ImageResizer, ImageConverter, ImageCropper, ImagesToPdfTool, ImageWatermark, ImageToBase64 } from '@/components/tools/impl/ImageTools';
export { PdfMerger, PdfSplitter, PdfToImage, PdfCompressor, PdfToText } from '@/components/tools/impl/PdfTools';
export { AiTextGenerator, AiSummarizer, AiTitleGenerator } from '@/components/tools/impl/AiTools';
export { UploadBox } from '@/components/tools/UploadBox';
export { ToolSearch } from '@/components/search/ToolSearch';
export { ThemeToggle } from '@/components/layout/ThemeToggle';
export { ToolsExplorer } from '@/components/tools/ToolsExplorer';
export { ContactForm } from '@/components/forms/ContactForm';
export { Header } from '@/components/layout/Header';
export { routerCalls } from '@/tests/dom/stubs/next-navigation';
export { GlobalWorkerOptions } from 'pdfjs-dist';
`
  );

  await build({
    entryPoints: [entry],
    outfile,
    absWorkingDir: root,
    nodePaths: [resolve(root, 'node_modules')],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    jsx: 'automatic',
    loader: { '.tsx': 'tsx', '.ts': 'ts' },
    alias: {
      '@': root,
      'next/navigation': resolve(dirname(new URL(import.meta.url).pathname), 'stubs/next-navigation.tsx'),
      'next/link': resolve(dirname(new URL(import.meta.url).pathname), 'stubs/next-link.tsx'),
    },
    define: { 'process.env.NODE_ENV': '"test"' },
    plugins: [
      {
        // pdf.js fetches /pdf.worker.min.mjs at runtime; in the test bundle we
        // resolve it to the copy in /public so the fake worker can boot.
        name: 'pdf-worker-resolver',
        setup(pluginBuild) {
          pluginBuild.onResolve({ filter: /pdf\.worker\.min\.mjs$/ }, () => ({
            path: resolve(root, 'public/pdf.worker.min.mjs'),
          }));
        },
      },
    ],
    logLevel: 'silent',
  });

  bundleUrl = pathToFileURL(outfile).href;
  return import(bundleUrl);
}

let domState = null;

/**
 * Installs the jsdom environment. It is created once and shared by the whole
 * file, because React DOM reads browser capability flags when it is first
 * imported — the window must already exist at that point.
 */
export function setupDom() {
  if (domState) return domState;

  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'https://toolnova.test/',
    pretendToBeVisual: true,
  });

  const { window } = dom;
  const previous = {};
  const keys = [
    'window',
    'document',
    'navigator',
    'location',
    'history',
    'HTMLElement',
    'HTMLInputElement',
    'HTMLTextAreaElement',
    'HTMLSelectElement',
    'Element',
    'Node',
    'Event',
    'CustomEvent',
    'MouseEvent',
    'KeyboardEvent',
    'DataTransfer',
    'File',
    'FileList',
    'FileReader',
    'Blob',
    'FormData',
    'XMLHttpRequest',
    'DOMParser',
    'MutationObserver',
    'URL',
    'getComputedStyle',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'localStorage',
    'sessionStorage',
    'matchMedia',
  ];
  for (const key of keys) {
    previous[key] = globalThis[key];
    if (window[key] === undefined) continue;
    const value =
      typeof window[key] === 'function' && key.startsWith('matchMedia')
        ? window[key].bind(window)
        : window[key];
    try {
      Object.defineProperty(globalThis, key, {
        value,
        configurable: true,
        writable: true,
        enumerable: false,
      });
    } catch {
      /* some globals (navigator) are getter-only in newer Node — the shimmed
         window object is still available through globalThis.window */
    }
  }

  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  if (!window.matchMedia) {
    window.matchMedia = () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    });
    globalThis.matchMedia = window.matchMedia;
  }

  domState = { dom, window, previous, keys };
  return domState;
}

/** Tears the environment down again once the whole file has finished. */
export function closeDom() {
  if (!domState) return;
  const { previous, keys, dom } = domState;
  for (const key of keys) {
    try {
      if (previous[key] === undefined) delete globalThis[key];
      else
        Object.defineProperty(globalThis, key, {
          value: previous[key],
          configurable: true,
          writable: true,
          enumerable: false,
        });
    } catch {
      /* ignore keys that cannot be restored */
    }
  }
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  dom.window.close();
  domState = null;
}

/** Creates a throwaway container for one test. */
export function createContainer() {
  const { window } = setupDom();
  const container = window.document.createElement('div');
  window.document.body.appendChild(container);
  return container;
}

/** Renders a component (wrapped in the toast provider) and returns DOM helpers. */
export async function mount(Component, props = {}) {
  const components = await loadComponents();
  const { React, act, createRoot, ToastProvider } = components;
  const container = createContainer();

  const tree = (nextProps = props) =>
    React.createElement(ToastProvider, null, React.createElement(Component, nextProps));

  let root;
  await act(async () => {
    root = createRoot(container);
    root.render(tree());
  });

  return {
    container,
    async update(nextProps) {
      await act(async () => {
        root.render(tree(nextProps));
      });
    },
    async unmount() {
      await act(async () => root.unmount());
      container.remove();
    },
    /** Find a control by its visible text; mode switches (role=radio) are skipped. */
    findByText(text, selector = 'button, a, label, h1, h2, h3, p, span, dt') {
      const candidates = Array.from(container.querySelectorAll(selector)).filter(
        (element) => !element.hasAttribute('role') || element.getAttribute('role') === 'button'
      );
      const wanted = text.toLowerCase();
      return (
        candidates.find((element) => (element.textContent ?? '').trim().toLowerCase() === wanted) ??
        candidates.find((element) => (element.textContent ?? '').trim().toLowerCase().includes(wanted))
      );
    },
    /** Find a category tab inside a tablist. */
    findTab(text) {
      return Array.from(container.querySelectorAll('[role="tab"]')).find((element) =>
        (element.textContent ?? '').trim().toLowerCase() === text.toLowerCase()
      );
    },
    /** Find a mode switch inside a radiogroup. */
    findRadio(text) {
      return Array.from(container.querySelectorAll('[role="radio"]')).find((element) =>
        (element.textContent ?? '').trim().toLowerCase() === text.toLowerCase()
      );
    },
    /** Query by id. */
    byId(id) {
      return container.querySelector(`#${id}`) ?? globalThis.document.getElementById(id);
    },
    async click(element) {
      if (!element) throw new Error('click(): element not found');
      await act(async () => {
        element.dispatchEvent(new globalThis.window.MouseEvent('click', { bubbles: true, cancelable: true }));
      });
    },
    async type(element, value) {
      if (!element) throw new Error('type(): element not found');
      await act(async () => {
        const setter = Object.getOwnPropertyDescriptor(
          element instanceof globalThis.window.HTMLTextAreaElement
            ? globalThis.window.HTMLTextAreaElement.prototype
            : globalThis.window.HTMLInputElement.prototype,
          'value'
        ).set;
        setter.call(element, value);
        element.dispatchEvent(new globalThis.window.Event('input', { bubbles: true }));
      });
    },
    async submit(form) {
      await act(async () => {
        form.dispatchEvent(new globalThis.window.Event('submit', { bubbles: true, cancelable: true }));
      });
    },
    text() {
      return container.textContent ?? '';
    },
  };
}

export async function cleanupBundle() {
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = null;
    bundleUrl = null;
  }
}
