# Current canonical résumé (2026-10-13)

The homepage `index.html` is generated from `site/content.json` by `scripts/build-home.py`. It has five blocks:

1. The hero: Cayleb's name, a 3D-styled illustrated character wearing a headset, and the integrator line.
2. How I work: a loop through Shadow, Understand, Build and Teach that ends at "Whole company".
3. Work experience: a timeline of his résumé employment.
4. Selected projects: Industry AI Suite featured, plus dotz, Sophos, Asmodeus and Ergon.
5. Contact: links and the downloads.

`resume.html` is a plain, printable résumé page built from `resume/candidate-fragment.html`. Both candidate PDFs are linked from the homepage and the résumé page. GitHub Pages publishes `main` at https://cayleb-james2008.github.io/agentic-resume/.

**Positioning.** The role Cayleb is going for is **Forward Thinking Engineer** (the exact title, used as the headline everywhere: site, résumé, PDFs, share card). The work: he shadows employees for a couple of days to learn how they actually work, builds each person a custom AI agent they can work with, plus personalized tools for anything digital the company wants automated or agent-driven, and teaches them to use it for faster, higher-quality daily work. Then he scales that across the whole company.

**Voice (2026-10-13).** Few words, plain words. Short fragments on the homepage, résumé, PDFs and project pages, without developer jargon (`tests/home-few-words.test.js`, `tests/candidate-resume.test.js`, `tests/subpages.test.js`). The guide agent speaks plainly. No small meta or disclaimer lines. Evidence — limits, dates, IDs, file fingerprints — is never cut.

**Value (2026-10-13).** The "Worth it" section shows full systems he builds for the kinds of business he has worked in — a moving company (lead to booking, self-planning dispatch, job to paid), a plaster and pool crew (estimate from a video, supply autopilot, weather-smart schedule), a shop or restaurant (self-ordering stock, smart scheduling, front-desk agent) — each against how the work is done today, in confident present tense. Each card ends with the money: what the busywork loses a month today versus with his systems, and the yearly saving (worked out at build time). The figures are sized examples for a named business size (a three-truck mover, a two-crew outfit, one location) and come only from missed jobs, miles, material, claims and waste. No real company is named as a client, and savings never come from anyone's hours or pay (`tests/home-value.test.js`).

**Evidence boundaries.** Current implementation and dated verification belong in the project pages. The résumé states the implemented features concisely. The hosted lab remains a historical replay; source authority, native platform acceptance, live services and customer outcomes are separate checks. Ergon's Windows pilot is pending native acceptance. Asmodeus covers research and paper replay only. Employee information, access credentials and private source are absent from public case studies. Generated illustrations retain their labels and attribution.

**Earlier versions.** The classic character-led homepage (Explore/Professional, Mofu, Pip, Folio, Loam) is recoverable at commit `2732c2f`. The earlier public résumé and site are recoverable at `476bb5623ef8b438028031faf86c55ff4520c090`. `resume/reviewed-verification.json` is historical; download integrity for the approved PDFs is recorded in `resume/approved-verification.json`.

---

## Historical product notes

> **Operator model:** the reader is a non-technical goal-bringer; plain English, no unexplained jargon or technical questions; professional output in an operator-accessible voice

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Recruiters, hiring managers, and technical reviewers considering Cayleb Alvarez-James for remote software engineering or applied AI roles. They need to see what works, inspect its evidence, and find a direct contact route.

## Product Purpose

This is Cayleb Alvarez-James's static public portfolio, recorded ten-workflow lab, and project résumé. It presents selected public engineering projects, bounded local review paths, dated source-backed examples, five witnessed local model samples, and clear limits on what each item proves. Local examples are synthetic demonstrations; all ten full workflows remain UNVERIFIED. A reviewer can inspect bounded results without mistaking a public example for a company deployment.

## Positioning

The portfolio pairs public case studies and repository links with dated evidence and explicit limits. It distinguishes public-source results, local-input reviews, and independently witnessed model samples. It does not infer employment, customers, adoption, revenue, or company deployment from project work.

## Operating Context

