import assert from "node:assert/strict";
import {
  getColumnsCount,
  getRowHeight,
  calculateVirtualizationData
} from "../src/utils/virtualizationUtils.js";

// Generate mock event list helper
const createMockEvents = (count) =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title: `Mock Event ${index + 1}`,
    date: `2026-06-${String((index % 30) + 1).padStart(2, "0")}`,
    location: "Online",
    type: "workshop"
  }));

console.log("Starting Virtualization List Rendering Unit Tests...");

// -------------------------------------------------------------
// Test Suite 1: Column Count Verification
// -------------------------------------------------------------
console.log("Running Suite 1: getColumnsCount...");
assert.equal(getColumnsCount(false, 1200), 1, "List mode always forces 1 column regardless of width");
assert.equal(getColumnsCount(false, 768), 1, "List mode forces 1 column at 768px");
assert.equal(getColumnsCount(false, 500), 1, "List mode forces 1 column on small screens");
assert.equal(getColumnsCount(true, 1200), 3, "Grid mode displays 3 columns on wide screens (>= 768px)");
assert.equal(getColumnsCount(true, 768), 3, "Grid mode displays 3 columns exactly at 768px");
assert.equal(getColumnsCount(true, 767.9), 1, "Grid mode collapses to 1 column on narrow screens (< 768px)");
assert.equal(getColumnsCount(true, 480), 1, "Grid mode displays 1 column on mobile devices");
assert.equal(getColumnsCount(true, 0), 1, "Grid mode handles 0 window width gracefully by defaulting to 1 column");

// -------------------------------------------------------------
// Test Suite 2: Row Height Verification
// -------------------------------------------------------------
console.log("Running Suite 2: getRowHeight...");
assert.equal(getRowHeight(true), 480, "Grid row height is configured to 480px");
assert.equal(getRowHeight(false), 200, "List row height is configured to 200px");

// -------------------------------------------------------------
// Test Suite 3: Virtualization Slice Calculations
// -------------------------------------------------------------
console.log("Running Suite 3: calculateVirtualizationData...");

// Test Case 3.1: Empty events list
const emptyResult = calculateVirtualizationData([], 0, 800, 1200, 1, 480, 1, 0);
assert.deepEqual(
  emptyResult,
  { renderedItems: [], topPadding: 0, bottomPadding: 0 },
  "Empty list returns zeroed paddings and empty items array"
);

const sampleEvents = createMockEvents(30);

// Test Case 3.2: Grid view, beginning of scroll (scrollTop = 0)
// 30 items, 3 columns, 10 total rows. rowHeight = 480. scrollTop = 0. bufferCount = 1.
// startRow = Math.max(0, 0 - 1) = 0.
// endRow = Math.min(9, Math.floor(800 / 480) + 1) = Math.min(9, 1 + 1) = 2.
// renderedRows = [0, 1, 2] -> 3 rows -> 9 items.
// startIndex = 0. endIndex = 3 * 3 = 9.
// topPadding = 0 * 480 = 0.
// bottomPadding = (10 - 1 - 2) * 480 = 7 * 480 = 3360.
const gridStartResult = calculateVirtualizationData(
  sampleEvents,
  0,       // scrollTop
  800,     // viewportHeight
  1200,    // windowWidth
  3,       // columnsCount
  480,     // rowHeight
  1,       // bufferCount
  0        // containerOffsetTop
);
assert.equal(gridStartResult.renderedItems.length, 9, "Should render 9 items at start of list in 3-column grid");
assert.equal(gridStartResult.renderedItems[0].originalIndex, 0, "First rendered item original index must be 0");
assert.equal(gridStartResult.renderedItems[8].originalIndex, 8, "Last rendered item original index must be 8");
assert.equal(gridStartResult.topPadding, 0, "Top padding at top of grid must be 0px");
assert.equal(gridStartResult.bottomPadding, 3360, "Bottom padding at top of grid must reserve space for remaining rows (3360px)");

// Test Case 3.3: Grid view, middle of scroll (scrollTop = 1500)
// relativeScrollY = 1500.
// startRow = Math.max(0, Math.floor(1500 / 480) - 1) = Math.max(0, 3 - 1) = 2.
// endRow = Math.min(9, Math.floor((1500 + 800) / 480) + 1) = Math.min(9, Math.floor(2300 / 480) + 1) = Math.min(9, 4 + 1) = 5.
// renderedRows = [2, 3, 4, 5] -> 4 rows -> 12 items.
// startIndex = 2 * 3 = 6.
// endIndex = 6 * 3 = 18.
// topPadding = 2 * 480 = 960.
// bottomPadding = (10 - 1 - 5) * 480 = 4 * 480 = 1920.
const gridMiddleResult = calculateVirtualizationData(
  sampleEvents,
  1500,    // scrollTop
  800,     // viewportHeight
  1200,    // windowWidth
  3,       // columnsCount
  480,     // rowHeight
  1,       // bufferCount
  0        // containerOffsetTop
);
assert.equal(gridMiddleResult.renderedItems.length, 12, "Should render 12 items (4 rows with buffer) when scrolled mid-way");
assert.equal(gridMiddleResult.renderedItems[0].originalIndex, 6, "First item index should be 6 when starting from row 2");
assert.equal(gridMiddleResult.renderedItems[11].originalIndex, 17, "Last item index should be 17");
assert.equal(gridMiddleResult.topPadding, 960, "Top padding should be 960px");
assert.equal(gridMiddleResult.bottomPadding, 1920, "Bottom padding should be 1920px");

