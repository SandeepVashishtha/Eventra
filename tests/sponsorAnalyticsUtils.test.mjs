import assert from "node:assert/strict";
import { computeSponsorBoothMetrics } from "../src/utils/sponsorAnalyticsUtils.js";

{
  const empty = computeSponsorBoothMetrics([]);
  assert.deepEqual(empty, {
    boothVisits: 0,
    footfall: 0,
    jobClicks: 0,
    chatInitiations: 0,
    qrScans: 0,
    engagementRate: 0,
  });
}

{
  const metrics = computeSponsorBoothMetrics([
    { action: "Booth Visit" },
    { action: "Booth Visit" },
    { action: "Booth Visit" },
    { action: "Applied: Frontend Engineer" },
    { action: "Applied: Backend Developer" },
    { action: "Chat Initiated" },
  ]);

  assert.equal(metrics.boothVisits, 3);
  assert.equal(metrics.footfall, 3);
  assert.equal(metrics.jobClicks, 2);
  assert.equal(metrics.chatInitiations, 1);
  // No QR-scan actions were recorded, so qrScans must be 0 — not the total
  // lead count (previously list.length == 6, see #17543).
  assert.equal(metrics.qrScans, 0);
  // (2 applies + 1 chat) / (3 visits + 0 scans) = 100%
  assert.equal(metrics.engagementRate, 100);
}

{
  // QR scans are counted by action, not fabricated from the total lead count.
  const metrics = computeSponsorBoothMetrics([
    { action: "QR Scan" },
    { action: "QR Scan" },
    { action: "QR Scan: Booth A" },
    { action: "Booth Visit" },
    { action: "Chat Initiated" },
  ]);
  assert.equal(metrics.qrScans, 3);
  assert.equal(metrics.boothVisits, 1);
  assert.equal(metrics.chatInitiations, 1);
  // (0 applies + 1 chat) / (1 visit + 3 scans) = 25%
  assert.equal(metrics.engagementRate, 25);
}

{
  // Must not invent multipliers from lead count
  const metrics = computeSponsorBoothMetrics([
    { action: "Applied: Designer" },
    { action: "Applied: PM" },
  ]);
  assert.equal(metrics.boothVisits, 0);
  assert.equal(metrics.footfall, 0);
  assert.equal(metrics.jobClicks, 2);
  assert.equal(metrics.qrScans, 0);
  assert.equal(metrics.engagementRate, 0);
  // boothVisits is not fabricated from the lead count (no Booth Visit actions
  // were recorded, so it must stay 0 rather than tracking list.length).
  assert.equal(metrics.boothVisits, 0);
}

{
  // engagementRate should reflect the actual interaction mix (booth visits +
  // QR scans as the base), so QR-only traffic still contributes a base.
  const metrics = computeSponsorBoothMetrics([
    { action: "QR Scan" },
    { action: "QR Scan" },
    { action: "Chat Initiated" },
    { action: "Chat Initiated" },
  ]);
  assert.equal(metrics.qrScans, 2);
  assert.equal(metrics.boothVisits, 0);
  assert.equal(metrics.chatInitiations, 2);
  // (0 applies + 2 chats) / (0 visits + 2 scans) = 100%
  assert.equal(metrics.engagementRate, 100);
}

{
  assert.deepEqual(computeSponsorBoothMetrics(null), {
    boothVisits: 0,
    footfall: 0,
    jobClicks: 0,
    chatInitiations: 0,
    qrScans: 0,
    engagementRate: 0,
  });
}

console.log("sponsorAnalyticsUtils tests passed");
