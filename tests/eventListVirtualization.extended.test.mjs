import assert from "node:assert/strict";
import {
  getColumnsCount,
  getRowHeight,
  calculateVirtualizationData
} from "../src/utils/virtualizationUtils.js";

// Helper to create synthetic events
const makeSyntheticEvents = (count) =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title: `Fuzzy Test Event ${index + 1}`,
    date: "2026-06-15",
    location: "Virtual Space",
    tags: ["tech", "fuzz"]
  }));

console.log("Starting Extended Mathematical Virtualization Edge-Case Validation...");

// -------------------------------------------------------------
// Test Case 1: Grid Snap Invariants (Fuzzy Test)
// -------------------------------------------------------------
console.log("Running Suite 1: Randomized Mathematical Invariants (1,000 runs)...");

const eventListSizes = [10, 57, 100, 503, 1000, 4999];
const viewports = [400, 600, 800, 1080];
const columnsOptions = [1, 2, 3, 4];
const rowHeights = [150, 200, 320, 480];
const buffers = [0, 1, 2, 3];

let runsCount = 0;

for (let r = 0; r < 1000; r++) {
  // Select random parameters
  const count = eventListSizes[Math.floor(Math.random() * eventListSizes.length)];
  const events = makeSyntheticEvents(count);
  const viewportHeight = viewports[Math.floor(Math.random() * viewports.length)];
  const columnsCount = columnsOptions[Math.floor(Math.random() * columnsOptions.length)];
  const rowHeight = rowHeights[Math.floor(Math.random() * rowHeights.length)];
  const bufferCount = buffers[Math.floor(Math.random() * buffers.length)];
  
  // Random vertical scroll between -100 and (totalHeight + 500)
  const totalRows = Math.ceil(count / columnsCount);
  const totalHeight = totalRows * rowHeight;
  const scrollTop = Math.floor(Math.random() * (totalHeight + 600)) - 100;
  const containerOffsetTop = Math.floor(Math.random() * 800);

  const result = calculateVirtualizationData(
    events,
    scrollTop,
    viewportHeight,
    1200,
    columnsCount,
    rowHeight,
    bufferCount,
    containerOffsetTop
  );

  runsCount++;

  // Invariant 1: renderedItems count must not exceed total event list size
  assert.ok(result.renderedItems.length <= count, `Rendered items (${result.renderedItems.length}) exceeds total count (${count})`);

  // Invariant 2: paddings must never be negative
  assert.ok(result.topPadding >= 0, `Top padding (${result.topPadding}) must be non-negative`);
  assert.ok(result.bottomPadding >= 0, `Bottom padding (${result.bottomPadding}) must be non-negative`);

  // Invariant 3: if events list is not empty, rendered items + padded rows must represent entire grid height
  if (count > 0 && result.renderedItems.length > 0) {
    const renderedFirstIndex = result.renderedItems[0].originalIndex;
    const renderedLastIndex = result.renderedItems[result.renderedItems.length - 1].originalIndex;
    
    const startRowIdx = Math.floor(renderedFirstIndex / columnsCount);
    const endRowIdx = Math.floor(renderedLastIndex / columnsCount);

    const calculatedTopPadding = startRowIdx * rowHeight;
    const calculatedBottomPadding = Math.max(0, (totalRows - 1 - endRowIdx) * rowHeight);

    assert.equal(result.topPadding, calculatedTopPadding, "Top padding math does not align with active slice row");
    assert.equal(result.bottomPadding, calculatedBottomPadding, "Bottom padding math does not align with active slice row");

    // Invariant 4: total height computed from paddings + active rows must equal total grid height
    const activeHeight = (endRowIdx - startRowIdx + 1) * rowHeight;
    const computedTotalHeight = result.topPadding + activeHeight + result.bottomPadding;
    assert.equal(computedTotalHeight, totalHeight, `Computed total height (${computedTotalHeight}) does not match expected total height (${totalHeight})`);
  }
}

console.log(`Successfully verified ${runsCount} randomized scroll scenarios with perfect mathematical consistency!`);

// -------------------------------------------------------------
// Test Case 2: Extreme Overscroll Bounds
// -------------------------------------------------------------
console.log("Running Suite 2: Extreme overscroll bounds validation...");

const tinyList = makeSyntheticEvents(5); // 5 items
// Scroll down by 50,000px (way past the end)
const overscrollDownResult = calculateVirtualizationData(
  tinyList,
  50000,
  800,
  1200,
  1,
  200,
  1,
  0
);

assert.equal(overscrollDownResult.bottomPadding, 0, "Overscroll down clamps bottom padding to 0px");
assert.equal(overscrollDownResult.renderedItems.length, 1, "Should render at least the last item when scrolled past the bottom");
assert.equal(overscrollDownResult.renderedItems[0].originalIndex, 4, "The rendered item must be the last item in the list");
assert.equal(overscrollDownResult.topPadding, 4 * 200, "Top padding matches the height of all preceding rows");

// -------------------------------------------------------------
// Test Case 3: Layout Transition Simulations
// -------------------------------------------------------------
console.log("Running Suite 3: Layout mode transitions validation...");

const midSizeList = makeSyntheticEvents(50);

// Transition from List mode to Grid mode
// List mode parameters
const listColumns = getColumnsCount(false, 1200); // 1
const listRowHeight = getRowHeight(false); // 200
const listScrollTop = 1500;

const listLayout = calculateVirtualizationData(
  midSizeList,
  listScrollTop,
  800,
  1200,
  listColumns,
  listRowHeight,
  1,
  0
);

// Grid mode parameters
const gridColumns = getColumnsCount(true, 1200); // 3
const gridRowHeight = getRowHeight(true); // 480
const gridScrollTop = 1500;

const gridLayout = calculateVirtualizationData(
  midSizeList,
  gridScrollTop,
  800,
  1200,
  gridColumns,
  gridRowHeight,
  1,
  0
);

assert.ok(listLayout.renderedItems.length > 0, "List layout produces active visible rows");
assert.ok(gridLayout.renderedItems.length > 0, "Grid layout produces active visible rows");
assert.notDeepEqual(listLayout, gridLayout, "List and Grid layout metrics must differ due to columns count and row height scaling");

// -------------------------------------------------------------
// Test Suite 4: Padding mathematical alignment validation
// -------------------------------------------------------------
console.log("Running Suite 4: Padding mathematical alignment validation...");

const alignmentEvents = makeSyntheticEvents(47);
for (let offset = 0; offset < 5000; offset += 150) {
  const result = calculateVirtualizationData(
    alignmentEvents,
    offset,
    768,
    1200,
    3,
    480,
    1,
    0
  );
  
  assert.equal(result.topPadding % 480, 0, "Top padding must be a clean mathematical multiple of row height");
  assert.equal(result.bottomPadding % 480, 0, "Bottom padding must be a clean mathematical multiple of row height");
}

console.log("Extended Mathematical Virtualization Edge-Case Validation Completed successfully!");
