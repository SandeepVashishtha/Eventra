export const checkCollision = (el1, el2) => {
  if (!el1 || !el2 || el1.id === el2.id) return false;
  
  // Validate that all coordinates and dimensions are finite numbers
  const coords1 = [el1.x, el1.y, el1.width, el1.height];
  const coords2 = [el2.x, el2.y, el2.width, el2.height];
  if (coords1.some(val => typeof val !== 'number' || !isFinite(val)) ||
      coords2.some(val => typeof val !== 'number' || !isFinite(val))) {
    return false;
  }

  const buffer = 4;
  return (
    el1.x < el2.x + el2.width - buffer &&
    el1.x + el1.width > el2.x + buffer &&
    el1.y < el2.y + el2.height - buffer &&
    el1.y + el1.height > el2.y + buffer
  );
};

export const getSeatPositions = (el) => {
  const positions = [];
  if (!el) return positions;

  // Validate seatsCount type and value, clamp to a maximum of 100 to prevent browser hangs
  const seatsCount = typeof el.seatsCount === 'number' && isFinite(el.seatsCount) ? el.seatsCount : 0;
  const count = Math.min(Math.max(0, Math.floor(seatsCount)), 100);
  if (count <= 0) return positions;

  // Validate width and height are finite positive numbers
  const width = typeof el.width === 'number' && isFinite(el.width) && el.width > 0 ? el.width : 100;
  const height = typeof el.height === 'number' && isFinite(el.height) && el.height > 0 ? el.height : 100;
  const rotation = typeof el.rotation === 'number' && isFinite(el.rotation) ? el.rotation : 0;

  const projOffset = 10;

  if (el.type === "round-table") {
    const radius = width / 2;
    const centerX = el.x + radius - projOffset;
    const centerY = el.y + radius - projOffset;
    const chairDistance = radius + 22;

    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count + (rotation * Math.PI) / 180;
      positions.push({
        x: centerX + chairDistance * Math.cos(angle),
        y: centerY + chairDistance * Math.sin(angle),
        index: i
      });
    }
  } else if (el.type === "rect-table") {
    const halfW = width / 2;
    const halfH = height / 2;

    const cX = el.x + halfW - projOffset;
    const cY = el.y + halfH - projOffset;

    const seatsPerSide = Math.ceil(count / 2);
    const spacingX = width / (seatsPerSide + 1);

    const rad = (rotation * Math.PI) / 180;

    const rotatePt = (px, py) => {
      const dx = px - cX;
      const dy = py - cY;
      return {
        x: cX + dx * Math.cos(rad) - dy * Math.sin(rad),
        y: cY + dx * Math.sin(rad) + dy * Math.cos(rad)
      };
    };

    for (let i = 0; i < count; i++) {
      const side = i < seatsPerSide ? "top" : "bottom";
      const sideIndex = i % seatsPerSide;
      const relativeX = spacingX * (sideIndex + 1) - halfW;

      let p;
      if (side === "top") {
        p = rotatePt(el.x - projOffset + halfW + relativeX, el.y - projOffset - 18);
      } else {
        p = rotatePt(el.x - projOffset + halfW + relativeX, el.y - projOffset + height + 18);
      }

      positions.push({ x: p.x, y: p.y, index: i });
    }
  }
  return positions;
};