- The product is a static HTML, CSS, and JavaScript website served under the `/agentic-resume/` base path with relative assets. The prior verified release baseline is `af666a16fea106c7a9769d8da60ddf15fba2697d`; each later release requires a fresh live check.
- Its sixteen main page routes are:
  1. `/agentic-resume/` — portfolio home (`index.html`)
  2. `/agentic-resume/resume.html` — reviewed résumé
  3. `/agentic-resume/projects/ledgerbridge.html` — LedgerBridge
  4. `/agentic-resume/projects/marketbrief.html` — MarketBrief
  5. `/agentic-resume/projects/chainwatch.html` — ChainWatch
  6. `/agentic-resume/projects/backtestguard.html` — BacktestGuard
  7. `/agentic-resume/projects/replycraft.html` — ReplyCraft
  8. `/agentic-resume/projects/handoffhub.html` — HandoffHub
  9. `/agentic-resume/projects/pipelinerelay.html` — PipelineRelay
  10. `/agentic-resume/projects/onboardpath.html` — OnboardPath
  11. `/agentic-resume/projects/sentineldesk.html` — SentinelDesk
  12. `/agentic-resume/projects/searchlift.html` — SearchLift
  13. `/agentic-resume/projects/dotz.html` — dotz case study
  14. `/agentic-resume/projects/sophos.html` — Sophos case study
  15. `/agentic-resume/projects/industry-ai-suite.html` — Industry AI Suite overview
  16. `/agentic-resume/lab/` — recorded interactive suite journeys
- The review and route list describe the current product; the dark visual direction remains in place.

## Capabilities and Constraints

- Preserve the existing static stack, sixteen routes, `/agentic-resume/` base path, and working relative assets. The one-page PDF `Cayleb-James-resume.pdf` contains the independently reviewed résumé, including self-reported additional work history and education.
- The ten Industry AI Suite pages lead with demonstrated results and state material limits in ordinary language. The dated receipts retain technical status fields. Five workflows have independently witnessed, source-cited local model samples: LedgerBridge, MarketBrief, BacktestGuard, SentinelDesk, and OnboardPath.

  | Workflow | Demonstrated result and boundary |
  |---|---|
  | LedgerBridge | A dated public Treasury cash-data slice and local finance import; public cash is not company books. |
  | MarketBrief | A cited World Bank GDP macro brief and local research import; no company or securities conclusion is shown. |
  | ChainWatch | A local watch-only EVM CSV/JSON processor and labelled hosted calculation example; no live EVM feed or company address is connected. |
  | BacktestGuard | A public-data chronology check and local experiment review; the GDP slice is not a completed backtest. |
  | ReplyCraft | A deterministic sample based on public GovInfo text and a local case/policy path; no customer case or message send is shown. |
  | HandoffHub | A cited public-document handoff and local knowledge import; workplace permissions and records are not shown. |
  | PipelineRelay | A public repository-metadata review and local consent-gated import; no CRM record or outreach is shown. |
  | OnboardPath | A cited public-document review and local HR policy path; no employee record or answer is shown. |
  | SentinelDesk | A public CISA KEV review queue and local alert/asset path; no organization incident is shown. |
  | SearchLift | A dated one-page read found 10/10 approved workflow names, and the local path audits supplied HTML; no SEO performance is measured. |

