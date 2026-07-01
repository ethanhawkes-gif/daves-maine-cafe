# Fix: www.davesmainecafe.com SSL certificate mismatch

## Root cause (diagnosed 2026-07-01)
- **Apex works:** `davesmainecafe.com` serves GitHub Pages with a valid Let's Encrypt cert (`CN=davesmainecafe.com`).
- **www is broken:** `www.davesmainecafe.com` is a CNAME pointing to **`davesmainecafe.com`** (the apex) instead of to GitHub's host. It resolves to the right servers, but GitHub never provisioned a Let's Encrypt certificate that covers `www.davesmainecafe.com`, so it falls back to serving its default `*.github.io` cert → browser shows a name-mismatch error.

## The fix (GoDaddy DNS, ~2 minutes + propagation)
In GoDaddy → **Domain → DNS → Manage Zones → davesmainecafe.com**:

1. Find the existing **CNAME** record with **Name = `www`**.
2. Change its **Value/Points to** from `davesmainecafe.com` → **`ethanhawkes-gif.github.io`**
   - Type: CNAME · Name: `www` · Value: `ethanhawkes-gif.github.io` · TTL: 1 hour (or default)
3. Leave the apex **A records** as they are (they should already be the four GitHub Pages IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`).

## GitHub side (after DNS propagates, ~15 min–1 hr)
1. Repo **ethanhawkes-gif/daves-maine-cafe → Settings → Pages**.
2. If the custom domain shows a cert error, **remove** the custom domain, Save, wait 1 min, **re-enter** `davesmainecafe.com`, Save. This forces GitHub to re-run cert provisioning for both apex and www.
3. Once the green check appears, tick **Enforce HTTPS**.

## Verify
```
dig +short www.davesmainecafe.com CNAME      # should show ethanhawkes-gif.github.io.
curl -sSI https://www.davesmainecafe.com      # should return HTTP 200, no cert error
```
Both apex and www should then load over HTTPS with a valid cert.

## Note
This is cosmetic-but-important: anyone typing `www.` (or old links using it) currently hits a scary security warning. Fix before any marketing push. Non-urgent for the apex, which already works.
