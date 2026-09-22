# SEO notes — Dave's Maine Cafe homepage rebuild (2026-09-22)

Preview: https://daves-maine-cafe-preview.netlify.app/ (noindex, does not compete with davesmainecafe.com).
Production is still GitHub Pages from `main`. Nothing here is live on the real domain yet.

## What is on the page (on-page, done)

- **One `h1`** ("You found lunch."), logical `h2`/`h3` order, `<header>`, `<main>`, `<nav>`, `<footer>`, `<address>`, skip link, visible focus states, AA contrast checked on every text/background pair, tables and lists are real tables and lists.
- **Title** (60 chars): `Lobster Rolls on Route 1 in Kittery, Maine | Dave's Maine Cafe` — leads with the query a local or tourist types ("lobster rolls kittery"), then the road, then the town, then the brand.
- **Meta description** written for the click: price, Thursday deal, taps, bourbons, address, "minutes from the outlets and Portsmouth", days open.
- **NAP** (name, address, phone) appears identically 7× in the HTML and once in schema: `Dave's Maine Cafe · 439 US Route 1, Ste 1, Kittery, ME 03904 · (207) 475-5655`.
- **Phone is tappable** (`tel:`) in the masthead, hero, FAQ, Visit, footer and the fixed mobile bar. Visible above the fold on phones.
- **Directions**: Google Maps directions link in hero, Visit, footer and mobile bar; Apple Maps link in Visit; click-to-load OpenStreetMap embed (keeps the page fast).
- **Hours** as a real `<table>`, today's row highlighted, and a live "Open now · until 7 PM / Closed now · opens Thursday 11:30 AM" status computed in America/New_York with 20 lines of plain JS. No framework, no jQuery.
- **Menu as HTML text**: every item and price from `menu.json` (the repo's single source of truth) is on the page, plus the bar (combos, taps, THC, wine, 55-name bourbon list in a `<details>`).
- **Local copy signals**: Kittery, Route 1, Kittery Outlets, Portsmouth NH, York, Seacoast, Maine, Gateway to Maine appear naturally in the h1 block, section copy, FAQ and Visit section, not stuffed.
- **JSON-LD `@graph`** (validated with `JSON.parse`): `WebSite` → `Restaurant` (name, alternateName, url, image[], logo, telephone, email, priceRange, servesCuisine, foundingDate, PostalAddress, GeoCoordinates, hasMap, areaServed, openingHoursSpecification, sameAs ×5, hasMenu, potentialAction Order/Directions) → `Menu` with 5 `MenuSection`s and 18 `MenuItem`s with `Offer` prices → `FAQPage` with 5 questions that match the visible FAQ word for word.
- **Open Graph + Twitter card** with a real 1200×630 JPG of the roll, plus `og:street-address`/`og:locality`/`og:phone_number`, `geo.position`/`ICBM` meta.
- **Canonical** → `https://www.davesmainecafe.com/` (the real domain), `robots.txt` allow-all with sitemap pointer, `sitemap.xml` with the 5 real URLs + image entry, PNG favicon + `apple-touch-icon` + `manifest.json`.
- **Alt text** on all 14 images, descriptive ("Dave, owner of Dave's Maine Cafe, smiling behind the bar holding two lobster rolls"), empty alt on the decorative masthead mascot.
- **Performance**: self-hosted subset fonts with `font-display: swap`, hero preloaded with `srcset` (88 KB on phones), all other images lazy WebP, critical CSS inline, zero third-party requests, `_headers` sets immutable caching on `/assets/*` and a CSP.

## What is preview-only (undo at go-live)

1. Delete `<meta name="robots" content="noindex,nofollow">` from `index.html`.
2. Delete the `X-Robots-Tag: noindex, nofollow` line from `_headers` (only matters if hosting on Netlify; GitHub Pages ignores `_headers`).
3. Find/replace `https://daves-maine-cafe-preview.netlify.app` → `https://www.davesmainecafe.com` (og:image, twitter:image, schema `image`/`logo`). 5 occurrences.
4. Re-add the GA4 tag `G-6JFFXXPBNG` and `/assets/dmc-conversions.js` from the current production `index.html` (kept out so preview traffic doesn't pollute Dave's analytics). The page already carries `data-intent-action` hooks the tracker expects.
5. Copy `assets/img/` and `assets/fonts/` to the repo root alongside the existing `assets/` (no name collisions).
6. Keep the existing subpages (`/lobster-rolls/`, `/catering/`, `/visit-kittery/`, `/route-one-bottling/`); the new homepage links to them.

## Off-page: where a restaurant actually wins (Dave, not the website)

The homepage can only confirm what Google already believes about the business. For "lobster roll near me" / "restaurants kittery maine" the ranking is decided by the **Google Business Profile**, not the site. In order:

1. **Claim and verify the Google Business Profile** at business.google.com. Set primary category *Seafood restaurant*, secondary *Bar*, *American restaurant*, *Lobster restaurant* if offered. Paste the exact NAP above. Add the Toast link as the "Order" link and the website as `https://www.davesmainecafe.com/`.
2. **Fix the hours everywhere.** Waze still shows Wednesday 3–7 PM (the pre-summer schedule). Check and correct Google, Apple Maps (via Apple Business Connect), Yelp, Tripadvisor, Facebook, Waze. Mismatched hours are the #1 reason Google demotes a local listing and the #1 reason a customer drives to a closed door.
3. **Google Business Profile posts weekly**: Thursday $18 lobster roll, Shell Yeah Wednesday, Bourbon Friday. Dave already posts this on Facebook in real time; cross-post the same photo and two sentences to GBP. Photos uploaded by the owner to GBP outrank everything else in the local pack.
4. **Reviews**: a printed card at the register and a line on the Toast receipt: "Loved it? 30 seconds on Google helps a one-man kitchen more than you'd think" with the review short link from GBP. Reply to every review, including the bad ones, in Dave's voice. Aim for a steady trickle, not a burst.
5. **Menu on GBP**: add the menu items and prices in the GBP menu editor, or link the Toast menu. Google shows "$18 lobster roll" in the listing when it has structured menu data.
6. **Apple Business Connect** (Apple Maps is the default on every iPhone in Kittery traffic): claim, verify, set hours, upload the same photos.
7. **Yelp / Tripadvisor**: claim both, fix hours, upload photos, set the website to `davesmainecafe.com` (Waze still lists `mainebeercafe.com`).
8. **Local links**: Kittery Outlets directory, Kittery Chamber / Greater York Region Chamber, Maine Office of Tourism (visitmaine.com) listing, Seacoast Online / Foster's coverage (already exists, link it from the site and GBP), Portsmouth NH "lunch across the bridge" blogs. One real local link is worth more than any on-page tweak left.
9. **Do not** buy citations, reviews, or "SEO packages". Do not create a second Google listing for "Maine Beer Cafe"; if one exists, mark it as moved/duplicate.

## Facts Dave must confirm before go-live

See the report `reports/daves-maine-cafe-rebuild-2026-09-22.md` §Facts. Short version: Wednesday opening time (11:30 vs 3 PM), email address (`@mainebeercafe.com`), Meal Deal add-on price ($8 vs $10), "2026 Finalist · Best of the Seacoast" exact wording, the Catherine + kids line, soup flights, Take & Bake rule, hot-sauce/BBQ product names, current taps.
