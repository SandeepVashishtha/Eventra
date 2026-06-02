export const checkCollision = (el1, el2) => {
  if (!el1 || !el2 || el1.id === el2.id) return false;
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
  const count = el.seatsCount;
  if (count <= 0) return positions;

  const projOffset = 10;

  if (el.type === "round-table") {
    const radius = el.width / 2;
    const centerX = el.x + radius - projOffset;
    const centerY = el.y + radius - projOffset;
    const chairDistance = radius + 22;

    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count + (el.rotation * Math.PI) / 180;
      positions.push({
        x: centerX + chairDistance * Math.cos(angle),
        y: centerY + chairDistance * Math.sin(angle),
        index: i
      });
    }
  } else if (el.type === "rect-table") {
    const width = el.width;
    const height = el.height;
    const halfW = width / 2;
    const halfH = height / 2;

    const cX = el.x + halfW - projOffset;
    const cY = el.y + halfH - projOffset;

    const seatsPerSide = Math.ceil(count / 2);
    const spacingX = width / (seatsPerSide + 1);

    const rad = (el.rotation * Math.PI) / 180;

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
