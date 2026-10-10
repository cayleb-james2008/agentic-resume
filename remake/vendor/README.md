# Requested motion stack

GSAP 3.14.2 is the existing local runtime, used for the approved character loop, changed-value/character transitions, Folio comment collection and Mofu-to-guide transform. It uses the GSAP Standard No Charge license: https://gsap.com/community/standard-license/. It is not MIT.

Lenis 1.3.26 (MIT) is vendored from the official npm registry and drives wheel interpolation only for the full desktop Explore story. Existing RAF calls lenis.raf; no autoRaf, second scroller or snap plugin. Direct navigation cancels interpolation with immediate scrollTo. Mobile/touch, reduced motion, paused and Professional reading use native scrolling.

React Bits GlassSurface JS-CSS is pinned at d86fccbd477786f94ca7eb891fbe0ec039d3cd3b. Its original source and license are included. The component renders the guide’s optical surface in a lazy React island; guide content and controls remain ordinary HTML. React/ReactDOM 19.3.0 and scheduler 0.28.0 production bundle. First paint does not load React. GlassSurface is MIT plus Commons Clause: website use allowed, selling/sublicensing the components themselves prohibited. Not described as plain MIT or unrestricted open source.

Exact package URLs and SHA256 are in provenance.json. No package manager/global install. Bundled using already installed esbuild with --bundle --format=esm --minify --define:process.env.NODE_ENV='"production"' --jsx=automatic. Runtime has no external network dependency. guide-glass.js includes retained license notices.

GlassSurface adaptation: measure clientWidth/clientHeight, rather than transformed getBoundingClientRect dimensions, so the Mofu guide expansion cannot distort its displacement map. A CSS frosted core leaves refraction at the rim while protecting text from backdrop ghosts. Upstream source is retained separately.
