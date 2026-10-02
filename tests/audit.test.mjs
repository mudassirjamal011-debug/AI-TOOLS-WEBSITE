import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { join, extname, relative } from 'node:path';

/**
 * Source hygiene checks. These guard the promises the site makes: no fake
 * buttons, no placeholder behaviour, no secrets in client code.
 */

const root = new URL('..', import.meta.url).pathname;
const sourceDirs = ['app', 'components', 'lib'];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      files.push(...(await walk(full)));
    } else if (['.ts', '.tsx', '.js', '.mjs'].includes(extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

const files = [];
for (const dir of sourceDirs) {
  files.push(...(await walk(join(root, dir))));
}

const contents = await Promise.all(
  files.map(async (file) => ({ file: relative(root, file), text: await readFile(file, 'utf8') }))
);

test('no placeholder or fake behaviour in the source', () => {
  const offenders = [];
  for (const { file, text } of contents) {
    if (/\balert\s*\(/.test(text)) offenders.push(`${file}: alert()`);
    if (/coming\s*soon/i.test(text)) offenders.push(`${file}: "coming soon"`);
    if (/TODO|FIXME/i.test(text)) offenders.push(`${file}: TODO/FIXME`);
    if (/not implemented/i.test(text)) offenders.push(`${file}: "not implemented"`);
    if (/Math\.random\s*\(\s*\)\s*\*?\s*\d*\s*(\+\s*)?/.test(text) && /fake|mock|dummy/i.test(text)) {
      offenders.push(`${file}: random mock data`);
    }
  }
  assert.deepEqual(offenders, [], `placeholder code found:\n${offenders.join('\n')}`);
});

test('no secrets or private keys are hard-coded', () => {
  const offenders = [];
  for (const { file, text } of contents) {
    // Sk-… (OpenAI), AIza… (Google), SG./resend keys, long hex strings
    if (/\bsk-[A-Za-z0-9]{16,}/.test(text)) offenders.push(`${file}: looks like an OpenAI key`);
    if (/\bAIza[0-9A-Za-z_-]{20,}/.test(text)) offenders.push(`${file}: looks like a Google key`);
    if (/\bSG\.[A-Za-z0-9_-]{16,}/.test(text)) offenders.push(`${file}: looks like a SendGrid key`);
    if (/\bre_[A-Za-z0-9_-]{16,}/.test(text)) offenders.push(`${file}: looks like a Resend key`);
  }
  assert.deepEqual(offenders, [], `hard-coded secrets found:\n${offenders.join('\n')}`);
});

test('only public values are exposed to the browser', () => {
  const offenders = [];
  const allowed = new Set([
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_ADS_ENABLED',
    'NEXT_PUBLIC_ADSENSE_CLIENT',
  ]);
  for (const { file, text } of contents) {
    for (const match of text.matchAll(/process\.env\.NEXT_PUBLIC_[A-Z0-9_]+/g)) {
      if (!allowed.has(match[0].replace('process.env.', ''))) {
        offenders.push(`${file}: ${match[0]}`);
      }
    }
    // Server-only variables must only be *read* inside route handlers.
    for (const match of text.matchAll(
      /process\.env\.(AI_API_KEY|DATABASE_URL|RESEND_API_KEY|CONTACT_[A-Z_]+|AI_PROVIDER|AI_MODEL)/g
    )) {
      // Server-only modules (route handlers and lib/server) may read them.
      if (file.startsWith('app/api') || file.startsWith('lib/server')) continue;
      offenders.push(`${file}: reads ${match[1]} outside the API routes`);
    }
  }
  assert.deepEqual(offenders, [], `client-side env misuse found:\n${offenders.join('\n')}`);
});

test('no absolute localhost URLs in client code', () => {
  const offenders = [];
  for (const { file, text } of contents) {
    if (file.startsWith('app/api')) continue;
    if (/https?:\/\/(localhost|127\.0\.0\.1)/.test(text)) offenders.push(file);
  }
  assert.deepEqual(offenders, [], `localhost URLs found in: ${offenders.join(', ')}`);
});

test('every interactive control has a handler', () => {
  const offenders = [];
  for (const { file, text } of contents) {
    if (extname(file) !== '.tsx') continue;
    const buttons = text.match(/<button\b[\s\S]*?>/g) ?? [];
    for (const button of buttons) {
      // Buttons inside .map() blocks get their handler from a render prop; the
      // ones we care about are the literal ones.
      // A component that spreads props forwards the caller's onClick.
      const spreadsProps = button.includes('{...');
      if (!button.includes('onClick') && !button.includes('type="submit"') && !spreadsProps) {
        offenders.push(`${file}: <button> without onClick →\n${button.slice(0, 160)}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `buttons without handlers:\n${offenders.join('\n')}`);
});

test('the site publishes the required legal and information pages', async () => {
  for (const page of [
    'privacy-policy',
    'terms',
    'cookie-policy',
    'about',
    'contact',
    'blog',
    'tools',
  ]) {
    const entries = await readdir(join(root, 'app', page)).catch(() => null);
    assert.ok(entries, `app/${page}/page.tsx is missing`);
    assert.ok(entries.includes('page.tsx'), `app/${page}/page.tsx is missing`);
  }
});

test('advertisement slots are labelled and never render fake ads', async () => {
  const adFile = join(root, 'components/ui/AdPlaceholder.tsx');
  const text = await readFile(adFile, 'utf8');
  assert.match(text, /Advertisement/);
  assert.ok(
    !/https:\/\/pagead2\.googlesyndication/.test(text),
    'no live ad network script is injected by default'
  );
  assert.match(text, /export function AdManager/);
  assert.match(text, /NEXT_PUBLIC_ADSENSE_CLIENT|ads\.client/);

  // The five required slots are actually placed somewhere in the app.
  const placed = new Set();
  for (const { text: source } of contents) {
    for (const match of source.matchAll(/<AdPlaceholder slot="([a-z-]+)"/g)) placed.add(match[1]);
  }
  for (const slot of ['header-banner', 'between-sections', 'below-result', 'sidebar', 'before-related']) {
    assert.ok(placed.has(slot), `the ${slot} ad slot is not used anywhere`);
  }
});