// Test Case 3.4: List view, mid-scroll with container offset (scrollTop = 2000, containerOffsetTop = 500)
// relativeScrollY = Math.max(0, 2000 - 500) = 1500.
// totalRows = 30 rows (columnsCount = 1). rowHeight = 200.
// startRow = Math.max(0, Math.floor(1500 / 200) - 1) = Math.max(0, 7 - 1) = 6.
// endRow = Math.min(29, Math.floor((1500 + 800) / 200) + 1) = Math.min(29, Math.floor(2300 / 200) + 1) = Math.min(29, 11 + 1) = 12.
// renderedRows = [6, ..., 12] -> 7 rows -> 7 items.
// startIndex = 6. endIndex = 13.
// topPadding = 6 * 200 = 1200.
// bottomPadding = (30 - 1 - 12) * 200 = 17 * 200 = 3400.
const listOffsetResult = calculateVirtualizationData(
  sampleEvents,
  2000,    // scrollTop
  800,     // viewportHeight
  1200,    // windowWidth
  1,       // columnsCount
  200,     // rowHeight
  1,       // bufferCount
  500      // containerOffsetTop
);
assert.equal(listOffsetResult.renderedItems.length, 7, "Should render 7 items in list mode with container offset");
assert.equal(listOffsetResult.renderedItems[0].originalIndex, 6, "First item index is 6");
assert.equal(listOffsetResult.renderedItems[6].originalIndex, 12, "Last item index is 12");
assert.equal(listOffsetResult.topPadding, 1200, "Top padding should be 1200px");
assert.equal(listOffsetResult.bottomPadding, 3400, "Bottom padding should be 3400px");

// Test Case 3.5: Grid view, end of scroll (scrollTop = 4000)
// relativeScrollY = 4000.
// startRow = Math.max(0, Math.floor(4000 / 480) - 1) = Math.max(0, 8 - 1) = 7.
// endRow = Math.min(9, Math.floor((4000 + 800) / 480) + 1) = Math.min(9, Math.floor(4800 / 480) + 1) = Math.min(9, 10 + 1) = 9.
// renderedRows = [7, 8, 9] -> 3 rows -> 9 items.
// startIndex = 21. endIndex = 30.
// topPadding = 7 * 480 = 3360.
// bottomPadding = (10 - 1 - 9) * 480 = 0.
const gridEndResult = calculateVirtualizationData(
  sampleEvents,
  4000,    // scrollTop
  800,     // viewportHeight
  1200,    // windowWidth
  3,       // columnsCount
  480,     // rowHeight
  1,       // bufferCount
  0        // containerOffsetTop
);
assert.equal(gridEndResult.renderedItems.length, 9, "Should render 9 items at the end of the scroll bounds");
assert.equal(gridEndResult.renderedItems[8].originalIndex, 29, "Last item is the final item in the array (index 29)");
assert.equal(gridEndResult.topPadding, 3360, "Top padding holds correct scrolled height (3360px)");
assert.equal(gridEndResult.bottomPadding, 0, "Bottom padding reaches 0px at the bottom of the container");

// Test Case 3.6: Large-scale performance stress test with 15,000 events
console.log("Running Suite 3.6: 15,000 items virtualization calculation stress test...");
const largeEventsList = createMockEvents(15000);
const startMs = Date.now();
const stressResult = calculateVirtualizationData(
  largeEventsList,
  450000,   // scrollTop (way down the list)
  900,      // viewportHeight
  1200,     // windowWidth
  3,        // columnsCount
  480,      // rowHeight
  2,        // bufferCount (extra buffer)
  1000      // containerOffsetTop
);
const duration = Date.now() - startMs;
console.log(`Stress test calculated in ${duration}ms.`);

assert.ok(duration < 15, "Virtualization calculation must be extremely fast and run in under 15ms to avoid rendering lag");
assert.equal(stressResult.renderedItems.length, 21, "Should render 21 items with 2 row buffers (7 rows total)");
assert.equal(stressResult.renderedItems[0].originalIndex, 2799, "Staged slice starting index matches scrolled row index");
assert.ok(stressResult.topPadding > 0, "Top padding successfully offset for scrolled rows");
assert.ok(stressResult.bottomPadding > 0, "Bottom padding successfully offset for remaining rows");

// Test Case 3.7: Boundary condition and negative scroll handling
console.log("Running Suite 3.7: Boundary condition validation...");
const boundaryResult = calculateVirtualizationData(
  sampleEvents,
  -500,     // negative scrollTop (overscroll upward)
  800,
  1200,
  3,
  480,
  1,
  100
);
assert.equal(boundaryResult.topPadding, 0, "Negative scroll values clamp and produce 0px top padding");
assert.equal(boundaryResult.renderedItems.length, 9, "Negative scroll values fallback gracefully to list beginning");

console.log("All Virtualization List Rendering Unit Tests PASSED successfully!");
