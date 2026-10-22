# RHL content sources

Checked against the current public RHL website on October 22, 2026. The concept's copy adapts these sources; it is not presented as a verbatim quotation. Capitalization, phone punctuation and some manufacturer names are normalized.

| Content | First-party source |
| --- | --- |
| Company, markets, address, phone, fax and Equal Opportunity Employer statement | [Home](https://rhlco.com/), [About](https://rhlco.com/about), [Contact](https://rhlco.com/contact) |
| Account executives, designers, project managers, furniture installers, architectural installers and service capabilities | [About](https://rhlco.com/about) |
| Roster, titles, phones, territories and linked biographies | [Team](https://rhlco.com/team), with the owner corrections below |
| Founding and leadership history | [About](https://rhlco.com/about), [John Lord](https://rhlco.com/team/john-lord-bio), [Peter Lord](https://rhlco.com/team/peter-lord-bio), [Rob Romay](https://rhlco.com/team/rob-romay-bio), [Roy McNally](https://rhlco.com/team/roy-mcnally-bio) |
| Showroom date, size, design and general contractor | [RHL showroom project](https://rhlco.com/portfolio/corporate/rhl-co) |
| Project descriptions, scope, products, credits and photographs | The `source` URL on each of the 36 records in [projects.json](data/projects.json) |
| Manufacturer lists, contract references, qualification language and dates | [Manufacturers](https://rhlco.com/manufacturers), [full line card PDF](https://rhlco.com/uploads/files/rhl-all-product-lines-july-2026.pdf), [MHEC PDF](https://rhlco.com/uploads/files/rhl-mhec-product-lines-1-1.pdf), [CLC PDF](https://rhlco.com/uploads/files/rhl-clc-product-lines.pdf) |
| Existing public inquiry route | [General inquiries form](https://rhlco.com/contact/general-inquiries-form) |

## Scope distinctions

The public About page supports an in-house trained **furniture** installation crew and **manufacturer-certified** installers for architectural products. It does not identify the architectural installers' employer. The concept now preserves that distinction in its process copy, crew headings, shared footer and metadata.

Service wording describes the team's ability to inspect, maintain and repair equipment. It does not promise a service duration or guarantee safety. Unverified delivery, storage, crew-count, hours and hiring claims are not supplied as company facts. The concept's own inquiry form remains a demo; its copy links to the actual public RHL inquiry form rather than assuming an inbox destination.

## Owner corrections

Cayleb supplied these updates on October 22, 2026:

- **Giovannie Berrato — Head Installer.** Keep the existing name spelling.
- **Raymond Ballard — Estimator in Training.** He is no longer included in the installer group or crew showcases.

The public RHL team page still has the older roles. These two changes are owner-provided corrections, not facts independently confirmed by that page. All other roster facts and the nine adapted biographies were checked against current official pages.

## Manufacturer-list discrepancy

RHL's current HTML lists contain **161 line-card entries, 102 DAS/MHEC entries and 79 CLC entries**, totaling 165 distinct manufacturers. The four MHEC-only entries are Cramer, OM Seating, Sauder and Sitmatic.

The linked MHEC PDF contains **101** names and omits **Watchfire**, which the HTML list includes. The concept retains the HTML-list data and labels counts as entries in the published lists. It asks visitors to confirm coverage with their account executive. This audit does not resolve the discrepancy or establish eligibility for a particular purchase. The full line-card and CLC PDF membership agree with their HTML lists after normalizing extraction artifacts.

The local display `Nienkamper` is retained as normalized brand spelling. RHL's list prints `NEINKAMPER`; the [manufacturer's own site](https://www.nienkamper.com/) styles the brand as Nienkämper. Middlebury's `Gill Athletics` display follows RHL's manufacturer directory; its project page uses the singular `Gill Athletic`.

The [Raymond Library page](https://rhlco.com/portfolio/libraries/raymond-library) credits `Tuttle & Wells`, while [Lyme Library](https://rhlco.com/portfolio/libraries/lyme-public-library) credits `Tuthill & Wells`. Each concept project now follows its own RHL project credit. This records the published credits without resolving the source's identity/spelling inconsistency.

The UConn IPB description is limited to the tenant-space scope and listed products on its current page. Unsupported building-size and room-detail additions were removed. Photo credits preserve the published `Greg Premru Photography Inc.` and `Courtesy of Gaston Electric` wording. Homepage summaries retain the separate Yale architect/architect-of-record and Franklin architect/designer roles.

Some original detail pages link to obsolete `/markets/...` slideshow routes. The current sitemap supplies working [Malden](https://rhlco.com/portfolio/corporate/malden-police-department/malden-police-department-gallery) and [Hunking](https://rhlco.com/portfolio/k-12/hunking-school/hunking-school-gallery) gallery URLs. All 12 local Malden images and all eight Hunking images were matched to images in those current public galleries; no existing project media was removed.

## Evidence and verification

Raw first-party HTML and PDF captures, readable extracts, retrieval timestamps, HTTP results, SHA-256 hashes and the focused audit reports are retained in `/home/cayleb/Work/session-artifacts/rhl-wording-review-20261022/`. The project manifest records the individual source URLs rather than duplicating them here.

Rebuild with `python3 src/build.py`. The review checks generated copy, preservation of the owner corrections, list totals, local links and assets, and the published version after deployment. Source documents live under `src/`, which is excluded from deployment by the existing `.vercelignore`.
