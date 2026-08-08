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
  assert.equal(metrics.qrScans, 6);
  // (2 applies + 1 chat) / 3 visits = 100%
  assert.equal(metrics.engagementRate, 100);
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
  assert.equal(metrics.qrScans, 2);
  assert.equal(metrics.engagementRate, 0);
  assert.notEqual(metrics.boothVisits, metrics.qrScans * 3);
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
