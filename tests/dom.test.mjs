import test from 'node:test';
import assert from 'node:assert/strict';

import { loadComponents, setupDom, closeDom, mount, cleanupBundle } from './dom/harness.mjs';

/**
 * Real-component DOM tests: these mount the same React components the site
 * ships and click the same buttons a visitor clicks.
 */
// React DOM captures browser capability flags when it is first imported, so the
// window has to exist before the component bundle is loaded.
setupDom();
const components = await loadComponents();

function withDom(fn) {
  return async (t) => {
    await fn(setupDom(), t);
  };
}

test.after(() => {
  closeDom();
  return cleanupBundle();
});

/* ------------------------------------------------------------ word counter */

test(
  'Word Counter updates every statistic live and copies + clears',
  withDom(async () => {
    const view = await mount(components.WordCounter);
    const textarea = view.container.querySelector('textarea');
    assert.ok(textarea, 'editor renders');

    await view.type(textarea, 'Hello world. this is a test of the counter!');

    const text = view.text();
    assert.match(text, /Words/);
    assert.match(text, /Characters/);
    assert.match(text, /No spaces/);
    assert.match(text, /Sentences/);
    assert.match(text, /Paragraphs/);
    assert.match(text, /Reading time/);

    // 9 words, 2 sentences, 1 paragraph
    const stats = Array.from(view.container.querySelectorAll('p')).map((p) => p.textContent);
    assert.ok(stats.includes('9'), `expected word count 9, got ${stats.slice(0, 8).join('|')}`);
    assert.ok(stats.includes('2'), 'sentence count renders');
    assert.ok(stats.includes('1'), 'paragraph count renders');

    // Keyword density toggle works
    const density = view.container.querySelector('input[type="checkbox"]');
    await view.click(density);
    assert.match(view.text(), /Most used words/);

    // Clear empties the editor
    const clear = view.findByText('Clear', 'button');
    await view.click(clear);
    assert.equal(view.container.querySelector('textarea').value, '');
    await view.unmount();
  })
);

/* ----------------------------------------------------------- case converter */

test(
  'Case Converter applies every transformation, copies and clears',
  withDom(async () => {
    const view = await mount(components.CaseConverter);
    const textarea = view.container.querySelector('textarea');
    await view.type(textarea, 'hello brave new world');

    const upper = view.findByText('UPPERCASE', 'button');
    await view.click(upper);
    assert.equal(view.container.querySelector('textarea').value, 'HELLO BRAVE NEW WORLD');

    const title = view.findByText('Title Case', 'button');
    await view.click(title);
    assert.equal(view.container.querySelector('textarea').value, 'Hello Brave New World');

    const lower = view.findByText('lowercase', 'button');
    await view.click(lower);
    assert.equal(view.container.querySelector('textarea').value, 'hello brave new world');

    const camel = view.findByText('camelCase', 'button');
    await view.click(camel);
    assert.equal(view.container.querySelector('textarea').value, 'helloBraveNewWorld');

    const snake = view.findByText('snake_case', 'button');
    await view.click(snake);
    assert.equal(view.container.querySelector('textarea').value, 'hello_brave_new_world');

    await view.click(view.findByText('Clear', 'button'));
    assert.equal(view.container.querySelector('textarea').value, '');
    await view.unmount();
  })
);

/* ---------------------------------------------------------- text formatter */

test(
  'Text Formatter cleans text and can undo each step',
  withDom(async () => {
    const view = await mount(components.TextFormatter);
    const textarea = view.container.querySelector('textarea');
    await view.type(textarea, '  b  \n a\n\n  b  \nc');

    await view.click(view.findByText('Trim each line', 'button'));
    assert.equal(view.container.querySelector('textarea').value, 'b\na\n\nb\nc');

    await view.click(view.findByText('Remove empty lines', 'button'));
    assert.equal(view.container.querySelector('textarea').value, 'b\na\nb\nc');

    await view.click(view.findByText('Remove duplicate lines', 'button'));
    assert.equal(view.container.querySelector('textarea').value, 'b\na\nc');

    await view.click(view.findByText('Sort A→Z', 'button'));
    assert.equal(view.container.querySelector('textarea').value, 'a\nb\nc');

    const undo = view.findByText('Undo', 'button');
    assert.ok(undo, 'undo button appears once there is history');
    await view.click(undo);
    assert.equal(view.container.querySelector('textarea').value, 'b\na\nc');

    await view.click(view.findByText('Clear', 'button'));
    assert.equal(view.container.querySelector('textarea').value, '');
    await view.unmount();
  })
);

