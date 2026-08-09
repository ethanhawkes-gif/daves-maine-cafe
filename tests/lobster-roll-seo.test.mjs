import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../lobster-rolls/index.html', import.meta.url), 'utf8');

assert.match(html, /<title>Maine Lobster Rolls in Kittery, ME \| Dave's Maine Cafe<\/title>/);
assert.match(html, /<link rel="canonical" href="https:\/\/www\.davesmainecafe\.com\/lobster-rolls\/">/);
assert.match(html, /<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">/);
assert.match(html, /<meta property="og:image" content="https:\/\/www\.davesmainecafe\.com\/assets\/photos\/daves-lobster-roll\.jpeg">/);
assert.match(html, /<img[^>]+width="779"[^>]+height="519"[^>]+fetchpriority="high"/);

const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)];
assert.equal(jsonLdBlocks.length, 1, 'lobster page must have one canonical JSON-LD graph');
const jsonLd = JSON.parse(jsonLdBlocks[0][1]);
assert.equal(jsonLd['@context'], 'https://schema.org');
assert.ok(Array.isArray(jsonLd['@graph']), 'JSON-LD must use a graph');

const restaurant = jsonLd['@graph'].find((item) => item['@type'] === 'Restaurant');
const menuItem = jsonLd['@graph'].find((item) => item['@type'] === 'MenuItem');
const webPage = jsonLd['@graph'].find((item) => Array.isArray(item['@type']) && item['@type'].includes('FAQPage'));
const breadcrumbs = jsonLd['@graph'].find((item) => item['@type'] === 'BreadcrumbList');

assert.equal(restaurant.name, "Dave's Maine Cafe");
assert.equal(restaurant.address.addressLocality, 'Kittery');
assert.equal(menuItem.offers.price, '20.00');
assert.equal(menuItem.offers.availability, undefined, 'do not claim always-in-stock inventory for a limited daily item');
assert.equal(webPage.mainEntity.length, 3, 'visible FAQ must have three matching structured questions');
assert.equal(breadcrumbs.itemListElement.length, 2);

console.log('lobster-roll SEO contract: PASS');
