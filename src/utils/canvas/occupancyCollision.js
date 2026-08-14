/**
 * occupancyCollision.js
 * Canvas-based collision detection and spatial analysis utilities for venue occupancy planning.
 * Provides real-time collision checking, safety zone calculations, and capacity validation.
 */

/**
 * Default safety distances in pixels (can be converted to real-world units)
 * @type {Object}
 */
const DEFAULT_SAFETY_DISTANCES = {
  aisle: 120,           // Minimum aisle width for safe passage
  emergencyExit: 200,   // Clearance required around emergency exits
  tableSpacing: 60,      // Minimum space between tables
  fireSafety: 150,       // Fire safety buffer zone
  accessibility: 180,   // ADA compliance spacing
};

/**
 * Table configurations with dimensions
 * @type {Object}
 */
const TABLE_CONFIGS = {
  round: { width: 120, height: 120, capacity: 8, radius: 60 },
  rectangular: { width: 180, height: 80, capacity: 6, radius: 0 },
  square: { width: 100, height: 100, capacity: 4, radius: 50 },
  booth: { width: 200, height: 120, capacity: 10, radius: 0 },
};

/**
 * Check if two rectangles are colliding
 * @param {Object} rect1 - First rectangle {x, y, width, height}
 * @param {Object} rect2 - Second rectangle {x, y, width, height}
 * @returns {boolean} True if rectangles are colliding
 */
export const checkRectCollision = (rect1, rect2) => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
};

/**
 * Check if a point is inside a rectangle
 * @param {number} px - Point x coordinate
 * @param {number} py - Point y coordinate
 * @param {Object} rect - Rectangle {x, y, width, height}
 * @returns {boolean} True if point is inside rectangle
 */
export const pointInRect = (px, py, rect) => {
  return (
    px >= rect.x &&
    px <= rect.x + rect.width &&
    py >= rect.y &&
    py <= rect.y + rect.height
  );
};

/**
 * Check if two circles are colliding
 * @param {Object} circle1 - First circle {x, y, radius}
 * @param {Object} circle2 - Second circle {x, y, radius}
 * @returns {boolean} True if circles are colliding
 */
export const checkCircleCollision = (circle1, circle2) => {
  const dx = circle1.x - circle2.x;
  const dy = circle1.y - circle2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < circle1.radius + circle2.radius;
};

/**
 * Check collision between a rectangle and a circle
 * @param {Object} rect - Rectangle {x, y, width, height}
 * @param {Object} circle - Circle {x, y, radius}
 * @returns {boolean} True if rectangle and circle are colliding
 */
export const checkRectCircleCollision = (rect, circle) => {
  // Find the closest point on rectangle to circle center
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

  // Calculate distance from closest point to circle center
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;

  return dx * dx + dy * dy < circle.radius * circle.radius;
};

/**
 * Check if an object can be placed at a given position without collisions
 * @param {Object} newObj - Object to place {x, y, width, height, type, shape}
 * @param {Array} existingObjects - Array of existing objects
 * @param {number} [minSpacing=60] - Minimum required spacing
 * @returns {Object} { canPlace: boolean, collisions: Array, distance: number }
 */
export const canPlaceObject = (newObj, existingObjects, minSpacing = 60) => {
  const collisions = [];
  let minDistance = Infinity;

  for (const obj of existingObjects) {
    // Skip self
    if (obj.id === newObj.id) continue;

    // Calculate expanded bounds with spacing
    const spacing = obj.minSpacing || minSpacing;
    const objBounds = {
      x: obj.x - spacing / 2,
      y: obj.y - spacing / 2,
      width: obj.width + spacing,
      height: obj.height + spacing,
    };

    const newBounds = {
      x: newObj.x - spacing / 2,
      y: newObj.y - spacing / 2,
      width: newObj.width + spacing,
      height: newObj.height + spacing,
    };

    const isColliding = checkRectCollision(objBounds, newBounds);

    if (isColliding) {
      collisions.push({
        id: obj.id,
        type: obj.type,
        distance: calculateDistance(newObj, obj),
      });
    }

    // Track minimum distance to any object
    const distance = calculateDistance(newObj, obj);
    minDistance = Math.min(minDistance, distance);
  }

  return {
    canPlace: collisions.length === 0,
    collisions,
    minDistance,
  };
};

