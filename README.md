# Dave's Maine Cafe — new site

Single-file static site for Dave's Maine Cafe (fka Maine Beer Café), Route 1, Kittery ME.
Built to recover Google rankings after the GoDaddy migration and give Dave a
lobster-shack-leaning identity his competitors don't have.

**Status (2026-06-09 20:49 ET):** domain is live and resolving. Current GoDaddy site is
"Restaurant In Kittery, Maine - Maine Cafe" — weak SEO title, no structured data,
no schema markup. This replacement is ready to drop in.

## What's here
- `index.html` — the whole site (no build step, drops on any host).
- `assets/photos/` — real photos pulled from mainebeercafe.com/about (Dave's own images).
- `assets/preview-desktop.png` / `preview-mobile.png` — current renders.

## Deploy (GoDaddy — Dave's current host)

**Option A — GoDaddy File Manager (no creds needed from us):**
1. Dave logs into godaddy.com → My Products → Hosting → Manage
2. File Manager → `public_html`
3. Rename existing `index.html` → `index.html.bak` (safety)
4. Upload `index.html` from this folder
5. Upload the `assets/` folder (drag and drop)
6. Hard-refresh mainebeercafe.com — new site is live

**Option B — Netlify drop (Ethan provides a Netlify token):**
```bash
cd ~/projects/maine-beer-cafe
npx netlify-cli deploy --dir . --prod
```

**Option C — Netlify free-tier drag-and-drop (no token):**
1. app.netlify.com → Add new site → Deploy manually
2. Drag the `maine-beer-cafe/` folder onto the drop zone
3. Gets a netlify.app preview URL immediately; can point mainebeercafe.com to it later

## Verified facts (from mainebeercafe.com/about, 2026-06-09)
- Address: 439 US Route 1, Ste 1, Kittery, ME 03904
- Phone: (207) 475-5655 · Email: dave@mainebeercafe.com
- Hours: Mon/Tue closed · Wed 3–7 · Thu/Fri 11:30–7 · Sat/Sun 11:30–5
- Online ordering: Toast
- Real draws: craft beer (Orono/LUX/Mast Landing), bourbon flights, the bacon
  burger, clam chowder, bacon gouda dog, whoopie pies. Lobster motif already in
  brand (lobster-shaped flight board).

## SEO recovery built in
schema.org Restaurant markup (address/geo/hours/menu/phone), Open Graph, semantic
HTML, mobile-first, single fast-loading file.
Current live site title: "Restaurant In Kittery, Maine - Maine Cafe" (no keywords, no brand).
This replacement leads with "Dave's Maine Cafe | Lobster Rolls, Craft Beer & Bourbon | Kittery ME."

## Open items for Dave
1. **A real lobster-roll photo** — the #1 missing asset. The Thursday roll is the
   stated differentiator but there's no photo of it anywhere on his current site or socials.
2. Confirm the Thursday roll price ($18 used; Facebook corroborates).
