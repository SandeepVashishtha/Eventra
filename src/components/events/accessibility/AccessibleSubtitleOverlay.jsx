import React, { useState } from "react";
import { Type, Download, Sliders, Eye } from "lucide-react";

export default function AccessibleSubtitleOverlay({
  currentCue = { text: "Welcome to the Eventra keynote presentation. Today we discuss decentralization." },
}) {
  const [fontSize, setFontSize] = useState("text-base");
  const [highContrast, setHighContrast] = useState(true);

  const handleDownloadTranscript = () => {
    const blob = new Blob([currentCue?.text || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "keynote-live-transcript.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Control Toolbar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-gray-900 dark:text-white">Subtitle Customizer</span>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-2 py-1 text-[11px] outline-none"
          >
            <option value="text-xs">Small Text</option>
            <option value="text-base">Medium Text</option>
            <option value="text-lg">Large Text</option>
            <option value="text-2xl">Extra Large (AAA)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1 rounded-xl font-bold transition-all ${
              highContrast
                ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 border border-indigo-200 dark:border-indigo-800"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600"
            }`}
          >
            WCAG AAA Contrast
          </button>
          <button
            onClick={handleDownloadTranscript}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold"
          >
            <Download className="w-3.5 h-3.5" /> Download Transcript
          </button>
        </div>
      </div>

      {/* Caption Viewport Display */}
      <div
        className={`w-full p-6 rounded-3xl border transition-all text-center leading-relaxed font-bold min-h-[96px] flex items-center justify-center ${
          highContrast
            ? "bg-black border-yellow-400 text-yellow-400 font-black shadow-2xl"
            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white shadow-sm"
        } ${fontSize}`}
      >
        {currentCue?.text || "Waiting for live stage captions..."}
      </div>
    </div>
  );
}
