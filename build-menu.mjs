#!/usr/bin/env node
// build-menu.mjs — regenerate the website menu (#eats + #bar) from menu.json, the MASTER source of truth.
// Flow: edit menu.json → `node build-menu.mjs` → staging/index.html menu sections are rewritten between
// the <!-- MENU:EATS:START/END --> and <!-- MENU:BAR:START/END --> markers. The SAME menu.json is what
// Chipper will push to Toast POS (names/descriptions/prices) once Dave grants admin access.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = dirname(fileURLToPath(import.meta.url));
const menu = JSON.parse(readFileSync(join(ROOT, "menu.json"), "utf8"));
const htmlPath = join(ROOT, "staging", "index.html");
let html = readFileSync(htmlPath, "utf8");

const TOAST = "https://www.toasttab.com/maine-beer-cafe-439-us-rt-1-ste-1/v3?utm_source=davesmainecafe.com&utm_medium=website&utm_campaign=order_online";
const e = (v) => String(v ?? "").replace(/&(?!amp;|lt;|gt;|#)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const item = (it) =>
  `        <div class="item"><div class="line"><span class="nm">${e(it.name)}</span><span class="pr">${e(it.price ?? "")}</span></div>${it.desc ? `<div class="desc">${e(it.desc)}</div>` : ""}</div>`;

function itemsGroup(g) {
  const note = g.note ? `\n        <p class="note">${e(g.note)}</p>` : "";
  const foot = g.footnote ? `\n        <p class="note" style="margin-top:16px">${e(g.footnote)}</p>` : "";
  let inner = g.items.map(item).join("\n");
  if (g.subgroup) {
    inner += `\n        <h3 style="margin-top:26px">${e(g.subgroup.name)}</h3>\n` + g.subgroup.items.map(item).join("\n");
  }
  return `      <div class="exit-cat">\n        <h3>${e(g.name)}</h3>${note}\n${inner}${foot}\n      </div>`;
}

// ---- EATS section ----
const eats = menu.eats;
const eatsSection = `<section class="menu-band" id="eats">
  <div class="wrap">
    <div class="sec-head">
      <span class="kicker">${e(eats.kicker)}</span>
      <h2>${e(eats.title)}</h2>
      <p>${e(eats.blurb)}</p>
    </div>
    <div class="exit-cols">
${eats.groups.map(itemsGroup).join("\n")}
    </div>
    <div class="sec-head" style="margin:36px auto 0"><a class="btn gold" href="${TOAST}" target="_blank" rel="noopener">Order for Pickup</a></div>
  </div>
</section>`;

// ---- BAR section ----
const bar = menu.bar;
const combos = bar.combos.items
  .map((c) => `        <div class="combo"><div class="no">${c.n}<small>EXIT</small></div><div class="body"><div class="nm">${e(c.name)}${c.price ? ` <span class="pr">${e(c.price)}</span>` : ""}</div><div class="desc">${e(c.desc)}</div></div></div>`)
  .join("\n");
const taps = bar.taps.items
  .map((t) => `          <div class="tap"><span class="nm">${e(t.name)}</span><span class="meta">${e(t.meta)}</span></div>`)
  .join("\n");
const bourbonsBlock = bar.bourbons
  ? `\n\n    <div class="exit-cat" style="margin-top:30px">\n        <h3>${e(bar.bourbons.name)}</h3>\n        <p class="note">${e(bar.bourbons.note)}</p>\n        <details style="margin-top:2px">\n        <summary style="cursor:pointer;font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:1px;color:var(--gold);font-size:.86rem;padding:6px 0">See the full list (${bar.bourbons.list.length}) &#9662;</summary>\n        <div class="taps" style="columns:3;margin-top:14px">\n${bar.bourbons.list.map((n) => `          <div class="tap"><span class="nm">${e(n)}</span></div>`).join("\n")}\n        </div>\n        <p class="note" style="margin-top:12px">${e(bar.bourbons.footnote)}</p>\n        </details>\n    </div>`
  : "";
const barSection = `<section class="menu-band" id="bar" style="border-top:0">
  <div class="wrap">
    <div class="sec-head">
      <span class="kicker">${e(bar.kicker)}</span>
      <h2>${e(bar.title)}</h2>
      <p>${e(bar.blurb)}</p>
    </div>

    <div class="exit-cols" style="grid-template-columns:1.15fr .85fr">
      <div class="exit-cat">
        <h3>${e(bar.combos.name)}</h3>
        <p class="note">${e(bar.combos.note)}</p>
${combos}
      </div>

      <div class="exit-cat">
        <h3>${e(bar.taps.name)}</h3>
        <p class="note">${e(bar.taps.note)}</p>
        <div class="taps">
${taps}
        </div>
        <p class="note" style="margin-top:12px">${e(bar.taps.footnote)}</p>
      </div>
    </div>

    <div class="exit-cols" style="grid-template-columns:1.15fr .85fr;margin-top:26px">
${bar.groups.map(itemsGroup).join("\n")}
    </div>${bourbonsBlock}
  </div>
</section>`;

function replaceRegion(src, startTag, endTag, replacement) {
  const re = new RegExp(`(${startTag}[^]*?-->)[\\s\\S]*?(${endTag})`);
  if (!re.test(src)) { console.error(`Marker not found: ${startTag}`); process.exit(1); }
  // Function replacer so literal $ in prices ($12, $18) is never treated as a capture-group ref.
  return src.replace(re, (_m, g1, g2) => `${g1}\n${replacement}\n${g2}`);
}

html = replaceRegion(html, "<!-- MENU:EATS:START", "<!-- MENU:EATS:END -->", eatsSection);
html = replaceRegion(html, "<!-- MENU:BAR:START", "<!-- MENU:BAR:END -->", barSection);
writeFileSync(htmlPath, html);

const count = (o) => (o.items ? o.items.length : 0) + (o.subgroup ? o.subgroup.items.length : 0);
const eatsN = eats.groups.reduce((a, g) => a + count(g), 0);
const barN = bar.combos.items.length + bar.taps.items.length + bar.groups.reduce((a, g) => a + count(g), 0);
console.log(`Rebuilt menu from menu.json → staging/index.html\n  Eats: ${eatsN} items · Bar: ${barN} items\n  Edit menu.json + re-run to update the site (and, on Toast access, the POS).`);
