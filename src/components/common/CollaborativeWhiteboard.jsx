import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Pencil, 
  Minus, 
  Square, 
  Circle as CircleIcon, 
  Type, 
  Trash2, 
  Download, 
  Users, 
  Sparkles
} from "lucide-react";
import { toast } from "react-toastify";

// DB Configuration for Whiteboard State Cache
const DB_NAME = "eventra_whiteboard_db";
const STORE_NAME = "canvas_state";
const DB_VERSION = 1;

const COLORS = [
  { value: "#4f46e5", label: "Indigo" },
  { value: "#10b981", label: "Emerald" },
  { value: "#f43f5e", label: "Rose" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#f8fafc", label: "White/Slate" }
];

export default function CollaborativeWhiteboard() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const bcRef = useRef(null);
  const dbRef = useRef(null);

  // Tool states
  const [tool, setTool] = useState("pencil"); // pencil, line, rect, circle, text
  const [color, setColor] = useState("#4f46e5");
  const [lineWidth, setLineWidth] = useState(4);
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState(null); // { x, y } where text box will render

  // Stroke list state
  const [localStrokes, setLocalStrokes] = useState([]);
  const [remoteActiveStrokes, setRemoteActiveStrokes] = useState({}); // strokes currently being drawn by peers

  const isDrawingRef = useRef(false);
  const currentStrokeIdRef = useRef(null);
  const currentPointsRef = useRef([]);

  // Generate a random client peer identifier
  const peerId = useRef(`peer_${Math.random().toString(36).substring(2, 7)}`);
  const [peersCount, setPeersCount] = useState(1);

  // Initialize IndexedDB
  const initDB = useCallback(() => {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
      request.onsuccess = (e) => {
        dbRef.current = e.target.result;
        resolve(dbRef.current);
      };
      request.onerror = () => {
        console.error("IndexedDB whiteboard failed to open.");
        resolve(null);
      };
    });
  }, []);

  // Load stroke history from cache
  const loadHistory = useCallback(async (db) => {
    if (!db) return;
    try {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get("latest_whiteboard");
      request.onsuccess = (e) => {
        if (e.target.result && Array.isArray(e.target.result.strokes)) {
          setLocalStrokes(e.target.result.strokes);
        }
      };
    } catch (err) {
      console.error("Error loading cached whiteboard state:", err);
    }
  }, []);

  // Save stroke history to cache
  const saveHistory = useCallback((strokes) => {
    if (!dbRef.current) return;
    try {
      const transaction = dbRef.current.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.put({ id: "latest_whiteboard", strokes, timestamp: Date.now() });
    } catch (err) {
      console.error("Error saving cached state:", err);
    }
  }, []);

  // Render loop to draw everything onto canvas context
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear board
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid Lines (Neon styling)
    ctx.strokeStyle = "rgba(99, 102, 241, 0.03)";
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Helper to draw single stroke item
    const drawItem = (item) => {
      ctx.strokeStyle = item.color;
      ctx.fillStyle = item.color;
      ctx.lineWidth = item.lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (item.tool === "pencil" && item.points && item.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(item.points[0][0], item.points[0][1]);
        for (let i = 1; i < item.points.length; i++) {
          ctx.lineTo(item.points[i][0], item.points[i][1]);
        }
        ctx.stroke();
      } else if (item.tool === "line") {
        ctx.beginPath();
        ctx.moveTo(item.start[0], item.start[1]);
        ctx.lineTo(item.end[0], item.end[1]);
        ctx.stroke();
      } else if (item.tool === "rect") {
        const x = item.start[0];
        const y = item.start[1];
        const w = item.end[0] - x;
        const h = item.end[1] - y;
        ctx.strokeRect(x, y, w, h);
      } else if (item.tool === "circle") {
        const x = item.start[0];
        const y = item.start[1];
        const r = Math.hypot(item.end[0] - x, item.end[1] - y);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (item.tool === "text") {
        ctx.font = `bold ${item.lineWidth * 4 + 10}px Inter, sans-serif`;
        ctx.fillText(item.text, item.x, item.y);
      }
    };

    // 1. Draw static strokes list
    localStrokes.forEach(drawItem);

    // 2. Draw remote active strokes currently dragging
    Object.values(remoteActiveStrokes).forEach(drawItem);
  }, [localStrokes, remoteActiveStrokes]);

  // Handle initialization, BroadcastChannel connection, and events setup
  useEffect(() => {
    // 1. Open Database & Load history
    initDB().then((db) => {
      loadHistory(db);
    });

    // 2. Connect BroadcastChannel for real-time signaling P2P
    bcRef.current = new BroadcastChannel("eventra_p2p_mesh");

    // Ping peers count check
    const interval = setInterval(() => {
      if (bcRef.current) {
        bcRef.current.postMessage({ type: "WHITEBOARD_PING", from: peerId.current });
      }
    }, 3000);

    bcRef.current.onmessage = (e) => {
      const msg = e.data;
      if (msg.from === peerId.current) return;

      switch (msg.type) {
        case "WHITEBOARD_PING":
          bcRef.current.postMessage({ type: "WHITEBOARD_PONG", from: peerId.current });
          break;

        case "WHITEBOARD_PONG":
          // Simple heuristic for counting active tabs
          setPeersCount(p => Math.min(6, p + 1));
          break;

        case "WHITEBOARD_STROKE_START":
          setRemoteActiveStrokes((prev) => ({
            ...prev,
            [msg.id]: msg.stroke,
          }));
          break;

        case "WHITEBOARD_SHAPE_PREVIEW":
          setRemoteActiveStrokes((prev) => {
            const active = prev[msg.id];
            if (!active) return prev;
            return {
              ...prev,
              [msg.id]: {
                ...active,
                end: msg.end,
              },
            };
          });
          break;

        case "WHITEBOARD_STROKE_DRAW":
          setRemoteActiveStrokes((prev) => {
            const active = prev[msg.id];
            if (!active) return prev;
            return {
              ...prev,
              [msg.id]: {
                ...active,
                points: [...(active.points || []), msg.point],
              },
            };
          });
          break;

        case "WHITEBOARD_STROKE_END":
          setRemoteActiveStrokes((prev) => {
            const finished = prev[msg.id];
            if (finished) {
              setLocalStrokes((l) => {
                const updated = [...l, finished];
                saveHistory(updated);
                return updated;
              });
            }
            const copy = { ...prev };
            delete copy[msg.id];
            return copy;
          });
          break;

        case "WHITEBOARD_COMPLETE_STROKE":
          setLocalStrokes((l) => {
            const updated = [...l, msg.stroke];
            saveHistory(updated);
            return updated;
          });
          if (msg.id) {
            setRemoteActiveStrokes((prev) => {
              const copy = { ...prev };
              delete copy[msg.id];
              return copy;
            });
          }
          break;

        case "WHITEBOARD_CLEAR":
          setLocalStrokes([]);
          saveHistory([]);
          toast.info("Whiteboard cleared by another peer.");
          break;

        default:
          break;
      }
    };

    return () => {
      clearInterval(interval);
      if (bcRef.current) {
        bcRef.current.close();
      }
    };
  }, [initDB, loadHistory, saveHistory]);

  // Re-trigger redraw loop whenever strokes update
  useEffect(() => {
    redrawCanvas();
  }, [localStrokes, remoteActiveStrokes, redrawCanvas]);

  // Helper: Extract relative scaled coordinate
  const getCanvasCoords = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  // Drawing event handlers
  const startDrawing = (clientX, clientY) => {
    const coords = getCanvasCoords(clientX, clientY);

    if (tool === "text") {
      setTextPos(coords);
      return;
    }

    isDrawingRef.current = true;
    currentStrokeIdRef.current = `${peerId.current}_${Date.now()}`;
    
    if (tool === "pencil") {
      currentPointsRef.current = [[coords.x, coords.y]];
      const newStroke = {
        tool,
        color,
        lineWidth,
        points: currentPointsRef.current,
      };

      bcRef.current.postMessage({
        type: "WHITEBOARD_STROKE_START",
        id: currentStrokeIdRef.current,
        stroke: newStroke,
        from: peerId.current,
      });

      setRemoteActiveStrokes(prev => ({
        ...prev,
        [currentStrokeIdRef.current]: newStroke
      }));
    } else {
      // Shape tools (line, rect, circle)
      currentPointsRef.current = [coords.x, coords.y]; // Store starting coordinate anchor
      const newStroke = {
        tool,
        color,
        lineWidth,
        start: [coords.x, coords.y],
        end: [coords.x, coords.y],
      };

      bcRef.current.postMessage({
        type: "WHITEBOARD_STROKE_START",
        id: currentStrokeIdRef.current,
        stroke: newStroke,
        from: peerId.current,
      });

      setRemoteActiveStrokes((prev) => ({
        ...prev,
        [currentStrokeIdRef.current]: newStroke,
      }));
    }
  };

  const draw = (clientX, clientY) => {
    if (!isDrawingRef.current) return;
    const coords = getCanvasCoords(clientX, clientY);

    if (tool === "pencil") {
      currentPointsRef.current.push([coords.x, coords.y]);

      bcRef.current.postMessage({
        type: "WHITEBOARD_STROKE_DRAW",
        id: currentStrokeIdRef.current,
        point: [coords.x, coords.y],
        from: peerId.current,
      });

      setRemoteActiveStrokes(prev => {
        const active = prev[currentStrokeIdRef.current];
        if (!active) return prev;
        return {
          ...prev,
          [currentStrokeIdRef.current]: {
            ...active,
            points: [...active.points, [coords.x, coords.y]]
          }
        };
      });
    } else {
      // Shape drawing preview rendering
      const startX = currentPointsRef.current[0];
      const startY = currentPointsRef.current[1];
      
      const previewStroke = {
        tool,
        color,
        lineWidth,
        start: [startX, startY],
        end: [coords.x, coords.y]
      };

      bcRef.current.postMessage({
        type: "WHITEBOARD_SHAPE_PREVIEW",
        id: currentStrokeIdRef.current,
        end: [coords.x, coords.y],
        from: peerId.current,
      });

      setRemoteActiveStrokes(prev => ({
        ...prev,
        [currentStrokeIdRef.current]: previewStroke
      }));
    }
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (tool === "pencil") {
      bcRef.current.postMessage({
        type: "WHITEBOARD_STROKE_END",
        id: currentStrokeIdRef.current,
        from: peerId.current,
      });

      setRemoteActiveStrokes(prev => {
        const finished = prev[currentStrokeIdRef.current];
        if (finished) {
          setLocalStrokes(l => {
            const updated = [...l, finished];
            saveHistory(updated);
            return updated;
          });
        }
        const copy = { ...prev };
        delete copy[currentStrokeIdRef.current];
        return copy;
      });
    } else {
      // Shape drawing finished
      setRemoteActiveStrokes(prev => {
        const finished = prev[currentStrokeIdRef.current];
        if (finished) {
          bcRef.current.postMessage({
            type: "WHITEBOARD_COMPLETE_STROKE",
            id: currentStrokeIdRef.current,
            stroke: finished,
            from: peerId.current
          });

          setLocalStrokes(l => {
            const updated = [...l, finished];
            saveHistory(updated);
            return updated;
          });
        }
        const copy = { ...prev };
        delete copy[currentStrokeIdRef.current];
        return copy;
      });
    }
  };

  // Text insertion handler
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim() || !textPos) return;

    const newTextStroke = {
      tool: "text",
      color,
      lineWidth, // scales text size
      text: textInput,
      x: textPos.x,
      y: textPos.y
    };

    bcRef.current.postMessage({
      type: "WHITEBOARD_COMPLETE_STROKE",
      stroke: newTextStroke,
      from: peerId.current
    });

    setLocalStrokes(l => {
      const updated = [...l, newTextStroke];
      saveHistory(updated);
      return updated;
    });

    setTextInput("");
    setTextPos(null);
  };

  // Clear board
  const clearBoard = () => {
    setLocalStrokes([]);
    saveHistory([]);
    if (bcRef.current) {
      bcRef.current.postMessage({ type: "WHITEBOARD_CLEAR", from: peerId.current });
    }
    toast.success("Whiteboard cleared.");
  };

  // Export board as PNG snapshot
  const exportBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `eventra-whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Board snapshot exported as PNG.");
  };

  return (
    <div className="flex flex-col gap-6" ref={containerRef}>
      {/* HUD Whiteboard Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-3xl shadow-lg">
        {/* Tools Select Group */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          {[
            { id: "pencil", icon: Pencil, label: "Sketcher" },
            { id: "line", icon: Minus, label: "Straight Line" },
            { id: "rect", icon: Square, label: "Rectangle" },
            { id: "circle", icon: CircleIcon, label: "Circle" },
            { id: "text", icon: Type, label: "Text Stamp" }
          ].map((item) => {
            const Icon = item.icon;
            const active = tool === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { setTool(item.id); setTextPos(null); }}
                title={item.label}
                className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
                  active 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon size={15} />
              </button>
            );
          })}
        </div>

        {/* Color Palette Picker */}
        <div className="flex items-center gap-2">
          {COLORS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setColor(item.value)}
              title={item.label}
              className={`w-6 h-6 rounded-full border transition hover:scale-110 cursor-pointer ${
                color === item.value 
                  ? "border-white ring-2 ring-indigo-500/50 scale-105" 
                  : "border-slate-800"
              }`}
              style={{ backgroundColor: item.value }}
            />
          ))}
        </div>

        {/* Width Adjustment Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Line Thickness</span>
          <input
            type="range"
            min="2"
            max="12"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value, 10))}
            className="w-24 accent-indigo-500 h-1 bg-slate-950 rounded-full appearance-none cursor-pointer"
          />
          <span className="text-xs font-black text-slate-300 min-w-4 text-center">{lineWidth}px</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
          {/* Active Mesh Indicator */}
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-400 mr-2 bg-slate-950/60 p-2 rounded-2xl border border-slate-800/80">
            <Users className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>P2P Peer Mesh Count: <span className="font-extrabold text-indigo-400">{peersCount}</span></span>
          </div>

          <button
            type="button"
            onClick={exportBoard}
            title="Download PNG snapshot"
            className="p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300 hover:text-white transition cursor-pointer flex items-center justify-center"
          >
            <Download size={14} />
          </button>
          
          <button
            type="button"
            onClick={clearBoard}
            title="Clear whiteboard board"
            className="p-2.5 rounded-xl border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 transition cursor-pointer flex items-center justify-center"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Main Interactive Drawing Board Viewport */}
      <div 
        className="relative border border-slate-800 rounded-3xl overflow-hidden bg-slate-950 shadow-inner flex items-center justify-center w-full aspect-[5/3]" 
        style={{ minHeight: "360px" }}
      >
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          onMouseDown={(e) => startDrawing(e.clientX, e.clientY)}
          onMouseMove={(e) => draw(e.clientX, e.clientY)}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => {
            if (e.touches.length === 1) startDrawing(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchMove={(e) => {
            if (e.touches.length === 1) draw(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchEnd={stopDrawing}
          className="w-full h-full block cursor-crosshair"
          style={{ backgroundColor: "#020617" }}
        />

        {/* Float Text Stamp Box input overlay */}
        <AnimatePresence>
          {textPos && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute p-4 rounded-2xl bg-slate-900 border border-indigo-500/50 shadow-2xl z-30 flex flex-col gap-2.5 max-w-xs"
              style={{
                left: `${(textPos.x / 1000) * 100}%`,
                top: `${(textPos.y / 600) * 100}%`,
                transform: "translate(-50%, -100%)"
              }}
            >
              <form onSubmit={handleTextSubmit} className="flex flex-col gap-2">
                <span className="text-[9px] font-black uppercase text-indigo-400 flex items-center gap-1">
                  <Sparkles size={10} /> Text Stamp input
                </span>
                <input
                  type="text"
                  autoFocus
                  placeholder="Type a word..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none focus:border-indigo-500 text-xs"
                  required
                />
                <div className="flex gap-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => { setTextPos(null); setTextInput(""); }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-700 text-[10px] font-bold text-white shadow-sm"
                  >
                    Place
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
