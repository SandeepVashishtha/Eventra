import React, { useRef, useEffect, useState } from "react";
import { Layers, Activity, RotateCcw } from "lucide-react";
import { drawHeatmapNode } from "../../../utils/heatmap/heatmapBlurPainter";
import PlaybackTimeline from "./PlaybackTimeline";

export default function LiveDensityHeatmap({ points = [{ x: 150, y: 100, val: 0.8 }, { x: 300, y: 150, val: 0.9 }] }) {
  const canvasRef = useRef(null);
  const [scale, setScale] = useState("classic");

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear previous drawing context
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid map placeholder backgrounds
    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    // Paint Gaussian nodes
    points.forEach((pt) => {
      drawHeatmapNode(ctx, pt.x, pt.y, 40, pt.val);
    });
  }, [points, scale]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 text-xs text-gray-900 dark:text-white select-none">
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">Live Venue Occupancy Heatmap</span>
        </div>

        <select
          value={scale}
          onChange={(e) => setScale(e.target.value)}
          className="bg-transparent font-semibold border-none outline-none cursor-pointer text-indigo-600 dark:text-indigo-400"
        >
          <option value="classic">Classic Hues</option>
          <option value="cool">Cool Tech</option>
        </select>
      </div>

      <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-slate-950 flex items-center justify-center">
        <canvas ref={canvasRef} width={800} height={400} className="w-full h-auto block bg-slate-900" />
      </div>

      <PlaybackTimeline />
    </div>
  );
}