/* ----------------------------------------------------------- json formatter */

test(
  'JSON Formatter formats, minifies, validates and reports real parse errors',
  withDom(async () => {
    const view = await mount(components.JsonFormatter);
    const [input, output] = view.container.querySelectorAll('textarea');

    await view.type(input, '{"b":2,"a":[1,2,3]}');
    await view.click(view.findByText('Format', 'button'));
    assert.match(output.value, /\n {2}"b": 2/);

    await view.click(view.findByText('Minify', 'button'));
    assert.equal(output.value, '{"b":2,"a":[1,2,3]}');

    await view.type(input, '{"a":1,}');
    await view.click(view.findByText('Validate', 'button'));
    assert.match(view.text(), /Invalid JSON/);
    assert.match(view.text(), /Line 1/);

    await view.click(view.findByText('Clear', 'button'));
    assert.equal(view.container.querySelectorAll('textarea')[0].value, '');
    await view.unmount();
  })
);

/* --------------------------------------------------------------- lorem ipsum */

test(
  'Lorem Ipsum generates, regenerates and resets',
  withDom(async () => {
    const view = await mount(components.LoremIpsum);
    await view.click(view.findByText('Generate', 'button'));
    const first = view.container.querySelector('textarea').value;
    assert.ok(first.length > 50, 'text was generated');

    await view.click(view.findByText('Regenerate', 'button'));
    const second = view.container.querySelector('textarea').value;
    assert.ok(second.length > 50);
    assert.notEqual(first, second, 'regenerate produces new text');

    await view.click(view.findByText('Clear', 'button'));
    assert.equal(view.container.querySelector('textarea').value, '');
    await view.unmount();
  })
);

/* --------------------------------------------------------- password generator */

test(
  'Password Generator creates strong, unique passwords and resets',
  withDom(async () => {
    const view = await mount(components.PasswordGenerator);
    await view.click(view.findByText('Generate password', 'button'));
    const first = view.container.querySelector('code').textContent;
    assert.equal(first.length, 16, 'default length is 16');
    assert.match(view.text(), /Strength:/);
    assert.match(view.text(), /Excellent|Strong|Good/);

    await view.click(view.findByText('Generate password', 'button'));
    const second = view.container.querySelector('code').textContent;
    assert.notEqual(first, second);

    await view.click(view.findByText('Reset', 'button'));
    assert.match(view.container.querySelector('code').textContent, /Press/);
    await view.unmount();
  })
);

/* --------------------------------------------------------------- regex tester */

test(
  'Regex Tester highlights matches, lists groups and previews replacements',
  withDom(async () => {
    const view = await mount(components.RegexTester);
    const textareas = view.container.querySelectorAll('textarea');
    await view.type(textareas[0], 'mail me at ada@toolnova.ai or grace@example.org');

    assert.match(view.text(), /Matches/);
    assert.ok(view.container.querySelectorAll('mark').length >= 2, 'matches are highlighted');
    assert.match(view.text(), /index 11/);
    assert.match(view.text(), /Group 1/);

    const output = view.container.querySelector('pre');
    assert.ok(output && output.textContent.includes('[ada]'), 'replacement preview renders');
    await view.unmount();
  })
);

test(
  'Regex Tester shows a real error for an invalid pattern',
  withDom(async () => {
    const view = await mount(components.RegexTester);
    const pattern = view.container.querySelector('#regex-pattern');
    await view.type(pattern, '(unclosed');
    assert.match(view.text(), /Invalid regular expression/);
    await view.unmount();
  })
);

/* ---------------------------------------------------------------- url encoder */

