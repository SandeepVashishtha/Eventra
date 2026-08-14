import React, { useState } from "react";
import { Image, Upload } from "lucide-react";
import CompressionRatioMeter from "./CompressionRatioMeter";

export default function BannerUploadCropper() {
  const [compressing, setCompressing] = useState(false);
  const [ratio, setRatio] = useState(100);

  const processBannerResizing = () => {
    setCompressing(true);
    setTimeout(() => {
      setCompressing(false);
      setRatio(35); // Optimized to 35% original size
    }, 500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white space-y-4">
      <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-3">
        <span className="font-bold flex items-center gap-1.5">
          <Image className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Event Banner Upload Panel
        </span>
        <button
          onClick={processBannerResizing}
          disabled={compressing}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" /> {compressing ? "Optimizing WASM..." : "Process Banner"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative aspect-video rounded-3xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-800">
          <span className="text-gray-500 font-bold">Image Frame Sandbox</span>
        </div>

        <CompressionRatioMeter ratio={ratio} />
      </div>
    </div>
  );
}
