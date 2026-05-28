/**
 * Utility functions for virtualization calculations.
 * Used by EventCardSection to optimize rendering of large event listings.
 */

/**
 * Calculates responsive column count based on viewport width.
 * @param {boolean} isGrid - Whether the view mode is grid or list
 * @param {number} windowWidth - Width of the window in pixels
 * @returns {number} The number of columns
 */
export const getColumnsCount = (isGrid, windowWidth) => {
  if (!isGrid) return 1;
  if (windowWidth >= 768) return 3; // MD breakpoint in Tailwind
  return 1;
};

/**
 * Returns estimated row height per card row based on layout.
 * @param {boolean} isGrid - Whether the view mode is grid or list
 * @returns {number} Height in pixels
 */
export const getRowHeight = (isGrid) => {
  return isGrid ? 480 : 200;
};

/**
 * Core virtualization slice and padding calculator.
 * Monitors scroll bounds and slices visible array to avoid DOM bloating.
 * 
 * @param {Array} events - List of events to render
 * @param {number} scrollTop - Vertical scroll position of the window
 * @param {number} viewportHeight - Height of the visible area
 * @param {number} windowWidth - Width of the window
 * @param {number} columnsCount - Number of grid columns
 * @param {number} rowHeight - Estimated height of each row in pixels
 * @param {number} bufferCount - Number of rows to render outside visible bounds
 * @param {number} containerOffsetTop - Vertical offset of the list container from page top
 * @returns {Object} { renderedItems, topPadding, bottomPadding }
 */
export const calculateVirtualizationData = (
  events = [],
  scrollTop = 0,
  viewportHeight = 800,
  windowWidth = 1200,
  columnsCount = 1,
  rowHeight = 480,
  bufferCount = 1,
  containerOffsetTop = 0
) => {
  const totalItems = events.length;
  if (totalItems === 0) {
    return {
      renderedItems: [],
      topPadding: 0,
      bottomPadding: 0,
    };
  }

  // Relative scroll offset inside the virtualized listing container
  const relativeScrollY = Math.max(0, scrollTop - containerOffsetTop);

  // Row range selection calculations
  const totalRows = Math.ceil(totalItems / columnsCount);
  
  const startRow = Math.max(0, Math.min(totalRows - 1, Math.floor(relativeScrollY / rowHeight) - bufferCount));
  const endRow = Math.min(totalRows - 1, Math.floor((relativeScrollY + viewportHeight) / rowHeight) + bufferCount);

  const startIndex = startRow * columnsCount;
  const endIndex = Math.min(totalItems, (endRow + 1) * columnsCount);

  const renderedItems = events.slice(startIndex, endIndex).map((event, index) => ({
    event,
    originalIndex: startIndex + index,
  }));

  const topPadding = startRow * rowHeight;
  const bottomPadding = Math.max(0, (totalRows - 1 - endRow) * rowHeight);

  return {
    renderedItems,
    topPadding,
    bottomPadding,
  };
};