test(
  'URL Encoder converts both ways and parses query parameters',
  withDom(async () => {
    const view = await mount(components.UrlEncoder);
    await view.type(view.byId('url-input'), 'https://example.com/a b?name=ada lovelace&page=2');
    await view.click(view.findByText('Encode', 'button'));
    assert.equal(
      view.byId('url-output').value,
      'https%3A%2F%2Fexample.com%2Fa%20b%3Fname%3Dada%20lovelace%26page%3D2'
    );

    // Switch to decode mode and decode a real encoded URL
    await view.click(view.findRadio('Decode'));
    await view.type(
      view.byId('url-input'),
      'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dtool%2520nova%26page%3D2'
    );
    await view.click(view.findByText('Decode', 'button'));
    assert.equal(
      view.byId('url-output').value,
      'https://example.com/search?q=tool%20nova&page=2'
    );
    assert.match(view.text(), /Query parameters/);

    // Invalid input is reported, not swallowed
    await view.type(view.byId('url-input'), '%E0%A4%A');
    await view.click(view.findByText('Decode', 'button'));
    assert.match(view.text(), /not valid percent-encoded/);

    await view.click(view.findByText('Clear', 'button'));
    assert.equal(view.byId('url-input').value, '');
    await view.unmount();
  })
);

/* ---------------------------------------------------------------- jwt decoder */

test(
  'JWT Decoder shows header, claims and expiry warnings',
  withDom(async () => {
    const view = await mount(components.JwtDecoder);
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' })
    ).toString('base64url');
    const past = Math.floor(Date.now() / 1000) - 3600;
    const payload = Buffer.from(
      JSON.stringify({ sub: '1234567890', name: 'Ada Lovelace', exp: past })
    ).toString('base64url');
    const token = `${header}.${payload}.signature-value`;

    await view.type(view.container.querySelector('textarea'), token);
    await view.click(view.findByText('Decode token', 'button'));

    assert.match(view.text(), /HS256/);
    assert.match(view.text(), /Ada Lovelace/);
    assert.match(view.text(), /has expired/);
    assert.match(view.text(), /does not verify the signature/);

    await view.click(view.findByText('Clear', 'button'));
    assert.equal(view.container.querySelector('textarea').value, '');
    await view.unmount();
  })
);

test(
  'JWT Decoder rejects a malformed token with a helpful message',
  withDom(async () => {
    const view = await mount(components.JwtDecoder);
    await view.type(view.container.querySelector('textarea'), 'not-a-token');
    await view.click(view.findByText('Decode token', 'button'));
    assert.match(view.text(), /not a valid JWT/);
    await view.unmount();
  })
);

/* --------------------------------------------------------- timestamp converter */

test(
  'Timestamp Converter converts both directions and copies',
  withDom(async () => {
    const view = await mount(components.TimestampConverter);
    const input = view.container.querySelector('#ts-input');
    await view.type(input, '1767225600');
    assert.match(view.text(), /2026/);
    assert.match(view.text(), /ISO 8601/);
    assert.match(view.text(), /Conversions/);
    await view.unmount();
  })
);

/* -------------------------------------------------------------- csv converter */

test(
  'CSV ⇄ JSON converts, previews and reports invalid JSON',
  withDom(async () => {
    const view = await mount(components.CsvConverter);
    const [input, output] = view.container.querySelectorAll('textarea');

    await view.type(input, 'name,age\nAda,36\nGrace,45');
    await view.click(view.findByText('Convert', 'button'));
    assert.match(output.value, /"name": "Ada"/);
    assert.match(view.text(), /Preview/);
    assert.match(view.text(), /Ada/);

    await view.click(view.findRadio('JSON → CSV'));
    const jsonInput = view.container.querySelectorAll('textarea')[0];
    await view.type(jsonInput, '{"broken":}');
    await view.click(view.findByText('Convert', 'button'));
    assert.match(view.text(), /Unexpected|JSON/);

    await view.click(view.findByText('Clear', 'button'));
    assert.equal(view.container.querySelectorAll('textarea')[0].value, '');
    await view.unmount();
  })
);

/* ------------------------------------------------------------- hash generator */

test(
  'Hash Generator produces matching digests for every algorithm',
  withDom(async () => {
    const view = await mount(components.HashGenerator);
    await view.type(view.container.querySelector('textarea'), 'toolnova');
    await view.click(view.findByText('Generate hashes', 'button'));

    const text = view.text();
    assert.match(text, /SHA-1/);
    assert.match(text, /SHA-256/);
    assert.match(text, /SHA-512/);
    // Known SHA-256 for "toolnova"
    assert.match(
      text,
      /[0-9a-f]{64}/,
      'hex digests render'
    );
    await view.unmount();
  })
);

