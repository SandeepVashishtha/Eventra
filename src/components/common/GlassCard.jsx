import React from "react";
import "../../styles/glassEffects.css";

export default function GlassCard({ children }) {
  return (
    // Isolate rendering context to GPU layer via graphics layer isolation properties (#16598)
    <div className="gpu-isolated-glass-card p-6 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md text-white">
      {children}
    </div>
  );
}
