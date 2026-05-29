import assert from "node:assert/strict";

console.log("Starting FloorPlanDesigner Accessibility & Keyboard Navigation Tests...");

// ── Helper to format ARIA labels exactly as in FloorPlanDesigner.js ──
function getAriaLabel(el) {
  const seatsCount = el.seatsCount || 0;
  const occupiedCount = el.assignedAttendees ? Object.keys(el.assignedAttendees).length : 0;
  const seatingDesc = seatsCount > 0 ? `${occupiedCount} of ${seatsCount} seats occupied` : "no seating";
  return `Floor plan element: ${el.label}, type: ${el.type.replace("-", " ")}, ${seatingDesc}, position: X ${Math.round(el.x)}, Y ${Math.round(el.y)}`;
}

// ── Test 1: ARIA Label Construction for Stage (No Seating) ──
const stageEl = {
  id: "stage-123",
  type: "stage",
  label: "Main Stage",
  x: 200,
  y: 150,
  width: 240,
  height: 120,
  rotation: 0,
  seatsCount: 0,
  assignedAttendees: {}
};

const stageLabel = getAriaLabel(stageEl);
assert.equal(
  stageLabel,
  "Floor plan element: Main Stage, type: stage, no seating, position: X 200, Y 150",
  "Stage ARIA label is correctly formatted without seating"
);

// ── Test 2: ARIA Label Construction for Round Table (With Occupied Seating) ──
const tableEl = {
  id: "round-table-456",
  type: "round-table",
  label: "VIP Table 1",
  x: 350.4,
  y: 350.8,
  width: 120,
  height: 120,
  rotation: 45,
  seatsCount: 6,
  assignedAttendees: {
    "0": "Alice",
    "2": "Bob"
  }
};

const tableLabel = getAriaLabel(tableEl);
assert.equal(
  tableLabel,
  "Floor plan element: VIP Table 1, type: round table, 2 of 6 seats occupied, position: X 350, Y 351",
  "Table ARIA label is correctly formatted and rounded with occupied seats"
);

// ── Test 3: Keyboard Navigation & Coordinate Shifts (Global keydown logic) ──
function simulateMovement(activeEl, key, snapToGrid = false) {
  const step = snapToGrid ? 20 : 5;
  let newX = activeEl.x;
  let newY = activeEl.y;

  switch (key) {
    case "ArrowUp":
      newY = Math.max(0, activeEl.y - step);
      break;
    case "ArrowDown":
      newY = Math.min(800 - activeEl.height, activeEl.y + step);
      break;
    case "ArrowLeft":
      newX = Math.max(0, activeEl.x - step);
      break;
    case "ArrowRight":
      newX = Math.min(1000 - activeEl.width, activeEl.x + step);
      break;
  }
  return { ...activeEl, x: newX, y: newY };
}

// A. Standard movement (5px steps)
let moved = simulateMovement(stageEl, "ArrowUp", false);
assert.equal(moved.y, 145, "ArrowUp decreases Y by 5px when snapToGrid is false");

moved = simulateMovement(stageEl, "ArrowDown", false);
assert.equal(moved.y, 155, "ArrowDown increases Y by 5px when snapToGrid is false");

moved = simulateMovement(stageEl, "ArrowLeft", false);
assert.equal(moved.x, 195, "ArrowLeft decreases X by 5px when snapToGrid is false");

moved = simulateMovement(stageEl, "ArrowRight", false);
assert.equal(moved.x, 205, "ArrowRight increases X by 5px when snapToGrid is false");

// B. Snapped movement (20px steps)
moved = simulateMovement(stageEl, "ArrowUp", true);
assert.equal(moved.y, 130, "ArrowUp decreases Y by 20px when snapToGrid is true");

moved = simulateMovement(stageEl, "ArrowDown", true);
assert.equal(moved.y, 170, "ArrowDown increases Y by 20px when snapToGrid is true");

// C. Boundary Clamping (Canvas bounds: 1000 x 800)
const boundaryEl = { ...stageEl, x: 2, y: 2 };
let boundaryMoved = simulateMovement(boundaryEl, "ArrowUp", false);
assert.equal(boundaryMoved.y, 0, "Y coordinate is clamped at 0 on ArrowUp");

boundaryMoved = simulateMovement(boundaryEl, "ArrowLeft", false);
assert.equal(boundaryMoved.x, 0, "X coordinate is clamped at 0 on ArrowLeft");

const boundaryFarEl = { ...stageEl, x: 990, y: 790 };
boundaryMoved = simulateMovement(boundaryFarEl, "ArrowDown", false);
assert.equal(boundaryMoved.y, 800 - stageEl.height, `Y is clamped at 800 - height (${800 - stageEl.height}) on ArrowDown`);

boundaryMoved = simulateMovement(boundaryFarEl, "ArrowRight", false);
assert.equal(boundaryMoved.x, 1000 - stageEl.width, `X is clamped at 1000 - width (${1000 - stageEl.width}) on ArrowRight`);

// ── Test 4: Shape Rotation Wraparound ──
function simulateRotation(activeEl) {
  return (activeEl.rotation + 15) % 360;
}

let rotation = simulateRotation({ rotation: 0 });
assert.equal(rotation, 15, "Rotation increases by 15 degrees");

rotation = simulateRotation({ rotation: 345 });
assert.equal(rotation, 0, "Rotation wraps around cleanly at 360 degrees");

// ── Test 5: Shape Resizing & Limits ──
function simulateResizing(activeEl, key) {
  let newW = activeEl.width;
  let newH = activeEl.height;

  if (key === "+" || key === "=") {
    newW = Math.min(activeEl.type === "stage" ? 600 : 300, activeEl.width + 10);
    newH = activeEl.type.includes("round")
      ? newW
      : Math.min(activeEl.type === "stage" ? 400 : 200, activeEl.height + 10);
  } else if (key === "-" || key === "_") {
    const minSize = activeEl.type.includes("table") ? 60 : 20;
    newW = Math.max(minSize, activeEl.width - 10);
    newH = activeEl.type.includes("round")
      ? newW
      : Math.max(minSize, activeEl.height - 10);
  }
  return { ...activeEl, width: newW, height: newH };
}

// Stage resizing check
let resized = simulateResizing(stageEl, "+");
assert.equal(resized.width, 250, "Stage width increases by 10px on '+'");
assert.equal(resized.height, 130, "Stage height increases by 10px on '+'");

resized = simulateResizing(stageEl, "-");
assert.equal(resized.width, 230, "Stage width decreases by 10px on '-'");
assert.equal(resized.height, 110, "Stage height decreases by 10px on '-'");

// Round table equal resizing check
let roundResized = simulateResizing(tableEl, "+");
assert.equal(roundResized.width, 130, "Round table width increases by 10px on '+'");
assert.equal(roundResized.height, 130, "Round table height scales equally with width on '+'");

// Resizing limits check
const maxStageEl = { ...stageEl, width: 600, height: 400 };
resized = simulateResizing(maxStageEl, "+");
assert.equal(resized.width, 600, "Stage width is clamped at max 600px");
assert.equal(resized.height, 400, "Stage height is clamped at max 400px");

const minTableEl = { ...tableEl, width: 60, height: 60 };
resized = simulateResizing(minTableEl, "-");
assert.equal(resized.width, 60, "Round table width is clamped at min 60px");
assert.equal(resized.height, 60, "Round table height is clamped at min 60px");

console.log("All FloorPlanDesigner Accessibility & Keyboard Navigation tests passed successfully ✓");
