# Progress

## 2026-08-07 · Domain migration to Cloudflare Pages

- New URL: https://barkerbloom.pagefront.co.uk (served at domain root, no project subpath).
- Hosting moved to Cloudflare Pages, auto-deploy on push to main.
- Updated canonical and og:url to the new subdomain.
- No robots.txt or sitemap.xml exist in this repo, so nothing to update there.
- No absolute /barker-bloom-demo/ asset paths or base href tags existed, so no path fixes were needed; all asset references were already relative.
- og:image points at the external Unsplash CDN, not the site, so it was left unchanged.
- No CNAME file present.
- Bumped the existing cache-busting scheme from ?v=15 to ?v=16 on styles.css and script.js.
- Added a `_redirects` file at the repo root forcing 404 on the non-site docs that Cloudflare Pages would otherwise serve by path: /PROGRESS.md, /README.md. fonts/ stays reachable as a site asset.
- Added a Pages Function middleware at functions/_middleware.js (orchestrator ruling). On Cloudflare Pages, static assets are served before _redirects is consulted, so the _redirects force-404 rules never fire for real files like /PROGRESS.md. The middleware runs ahead of asset serving and returns a plain 404 for the blocklist (/PROGRESS.md, /README.md, plus /functions/ defensively), matched case-insensitively on the pathname; everything else calls context.next(). The _redirects file is kept as a fallback. Matcher validated standalone with node. Note: barkerbloom was returning 502 at launch, a separate issue for the orchestrator; the middleware could not be exercised live yet.

## 2026-08-07 · Removed Pages Function + _redirects (back to a pure static site)

- Deleted `functions/_middleware.js` and `_redirects`. This is a static site and
  should ship zero server-side code; a Pages Function is also the most likely
  cause of a 502, since a Function that throws returns exactly that.
- The blocklist protected nothing. The GitHub repo is **public**, so both files
  it hid are already served at 200 from `raw.githubusercontent.com` and from the
  GitHub Pages mirror. Blocking `/PROGRESS.md` on one host while the identical
  file is public on two others is theatre, not protection.
- PROGRESS.md contains a migration changelog only: no credentials, no client or
  real-business names. Nothing here warrants hiding.
- If these docs genuinely shouldn't be published, the static-correct fix is to
  stop deploying them (exclude from the build / move them out of the repo), not
  to run code on every request to 404 them.
- Assets bumped to ?v=18.

