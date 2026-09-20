import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const pageUrl = new URL('../index.html', import.meta.url);
const rootUrl = new URL('../', import.meta.url);
const html = await readFile(pageUrl, 'utf8');

assert.match(html, /<meta name="robots" content="index,follow,max-image-preview:large">/);
assert.doesNotMatch(html, /noindex|From-Zero Review/);
assert.match(html, /<link rel="canonical" href="https:\/\/www\.davesmainecafe\.com\/">/);
assert.match(html, /G-6JFFXXPBNG/);
assert.match(html, /\/assets\/dmc-conversions\.js/);

assert.match(html, /Dave's<br>Lobster Roll<b>\$20<\/b><small>\$18 Thursdays<\/small>/);
assert.match(html, /Mix &amp; match four for \$9\.99\./);
assert.doesNotMatch(html, /Take &amp; Bake|take one home/i);

assert.match(html, /Sun · 11:30–5/);
assert.match(html, /Wednesday–Friday · 11:30 AM–7 PM/);
assert.match(html, /Saturday–Sunday · 11:30 AM–5 PM/);
assert.match(html, /Monday–Tuesday · Closed/);

assert.match(html, /order\.toasttab\.com\/online\/davesmainecafe/);
assert.match(html, /google\.com\/maps\/dir/);
assert.match(html, /href="tel:\+12074755655"/);
assert.match(html, /facebook\.com\/davesmainecafe/);

const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)];
assert.equal(jsonLdBlocks.length, 1);
const restaurant = JSON.parse(jsonLdBlocks[0][1]);
assert.equal(restaurant['@type'], 'Restaurant');
assert.equal(restaurant.name, "Dave's Maine Cafe");
assert.equal(restaurant.hasMenuItem.offers.price, '20.00');
assert.deepEqual(restaurant.openingHoursSpecification[1].dayOfWeek, ['Saturday', 'Sunday']);

const localRefs = [...html.matchAll(/(?:src|href)="(\/[^"#?]+)"/g)]
  .map((match) => match[1])
  .filter((ref) => !ref.startsWith('//'));
for (const ref of localRefs) await access(fileURLToPath(new URL(`.${ref}`, rootUrl)));

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
for (const target of [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1])) {
  assert.ok(ids.has(target), `missing anchor target #${target}`);
}

console.log(`homepage release contract: PASS (${localRefs.length} local references)`);
