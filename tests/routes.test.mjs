import test from 'node:test';
import assert from 'node:assert/strict';

import { tools } from '../lib/tools.ts';
import { categories } from '../lib/categories.ts';
import { blogPosts } from '../lib/blog.ts';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

let reachable = true;
try {
  const probe = await fetch(BASE, { signal: AbortSignal.timeout(5000) });
  reachable = probe.ok || probe.status === 500;
} catch {
  reachable = false;
}

const skip = !reachable;
const options = skip ? { skip: `server not reachable at ${BASE}` } : {};

async function get(path) {
  const response = await fetch(`${BASE}${path}`);
  return { status: response.status, body: await response.text(), response };
}

test('home page renders hero, search and links', options, async () => {
  const { status, body } = await get('/');
  assert.equal(status, 200);
  assert.match(body, /<h1[^>]*>[\s\S]*Powerful AI &amp; Online Tools/);
  assert.match(body, /Convert, compress, generate and optimize/);
  assert.match(body, /Search 31 tools/);
  assert.match(body, /href="#all-tools"/);
  assert.match(body, /href="#popular-tools"/);
  assert.match(body, /Explore Tools/);
  assert.match(body, /Popular Tools/);
  assert.match(body, /Your files are processed locally/);
  assert.match(body, /rel="canonical" href="[^"]*"/);
  assert.match(body, /application\/ld\+json/);
});

test('every tool page renders with unique SEO metadata', options, async () => {
  for (const tool of tools) {
    const { status, body } = await get(`/tools/${tool.slug}`);
    assert.equal(status, 200, `${tool.slug} returns 200`);
    assert.match(
      body,
      new RegExp(`<title>[^<]*${escapeRegex(escapeHtml(tool.name))}`),
      `${tool.slug} has a unique title`
    );
    assert.match(
      body,
      new RegExp(`rel="canonical" href="[^"]*/tools/${tool.slug}"`),
      `${tool.slug} has a canonical URL`
    );
    assert.match(
      body,
      new RegExp(`<h1[^>]*>[\\s\\S]*${escapeRegex(escapeHtml(tool.name))}`),
      `${tool.slug} has an H1`
    );
    assert.match(body, /property="og:title"/, `${tool.slug} has Open Graph metadata`);
    assert.match(body, /"@type":"FAQPage"/, `${tool.slug} has FAQ structured data`);
    assert.match(body, /"@type":"HowTo"/, `${tool.slug} has HowTo structured data`);
    assert.match(body, /"@type":"WebApplication"/, `${tool.slug} has software structured data`);
    assert.match(body, /"@type":"BreadcrumbList"/, `${tool.slug} has breadcrumbs`);
    assert.ok(
      !body.includes('This tool has no interface yet'),
      `${tool.slug} has a registered interface`
    );
    assert.ok(body.includes('How to use the'), `${tool.slug} has a how-to section`);
    assert.ok(body.includes('Related tools'), `${tool.slug} has related tools`);
    assert.ok(body.includes('Advertisement'), `${tool.slug} reserves ad slots`);
  }
});

test('AI tool pages explain the configuration requirement up front', options, async () => {
  for (const slug of ['ai-text-generator', 'ai-summarizer', 'ai-title-generator']) {
    const { body } = await get(`/tools/${slug}`);
    // The page must mention the API key / configuration requirement in its
    // server-rendered copy, not only after the client component hydrates.
    assert.match(
      body,
      /AI_API_KEY|AI service is not configured|not configured|configured provider/,
      `${slug} explains that a provider must be configured`
    );
    assert.match(body, /Server route|Secure server route|server-side/, `${slug} notes server-side handling`);
  }
});

test('category pages render with their tools', options, async () => {
  for (const category of categories) {
    const { status, body } = await get(`/categories/${category.slug}`);
    assert.equal(status, 200);
    assert.match(
      body,
      new RegExp(`<h1[^>]*>[\\s\\S]*${escapeRegex(escapeHtml(category.title))}`)
    );
    for (const tool of tools.filter((entry) => entry.category === category.slug)) {
      assert.ok(
        body.includes(`/tools/${tool.slug}`),
        `${category.slug} links to ${tool.slug}`
      );
    }
  }
});