- The established public dotz work is documented at `projects/dotz.html` and [its public repository](https://github.com/cayleb-james2008/dotz): a local-first multi-agent coding dashboard spanning a Rust/axum API and Tauri desktop shell. The record does not claim sole authorship, production-SaaS users, or adoption.
- The established public Sophos work is documented at `projects/sophos.html` and [its public repository](https://github.com/cayleb-james2008/sophos): a Windows coding-agent project described as a port of Prime Intellect's Prime Agent. The repository credits Prime Intellect for the upstream runtime, daemon, and bridge; the portfolio makes no sole-author or employment claim.
- `projects/industry-ai-suite.html` is the concise recruiter overview for the ten workflow paths; the dated journeys, exact receipt details, source attribution, and five model witnesses remain available through the recorded lab and linked evidence.
- The public Industry AI Suite repository exposes the local workbench, recorded-lab exporter, and [model witness bundle](https://github.com/cayleb-james2008/industry-ai-suite/tree/main/evidence/ai-witness-20260926). Code visibility and a witnessed model call do not establish company deployment.
- Recruiter contact is [caylebalvarezjames@gmail.com](mailto:caylebalvarezjames@gmail.com) on the portfolio, résumé, PDF, and [GitHub profile](https://github.com/cayleb-james2008). The reviewed résumé is available as `resume.html`, with structured source in `resume/resume-content.json` and matching `resume/resume.md` and `resume/resume-fragment.html`.
- Do not add unsupported employment or education history, customers, income, adoption, company deployment, or AI completion claims. No customer, revenue, adoption, or company-deployment outcome is established by the current public record; unknown outcomes are not evidence of zero outcomes.
- Accessibility and viewport needs are requirements for changes: usable desktop and phone layouts, keyboard-operable controls with visible focus, and respect for reduced-motion preferences. This product record does not certify current accessibility conformance.

## Brand Commitments

On 2026-09-26 Cayleb requested a dark, black-and-white, modern cyberpunk/holographic/professional application portfolio. The approved near-monochrome evidence dossier replaces the cool-light vermilion direction.

## Candidate PDF and rollback boundary

- This worktree contains an unpublished résumé polish candidate, not a replacement approved release. `release.json` and `resume/approved-verification.json` describe historical artifacts.
- Preserve the approved `Cayleb-James-resume.pdf`, `Cayleb-James-one-page-resume.pdf` and approved manifest bytes. The historical DOCX and preview also remain unchanged.
- Candidate filenames are `Cayleb-James-polished-one-page.pdf`, `Cayleb-James-polished-resume.pdf` and corresponding UTF-8 text files. Candidate copy is generated from `resume/resume-content.json`; the short website fragment uses the approved layout with shared summary and project fields.
- `resume/candidate-verification.json` records source hashes and sequential extraction/page checks, with no ATS score or new factual verification. Project evidence remains the October 5, 2026 snapshot; work and education are self-reported.
- Proposed assistant implementation, business support and employee onboarding use cases are future focus, not demonstrated delivery. No push or deployment is authorized. Existing project-page PDF links continue to the unchanged historical PDF; the candidate Professional view offers the revised downloads.

## Evidence on Hand

- Historical public site source checked 2026-09-25: Pages commit `91082127649451e4bd57f75f91cbe89a0e0929a1`; that check does not certify a later release.
- Ten separate workflow explanations and source/evidence limits: `projects/ledgerbridge.html`, `projects/marketbrief.html`, `projects/chainwatch.html`, `projects/backtestguard.html`, `projects/replycraft.html`, `projects/handoffhub.html`, `projects/pipelinerelay.html`, `projects/onboardpath.html`, `projects/sentineldesk.html`, and `projects/searchlift.html`.
- SearchLift dated Pages read (`clean-clone-live.json`, retrieved `2026-09-25T19:43:45Z`; source SHA-256 `b4ed4de9f785a5059acde72c7660d6c20351d8409915c6323a252836b3001c88`): a bounded, read-only review of one page found 10/10 approved workflow names in captured fields. This is structural name coverage only, not SEO performance or a current full-site audit.
- The 2026-09-26 witness bundle verifies six local model exchanges; five accepted, source-cited samples are exposed in the recorded lab.
- dotz and Sophos case studies and their public repositories: `projects/dotz.html`, `projects/sophos.html`, and the repository links recorded above.
- Project résumé and existing one-page PDF: `resume.html`, `resume/resume.md`, and `Cayleb-James-resume.pdf`.
- Additional work history and education are self-reported in the reviewed résumé. No customer outcomes, revenue, adoption, or company deployment is established; none should be invented.

## Product Principles

1. Keep public-source results, local-input reviews, and model evidence distinct; retain machine statuses in the dated receipts.
2. Make each proof's scope and limits explicit; a public source slice is not a full-workflow result.
3. Do not claim authorship, employment, customer or business outcomes beyond the linked evidence.
4. Preserve the public routes and project résumé while making the lab's dated replay explicit.

## Accessibility & Inclusion

Future changes must keep the web experience usable at desktop and phone sizes, allow keyboard operation with visible focus, and honor reduced-motion preferences. These are requirements, not a claim that the current site has passed a full accessibility audit.

## Open Facts

- Recruiter contact and remote role focus are explicit operator decisions.
- The reviewed résumé includes user-supplied work history and education. These were checked against supplied materials, not independently verified by employers or the school.
- Private-company outcomes—including any customers, revenue, adoption, or deployment—remain unknown from this public evidence and must not be asserted without verification.
- The approved dark visual direction is preserved across the site and lab.