/**
 * Calculate distance between two objects (center to center)
 * @param {Object} obj1 - First object with x, y coordinates
 * @param {Object} obj2 - Second object with x, y coordinates
 * @returns {number} Distance in pixels
 */
export const calculateDistance = (obj1, obj2) => {
  const dx = obj1.x - obj2.x;
  const dy = obj1.y - obj2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Find valid placement position near a desired location
 * @param {Object} obj - Object to place
 * @param {Array} existingObjects - Existing objects on canvas
 * @param {Object} desiredPos - Desired position {x, y}
 * @param {number} [searchRadius=200] - Radius to search for valid position
 * @param {number} [minSpacing=60] - Minimum spacing requirement
 * @returns {Object|null} Valid position or null if none found
 */
export const findValidPlacement = (obj, existingObjects, desiredPos, searchRadius = 200, minSpacing = 60) => {
  // Try the desired position first
  const testAtDesired = canPlaceObject(
    { ...obj, x: desiredPos.x, y: desiredPos.y },
    existingObjects,
    minSpacing
  );
  if (testAtDesired.canPlace) {
    return { x: desiredPos.x, y: desiredPos.y };
  }

  // Try positions in a spiral pattern around the desired position
  for (let r = minSpacing; r <= searchRadius; r += minSpacing) {
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const x = desiredPos.x + Math.cos(angle) * r;
      const y = desiredPos.y + Math.sin(angle) * r;

      const test = canPlaceObject(
        { ...obj, x, y },
        existingObjects,
        minSpacing
      );

      if (test.canPlace) {
        return { x, y };
      }
    }
  }

  return null; // No valid position found
};

/**
 * Check if an object is within a safety zone
 * @param {Object} obj - Object to check {x, y, width, height}
 * @param {Array} safetyZones - Array of safety zones {x, y, width, height, type}
 * @returns {Array} Array of violated safety zones
 */
export const checkSafetyZones = (obj, safetyZones) => {
  const violations = [];

  for (const zone of safetyZones) {
    const expandedZone = {
      x: zone.x - zone.buffer,
      y: zone.y - zone.buffer,
      width: zone.width + zone.buffer * 2,
      height: zone.height + zone.buffer * 2,
    };

    if (checkRectCollision(obj, expandedZone)) {
      violations.push({
        zoneId: zone.id,
        zoneType: zone.type,
        requiredBuffer: zone.buffer,
        distance: calculateZoneDistance(obj, zone),
      });
    }
  }

  return violations;
};

/**
 * Calculate distance from object to safety zone boundary
 * @param {Object} obj - Object to check
 * @param {Object} zone - Safety zone
 * @returns {number} Distance to zone boundary
 */
export const calculateZoneDistance = (obj, zone) => {
  const objCenter = {
    x: obj.x + obj.width / 2,
    y: obj.y + obj.height / 2,
  };

  const zoneCenter = {
    x: zone.x + zone.width / 2,
    y: zone.y + zone.height / 2,
  };

  const dx = objCenter.x - zoneCenter.x;
  const dy = objCenter.y - zoneCenter.y;

  // Distance from object center to zone center
  const centerDistance = Math.sqrt(dx * dx + dy * dy);

  // Minimum distance considering object and zone sizes
  const minDistance = centerDistance - 
    (obj.width + zone.width) / 2 - 
    (obj.height + zone.height) / 2;

  return Math.max(0, minDistance);
};

/**
 * Calculate total capacity based on placed objects
 * @param {Array} placedObjects - Array of placed objects with capacity
 * @returns {number} Total capacity
 */
export const calculateTotalCapacity = (placedObjects) => {
  return placedObjects.reduce((total, obj) => {
    const config = TABLE_CONFIGS[obj.tableType] || TABLE_CONFIGS.rectangular;
    return total + (obj.capacityOverride || config.capacity);
  }, 0);
};

