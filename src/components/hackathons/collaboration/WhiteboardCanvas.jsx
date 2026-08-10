import React, { useRef, useState, useEffect } from "react";
import { Pen, Square, Circle, Minus, Eraser, Trash2, Download, Palette } from "lucide-react";

const COLOR_PALETTE = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f43f5e", // Rose
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#000000", // Black
  "#ffffff", // White
];

export default function WhiteboardCanvas({
  incomingCanvasStroke,
  onCanvasStroke,
}) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const [activeTool, setActiveTool] = useState("pen");
  const [strokeColor, setStrokeColor] = useState("#6366f1");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [canvasSnapshot, setCanvasSnapshot] = useState(null);

  // Initialize canvas context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Set background to transparent / dark grid friendly
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }, []);

  // Handle incoming peer strokes
  useEffect(() => {
    if (!incomingCanvasStroke?.payload) return;
    const { tool, color, width, from, to, type } = incomingCanvasStroke.payload;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.strokeStyle = tool === "eraser" ? "#0f172a" : color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;

    if (type === "draw_line") {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (type === "draw_rect") {
      ctx.strokeRect(from.x, from.y, to.x - from.x, to.y - from.y);
    } else if (type === "draw_circle") {
      const radius = Math.hypot(to.x - from.x, to.y - from.y);
      ctx.beginPath();
      ctx.arc(from.x, from.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }, [incomingCanvasStroke]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    isDrawingRef.current = true;
    const coords = getCanvasCoords(e);
    startPosRef.current = coords;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    setCanvasSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current) return;
    const currentCoords = getCanvasCoords(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = activeTool === "eraser" ? "#0f172a" : strokeColor;
    ctx.lineWidth = activeTool === "eraser" ? strokeWidth * 3 : strokeWidth;
    ctx.lineCap = "round";

    if (activeTool === "pen" || activeTool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(startPosRef.current.x, startPosRef.current.y);
      ctx.lineTo(currentCoords.x, currentCoords.y);
      ctx.stroke();

      if (onCanvasStroke) {
        onCanvasStroke({
          type: "draw_line",
          tool: activeTool,
          color: strokeColor,
          width: strokeWidth,
          from: startPosRef.current,
          to: currentCoords,
        });
      }
      startPosRef.current = currentCoords;
    } else if (canvasSnapshot) {
      // Restore canvas snapshot for previewing shapes
      ctx.putImageData(canvasSnapshot, 0, 0);
      ctx.beginPath();
      if (activeTool === "rectangle") {
        ctx.strokeRect(
          startPosRef.current.x,
          startPosRef.current.y,
          currentCoords.x - startPosRef.current.x,
          currentCoords.y - startPosRef.current.y
        );
      } else if (activeTool === "circle") {
        const radius = Math.hypot(
          currentCoords.x - startPosRef.current.x,
          currentCoords.y - startPosRef.current.y
        );
        ctx.arc(startPosRef.current.x, startPosRef.current.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (activeTool === "line") {
        ctx.moveTo(startPosRef.current.x, startPosRef.current.y);
        ctx.lineTo(currentCoords.x, currentCoords.y);
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = (e) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const currentCoords = getCanvasCoords(e);

    if (activeTool !== "pen" && activeTool !== "eraser" && onCanvasStroke) {
      onCanvasStroke({
        type: `draw_${activeTool}`,
        tool: activeTool,
        color: strokeColor,
        width: strokeWidth,
        from: startPosRef.current,
        to: currentCoords,
      });
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleExportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "hackathon_whiteboard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-900 shadow-md overflow-hidden transition-all">
      {/* Whiteboard Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-800 bg-slate-950">
        {/* Tools */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {[
            { id: "pen", label: "Pen", icon: Pen },
            { id: "line", label: "Line", icon: Minus },
            { id: "rectangle", label: "Rectangle", icon: Square },
            { id: "circle", label: "Circle", icon: Circle },
            { id: "eraser", label: "Eraser", icon: Eraser },
          ].map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveTool(tool.id)}
                className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTool === tool.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
                title={tool.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-slate-400" />
          <div className="flex items-center gap-1">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setStrokeColor(color)}
                style={{ backgroundColor: color }}
                className={`w-5 h-5 rounded-full border border-slate-700 transition-transform ${
                  strokeColor === color ? "scale-125 ring-2 ring-indigo-500" : "hover:scale-110"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stroke Size Slider & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Size:</span>
            <input
              type="range"
              min="1"
              max="12"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-900/40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>

          <button
            type="button"
            onClick={handleExportImage}
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            Export PNG
          </button>
        </div>
      </div>

      {/* Interactive Drawing Canvas */}
      <div className="relative flex-1 bg-slate-950 cursor-crosshair min-h-[380px] overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
}