test('blog index and posts render with article metadata', options, async () => {
  const index = await get('/blog');
  assert.equal(index.status, 200);
  assert.match(index.body, /Guides/);

  for (const post of blogPosts) {
    const { status, body } = await get(`/blog/${post.slug}`);
    assert.equal(status, 200);
    assert.match(
      body,
      new RegExp(`<h1[^>]*>[\\s\\S]*${escapeRegex(escapeHtml(post.title))}`)
    );
    assert.match(body, /"@type":"BlogPosting"/);
    assert.match(body, /Key takeaways/);
    assert.match(body, /Frequently asked questions/);
  }
});

test('static pages render', options, async () => {
  for (const path of [
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/cookie-policy',
  ]) {
    const { status } = await get(path);
    assert.equal(status, 200, `${path} returns 200`);
  }

  const contact = await get('/contact');
  assert.match(contact.body, /Send message/);
  assert.match(contact.body, /id="contact-name"/);
});

test('tools index supports server-side search queries', options, async () => {
  const { status, body } = await get('/tools?q=pdf');
  assert.equal(status, 200);
  // React inserts comment markers around interpolated numbers.
  assert.match(body, /All <!-- -->31<!-- --> tools/);
  assert.match(body, /Search 31 tools/);
});

test('sitemap and robots are generated correctly', options, async () => {
  const sitemap = await get('/sitemap.xml');
  assert.equal(sitemap.status, 200);
  assert.match(sitemap.body, /<urlset/);
  for (const tool of tools) {
    assert.ok(
      sitemap.body.includes(`/tools/${tool.slug}<`),
      `sitemap includes /tools/${tool.slug}`
    );
  }
  for (const post of blogPosts) {
    assert.ok(sitemap.body.includes(`/blog/${post.slug}<`), `sitemap includes /blog/${post.slug}`);
  }

  const robots = await get('/robots.txt');
  assert.equal(robots.status, 200);
  assert.match(robots.body, /Disallow: \/api\//);
  assert.match(robots.body, /Sitemap: /);
});

test('unknown pages return a friendly 404', options, async () => {
  const { status, body } = await get('/definitely-not-a-page');
  assert.equal(status, 404);
  assert.match(body, /We could not find that page/);
});

test('AI API refuses to invent output when unconfigured', options, async () => {
  const status = await (await fetch(`${BASE}/api/ai`)).json();
  assert.equal(status.configured, false);

  const response = await fetch(`${BASE}/api/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: 'generate', prompt: 'Write a haiku about PDFs' }),
  });
  assert.equal(response.status, 503);
  const data = await response.json();
  assert.equal(data.code, 'AI_NOT_CONFIGURED');
  assert.match(data.error, /AI service is not configured yet/);
  assert.equal(data.text, undefined, 'no fabricated text is returned');
});

test('contact API validates input and reports missing configuration', options, async () => {
  const invalid = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'nope', subject: 'x', message: 'short' }),
  });
  assert.equal(invalid.status, 400);
  const invalidData = await invalid.json();
  assert.equal(invalidData.code, 'VALIDATION_ERROR');
  assert.ok(invalidData.errors.email);

  const valid = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      subject: 'Testing the form',
      message: 'This message is long enough to pass validation.',
    }),
  });
  const validData = await valid.json();
  // 200 = delivered, 503 = no provider configured, 429 = rate limited by an
  // earlier request in this run. All three are correct, honest responses.
  assert.ok([200, 429, 503].includes(valid.status), `unexpected status ${valid.status}`);
  if (valid.status === 503) {
    assert.equal(validData.code, 'CONTACT_NOT_CONFIGURED');
    assert.match(validData.error, /Contact service is not configured/);
  } else if (valid.status === 429) {
    assert.equal(validData.code, 'RATE_LIMITED');
  } else {
    assert.equal(validData.delivered, true);
  }
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** React escapes text nodes; match what the browser actually receives. */
function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
