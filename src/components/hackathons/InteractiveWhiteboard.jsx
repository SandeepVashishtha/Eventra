import { useState, useEffect, useRef, useCallback } from "react";
import {
  Square,
  Circle,
  PenTool,
  RotateCcw,
  Trash2,
  Plus,
  Move,
  Check,
  Palette,
  HelpCircle,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

const COLORS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Pink", value: "#ec4899" },
  { name: "Emerald", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "White", value: "#ffffff" },
];

const BRUSH_SIZES = [2, 4, 8, 12];

const InteractiveWhiteboard = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Tools & Settings
  const [tool, setTool] = useState("pen"); // 'pen' | 'rect' | 'circle' | 'sticky'
  const [color, setColor] = useState("#6366f1");
  const [size, setSize] = useState(4);
  const [isSolid, setIsSolid] = useState(false);

  // Drawing History & Sticky Notes State
  const [elements, setElements] = useState([]); // array of paths and shapes
  const [stickies, setStickies] = useState([
    {
      id: 1,
      x: 80,
      y: 100,
      text: "Idea: AI-driven scheduler for hackathons! 🚀",
      color: "#6366f1",
    },
    { id: 2, x: 320, y: 150, text: "Stack: React + Tailwind + SSE fallback", color: "#10b981" },
  ]);

  // Temporary drag-drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState(null);

  // Dragging Sticky Note state
  const [draggingSticky, setDraggingSticky] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Main Canvas Rendering Engine
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawEl = (el) => {
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (el.type === "path" && el.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      } else if (el.type === "shape") {
        if (el.shapeType === "rect") {
          ctx.beginPath();
          if (el.isSolid) {
            ctx.fillRect(el.x, el.y, el.width, el.height);
          } else {
            ctx.strokeRect(el.x, el.y, el.width, el.height);
          }
        } else if (el.shapeType === "circle") {
          ctx.beginPath();
          const rx = el.width / 2;
          const ry = el.height / 2;
          const cx = el.x + rx;
          const cy = el.y + ry;
          ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
          if (el.isSolid) {
            ctx.fill();
          } else {
            ctx.stroke();
          }
        }
      }
    };

    // Draw all archived historical elements
    elements.forEach(drawEl);

    // Draw current drag-in-progress element
    if (currentElement) {
      drawEl(currentElement);
    }
  }, [elements, currentElement]);

  // Redraw whenever history or current element updates
  useEffect(() => {
    drawCanvas();
  }, [elements, currentElement, drawCanvas]);

  // Adjust canvas pixel dimensions to match container sizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = Math.max(rect.height, 450);
      drawCanvas();
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial trigger

    return () => window.removeEventListener("resize", handleResize);
  }, [drawCanvas]);

  // Sticky Notes Drag-and-Drop Handlers
  const handleStickyDragStart = (e, stickyId) => {
    e.stopPropagation();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const sticky = stickies.find((s) => s.id === stickyId);
    if (!sticky) return;

    setDraggingSticky(stickyId);
    setDragOffset({
      x: clientX - sticky.x,
      y: clientY - sticky.y,
    });
  };

  const handleStickyDragMove = (e) => {
    if (draggingSticky === null) return;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    setStickies((prev) =>
      prev.map((s) => {
        if (s.id === draggingSticky) {
          const bounds = canvasRef.current.getBoundingClientRect();
          let newX = clientX - dragOffset.x;
          let newY = clientY - dragOffset.y;

          // Keep inside canvas bounds
          newX = Math.max(10, Math.min(bounds.width - 150, newX));
          newY = Math.max(10, Math.min(bounds.height - 150, newY));

          return { ...s, x: newX, y: newY };
        }
        return s;
      })
    );
  };

  const handleStickyDragEnd = () => {
    setDraggingSticky(null);
  };

  // Sticky Content updates
  const handleStickyTextChange = (id, newText) => {
    setStickies(stickies.map((s) => (s.id === id ? { ...s, text: newText } : s)));
  };

  const handleDeleteSticky = (id) => {
    setStickies(stickies.filter((s) => s.id !== id));
    toast.info("Sticky note removed.");
  };

  // History controls
  const handleUndo = () => {
    if (elements.length === 0) {
      toast.warn("Nothing left to undo!");
      return;
    }
    setElements(elements.slice(0, -1));
  };

  const handleClear = () => {
    setElements([]);
    setStickies([]);
    toast.info("Canvas cleared successfully.");
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleMouseDown = useCallback(
    (e) => {
      if (tool === "sticky") return;
      e.stopPropagation();
      const coords = getCanvasCoords(e);
      if (tool === "pen") {
        setCurrentElement({
          type: "path",
          color,
          size,
          isSolid,
          points: [{ x: coords.x, y: coords.y }],
        });
      } else {
        setCurrentElement({
          type: "shape",
          shapeType: tool,
          color,
          size,
          isSolid,
          x: coords.x,
          y: coords.y,
          width: 0,
          height: 0,
        });
      }
      setIsDrawing(true);
    },
    [tool, color, size, isSolid]
  );

  // Drawing move handler
  const handleMouseMove = useCallback(
    (e) => {
      if (tool === "sticky") return;
      if (!isDrawing) return;
      e.stopPropagation();
      const coords = getCanvasCoords(e);

      setCurrentElement((prev) => {
        if (!prev) return prev;
        if (prev.type === "path") {
          return {
            ...prev,
            points: [...prev.points, { x: coords.x, y: coords.y }],
          };
        }

        // shape
        return {
          ...prev,
          width: coords.x - prev.x,
          height: coords.y - prev.y,
        };
      });
    },
    [tool, isDrawing]
  );

  // Finalize drawing on mouse up / touch end / mouse leave
  const handleMouseUp = useCallback(
    (e) => {
      if (tool === "sticky") return;
      if (!isDrawing) return;
      if (e && typeof e.stopPropagation === "function") {
        e.stopPropagation();
      }

      setCurrentElement((prev) => {
        if (prev) {
          setElements((els) => [...els, prev]);
        }
        return null;
      });

      setIsDrawing(false);
    },
    [tool, isDrawing]
  );

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl select-none"
      onMouseMove={handleStickyDragMove}
      onTouchMove={handleStickyDragMove}
      onMouseUp={handleStickyDragEnd}
      onTouchEnd={handleStickyDragEnd}
      ref={containerRef}
    >
      {/* Premium Toolbar Header */}
      <div className="z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-3 backdrop-blur-md">
        {/* Tool Selectors */}
        <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1">
          <button
            onClick={() => setTool("pen")}
            className={`rounded-lg p-2 transition-all ${
              tool === "pen"
                ? "bg-indigo-600 font-bold text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
            title="Pen Sketch Tool"
          >
            <PenTool size={16} />
          </button>

          <button
            onClick={() => setTool("rect")}
            className={`rounded-lg p-2 transition-all ${
              tool === "rect"
                ? "bg-indigo-600 font-bold text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
            title="Rectangle Tool"
          >
            <Square size={16} />
          </button>

          <button
            onClick={() => setTool("circle")}
            className={`rounded-lg p-2 transition-all ${
              tool === "circle"
                ? "bg-indigo-600 font-bold text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
            title="Circle Tool"
          >
            <Circle size={16} />
          </button>

          <button
            onClick={() => setTool("sticky")}
            className={`flex items-center gap-1 rounded-lg p-2.5 text-xs font-bold tracking-wider uppercase transition-all ${
              tool === "sticky"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
            title="Place Sticky Note"
          >
            <Plus size={14} />
            <span>Sticky</span>
          </button>
        </div>

        {/* Color Palette Selector */}
        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5">
          <Palette size={14} className="text-slate-400" />
          <div className="flex items-center gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c.value)}
                className={`h-4 w-4 rounded-full border transition-all ${
                  color === c.value
                    ? "scale-125 border-white ring-2 ring-indigo-500/50"
                    : "border-slate-800 hover:scale-110"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Size Slider & Shapes Fill Toggle */}
        <div className="flex shrink-0 items-center gap-4">
          {/* Thickness presets */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
            {BRUSH_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-black transition-all ${
                  size === s
                    ? "bg-slate-800 text-white"
                    : "text-slate-500 hover:bg-slate-900 hover:text-white"
                }`}
                title={`Brush size: ${s}px`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Solid fill for shapes */}
          {(tool === "rect" || tool === "circle") && (
            <button
              onClick={() => setIsSolid(!isSolid)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold tracking-wider transition-all ${
                isSolid
                  ? "bg-indigo-650/20 border-indigo-500/40 font-bold text-indigo-400"
                  : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
              }`}
            >
              <Check size={12} className={isSolid ? "opacity-100" : "opacity-30"} />
              <span>Solid Fill</span>
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={handleUndo}
            className="rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-400 transition-all hover:bg-slate-900 hover:text-white"
            title="Undo Last Drawing"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={handleClear}
            className="rounded-xl border border-red-500/10 bg-red-950/20 p-2 text-red-400 transition-all hover:border-red-500/30 hover:bg-red-950/50"
            title="Clear Workspace"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Drawing Arena Area */}
      <div
        className="relative min-h-[450px] flex-1 cursor-crosshair overflow-hidden bg-[#090a0f]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onTouchCancel={handleMouseUp}
      >
        {/* HTML5 Canvas Element */}
        <canvas ref={canvasRef} className="absolute inset-0 block bg-[#090a0f]" />

        {/* Sticky Notes Layer */}
        {stickies.map((sticky) => (
          <div
            key={sticky.id}
            className="absolute z-20 flex min-h-36 w-44 flex-col overflow-hidden rounded-xl border shadow-xl"
            style={{
              left: `${sticky.x}px`,
              top: `${sticky.y}px`,
              borderColor: `${sticky.color}40`,
              backgroundColor: "#0d0f18",
            }}
          >
            {/* Grab Handle Header */}
            <div
              onMouseDown={(e) => handleStickyDragStart(e, sticky.id)}
              onTouchStart={(e) => handleStickyDragStart(e, sticky.id)}
              className="hover:text-slate-350 flex cursor-grab items-center justify-between border-b border-slate-800/80 bg-slate-900 px-2.5 py-1.5 text-slate-500 transition-colors active:cursor-grabbing"
            >
              <Move size={12} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSticky(sticky.id);
                }}
                className="cursor-pointer rounded border-none bg-transparent p-0.5 text-gray-500 transition-colors hover:text-red-400"
              >
                <X size={10} />
              </button>
            </div>

            {/* Note Textarea Container */}
            <div className="flex-1 bg-gradient-to-b from-[#0e101a] to-[#0a0c12] p-2">
              <textarea
                className="h-full min-h-[80px] w-full cursor-text resize-none border-none bg-transparent p-1 text-xs leading-relaxed font-medium text-gray-200 outline-none select-text"
                value={sticky.text}
                onChange={(e) => handleStickyTextChange(sticky.id, e.target.value)}
                placeholder="Write your idea here..."
              />
            </div>

            {/* Accent Footer */}
            <div className="h-1" style={{ backgroundColor: sticky.color }} />
          </div>
        ))}

        {/* Floating Help Instructions */}
        {elements.length === 0 && stickies.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center space-y-3 p-6 text-center text-slate-500 select-none">
            <HelpCircle size={36} className="text-slate-600" />
            <div>
              <div className="text-sm font-bold text-slate-400">
                Collaborative Whiteboard Canvas
              </div>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-600">
                Sketch flows using the pen tool, draw diagrams with rectangles/circles, or place
                floating Sticky Notes. Click and drag sticky headers to reorganize.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveWhiteboard;
