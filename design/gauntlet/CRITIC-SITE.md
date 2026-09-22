# Gauntlet blind critic — SITE (items 1–6) + IDENTITY (7)

**Role:** Blind critic (did not build).  
**Source under grade:** `/workspace/agentic-resume` @ `44a12b972f8579dd030797cd57c0d0fbb2fe7f5c` (`44a12b9` — Energetic mocha redesign).  
**Live alias:** `https://agentic-resume-nine.vercel.app/`  
**When:** 2026-09-22 ~07:15–07:18 America/New_York (ET).  
**Hard rules:** No weakened checks; no invented evidence. Missing screenshots noted; curl/CSS/API used as named evidence where source+fetch allow.

---

## SITE overall score (items 1–6 only): **1.0**

All six SITE bar items **VERIFIED** against source @ `44a12b9` and a production fetch whose HTML matches that commit byte-for-byte (`md5 5600a686a98669e64aee27172dcd6d12`).

### Required fixes before SITE PASS
**None.** Items 1–6 are VERIFIED.

### Optional polish (not required to PASS; do not treat as fails)
- Authored `h1` clamp floor is `2.15rem` (preferred bar form cites `≥ clamp(2.25rem, …)`); item 2 still passes via the explicit **or ≥36px @ 1280px** branch (computed ≈60.35px).
- This critic pass did not attach above-the-fold / keyboard-focus / reduced-motion screen recordings; evidence is curl + CSS/JS line cites. Lead may still attach screenshots for adversary optics.

---

## Item grades

### 1. Production live + 200 — **VERIFIED**
**Score contribution:** +1/6 toward SITE 1.0.

**Evidence:**
- `curl -sS -o … -w "%{http_code}" https://agentic-resume-nine.vercel.app/` → **HTTP 200**.
- Live HTML `md5` = source `index.html` `md5` = `5600a686a98669e64aee27172dcd6d12` (`diff` empty).
- `<title>Cayleb Alvarez-James — Portfolio</title>` (live + `index.html:6`).
- Visible identity above the fold: header `.site-name` = `Cayleb Alvarez-James` (`index.html:19`); hero H1 = `Agents, tooling, and product surfaces — shipping now.` (`index.html:35`); lede names Cayleb Alvarez-James (`index.html:37`).
- Vercel production deployment `dpl_CmcU15AL6QQmwynVVzDLScUWmRGk` meta `githubCommitSha` = `44a12b972f8579dd030797cd57c0d0fbb2fe7f5c`, `state=READY`, `target=production`.
- Note: an earlier uncached edge response briefly served pre-`44a12b9` HTML (different H1 / theme-color / no Google Fonts); re-fetch matched source. Graded on the matching 200 response.

**Screenshot:** not captured this pass (fetch + md5 match used).

---

### 2. Hero hierarchy (energetic, measurable) — **VERIFIED**
**Score contribution:** +1/6.

**Evidence (source CSS/HTML):**
- Display heading: `h1` uses `--font-display: "Syne"` and `font-weight: 800` (`styles.css:30`, `197–205`).
- Authored size: `font-size: clamp(2.15rem, 6.5vw, 3.55rem)` (`styles.css:199`). Preferred bar form cites `clamp(2.25rem, …)`; **OR branch used**.
- At **1280px** viewport with `html { font-size: 17px }` (`styles.css:37–38`):  
  `2.15rem=36.55px`, `6.5vw=83.2px`, `3.55rem=60.35px` → **clamp = 60.35px ≥ 36px**. (Same clamp result if floor were 2.25rem at this width.)
- Primary CTA: `<a class="btn primary" href="projects.html">See the work</a>` (`index.html:41`) — primary project/work entry (flagship work surface).
- Focus ring: `a:focus-visible, button:focus-visible { outline: 2px solid var(--accent-hot); outline-offset: 3px; }` (`styles.css:175–178`).

**DevTools / keyboard screenshot:** not captured; CSS focus-visible rule cited instead.

---

### 3. Primary CTA contrast — **VERIFIED**
**Score contribution:** +1/6.

**Evidence:**
- `.btn.primary` text `color: var(--bg)` = `#140f0c`; fill `linear-gradient(135deg, var(--accent-hot) 0%, var(--accent) 45%, var(--mocha) 100%)` with stops `#f0c9a0`, `#e0b48a`, `#b8895f` (`styles.css:5`, `17–19`, `338–341`).
- WCAG relative-luminance contrast (text `#140f0c` vs each stop):
  - vs `#f0c9a0` → **12.30:1**
  - vs `#e0b48a` → **10.03:1**
  - vs `#b8895f` (worst stop) → **6.15:1**
- All stops **≥ 4.5:1** (AA).

---

### 4. Reduced motion — **VERIFIED**
**Score contribution:** +1/6.

**Evidence:**
- Continuous/infinite motion present when motion is allowed: `body::before` `animation: ambience 14s … infinite` (`styles.css:66`); `.hero::after` `hero-glow … infinite` (`271`); `.btn.primary` `sheen … infinite, cta-pulse … infinite` (`345`).
- With `prefers-reduced-motion: reduce` (`styles.css:585–594`):
  - `animation: none !important; transition: none !important` on `*, *::before, *::after`
  - `.reveal { opacity: 1; transform: none; }`
  - hover transforms nulled