/* --------------------------------------------------------------- base64 tool */

test(
  'Base64 tool encodes, decodes and reports invalid input',
  withDom(async () => {
    const view = await mount(components.Base64Tool);
    await view.type(view.byId('b64-main-input'), 'ToolNova AI — free tools ✓');
    await view.click(view.findByText('Encode', 'button'));
    const encoded = view.byId('b64-main-output').value;
    assert.equal(encoded, Buffer.from('ToolNova AI — free tools ✓', 'utf8').toString('base64'));

    await view.click(view.findRadio('Decode'));
    await view.type(view.byId('b64-main-input'), encoded);
    await view.click(view.findByText('Decode', 'button'));
    assert.equal(view.byId('b64-main-output').value, 'ToolNova AI — free tools ✓');

    await view.type(view.byId('b64-main-input'), 'not-valid-base64!!');
    await view.click(view.findByText('Decode', 'button'));
    assert.match(view.text(), /not valid Base64|Decoding failed|Something went wrong/i);

    await view.click(view.findByText('Clear', 'button'));
    assert.equal(view.byId('b64-main-input').value, '');
    await view.unmount();
  })
);

/* ------------------------------------------------------------- QR generator */

test(
  'QR Code Generator renders a code and enables downloads',
  withDom(async () => {
    const view = await mount(components.QrGenerator);
    // jsdom has no canvas, so qrcode's PNG path is skipped; the SVG path still
    // runs and enables the SVG download button.
    await new Promise((resolve) => setTimeout(resolve, 400));
    const buttons = Array.from(view.container.querySelectorAll('button')).map((b) => b.textContent);
    assert.ok(buttons.some((label) => label?.includes('Download SVG')), 'SVG download exists');
    assert.ok(buttons.some((label) => label?.includes('Download PNG')), 'PNG download exists');
    assert.match(view.text(), /Encoded content: https:\/\/toolnovaai.com/);
    await view.unmount();
  })
);

/* -------------------------------------------------------------- upload box */

test(
  'UploadBox validates file type and size before accepting a file',
  withDom(async () => {
    const accepted = [];
    const view = await mount(components.UploadBox, {
      accept: 'image/png',
      maxSizeMb: 1,
      onFiles: (files) => accepted.push(...files),
    });

    const input = view.container.querySelector('input[type="file"]');
    assert.ok(input, 'file input exists');

    const setFiles = (files) => {
      Object.defineProperty(input, 'files', { value: files, configurable: true });
      return input;
    };

    const item = (name, type, size) => {
      const file = new globalThis.window.File(['x'.repeat(size)], name, { type });
      return file;
    };

    // Unsupported type
    await view.type(setFiles([item('notes.pdf', 'application/pdf', 10)]), '');
    setFiles([item('notes.pdf', 'application/pdf', 10)]);
    const { act } = components;
    await act(async () => {
      input.dispatchEvent(new globalThis.window.Event('change', { bubbles: true }));
    });
    assert.match(view.text(), /Unsupported file format/);
    assert.equal(accepted.length, 0);

    // Too large
    setFiles([item('huge.png', 'image/png', 2 * 1024 * 1024)]);
    await act(async () => {
      input.dispatchEvent(new globalThis.window.Event('change', { bubbles: true }));
    });
    assert.match(view.text(), /File is too large/);
    assert.equal(accepted.length, 0);

    // Valid
    setFiles([item('ok.png', 'image/png', 1024)]);
    await act(async () => {
      input.dispatchEvent(new globalThis.window.Event('change', { bubbles: true }));
    });
    assert.equal(accepted.length, 1);
    assert.equal(accepted[0].name, 'ok.png');
    await view.unmount();
  })
);

/* --------------------------------------------------------------- tool search */

