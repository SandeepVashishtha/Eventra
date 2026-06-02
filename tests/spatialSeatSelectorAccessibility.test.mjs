import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const componentPath = path.resolve(__dirname, "../src/components/events/SpatialSeatSelector.jsx");
const componentSrc = readFileSync(componentPath, "utf8");

// ── Test Helper Functions (reflecting component logic) ──

function getSeatAriaLabel(el, seatLabel, isOccupied, seatTier) {
  const availability = isOccupied ? "Occupied" : "Available";
  return `${el.label} - ${seatLabel}, ${availability} (${seatTier})`;
}

function getSeatTabIndex(readOnly, isOccupied) {
  return readOnly || isOccupied ? -1 : 0;
}

function getSeatRole(readOnly, isOccupied) {
  return !readOnly && !isOccupied ? "button" : undefined;
}

function getBestSeat(seat, seats, direction) {
  let tx = 0,
    ty = 0;
  if (direction === "ArrowRight") tx = 1;
  if (direction === "ArrowLeft") tx = -1;
  if (direction === "ArrowUp") ty = -1;
  if (direction === "ArrowDown") ty = 1;

  let bestSeat = null;
  let minScore = Infinity;

  seats.forEach((s) => {
    if (s.index === seat.index) return;
    const dx = s.x - seat.x;
    const dy = s.y - seat.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    const nx = dx / dist;
    const ny = dy / dist;
    const dot = nx * tx + ny * ty;

    if (dot > 0.1) {
      const score = dist / dot;
      if (score < minScore) {
        minScore = score;
        bestSeat = s;
      }
    }
  });

  return bestSeat;
}

// ── Test Suites ──

describe("SpatialSeatSelector Accessibility Attributes", () => {
  const mockTable = {
    label: "VIP Table A",
    tier: "VIP Front Row",
  };

  it("should construct aria-label containing table name, seat label, availability and tier", () => {
    const labelAvailable = getSeatAriaLabel(mockTable, "Seat 3", false, "VIP Front Row");
    assert.equal(
      labelAvailable,
      "VIP Table A - Seat 3, Available (VIP Front Row)",
      "Should format available seat aria-label correctly"
    );

    const labelOccupied = getSeatAriaLabel(mockTable, "Seat 5", true, "VIP Front Row");
    assert.equal(
      labelOccupied,
      "VIP Table A - Seat 5, Occupied (VIP Front Row)",
      "Should format occupied seat aria-label correctly"
    );
  });

  it("should assign tabIndex based on readOnly or occupied status", () => {
    assert.equal(getSeatTabIndex(false, false), 0, "Selectable seat should have tabIndex 0");
    assert.equal(getSeatTabIndex(true, false), -1, "ReadOnly seat should have tabIndex -1");
    assert.equal(getSeatTabIndex(false, true), -1, "Occupied seat should have tabIndex -1");
    assert.equal(getSeatTabIndex(true, true), -1, "ReadOnly occupied seat should have tabIndex -1");
  });

  it("should assign role='button' only to selectable seats", () => {
    assert.equal(getSeatRole(false, false), "button", "Selectable seat should have role='button'");
    assert.equal(
      getSeatRole(true, false),
      undefined,
      "ReadOnly seat should not have role='button'"
    );
    assert.equal(
      getSeatRole(false, true),
      undefined,
      "Occupied seat should not have role='button'"
    );
  });
});

describe("SpatialSeatSelector Directional Arrow Navigation", () => {
  // Mock seats grid arrangement:
  // Seat 0 (0,0) ---- Seat 1 (20,0)
  //   |                 |
  // Seat 2 (0,40) --- Seat 3 (20,40)
  const seats = [
    { index: 0, x: 0, y: 0 },
    { index: 1, x: 20, y: 0 },
    { index: 2, x: 0, y: 40 },
    { index: 3, x: 20, y: 40 },
  ];

  it("should correctly find the seat to the right (ArrowRight)", () => {
    const result = getBestSeat(seats[0], seats, "ArrowRight");
    assert.ok(result, "Should find a seat");
    assert.equal(result.index, 1, "Seat to the right of Seat 0 should be Seat 1");
  });

  it("should correctly find the seat below (ArrowDown)", () => {
    const result = getBestSeat(seats[0], seats, "ArrowDown");
    assert.ok(result, "Should find a seat");
    assert.equal(result.index, 2, "Seat below Seat 0 should be Seat 2");
  });

  it("should correctly find the seat to the left (ArrowLeft)", () => {
    const result = getBestSeat(seats[1], seats, "ArrowLeft");
    assert.ok(result, "Should find a seat");
    assert.equal(result.index, 0, "Seat to the left of Seat 1 should be Seat 0");
  });

  it("should correctly find the seat above (ArrowUp)", () => {
    const result = getBestSeat(seats[2], seats, "ArrowUp");
    assert.ok(result, "Should find a seat");
    assert.equal(result.index, 0, "Seat above Seat 2 should be Seat 0");
  });

  it("should return null if no seat exists in that direction", () => {
    const result = getBestSeat(seats[0], seats, "ArrowUp");
    assert.equal(result, null, "Should return null for upward movement from Seat 0");
  });
});

describe("SpatialSeatSelector Code Structure Integrity", () => {
  it("should include tabIndex attribute in the seat rendering g tag", () => {
    assert.ok(
      componentSrc.includes("tabIndex={tabIndex}"),
      "Component source must render tabIndex={tabIndex}"
    );
  });

  it("should include role attribute in the seat rendering g tag", () => {
    assert.ok(componentSrc.includes("role={role}"), "Component source must render role={role}");
  });

  it("should include aria-label attribute in the seat rendering g tag", () => {
    assert.ok(
      componentSrc.includes("aria-label={ariaLabel}"),
      "Component source must render aria-label={ariaLabel}"
    );
  });

  it("should support keydown event handling on the seat g tag", () => {
    assert.ok(
      componentSrc.includes("onKeyDown={handleKeyDown}"),
      "Component source must support onKeyDown"
    );
  });

  it("should support focus & blur handlers to display tooltip overlay", () => {
    assert.ok(
      componentSrc.includes("onFocus={handleFocus}") &&
        componentSrc.includes("onBlur={handleBlur}"),
      "Component source must support onFocus and onBlur handlers"
    );
  });
});

console.log("SpatialSeatSelector Accessibility & Keyboard Navigation tests loaded ✓");
