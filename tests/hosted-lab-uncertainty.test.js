import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const receiptsDir = path.join(root, "lab", "receipts");
const expectedSlugs = [
  "backtestguard",
  "chainwatch",
  "handoffhub",
  "ledgerbridge",
  "marketbrief",
  "onboardpath",
  "pipelinerelay",
  "replycraft",
  "searchlift",
  "sentineldesk",
];

const expectedUncertainty = {
  searchlift:
    "This is a dated 2026-09-26 snapshot of one public portfolio page. SearchLift inspected title, meta description, heading text, and paragraph text in a bounded parser projection only (at most 1,000 characters per captured item, 20 headings, and 30 paragraphs). It did not inspect analytics, traffic, search rankings, the complete page source, or other pages; 10/10 name coverage applies only to those captured fields.",
  sentineldesk:
    "This is a dated CISA KEV catalog snapshot retrieved 2026-09-26. No organization alerts or asset inventory were connected. The public queue does not establish whether any listed CVE applies to an organization, whether an incident exists, or response priority. A responder must validate alert provenance, source freshness, product/version applicability, and authorized asset context before acting.",
};

const unchangedReceiptHashes = {
  backtestguard: "ec302484ed7cc3c311a1e6bb86bbccbb8a00708ddf0f98ff298b4ae2980728c5",
  chainwatch: "46e523ffc3fb52bb4044ba573be67e39cb3ed3137131e5b24d488946b0f9214c",
  handoffhub: "e8f19abc112272cd6afbdd1732c3f5413d96ad731f467e92ad3c18dd01447ad7",
  ledgerbridge: "7fe788479210e46fe98a2fe15c71ec1571f786efaeec27434fa7794762319e23",
  marketbrief: "53ce6039b33b50f9dd92b3d526890cf8743bc90226cfd02a77625bf98954a1f6",
  onboardpath: "2dfd4b487d153628ee534ef2f666ac2efd014c1e606132b0cb539dac95ec8daa",
  pipelinerelay: "f5304a4fb5aed966709bd398d6f88bd5336eeae3a967c65236cf8b598cc73cec",
  replycraft: "f522b0bc695db29b644cde85f1f76e6e213fcf8fbf229a7c8c591708a9e83bbe",
};

const normalizedChangedReceiptHashes = {
  searchlift: "1af31e35fccfa76c562aee8fa86db2b5e90931d5a1e3b42f29f56147d897ec16",
  sentineldesk: "690a21fbf32fae205d0f7837f949cf6f40923c37302ea1a07d46d84b8cd3aed8",
};

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function loadReceipt(slug) {
  return JSON.parse(readFileSync(path.join(receiptsDir, `${slug}.json`), "utf8"));
}

test("SearchLift exposes the actual capture and parser limits", () => {
  const receipt = loadReceipt("searchlift");
  assert.equal(receipt.uncertainty, expectedUncertainty.searchlift);
  for (const phrase of [
    "one public portfolio page",
    "title, meta description, heading text, and paragraph text",
    "1,000 characters",
    "20 headings",
    "30 paragraphs",
    "analytics",
    "search rankings",
    "complete page source",
  ]) {
    assert.ok(receipt.uncertainty.includes(phrase), `SearchLift uncertainty must include: ${phrase}`);
  }
});

test("SentinelDesk states that org alerts and assets were not connected", () => {
  const receipt = loadReceipt("sentineldesk");
  assert.equal(receipt.uncertainty, expectedUncertainty.sentineldesk);
  for (const phrase of [
    "CISA KEV catalog snapshot",
    "2026-09-26",
    "No organization alerts or asset inventory were connected",
    "does not establish whether any listed CVE applies",
    "product/version applicability",
    "authorized asset context",
  ]) {
    assert.ok(receipt.uncertainty.includes(phrase), `SentinelDesk uncertainty must include: ${phrase}`);
  }
});

test("all ten dated receipts remain unchanged outside the two uncertainty values", () => {
  const slugs = readdirSync(receiptsDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.slice(0, -5))
    .sort();
  assert.deepEqual(slugs, expectedSlugs);

  for (const slug of expectedSlugs) {
    const raw = readFileSync(path.join(receiptsDir, `${slug}.json`));
    const receipt = JSON.parse(raw.toString("utf8"));
    assert.equal(receipt.app_slug, slug, `${slug} app_slug must match its filename`);
    assert.equal(typeof receipt.recorded_at_utc, "string", `${slug} dated replay timestamp must remain`);

    if (slug in expectedUncertainty) {
      const normalized = JSON.parse(JSON.stringify(receipt));
      normalized.uncertainty = null;
      assert.equal(
        sha256(JSON.stringify(normalized)),
        normalizedChangedReceiptHashes[slug],
        `${slug} must differ from the public baseline only in uncertainty`,
      );
      assert.equal(receipt.uncertainty, expectedUncertainty[slug]);
    } else {
      assert.equal(sha256(raw), unchangedReceiptHashes[slug], `${slug} dated receipt bytes must remain unchanged`);
    }
  }
});