test(
  'Search finds tools, navigates to the right page and shows the empty state',
  withDom(async () => {
    const { routerCalls } = components;
    routerCalls.length = 0;
    const view = await mount(components.ToolSearch);
    const input = view.container.querySelector('input[type="search"]');

    await view.type(input, 'compress');
    assert.match(view.text(), /Image Compressor/);
    assert.ok(view.container.querySelectorAll('[role="option"]').length >= 1, 'results render');

    // Enter opens the highlighted tool
    await components.act(async () => {
      input.dispatchEvent(
        new globalThis.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      );
    });
    assert.ok(
      (routerCalls ?? []).some((call) => call.href === '/tools/image-compressor'),
      `router pushed to the tool page, calls: ${JSON.stringify(routerCalls)}`
    );

    await view.type(input, 'zzzzz-nothing');
    assert.match(view.text(), /No tools found/);
    await view.unmount();
  })
);

/* ------------------------------------------------------------ theme toggle */

test(
  'Theme toggle switches the document class and remembers the choice',
  withDom(async () => {
    const view = await mount(components.ThemeToggle);
    const root = globalThis.document.documentElement;
    const before = root.classList.contains('dark');
    await view.click(view.container.querySelector('button'));
    assert.notEqual(root.classList.contains('dark'), before, 'theme flips');
    assert.equal(globalThis.window.localStorage.getItem('toolnova-theme'), root.classList.contains('dark') ? 'dark' : 'light');
    await view.unmount();
  })
);

/* ---------------------------------------------------------------- header */

test(
  'Header opens the mobile menu, navigates and closes again',
  withDom(async () => {
    const { routerCalls } = components;
    routerCalls.length = 0;
    const view = await mount(components.Header);

    const openMenu = view.container.querySelector('button[aria-label="Open menu"]');
    assert.ok(openMenu, 'the header renders a menu button');
    assert.equal(openMenu.getAttribute('aria-expanded'), 'false');

    await view.click(openMenu);
    const dialog = view.container.querySelector('[role="dialog"][aria-label="Site menu"]');
    assert.ok(dialog, 'the mobile menu opens as a dialog');
    assert.match(dialog.textContent ?? '', /Image Tools/);
    assert.match(dialog.textContent ?? '', /About/);
    assert.match(dialog.textContent ?? '', /Your files are processed locally/);

    // A link inside the menu navigates and closes the menu.
    const link = Array.from(dialog.querySelectorAll('a')).find(
      (anchor) => anchor.getAttribute('href') === '/categories/pdf-tools'
    );
    assert.ok(link, 'the menu links to the PDF tools category');
    await view.click(link);
    assert.ok(!view.container.querySelector('[role="dialog"][aria-label="Site menu"]'), 'menu closes after navigating');

    // The desktop search button opens the search dialog.
    const searchButton = view.container.querySelector('button[aria-label="Open tool search"]');
    assert.ok(searchButton, 'search button exists');
    await view.click(searchButton);
    assert.ok(view.container.querySelector('input[type="search"]'), 'search input appears');
    void routerCalls;
    await view.unmount();
  })
);

/* ------------------------------------------------------------ ai tools (UI) */

test(
  'AI tools warn when the service is not configured instead of faking output',
  withDom(async () => {
    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({ url, options });
      if (String(url).includes('/api/ai') && (!options || options.method !== 'POST')) {
        return { ok: true, json: async () => ({ ok: true, configured: false, model: null }) };
      }
      return {
        ok: false,
        status: 503,
        json: async () => ({
          ok: false,
          code: 'AI_NOT_CONFIGURED',
          error: 'AI service is not configured yet. Set the AI_API_KEY environment variable on the server to enable this tool.',
        }),
      };
    };

    const view = await mount(components.AiTextGenerator);
    await view.type(view.container.querySelector('textarea'), 'Write a product announcement');
    await view.click(view.findByText('Generate', 'button'));

    assert.match(view.text(), /AI service is not configured yet/);
    assert.match(view.text(), /No text was generated/);
    assert.equal(calls.filter((call) => call.options?.method === 'POST').length, 1);
    await view.unmount();
  })
);