/**
 * Calculate occupancy percentage
 * @param {number} currentCount - Current number of occupants
 * @param {number} maxCapacity - Maximum capacity
 * @returns {number} Percentage (0-100)
 */
export const calculateOccupancyPercentage = (currentCount, maxCapacity) => {
  if (maxCapacity === 0) return 0;
  return Math.min(100, Math.round((currentCount / maxCapacity) * 100));
};

/**
 * Check if layout meets safety compliance
 * @param {Array} placedObjects - Placed objects
 * @param {Array} safetyZones - Safety zones
 * @param {number} maxCapacity - Maximum allowed capacity
 * @param {number} [minSpacing=60] - Minimum spacing requirement
 * @returns {Object} Compliance status with details
 */
export const checkSafetyCompliance = (placedObjects, safetyZones, maxCapacity, minSpacing = 60) => {
  const issues = [];
  let totalCapacity = 0;

  // Check object collisions
  for (let i = 0; i < placedObjects.length; i++) {
    for (let j = i + 1; j < placedObjects.length; j++) {
      const obj1 = placedObjects[i];
      const obj2 = placedObjects[j];

      const result = canPlaceObject(obj1, [obj2], minSpacing);
      if (!result.canPlace) {
        issues.push({
          type: 'collision',
          severity: 'high',
          message: `Objects ${obj1.id} and ${obj2.id} are too close`,
          distance: result.minDistance,
          required: minSpacing,
        });
      }
    }

    // Check safety zones
    const zoneViolations = checkSafetyZones(placedObjects[i], safetyZones);
    zoneViolations.forEach(violation => {
      issues.push({
        type: 'safety_zone',
        severity: 'critical',
        message: `Object ${placedObjects[i].id} violates ${violation.zoneType} safety zone`,
        zoneType: violation.zoneType,
        distance: violation.distance,
      });
    });

    // Calculate capacity
    const config = TABLE_CONFIGS[placedObjects[i].tableType] || TABLE_CONFIGS.rectangular;
    totalCapacity += placedObjects[i].capacityOverride || config.capacity;
  }

  // Check capacity limit
  if (totalCapacity > maxCapacity) {
    issues.push({
      type: 'capacity',
      severity: 'high',
      message: `Total capacity ${totalCapacity} exceeds maximum ${maxCapacity}`,
      current: totalCapacity,
      maximum: maxCapacity,
    });
  }

  return {
    isCompliant: issues.length === 0,
    issues,
    totalCapacity,
    collisionCount: issues.filter(i => i.type === 'collision').length,
    safetyZoneViolations: issues.filter(i => i.type === 'safety_zone').length,
    capacityExceeded: totalCapacity > maxCapacity,
  };
};

/**
 * Get aisle pathways from placed objects
 * @param {Array} placedObjects - Placed objects
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @returns {Array} Array of aisle pathways
 */
