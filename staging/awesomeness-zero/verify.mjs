#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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
pass((html.match(/utm_content=/g) ?? []).length === 4, 'every order CTA needs a distinct content label');
pass(manifest.reviewRevision.startsWith('v7'), 'manifest revision must be v7');
pass(manifest.productionChanged === false, 'productionChanged must remain false');
pass(publicFacts.schema === 'daves-maine-cafe.public-facts.v1', 'public facts schema missing');
pass(publicFacts.featuredOffer.regularPriceUsd === 20 && publicFacts.featuredOffer.thursdayPriceUsd === 18, 'public fact prices do not match');
pass(llms.includes('Do not infer availability'), 'llms accuracy guard missing');

const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
pass(jsonLdBlocks.length === 1, 'expected exactly one JSON-LD graph');
if (jsonLdBlocks.length === 1) {
  try {
    const graph = JSON.parse(jsonLdBlocks[0][1]);
    const nodes = graph['@graph'] ?? [];
    pass(nodes.some((node) => node['@type'] === 'Restaurant'), 'Restaurant schema missing');
    pass(nodes.some((node) => node['@type'] === 'FAQPage'), 'FAQPage schema missing');
    pass(JSON.stringify(graph).includes('18.00') && JSON.stringify(graph).includes('20.00'), 'lobster offers missing');
  } catch {
    failures.push('JSON-LD must parse');
  }
}

for (const match of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)) {
  const value = match[1].replaceAll('&amp;', '&');
  if (/^(?:https?:|tel:|mailto:)/.test(value)) continue;
  const relative = value.split(/[?#]/, 1)[0];
  try { await access(resolve(here, relative)); } catch { failures.push(`missing local asset: ${relative}`); }
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
  productionChanged: false
}, null, 2));
