# Cayleb’s résumé

Canonical website: https://cayleb-james2008.github.io/agentic-resume/

The approved character-led résumé has an Explore view with three explicitly fictional workdays and a Professional view with a one-page résumé. Mofu, Pip, Folio and Loam use the approved, unchanged transparent frame packs. The desktop stories follow scrolling; mobile, short screens, paused motion and system reduced motion use native reading and direct controls.

`resume.html` opens the Professional view of this same website. The current PDF downloads are `Cayleb-James-one-page-resume.pdf` and `Cayleb-James-resume.pdf`. Work history is self-reported. Project evidence is dated; local examples are synthetic demonstrations; all ten full workflows remain UNVERIFIED. No production customer outcome or ROI is claimed.

## Build and validate

No dependency download is required for the public static site. Its fonts, character assets and motion libraries are served locally.

```sh
python3 scripts/build-remake.py
node --test tests/*.test.js
python3 scripts/check-release.py
python3 -m http.server 18412 --bind 127.0.0.1
```

The builder preserves the reviewed reading content in `remake/project-source.html`, `remake/reading-source.html` and `stage/incumbent-resume-source.html`. GSAP, Lenis, React/ReactDOM, React Bits GlassSurface and free Aether source/license notices are retained under `vendor/`, `remake/vendor/` and `assets/licenses/`. React is loaded only when Mofu’s guide opens.

## Publish and rollback

GitHub Pages publishes `main` from the repository root. Release validation checks the exact deployed commit and compares live assets to source hashes. The previous public release is commit `476bb5623ef8b438028031faf86c55ff4520c090`; its source and previous PDFs remain recoverable in Git. Local development candidates are preserved separately and are not deployment entrypoints.
