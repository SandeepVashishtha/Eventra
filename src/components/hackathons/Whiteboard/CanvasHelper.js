export function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  
  // Set real dimensions based on parent container size
  canvas.width = rect.width * 2; // High-DPI support
  canvas.height = (rect.width * 0.5625) * 2; // 16:9 ratio
  
  canvas.style.width = "100%";
  canvas.style.height = "auto";

  const context = canvas.getContext("2d");
  context.scale(2, 2);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "#4f46e5";
  context.lineWidth = 5;
  
  // Draw base white background so downloaded file isn't transparent
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  return context;
}

export function drawPath(context, path, options = {}) {
  if (!path || path.length < 2) return;
  
  context.save();
  context.strokeStyle = options.color || "#4f46e5";
  context.lineWidth = options.brushSize || 5;
  context.lineCap = "round";
  context.lineJoin = "round";
  
  context.beginPath();
  context.moveTo(path[0].x, path[0].y);
  
  for (let i = 1; i < path.length; i++) {
    context.lineTo(path[i].x, path[i].y);
  }
  
  context.stroke();
  context.restore();
}