export const generateAislePathways = (placedObjects, canvasWidth, canvasHeight) => {
  const pathways = [];

  if (placedObjects.length === 0) {
    return [
      { x: 0, y: 0, width: canvasWidth, height: canvasHeight, type: 'main' },
    ];
  }

  // Find gaps between objects that can serve as aisles
  // Sort objects by position
  const sortedByX = [...placedObjects].sort((a, b) => a.x - b.x);
  const sortedByY = [...placedObjects].sort((a, b) => a.y - b.y);

  // Check horizontal gaps
  for (let i = 1; i < sortedByX.length; i++) {
    const obj1 = sortedByX[i - 1];
    const obj2 = sortedByX[i];

    const gap = obj2.x - (obj1.x + obj1.width);
    if (gap > DEFAULT_SAFETY_DISTANCES.aisle) {
      // This gap can be an aisle
      pathways.push({
        x: obj1.x + obj1.width,
        y: Math.min(obj1.y, obj2.y),
        width: gap,
        height: Math.max(obj1.height, obj2.height),
        type: 'horizontal',
        isValid: true,
      });
    } else {
      pathways.push({
        x: obj1.x + obj1.width,
        y: Math.min(obj1.y, obj2.y),
        width: gap,
        height: Math.max(obj1.height, obj2.height),
        type: 'horizontal',
        isValid: false,
      });
    }
  }

  // Check vertical gaps
  for (let i = 1; i < sortedByY.length; i++) {
    const obj1 = sortedByY[i - 1];
    const obj2 = sortedByY[i];

    const gap = obj2.y - (obj1.y + obj1.height);
    if (gap > DEFAULT_SAFETY_DISTANCES.aisle) {
      pathways.push({
        x: Math.min(obj1.x, obj2.x),
        y: obj1.y + obj1.height,
        width: Math.max(obj1.width, obj2.width),
        height: gap,
        type: 'vertical',
        isValid: true,
      });
    } else {
      pathways.push({
        x: Math.min(obj1.x, obj2.x),
        y: obj1.y + obj1.height,
        width: Math.max(obj1.width, obj2.width),
        height: gap,
        type: 'vertical',
        isValid: false,
      });
    }
  }

  return pathways;
};

/**
 * Get default safety distances
 * @returns {Object} Default safety distances
 */
export const getDefaultSafetyDistances = () => {
  return { ...DEFAULT_SAFETY_DISTANCES };
};

/**
 * Get table configuration by type
 * @param {string} type - Table type
 * @returns {Object} Table configuration
 */
export const getTableConfig = (type) => {
  return TABLE_CONFIGS[type] || TABLE_CONFIGS.rectangular;
};

/**
 * Get all table types
 * @returns {Array} Array of table type names
 */
export const getTableTypes = () => {
  return Object.keys(TABLE_CONFIGS);
};

/**
 * Create a safety zone
 * @param {string} type - Zone type (aisle, emergencyExit, fireSafety, accessibility)
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Width
 * @param {number} height - Height
 * @param {string} [id] - Optional ID
 * @returns {Object} Safety zone object
 */
export const createSafetyZone = (type, x, y, width, height, id) => {
  const buffer = DEFAULT_SAFETY_DISTANCES[type] || DEFAULT_SAFETY_DISTANCES.aisle;
  return {
    id: id || `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    x,
    y,
    width,
    height,
    buffer,
  };
};

/**
 * Create a table/furniture object
 * @param {string} type - Object type
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} [tableType='rectangular'] - Table shape type
 * @param {number} [capacityOverride] - Custom capacity
 * @param {string} [id] - Optional ID
 * @returns {Object} Table/furniture object
 */
export const createTableObject = (type, x, y, tableType = 'rectangular', capacityOverride, id) => {
  const config = TABLE_CONFIGS[tableType] || TABLE_CONFIGS.rectangular;
  return {
    id: id || `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    tableType,
    x,
    y,
    width: config.width,
    height: config.height,
    capacity: capacityOverride || config.capacity,
    capacityOverride,
    minSpacing: DEFAULT_SAFETY_DISTANCES.tableSpacing,
    color: getTableColor(tableType),
  };
};

/**
 * Get color for table type
 * @param {string} type - Table type
 * @returns {string} Color hex code
 */
const getTableColor = (type) => {
  const colors = {
    round: '#3B82F6',
    rectangular: '#10B981',
    square: '#8B5CF6',
    booth: '#F59E0B',
  };
  return colors[type] || '#6B7280';
};

export default {
  checkRectCollision,
  pointInRect,
  checkCircleCollision,
  checkRectCircleCollision,
  canPlaceObject,
  calculateDistance,
  findValidPlacement,
  checkSafetyZones,
  calculateZoneDistance,
  calculateTotalCapacity,
  calculateOccupancyPercentage,
  checkSafetyCompliance,
  generateAislePathways,
  getDefaultSafetyDistances,
  getTableConfig,
  getTableTypes,
  createSafetyZone,
  createTableObject,
  DEFAULT_SAFETY_DISTANCES,
  TABLE_CONFIGS,
};
