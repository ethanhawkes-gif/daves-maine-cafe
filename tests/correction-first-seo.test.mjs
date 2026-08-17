import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [sitemap, catering, routeOne, event, retired] = await Promise.all([
  read('sitemap.xml'),
  read('catering/index.html'),
  read('route-one-bottling/index.html'),
  read('lobster-roll-weekend/index.html'),
  read('bugs-are-back/index.html'),
]);

for (const path of ['catering/', 'route-one-bottling/']) {
  assert.match(sitemap, new RegExp(`https://www\\.davesmainecafe\\.com/${path}`));
}
assert.doesNotMatch(sitemap, /lobster-roll-weekend/);

for (const [html, path] of [[catering, 'catering'], [routeOne, 'route-one-bottling']]) {
  assert.match(html, new RegExp(`<link rel="canonical" href="https://www\\.davesmainecafe\\.com/${path}/">`));
  assert.match(html, /<meta property="og:title"/);
  assert.match(html, /G-6JFFXXPBNG/);
}

for (const html of [catering, routeOne]) {
  for (const match of html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)) JSON.parse(match[1]);
}

assert.match(event, /name="robots" content="noindex,follow"/);
assert.match(event, /<link rel="canonical" href="https:\/\/www\.davesmainecafe\.com\/lobster-rolls\/">/);
assert.match(event, /location\.replace\('\/lobster-rolls\/'\)/);
assert.doesNotMatch(event, /August 14–16|\$19|LimitedAvailability|EventScheduled/);
assert.match(retired, /name="robots" content="noindex,follow"/);
assert.match(retired, /lobster-roll-weekend/);
assert.doesNotMatch(retired, /August 13|\$18|1674832227310619/);

console.log('correction-first SEO contract: PASS');
