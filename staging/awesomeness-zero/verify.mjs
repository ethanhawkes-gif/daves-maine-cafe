#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const here = dirname(fileURLToPath(import.meta.url));
const html = await readFile(resolve(here, 'index.html'), 'utf8');
const manifest = JSON.parse(await readFile(resolve(here, 'manifest.json'), 'utf8'));
const publicFacts = JSON.parse(await readFile(resolve(here, 'site-facts.json'), 'utf8'));
const llms = await readFile(resolve(here, 'llms.txt'), 'utf8');
const failures = [];
const pass = (condition, message) => { if (!condition) failures.push(message); };

pass(/<meta name="robots" content="noindex,nofollow,noarchive">/.test(html), 'review must remain noindex');
pass(/<title>Lobster Rolls in Kittery, Maine \| Dave's Maine Cafe<\/title>/.test(html), 'search title missing');
pass(/<link rel="canonical" href="https:\/\/www\.davesmainecafe\.com\/">/.test(html), 'canonical missing');
pass(/id="answers"/.test(html) && /Route 1 roadside intelligence/.test(html), 'visible answer section missing');
pass((html.match(/data-intent-action="order_online"/g) ?? []).length === 4, 'expected four order intent hooks');
pass((html.match(/data-intent-action="directions"/g) ?? []).length === 2, 'expected two directions intent hooks');
pass((html.match(/data-intent-action="phone_call"/g) ?? []).length === 2, 'expected two phone intent hooks');
pass(html.includes('G-6JFFXXPBNG'), 'production GA4 measurement ID missing');
pass(html.includes('/assets/dmc-conversions.js'), 'production conversion script missing');
pass(html.includes('data-cta="masthead"'), 'masthead CTA attribution missing');
pass(html.includes('data-cta="hero"'), 'hero CTA attribution missing');
pass(html.includes('data-cta="local_intel"'), 'local-intel CTA attribution missing');
pass(html.includes('data-cta="visit"'), 'visit CTA attribution missing');
pass(html.includes('data-cta="mobile_bar"'), 'mobile-bar CTA attribution missing');
pass((html.match(/utm_content=/g) ?? []).length === 4, 'every order CTA needs a distinct content label');
pass(manifest.reviewRevision.startsWith('v8'), 'manifest revision must be v8');
pass(manifest.productionChanged === false, 'productionChanged must remain false');
pass((html.match(/data-review-zone="[1-7]"/g) ?? []).length === 7, 'expected seven numbered review zones');
pass(/Fast review:/.test(html), 'fast review instruction missing');
pass(/>Menu<\/a>/.test(html), 'clear Menu tab missing');
for (const route of ['lobster-rolls/', 'catering/', 'route-one-bottling/', 'visit-kittery/']) {
  pass(html.includes(`href="https://www.davesmainecafe.com/${route}"`), `established route missing from review navigation: ${route}`);
}
pass(/font:18px\/1\.6 Inter/.test(html), '50+ base readability size missing');
pass(publicFacts.schema === 'daves-maine-cafe.public-facts.v1', 'public facts schema missing');
pass(publicFacts.featuredOffer.regularPriceUsd === 20 && publicFacts.featuredOffer.thursdayPriceUsd === 18, 'public fact prices do not match');
pass(llms.includes('Do not infer availability'), 'llms accuracy guard missing');
pass(!html.includes('Maine lobster') && !llms.includes('Maine lobster') && !JSON.stringify(publicFacts).includes('Maine lobster'), 'review must not claim Maine origin for the lobster meat');

const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
pass(jsonLdBlocks.length === 1, 'expected exactly one JSON-LD graph');
if (jsonLdBlocks.length === 1) {
  try {
    const parsed = JSON.parse(jsonLdBlocks[0][1]);
    const graph = Array.isArray(parsed) ? parsed[0] : parsed;
    const nodes = graph['@graph'] ?? [];
    pass(nodes.some((node) => node['@type'] === 'Restaurant'), 'Restaurant schema missing');
    pass(nodes.some((node) => node['@type'] === 'FAQPage'), 'FAQPage schema missing');
    pass(JSON.stringify(graph).includes('18.00') && JSON.stringify(graph).includes('20.00'), 'lobster offers missing');
  } catch {
    failures.push('JSON-LD must parse');
  }
}

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const browserErrors = [];
page.on('pageerror', (error) => browserErrors.push(error.message));
await page.goto(`file://${resolve(here, 'index.html')}`);
for (const width of [360, 390, 768, 1440]) {
  await page.setViewportSize({ width, height: width >= 1000 ? 1000 : 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `horizontal overflow at ${width}px`);
  assert.equal(await page.locator('.review-zone').count(), 7, `review zone count at ${width}px`);
  assert.ok(await page.locator('.mast__order').evaluate((node) => node.getBoundingClientRect().height >= 48), `Menu touch target at ${width}px`);
}
await page.setViewportSize({ width: 390, height: 844 });
assert.equal(await page.locator('.mast__links').isVisible(), false, 'desktop navigation should not crowd the phone header');
assert.equal(await page.locator('.review-map').isVisible(), true, 'numbered review map must be visible on phone');
assert.equal(await page.locator('.review-map__links a').first().evaluate((node) => node.getBoundingClientRect().height >= 44), true, 'review jump target too small');
assert.equal(await page.locator('body').evaluate((node) => getComputedStyle(node).fontSize), '18px', 'body type must remain 18px');
await page.screenshot({ path: '/tmp/dmc-review-mobile-v8.png', fullPage: false });
await page.setViewportSize({ width: 1440, height: 1000 });
assert.equal(await page.locator('.mast__links').isVisible(), true, 'desktop route navigation must be visible');
await page.screenshot({ path: '/tmp/dmc-review-desktop-v8.png', fullPage: false });
assert.deepEqual(browserErrors, [], 'browser errors');
await browser.close();

for (const match of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)) {
  const value = match[1].replaceAll('&amp;', '&');
  if (/^(?:https?:|tel:|mailto:)/.test(value)) continue;
  const relative = value.split(/[?#]/, 1)[0];
  const localPath = relative.startsWith('/')
    ? resolve(here, '../..', relative.slice(1))
    : resolve(here, relative);
  try { await access(localPath); } catch { failures.push(`missing local asset: ${relative}`); }
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  reviewRevision: manifest.reviewRevision,
  structuredDataTypes: ['WebSite', 'Restaurant', 'Menu', 'MenuItem', 'Offer', 'FAQPage'],
  orderIntentHooks: 4,
  directionsIntentHooks: 2,
  phoneIntentHooks: 2,
  browserWidths: [360, 390, 768, 1440],
  bodyFontSize: '18px',
  productionChanged: false
}, null, 2));
