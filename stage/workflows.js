export const WORKFLOWS=[
  {
    "slug": "ledgerbridge",
    "name": "LedgerBridge",
    "purpose": "Treasury row reconciliation",
    "source": "Treasury DTS public operating-cash rows",
    "result": "10 rows accounted for. Single-sided activity stays a review cue.",
    "limit": "Public data has no company ledger or bank counterpart.",
    "ai": "Witnessed local-model output",
    "date": "September 26, 2026",
    "ids": [
      "2026-09-24:II:9"
    ],
    "sourceUrl": "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/dts/deposits_withdrawals_operating_cash?page%5Bsize%5D=10&sort=-record_date",
    "receiptUrl": "lab/receipts/ledgerbridge.json",
    "handoff": "Review each cited category and row at its official source URL; obtain an authorized company ledger and bank statement before any private month-end reconciliation."
  },
  {
    "slug": "marketbrief",
    "name": "MarketBrief",
    "purpose": "Cited macro context",
    "source": "World Bank nominal U.S. GDP series",
    "result": "15 annual observations with citations preserved.",
    "limit": "Macro context does not establish security returns or company research.",
    "ai": "Witnessed local-model output",
    "date": "September 26, 2026",
    "ids": [
      "USA:NY.GDP.MKTP.CD:2024",
      "USA:NY.GDP.MKTP.CD:2025"
    ],
    "sourceUrl": "https://api.worldbank.org/v2/country/USA/indicator/NY.GDP.MKTP.CD?format=json&per_page=15",
    "receiptUrl": "lab/receipts/marketbrief.json",
    "handoff": "Review each cited source year and add independently sourced company, valuation, and market evidence before presenting full company research."
  },
  {
    "slug": "backtestguard",
    "name": "BacktestGuard",
    "purpose": "Chronology & leakage review",
    "source": "World Bank GDP observation years",
    "result": "A chronological split is inspected against a future-observation probe.",
    "limit": "No actual external experiment record or release timestamps were supplied.",
    "ai": "Witnessed local-model output",
    "date": "September 26, 2026",
    "ids": [
      "USA:NY.GDP.MKTP.CD:2021"
    ],
    "sourceUrl": "https://api.worldbank.org/v2/country/USA/indicator/NY.GDP.MKTP.CD?format=json&per_page=15",
    "receiptUrl": "lab/receipts/backtestguard.json",
    "handoff": "Review the cutoff and holdout years, verify source release timing, and attach the actual experiment record before deciding whether any leakage conclusion applies."
  },
  {
    "slug": "sentineldesk",
    "name": "SentinelDesk",
    "purpose": "Vulnerability triage",
    "source": "Dated CISA KEV catalog",
    "result": "Public vulnerability records are grouped for human review.",
    "limit": "No organization alerts or asset inventory are connected.",
    "ai": "Witnessed local-model output",
    "date": "September 26, 2026",
    "ids": [
      "CVE-2026-93952"
    ],
    "sourceUrl": "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
    "receiptUrl": "lab/receipts/sentineldesk.json",
    "handoff": "Compare cited CVEs with an authorized asset inventory and alert source, then validate product/version applicability before deciding on a response."
  },
  {
    "slug": "onboardpath",
    "name": "OnboardPath",
    "purpose": "Public policy review",
    "source": "Public Federal Register OPM proposal",
    "result": "Source-linked policy context is prepared for review.",
    "limit": "No employee records or applicable employer policy are available.",
    "ai": "Witnessed local-model output",
    "date": "September 26, 2026",
    "ids": [
      "opmtext:FR2026_19222"
    ],
    "sourceUrl": null,
    "receiptUrl": "lab/receipts/onboardpath.json",
    "handoff": "A human reviewer should inspect the cited federal document; connect authorized employee records and applicable employer policy before answering a person."
  },
  {
    "slug": "handoffhub",
    "name": "HandoffHub",
    "purpose": "Context-preserving handoffs",
    "source": "Public OPM text excerpt",
    "result": "A deterministic excerpt carries context into a human handoff.",
    "limit": "The owner is a role placeholder, not a verified internal assignee.",
    "ai": "Deterministic review \u00b7 no AI run",
    "date": "September 26, 2026",
    "ids": [],
    "sourceUrl": null,
    "receiptUrl": "lab/receipts/handoffhub.json",
    "handoff": "A human reviewer should verify the official edition and connect an authorized internal owner before any workplace handoff."
  },
  {
    "slug": "replycraft",
    "name": "ReplyCraft",
    "purpose": "Draft & approval boundary",
    "source": "Public OPM policy sample",
    "result": "A deterministic draft waits for a human decision.",
    "limit": "A sample only. No send endpoint is enabled.",
    "ai": "Deterministic review \u00b7 no AI run",
    "date": "September 26, 2026",
    "ids": [],
    "sourceUrl": null,
    "receiptUrl": "lab/receipts/replycraft.json",
    "handoff": "A human reviewer must approve or revise this sample before any separate use; no send endpoint is enabled."
  },
  {
    "slug": "pipelinerelay",
    "name": "PipelineRelay",
    "purpose": "Public repository review",
    "source": "Public pytest repository metadata",
    "result": "Returned repository and license metadata are checked.",
    "limit": "Public metadata is not a CRM record, lead, or contact permission.",
    "ai": "Deterministic review \u00b7 no AI run",
    "date": "September 26, 2026",
    "ids": [],
    "sourceUrl": "https://api.github.com/repos/pytest-dev/pytest",
    "receiptUrl": "lab/receipts/pipelinerelay.json",
    "handoff": "Review the exact returned license terms at https://api.github.com/licenses/mit, confirm the repository metadata is relevant to an explicitly authorized public-research question, and keep the timestamp limitation visible; do not create a lead or initiate contact."
  },
  {
    "slug": "searchlift",
    "name": "SearchLift",
    "purpose": "Structural content review",
    "source": "A dated public portfolio-page snapshot",
    "result": "Captured headings and content fields are reviewed.",
    "limit": "Bounded parser projection. No rankings, traffic or analytics.",
    "ai": "Deterministic review \u00b7 no AI run",
    "date": "September 26, 2026",
    "ids": [],
    "sourceUrl": null,
    "receiptUrl": "lab/receipts/searchlift.json",
    "handoff": "Review the source-linked findings and drafts; any content change requires a separate human publishing decision."
  },
  {
    "slug": "chainwatch",
    "name": "ChainWatch",
    "purpose": "Anomaly calculation example",
    "source": "Two invented observations",
    "result": "A deterministic threshold calculation illustrates a review cue.",
    "limit": "Invented addresses and values. No live chain data or exposure evidence.",
    "ai": "Invented-data calculation",
    "date": "September 26, 2026",
    "ids": [],
    "sourceUrl": null,
    "receiptUrl": "lab/receipts/chainwatch.json",
    "handoff": "Review the invented example before applying a calculation to authorized data."
  }
];