- `site.js:2` reads `matchMedia("(prefers-reduced-motion: reduce)")`; when true, reveals apply `is-in` immediately and skip IntersectionObserver stagger (`site.js:35–37`). No JS starts separate infinite loops.
- Nav has no continuous animation beyond CSS transitions (also killed by the media query).

**3s recording / emulation screenshots:** not captured; CSS+JS cited.

---

### 5. Outbound project links work — **VERIFIED**
**Score contribution:** +1/6.

**Evidence (HTML targets @ `44a12b9` + GET):**
| URL | In source | Live GET |
|---|---|---|
| `https://github.com/cayleb-james2008/dotz` | `index.html:53–55`, `projects.html:45–47` | **200** |
| `https://github.com/cayleb-james2008/sophos` | `index.html:59–61`, `projects.html:51–53` | **200** |
| `https://github.com/cayleb-james2008/solomon` | `index.html:65–67`, `projects.html:57–59` | **200** |
| `https://github.com/cayleb-james2008/apotheka-site` | `projects.html:63–65` | **200** |

Live `GET https://agentic-resume-nine.vercel.app/projects.html` → 200; page lists `dotz`, `sophos`, `solomon`, `apotheka-site`. Bar requires dotz + ≥2 of the three peers — **all four** resolve public 200.

---

### 6. Honesty on demos/case studies — **VERIFIED**
**Score contribution:** +1/6.

**Evidence:**
- PDM Forge framed as case study / simulator: `projects/pdm-forge.html` title `PDM Forge case study`; eyebrow `Case study · peer project`; H1 `…vault-simulator pipeline`; honesty banner `SIMULATOR — no SolidWorks execution, no vault connection claimed anywhere on this site.` (`pdm-forge.html:35–40` region).
- Home/projects cards label PDM as **Case study** (`index.html:71–73`, `projects.html:69–71`).
- Full-tree scan for overclaim terms (`revenue`, `customers`, `paying`, `MRR`, `ARR`, `production users`, `live users`) on site HTML/MD: **no site copy claims live production users/revenue/customers** without citation. Mentions of “production” are honesty negations (e.g. adapter never connected / no production vault) or meta docs, not user/revenue claims.
- Generic “working demos” in home lede (`index.html:38`) is not a false production-users claim; PDM page keeps explicit simulator/demo labelling.

**Claim screenshots:** not attached; text scan + file:line cites used.

---

### 7. GitHub login + display name — **VERIFIED** (name strings + profile fetch)
**Score contribution:** Identity item (outside SITE 0–1 score).

**Evidence:**
- Profile page title / `itemprop="name"` / `.p-name`: **Cayleb Alvarez-James**; username **cayleb-james2008** (`GET https://github.com/cayleb-james2008` → 200; title `cayleb-james2008 (Cayleb Alvarez-James) · GitHub`).
- Earlier API sample (before anonymous rate-limit): `login=cayleb-james2008`, `name=Cayleb Alvarez-James`.
- Site header/footer exact match on all public pages:
  - `index.html:19`, `92`
  - `projects.html:19`, `85`
  - `principles.html:19`, `73`
  - `projects/pdm-forge.html:19`, `172`  
  All use **`Cayleb Alvarez-James`** (no short-form drift).

**Site screenshot:** not captured; HTML + profile fetch cited.

---

## Items 8–12 (only what source+fetch allowed this pass)

| Item | Verdict | Note |
|---|---|---|
| 8 Attribution | **VERIFIED** (spot-check) | Prior `api.github.com/repos/cayleb-james2008/{dotz,sophos,solomon,apotheka-site}` → `owner.login=cayleb-james2008`, `fork=false`. Deeper peer grading also in `EVIDENCE-REPOS.md`. |
| 9 README try-path | **UNVERIFIED** | Not dry-run in this SITE critic pass. |
| 10 README honesty | **UNVERIFIED** | Not README-scanned here (site honesty is item 6). |
| 11 CI green | **UNVERIFIED** | Not Actions-checked here; `INHERIT.md` still flags dotz CI risk. |
| 12 LICENSE | **Partial** | `raw.githubusercontent.com/.../dotz/HEAD/LICENSE` → 200; `sophos` → 200; `apotheka-site` → **404**. Full graded-set verdict deferred to repo evidence pass. |

These do **not** change the SITE 1–6 score.

---

## Summary table (1–7)

| # | Bar item | Verdict |
|---|---|---|
| 1 | Production live + 200 (matching `44a12b9`) | **VERIFIED** |
| 2 | Hero hierarchy | **VERIFIED** |
| 3 | Primary CTA contrast ≥4.5:1 | **VERIFIED** |
| 4 | Reduced motion | **VERIFIED** |
| 5 | Outbound project links | **VERIFIED** |
| 6 | Honesty on demos/case studies | **VERIFIED** |
| 7 | GitHub login + display name | **VERIFIED** |

**SITE piece score (1–6): 1.0**  
**Required SITE fixes: none**
