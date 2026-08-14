import React, { useRef, useState, useEffect } from "react";
import { Paintbrush, Eraser, Trash2, Download, Undo, Redo } from "lucide-react";
import { setupCanvas, drawPath } from "./CanvasHelper";
import "./whiteboard.css";

export default function CollaborativeWhiteboard({ teamId = "team-alpha" }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#4f46e5");
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState("pencil"); // pencil, eraser

  const history = useRef([]);
  const historyIndex = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = setupCanvas(canvas);
    contextRef.current = ctx;

    saveHistoryState();
  }, []);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const state = canvas.toDataURL();
      history.current = history.current.slice(0, historyIndex.current + 1);
      history.current.push(state);
      historyIndex.current = history.current.length - 1;
    }
  };

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = getCoordinates(nativeEvent);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(nativeEvent);
    const ctx = contextRef.current;
    ctx.lineWidth = tool === "eraser" ? brushSize * 4 : brushSize;
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      contextRef.current.closePath();
      setIsDrawing(false);
      saveHistoryState();
    }
  };

  const getCoordinates = (event) => {
    if (event.touches && event.touches.length > 0) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        offsetX: event.touches[0].clientX - rect.left,
        offsetY: event.touches[0].clientY - rect.top,
      };
    }
    return {
      offsetX: event.offsetX,
      offsetY: event.offsetY,
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistoryState();
  };

  const handleUndo = () => {
    if (historyIndex.current > 0) {
      historyIndex.current -= 1;
      restoreHistoryState();
    }
  };

  const handleRedo = () => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current += 1;
      restoreHistoryState();
    }
  };

  const restoreHistoryState = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    const img = new Image();
    img.src = history.current[historyIndex.current];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `whiteboard-${teamId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="whiteboard-container p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Collaborative Brainstorm Whiteboard</h3>
        <div className="toolbar flex flex-wrap gap-2 items-center bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
          <button
            onClick={() => setTool("pencil")}
            className={`p-2 rounded-lg transition-colors ${tool === "pencil" ? "bg-indigo-600 text-white" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"}`}
          >
            <Paintbrush className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-2 rounded-lg transition-colors ${tool === "eraser" ? "bg-indigo-600 text-white" : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"}`}
          >
            <Eraser className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-1" />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={tool === "eraser"}
            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
          />
          <select
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600"
          >
            <option value="2">Thin (2px)</option>
            <option value="5">Normal (5px)</option>
            <option value="10">Thick (10px)</option>
            <option value="20">Huge (20px)</option>
          </select>
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-1" />
          <button onClick={handleUndo} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
            <Undo className="w-5 h-5" />
          </button>
          <button onClick={handleRedo} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
            <Redo className="w-5 h-5" />
          </button>
          <button onClick={clearCanvas} className="p-2 hover:bg-red-100 dark:hover:bg-red-950 hover:text-red-600 rounded-lg text-slate-700 dark:text-slate-300">
            <Trash2 className="w-5 h-5" />
          </button>
          <button onClick={downloadImage} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="canvas-wrapper bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="block w-full cursor-crosshair bg-white"
        />
      </div>
    </div>
  );
}
