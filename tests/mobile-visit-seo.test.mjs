import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [home, visit, sitemap] = await Promise.all([
  read('index.html'),
  read('visit-kittery/index.html'),
  read('sitemap.xml'),
]);

assert.match(home, /<nav class="mbar" aria-label="Quick cafe actions">/);
assert.match(home, /mobile_quick_actions/);
assert.match(home, /google\.com\/maps\/dir/);
assert.match(home, /href="tel:\+12074755655"/);
assert.doesNotMatch(home, /ethanhawkes-gif\.github\.io/);
assert.match(home, /"acceptsReservations": false/);

for (const id of ['list-name', 'list-email', 'list-phone', 'catering-name', 'catering-phone', 'catering-email', 'catering-guests', 'catering-date', 'catering-message']) {
  assert.match(home, new RegExp(`for="${id}"`));
  assert.match(home, new RegExp(`id="${id}"`));
}

assert.match(visit, /<title>Lunch in Kittery Near the Outlets \| Dave's Maine Cafe<\/title>/);
assert.match(visit, /<h1>Lunch in Kittery starts <span>here\.<\/span><\/h1>/);
assert.match(visit, /fresh-picked lobster rolls, sandwiches, chowder and takeout/i);
assert.match(home, /href="\/visit-kittery\/">Lunch in Kittery<\/a>/);
assert.match(visit, /<link rel="canonical" href="https:\/\/www\.davesmainecafe\.com\/visit-kittery\/">/);
assert.match(visit, /G-6JFFXXPBNG/);
assert.match(visit, /dmc-conversions\.js/);
assert.match(visit, /Wednesday–Sunday/);
assert.match(visit, /Closed Monday and Tuesday/);
assert.match(visit, /google\.com\/maps\/dir/);
assert.match(visit, /toasttab\.com\/davesmainecafe/);
assert.match(sitemap, /<loc>https:\/\/www\.davesmainecafe\.com\/visit-kittery\/<\/loc>/);

for (const match of visit.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g)) JSON.parse(match[1]);

console.log('mobile conversion and Visit Kittery SEO contract: PASS');
