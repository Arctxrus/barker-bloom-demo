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
