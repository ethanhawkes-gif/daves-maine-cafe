import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../catering/index.html', import.meta.url), 'utf8');
const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');

test('catering is indexable, canonical, and included in the sitemap', () => {
  assert.match(html, /<meta name="robots" content="index,follow/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.davesmainecafe\.com\/catering\/">/);
  assert.match(sitemap, /<loc>https:\/\/www\.davesmainecafe\.com\/catering\/<\/loc>/);
});

test('catering social previews use current first-party URLs', () => {
  assert.match(html, /<meta property="og:url" content="https:\/\/www\.davesmainecafe\.com\/catering\/">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/www\.davesmainecafe\.com\/assets\/photos\//);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
});

test('catering structured data links the service, restaurant, FAQ, and breadcrumb', () => {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, 'JSON-LD block is present');
  const graph = JSON.parse(match[1])['@graph'];
  const types = graph.flatMap((node) => Array.isArray(node['@type']) ? node['@type'] : [node['@type']]);
  for (const type of ['Restaurant', 'Service', 'WebPage', 'FAQPage', 'BreadcrumbList']) assert.ok(types.includes(type), type);
  const service = graph.find((node) => node['@type'] === 'Service');
  assert.equal(service.provider['@id'], 'https://www.davesmainecafe.com/#restaurant');
});
