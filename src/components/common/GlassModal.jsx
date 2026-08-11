import React from "react";
import { X, ShieldCheck } from "lucide-react";

export default function GlassModal({
  isOpen = false,
  onClose = () => {},
  title = "Premium Event Pass",
  children,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in select-none">
      {/* Hardware Accelerated modal container */}
      <div className="gpu-accelerated-glass w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl space-y-4 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="text-xs leading-relaxed text-slate-300">
          {children || "Your hardware-accelerated premium ticket pass details go here."}
        </div>
      </div>
    </div>
  );
}
