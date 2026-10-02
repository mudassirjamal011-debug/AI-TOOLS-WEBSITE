import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { tools, toolMap, toolCount, searchTools, popularTools } from '../lib/tools.ts';
import { categories, categoryMap } from '../lib/categories.ts';
import { catalog, searchCatalog } from '../lib/catalog.ts';
import { blogPosts } from '../lib/blog.ts';

test('every tool has a unique slug and required copy', () => {
  const slugs = tools.map((tool) => tool.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'slugs are unique');

  for (const tool of tools) {
    assert.ok(tool.name, `${tool.slug} has a name`);
    assert.ok(tool.tagline.length > 20, `${tool.slug} tagline is descriptive`);
    assert.ok(
      tool.description.length >= 100 && tool.description.length <= 200,
      `${tool.slug} meta description is ${tool.description.length} chars (want 100–200)`
    );
    assert.ok(tool.howTo.length >= 3, `${tool.slug} has step-by-step instructions`);
    assert.ok(tool.faq.length >= 3, `${tool.slug} has an FAQ`);
    assert.ok(tool.intro.length >= 1, `${tool.slug} has long-form content`);
    assert.ok(categoryMap[tool.category], `${tool.slug} points at a real category`);
    assert.ok(tool.keywords.length >= 3, `${tool.slug} has keywords`);
  }
});

test('related tool links all resolve to real tools', () => {
  for (const tool of tools) {
    for (const related of tool.related) {
      assert.ok(toolMap[related], `${tool.slug} links to unknown tool "${related}"`);
      assert.notEqual(related, tool.slug, `${tool.slug} should not link to itself`);
    }
  }
});

test('every category has at least one tool and a valid icon', () => {
  for (const category of categories) {
    const members = tools.filter((tool) => tool.category === category.slug);
    assert.ok(members.length > 0, `${category.slug} is not empty`);
    assert.ok(category.intro.length >= 2, `${category.slug} has intro copy`);
    assert.equal(category.faq.length >= 3, true, `${category.slug} has an FAQ`);
  }
});

test('catalog mirrors the registry and stays in sync', () => {
  assert.equal(catalog.length, tools.length);
  for (const entry of catalog) {
    const tool = toolMap[entry.slug];
    assert.ok(tool);
    assert.equal(entry.name, tool.name);
    assert.equal(entry.category, tool.category);
  }
});

test('search finds tools by name, synonym and category', () => {
  assert.ok(searchTools('compress')[0]?.slug.startsWith('image-compress'));
  assert.ok(searchTools('pdf merge').some((tool) => tool.slug === 'pdf-merger'));
  assert.ok(searchTools('jpg to webp').some((tool) => tool.slug === 'image-converter'));
  assert.ok(searchTools('json').length >= 1);
  assert.equal(searchTools('').length, 0);
  assert.equal(searchTools('zzzzzz').length, 0);

  assert.equal(searchCatalog('word count')[0]?.slug, 'word-counter');
  assert.equal(searchCatalog('nonsense-query').length, 0);
});

test('popular tools are a non-empty subset of the registry', () => {
  assert.ok(popularTools.length >= 5);
  assert.ok(popularTools.every((tool) => toolMap[tool.slug]));
});

test('blog posts are complete and link to real tools', () => {
  for (const post of blogPosts) {
    assert.ok(post.title && post.description);
    assert.ok(post.blocks.length >= 3, `${post.slug} has content`);
    assert.ok(post.faq.length >= 3, `${post.slug} has an FAQ`);
    assert.ok(post.takeaways.length >= 3, `${post.slug} has takeaways`);
    for (const slug of post.relatedTools) {
      assert.ok(toolMap[slug], `${post.slug} links to unknown tool ${slug}`);
    }
  }
  const slugs = blogPosts.map((post) => post.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test('every tool slug is registered in the ToolRunner component map', () => {
  const source = readFileSync(new URL('../components/tools/ToolRunner.tsx', import.meta.url), 'utf8');
  for (const tool of tools) {
    assert.ok(
      source.includes(`'${tool.slug}':`),
      `${tool.slug} is missing from components/tools/ToolRunner.tsx`
    );
  }
  assert.equal(toolCount, tools.length);
});
