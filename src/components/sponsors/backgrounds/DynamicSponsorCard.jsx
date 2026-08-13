import React, { useRef, useEffect } from "react";
import { Sparkles, Trophy } from "lucide-react";
import { getSponsorPaintWorkletSource } from "./sponsorBackgroundWorklet";

export default function DynamicSponsorCard({ sponsorName = "Google Cloud", tier = "Platinum" }) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (typeof CSS !== "undefined" && CSS.paintWorklet) {
      try {
        const code = getSponsorPaintWorkletSource();
        const blob = new Blob([code], { type: "application/javascript" });
        const url = URL.createObjectURL(blob);
        CSS.paintWorklet.addModule(url);
      } catch (e) {
        console.warn("[Houdini] Error adding sponsor paint worklet:", e);
      }
    }
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--sponsor-hover-x", x.toFixed(1));
    cardRef.current.style.setProperty("--sponsor-hover-y", y.toFixed(1));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="houdini-sponsor-card w-full max-w-sm mx-auto p-6 rounded-3xl border border-white/10 bg-slate-900 text-white space-y-4 shadow-xl select-none"
    >
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-1 font-bold font-mono text-indigo-400 text-xs">
          <Trophy className="w-3.5 h-3.5" /> {tier} Sponsor
        </span>
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-extrabold tracking-wider">{sponsorName}</h2>
        <p className="text-slate-400 text-[10px]">VISIT VIRTUAL BOOTH</p>
      </div>
    </div>
  );
}
