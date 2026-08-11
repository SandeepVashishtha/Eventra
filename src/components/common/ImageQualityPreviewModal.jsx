import React, { useState } from "react";
import { X, Cpu, Check, Sliders, ArrowRight } from "lucide-react";
import { formatBytes } from "../../utils/wasmCompressor/wasmLoader";

export default function ImageQualityPreviewModal({
  originalFile = null,
  compressedResult = null,
  onConfirm = () => {},
  onClose = () => {},
  onQualityChange = () => {},
}) {
  const [quality, setQuality] = useState(80);

  if (!compressedResult || !originalFile) return null;

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setQuality(val);
    onQualityChange(val / 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Client-Side WASM Image Compressor
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-200">
                Zero-Server WebP Conversion & Scaling
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Original Card */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-200">
                <span>Original File</span>
                <span className="font-mono text-gray-700 dark:text-gray-300">
                  {formatBytes(compressedResult.originalSize)}
                </span>
              </div>
              <div className="h-44 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-slate-950 flex items-center justify-center">
                <img
                  src={URL.createObjectURL(originalFile)}
                  alt="Original Preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            {/* Compressed Card */}
            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Compressed (WebP)</span>
                <div className="flex items-center gap-1 font-mono">
                  <span>{formatBytes(compressedResult.compressedSize)}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px]">
                    -{compressedResult.savingsPercent}%
                  </span>
                </div>
              </div>
              <div className="h-44 rounded-lg overflow-hidden border border-indigo-300 dark:border-indigo-800 bg-slate-950 flex items-center justify-center">
                <img
                  src={compressedResult.previewUrl}
                  alt="Compressed Preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Quality Slider Control */}
          <div className="space-y-2 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                <Sliders className="w-4 h-4 text-indigo-500" />
                Compression Quality Target
              </span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">{quality}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              value={quality}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <ArrowRight className="w-4 h-4" />
            Reduced server upload payload by {compressedResult.savingsPercent}%
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(compressedResult)}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all"
            >
              <Check className="w-4 h-4" />
              Use Optimized Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