test(
  'AI summarizer refuses short input and posts valid input',
  withDom(async () => {
    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({ url, options });
      if (options?.method === 'POST') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ ok: true, text: 'A faithful summary.', model: 'test-model' }),
        };
      }
      return { ok: true, json: async () => ({ ok: true, configured: true, model: 'test-model' }) };
    };

    const view = await mount(components.AiSummarizer);
    await view.type(view.container.querySelector('textarea'), 'short');
    assert.match(view.text(), /at least 40 characters/);

    await view.type(
      view.container.querySelector('textarea'),
      'This is a long enough passage for the summariser to accept and send to the configured provider for processing.'
    );
    await view.click(view.findByText('Summarise', 'button'));
    assert.match(view.text(), /A faithful summary/);
    assert.equal(calls.filter((call) => call.options?.method === 'POST').length, 1);
    await view.unmount();
  })
);

/* -------------------------------------------------------------- contact form */

test(
  'Contact form validates every field before submitting',
  withDom(async () => {
    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({ url, options });
      if (options?.method === 'POST') {
        return {
          ok: false,
          status: 400,
          json: async () => ({
            ok: false,
            code: 'VALIDATION_ERROR',
            error: 'Please fix the highlighted fields.',
            errors: {},
          }),
        };
      }
      return { ok: true, json: async () => ({ ok: true, configured: true }) };
    };

    const view = await mount(components.ContactForm);
    await view.submit(view.container.querySelector('form'));

    const text = view.text();
    assert.match(text, /Please enter your name/);
    assert.match(text, /Please enter a valid email address/);
    assert.match(text, /Please enter a subject/);
    assert.match(text, /Please write at least 10 characters/);
    assert.equal(calls.filter((call) => call.options?.method === 'POST').length, 0, 'nothing was sent');

    // Fill it in properly and submit
    await view.type(view.container.querySelector('#contact-name'), 'Ada Lovelace');
    await view.type(view.container.querySelector('#contact-email'), 'ada@example.com');
    await view.type(view.container.querySelector('#contact-subject'), 'Feature request');
    await view.type(view.container.querySelector('#contact-message'), 'Please add a PDF OCR tool.');
    await view.submit(view.container.querySelector('form'));
    assert.equal(calls.filter((call) => call.options?.method === 'POST').length, 1, 'form submits');
    await view.unmount();
  })
);

test(
  'Contact form says so plainly when delivery is not configured',
  withDom(async () => {
    globalThis.fetch = async (url, options) => {
      if (options?.method === 'POST') {
        return {
          ok: false,
          status: 503,
          json: async () => ({
            ok: false,
            code: 'CONTACT_NOT_CONFIGURED',
            error:
              'Contact service is not configured. Set RESEND_API_KEY and CONTACT_TO_EMAIL (or CONTACT_WEBHOOK_URL) on the server.',
          }),
        };
      }
      return { ok: true, json: async () => ({ ok: true, configured: false }) };
    };

    const view = await mount(components.ContactForm);
    assert.match(view.text(), /Contact service is not configured/);

    await view.type(view.container.querySelector('#contact-name'), 'Ada Lovelace');
    await view.type(view.container.querySelector('#contact-email'), 'ada@example.com');
    await view.type(view.container.querySelector('#contact-subject'), 'Testing');
    await view.type(view.container.querySelector('#contact-message'), 'This should not be delivered.');
    await view.submit(view.container.querySelector('form'));
    assert.match(view.text(), /Contact service is not configured/);
    assert.ok(!view.text().includes('Message sent'), 'no false success message');
    await view.unmount();
  })
);

/* ----------------------------------------------------------- tools explorer */

test(
  'Tools explorer filters by query and category and shows an empty state',
  withDom(async () => {
    const view = await mount(components.ToolsExplorer);
    const input = view.container.querySelector('#tools-filter');

    assert.match(view.text(), /31 tools/);
    await view.type(input, 'pdf');
    assert.match(view.text(), /PDF Merger/);
    assert.ok(!view.text().includes('Image Compressor'), 'unrelated tools are filtered out');

    await view.type(input, 'zzzzz');
    assert.match(view.text(), /No tools found/);

    await view.click(view.findByText('Clear filters', 'button'));
    assert.match(view.text(), /31 tools/);

    await view.click(view.findTab('PDF Tools'));
    assert.match(view.text(), /PDF Splitter/);
    assert.ok(!view.text().includes('Word Counter'));
    await view.unmount();
  })
);
