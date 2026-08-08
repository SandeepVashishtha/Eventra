/**
 * Unit tests for src/utils/notificationMerge.js
 *
 * Regression coverage for the realtime notification ingest path: an incoming
 * notification must be merged into the existing inbox (deduped by id, sorted
 * newest-first) instead of replacing it, so previously loaded and persisted
 * notifications are never wiped.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeNotificationLists } from "../src/utils/notificationMerge.js";

test("merges an incoming realtime notification into an existing inbox of N items", () => {
  const existing = [
    { id: "1", title: "A", isRead: true, timestamp: "2026-08-01T10:00:00Z" },
    { id: "2", title: "B", isRead: false, timestamp: "2026-08-01T09:00:00Z" },
  ];
  const incoming = [
    { id: "3", title: "C", isRead: false, timestamp: "2026-08-02T10:00:00Z" },
  ];

  const merged = mergeNotificationLists(existing, incoming);

  assert.equal(merged.length, 3);
  assert.deepEqual(
    merged.map((n) => n.id),
    ["3", "1", "2"],
  );
});

test("dedupes by id keeping the incoming item", () => {
  const existing = [
    { id: "1", title: "Old title", isRead: true, timestamp: "2026-08-01T10:00:00Z" },
  ];
  const incoming = [
    { id: "1", title: "New title", isRead: false, timestamp: "2026-08-02T10:00:00Z" },
  ];

  const merged = mergeNotificationLists(existing, incoming);

  assert.equal(merged.length, 1);
  assert.equal(merged[0].title, "New title");
  assert.equal(merged[0].isRead, false);
});

test("sorts newest-first after a merge", () => {
  const existing = [
    { id: "1", title: "Older", timestamp: "2026-08-01T10:00:00Z" },
    { id: "2", title: "Oldest", timestamp: "2026-08-01T09:00:00Z" },
  ];
  const incoming = [
    { id: "3", title: "Newest", timestamp: "2026-08-03T10:00:00Z" },
  ];

  const merged = mergeNotificationLists(existing, incoming);

  assert.deepEqual(
    merged.map((n) => n.id),
    ["3", "1", "2"],
  );
});

test("handles empty existing inbox", () => {
  const incoming = [{ id: "1", title: "Only", timestamp: "2026-08-01T10:00:00Z" }];

  const merged = mergeNotificationLists([], incoming);

  assert.equal(merged.length, 1);
  assert.equal(merged[0].id, "1");
});
