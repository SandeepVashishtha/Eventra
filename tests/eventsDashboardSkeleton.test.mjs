import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const eventsTabPath = path.resolve(__dirname, "../src/components/user/EventsTab.js");

test("Events dashboard loading state uses skeleton placeholders instead of a centered spinner", () => {
  const source = readFileSync(eventsTabPath, "utf8");
  const loadingComponent = source.slice(
    source.indexOf("const EventsLoading"),
    source.indexOf("/* ---------------- Stats Component ---------------- */"),
  );

  assert.match(loadingComponent, /role="status"/, "loading skeleton should announce loading status");
  assert.match(loadingComponent, /DashboardStatCardSkeleton/, "loading state should include stat skeletons");
  assert.match(loadingComponent, /SkeletonEventCard/, "loading state should include event card skeletons");
  assert.match(loadingComponent, /my-events-toolbar/, "loading state should preserve toolbar layout");
  assert.doesNotMatch(loadingComponent, /animate-spin/, "Events dashboard loading should not use a spinner");
  assert.doesNotMatch(loadingComponent, /Loading your events\.\.\./, "Events dashboard loading should not render loading text in place of skeletons");
});
