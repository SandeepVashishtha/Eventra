import React, { useRef, useEffect } from "react";
import { Sparkles, Compass } from "lucide-react";
import { getTicketPaintWorkletSource } from "./ticketPaintWorklet";

export default function InteractiveTicketCard({ ticketCode = "EVT-VIP-2026", holderName = "Suman Vashishtha" }) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (typeof CSS !== "undefined" && CSS.paintWorklet) {
      try {
        const code = getTicketPaintWorkletSource();
        const blob = new Blob([code], { type: "application/javascript" });
        const url = URL.createObjectURL(blob);
        CSS.paintWorklet.addModule(url);
      } catch (e) {
        console.warn("[Houdini] Error adding paint workletModule:", e);
      }
    }
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--ticket-glow-x", x.toFixed(1));
    cardRef.current.style.setProperty("--ticket-glow-y", y.toFixed(1));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="houdini-ticket-card w-full max-w-sm mx-auto p-6 rounded-3xl border border-white/10 bg-slate-900 text-white space-y-4 shadow-xl select-none"
    >
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-1 font-bold font-mono text-indigo-400 text-xs">
          <Sparkles className="w-3.5 h-3.5" /> Eventra VIP Card
        </span>
        <Compass className="w-4 h-4 text-indigo-500 animate-spin" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-extrabold tracking-wider">{ticketCode}</h2>
        <p className="text-slate-400 text-[10px]">HOLDER: {holderName.toUpperCase()}</p>
      </div>
    </div>
  );
}
