/**
 * Normalizes absolute layout coordinates to viewBox percentage ranges (#16542)
 */

export function scaleSvgCoordinates(x, y, width, height, viewBoxWidth = 1000, viewBoxHeight = 1000) {
  if (width === 0 || height === 0) return { x: 0, y: 0 };
  
  // Calculate exact normalized coordinates relative to unified viewBox bounds
  const scaledX = (x / width) * viewBoxWidth;
  const scaledY = (y / height) * viewBoxHeight;

  return {
    x: Math.round(scaledX),
    y: Math.round(scaledY)
  };
}
