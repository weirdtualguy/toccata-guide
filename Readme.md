# Toccata: A Field Guide

A mobile-friendly, interactive guide to the Toccata hard fork on Kaspa.

## What This Is

Toccata is Kaspa's programmable upgrade, bringing smart contracts and zero-knowledge applications to the base layer. This guide explains every feature in two versions:

- **Simple**: For people who want to understand what Toccata does without technical jargon.
- **Technical**: For developers who need precise details, code examples, and specification references.

## Deployment

1. Clone this repository
2. Push to GitHub
3. Enable GitHub Pages in Settings → Pages → main branch → `/ (root)`
4. Site is live at `yourusername.github.io/toccata-guide`

## Structure

- `index.html` — Main page
- `css/style.css` — All styling (mobile-first)
- `js/main.js` — App controller, navigation, rendering
- `js/depth-toggle.js` — Simple/Technical view switcher
- `js/search.js` — Client-side search
- `data/content.json` — All content for both versions
- `sw.js` — Service worker for offline support
- `manifest.json` — PWA manifest for mobile install

## Adding Content

Edit `data/content.json`. Each section has `simple` and `technical` objects. The UI automatically renders both and shows the correct one based on the user's toggle preference.

## License

MIT — use freely. This is a community resource.