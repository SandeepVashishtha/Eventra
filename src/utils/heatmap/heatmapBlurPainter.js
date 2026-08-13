/**
 * Gaussian Blur Canvas Heatmap Density Painter (#16273)
 */

export function drawHeatmapNode(ctx, x, y, radius = 20, intensity = 0.5) {
  if (!ctx) return;

  // Create a radial gradient for smooth Gaussian density dropoff
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(99, 102, 241, ${intensity})`);
  gradient.addColorStop(1, "rgba(99, 102, 241, 0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}
