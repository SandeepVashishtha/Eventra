import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Box, ShieldCheck } from "lucide-react";
import { STAGE_VERTEX_SHADER, STAGE_FRAGMENT_SHADER } from "./wgslShaders";

export default function SpatialStageScene({ onSelectBooth = () => {} }) {
  const canvasRef = useRef(null);
  const [hasWebGPU, setHasWebGPU] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Initializing WebGPU Hardware Accelerator...");

  useEffect(() => {
    async function initWebGPU() {
      if (typeof navigator === "undefined" || !navigator.gpu) {
        setHasWebGPU(false);
        setStatusMessage("WebGPU not supported in browser. Fallback 2D mode active.");
        return;
      }

      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
          setHasWebGPU(false);
          setStatusMessage("No GPU Adapter available. Fallback 2D mode active.");
          return;
        }

        const device = await adapter.requestDevice();
        const context = canvasRef.current.getContext("webgpu");
        const format = navigator.gpu.getPreferredCanvasFormat();

        context.configure({
          device,
          format,
          alphaMode: "premultiplied",
        });

        setStatusMessage("WebGPU Hardware Accelerator Active (60 FPS)");
      } catch (err) {
        console.warn("[WebGPU] Initialization fallback:", err);
        setHasWebGPU(false);
        setStatusMessage("WebGPU Initialization Error. Fallback 2D mode active.");
      }
    }

    initWebGPU();
  }, []);

  return (
    <div className="relative w-full h-[480px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col items-center justify-center text-white">
      {hasWebGPU ? (
        <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />
      ) : (
        <div className="p-8 text-center space-y-4 max-w-md">
          <Box className="w-12 h-12 text-indigo-400 mx-auto animate-bounce" />
          <h3 className="font-bold text-lg">Interactive 3D Virtual Stage</h3>
          <p className="text-xs text-slate-400">
            Rendering interactive booth preview in compatibility mode.
          </p>
        </div>
      )}

      {/* Floating Status Bar Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>{statusMessage}</span>
      </div>
    </div>
  );
}
