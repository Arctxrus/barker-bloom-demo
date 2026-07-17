# Barker &amp; Bloom — demo site

A single-page website for **Barker &amp; Bloom**, a *fictional* premium dog-grooming salon in
Heywood, Greater Manchester. Built as a **portfolio demo** to pitch real local groomers.

> ⚠️ **Demo / fictional.** The business, address, phone number (Ofcom reserved `07700 900xxx`
> range) and reviews are illustrative. Photos are Unsplash placeholders pending a real image pass.

## Stack
Plain HTML/CSS/JS — no framework, no build step. Open `index.html` in a browser, or serve the
folder with any static server.

```
index.html      single page
styles.css      design tokens + components (mobile-first)
script.js       nav, overlay menu, paw-trail, reveals, form validation
fonts/          self-hosted Fredoka + Nunito Sans (woff2, latin subset)
DESIGN.md       design system & build plan
references/     mood/pattern references (descriptions)
```

## Notes
- **Self-hosted fonts** — no Google Fonts requests at runtime (`@font-face` + `font-display: swap`).
- **Accessible** — WCAG AA contrast, keyboard-friendly, `prefers-reduced-motion` respected.
- **Booking form** is a demo (no backend); structured so a real booking embed can drop in later.
- `styles.css`/`script.js` are referenced with `?v=1` for cache-busting on future pushes.
- Assets built for GitHub Pages (includes `.nojekyll`).
