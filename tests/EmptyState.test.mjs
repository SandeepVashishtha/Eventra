import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const emptyStateSrc = readFileSync("src/components/common/EmptyState.jsx", "utf8");
const searchEmptyStateSrc = readFileSync("src/components/common/SearchEmptyState.jsx", "utf8");

// 1. Verify EmptyState.jsx props and destructuring
assert.ok(
  emptyStateSrc.includes("title") && emptyStateSrc.includes("description") && emptyStateSrc.includes("icon"),
  "EmptyState must destructure standard props: title, description, icon"
);

assert.ok(
  emptyStateSrc.includes("message") && emptyStateSrc.includes("onClearFilters") && emptyStateSrc.includes("onBrowseAll"),
  "EmptyState must support legacy props: message, onClearFilters, onBrowseAll for backward compatibility"
);

assert.ok(
  emptyStateSrc.includes("actionPath") && emptyStateSrc.includes("actionLabel"),
  "EmptyState must support navigation props: actionPath, actionLabel"
);

assert.ok(
  emptyStateSrc.includes("children"),
  "EmptyState must support custom children insertion for extensibility"
);

// 2. Verify accessibility features in EmptyState.jsx
assert.match(
  emptyStateSrc,
  /aria-label=\{displayActionLabel\}/,
  "EmptyState must include appropriate ARIA labels for action triggers"
);

// 3. Verify SearchEmptyState.jsx refactor wraps EmptyState
assert.match(
  searchEmptyStateSrc,
  /import EmptyState from "\.\/EmptyState"/,
  "SearchEmptyState must import the consolidated EmptyState component"
);

assert.match(
  searchEmptyStateSrc,
  /<EmptyState/,
  "SearchEmptyState must render the EmptyState container"
);

// 4. Verify user events tab integration
const eventsTabSrc = readFileSync("src/components/user/EventsTab.js", "utf8");
assert.match(
  eventsTabSrc,
  /import EmptyState from "\.\.\/common\/EmptyState"/,
  "EventsTab.js must import the shared EmptyState component"
);

assert.match(
  eventsTabSrc,
  /<EmptyState/,
  "EventsTab.js must render the EmptyState component"
);

// 5. Verify saved events integration
const savedEventsSrc = readFileSync("src/Pages/SavedEventsPage.jsx", "utf8");
assert.match(
  savedEventsSrc,
  /icon=\{Inbox\}/,
  "SavedEventsPage.jsx must use the new prop-driven EmptyState with icon component reference"
);

console.log("EmptyState integrity tests passed ✓");
