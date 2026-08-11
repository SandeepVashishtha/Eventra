/**
 * Floor Plan Geometry & Collision Detection Utility
 */

export function calculateDistance(ptA, ptB) {
  return Math.hypot(ptB.x - ptA.x, ptB.y - ptA.y);
}

export function checkBoundsCollision(rectA, rectB, minClearanceMeters = 1.5) {
  const clearancePx = minClearanceMeters * 20; // 20px per meter grid ratio

  return !(
    rectA.x + rectA.width + clearancePx < rectB.x ||
    rectA.x > rectB.x + rectB.width + clearancePx ||
    rectA.y + rectA.height + clearancePx < rectB.y ||
    rectA.y > rectB.y + rectB.height + clearancePx
  );
}

export function detectExitObstructions(tables = [], exits = [], minClearanceMeters = 1.5) {
  const warnings = [];

  tables.forEach((table) => {
    exits.forEach((exit) => {
      const dist = calculateDistance(
        { x: table.x + (table.width || 40) / 2, y: table.y + (table.height || 40) / 2 },
        { x: exit.x, y: exit.y }
      );

      if (dist < minClearanceMeters * 30) {
        warnings.push({
          tableId: table.id,
          tableName: table.name || `Table ${table.id}`,
          exitName: exit.name || "Emergency Exit",
          distanceMeters: (dist / 30).toFixed(1),
        });
      }
    });
  });

  return warnings;
}
