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

for (const path of ['catering/', 'route-one-bottling/', 'lobster-roll-weekend/']) {
  assert.match(sitemap, new RegExp(`https://www\\.davesmainecafe\\.com/${path}`));
}

for (const [html, path] of [[catering, 'catering'], [routeOne, 'route-one-bottling'], [event, 'lobster-roll-weekend']]) {
  assert.match(html, new RegExp(`<link rel="canonical" href="https://www\\.davesmainecafe\\.com/${path}/">`));
  assert.match(html, /<meta property="og:title"/);
  assert.match(html, /G-6JFFXXPBNG/);
}

for (const html of [catering, routeOne, event]) {
  for (const match of html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)) JSON.parse(match[1]);
}

assert.match(event, /August 14–16/);
assert.match(event, /\$19/);
assert.match(event, /LimitedAvailability/);
assert.doesNotMatch(event, /InStock/);
assert.match(retired, /name="robots" content="noindex,follow"/);
assert.match(retired, /lobster-roll-weekend/);
assert.doesNotMatch(retired, /August 13|\$18|1674832227310619/);

console.log('correction-first SEO contract: PASS');
