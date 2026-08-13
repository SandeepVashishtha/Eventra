import React, { useState } from "react";
import { Tv, ChevronRight, ChevronLeft } from "lucide-react";
import SwarmConnectivityOverlay from "./SwarmConnectivityOverlay";

export default function LiveSlideSyncer() {
  const [slideIndex, setSlideIndex] = useState(0);

  const prevSlide = () => setSlideIndex((prev) => Math.max(0, prev - 1));
  const nextSlide = () => setSlideIndex((prev) => prev + 1);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white space-y-4">
      <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-3">
        <span className="font-bold flex items-center gap-1.5">
          <Tv className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> WebRTC Slide Controller
        </span>
        <span className="font-mono text-[10px] text-gray-400">Current Slide: {slideIndex + 1}</span>
      </div>

      <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center text-white border border-gray-150 dark:border-gray-800">
        <div className="text-xl font-bold">Slide content frame #{slideIndex + 1}</div>
        <div className="absolute bottom-4 flex gap-2">
          <button onClick={prevSlide} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={nextSlide} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <SwarmConnectivityOverlay />
    </div>
  );
}
