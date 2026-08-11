import React, { useRef, useState } from "react";
import { Download, Palette, Trash2, CheckCircle } from "lucide-react";
import { generateBlobUrlFromCanvas, revokeBlobUrlSafely, resetCanvasMemory } from "./canvasExportUtils";

export default function WhiteboardCanvas() {
  const canvasRef = useRef(null);
  const [color, setColor] = useState("#6366f1");
  const [exporting, setExporting] = useState(false);

  const handleExportDrawing = async () => {
    if (!canvasRef.current) return;
    setExporting(true);

    try {
      const blobUrl = await generateBlobUrlFromCanvas(canvasRef.current);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `whiteboard-export-${Date.now()}.png`;
      a.click();

      // Revoke to prevent garbage collection leaks
      revokeBlobUrlSafely(blobUrl);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const handleClearWhiteboard = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Tool panel bar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-gray-900 dark:text-white font-mono">Whiteboard Toolkit</span>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-6 rounded border cursor-pointer bg-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearWhiteboard}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Clear Board
          </button>

          <button
            onClick={handleExportDrawing}
            disabled={exporting}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> {exporting ? "Exporting..." : "Export PNG"}
          </button>
        </div>
      </div>

      {/* Drawing Viewport Grid Board */}
      <div className="relative w-full h-[320px] rounded-3xl overflow-hidden bg-white border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-full block bg-slate-50 cursor-crosshair"
        />
      </div>
    </div>
  );
}
