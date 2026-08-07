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
