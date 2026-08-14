import React from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LayerControl({ layer, onToggle, onColorChange }) {
  return (
    <div className="layer-row flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className={`p-1.5 rounded-lg border transition-colors ${
            layer.visible
              ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900"
              : "hover:bg-slate-200 border-slate-200 dark:border-slate-800 text-slate-450"
          }`}
        >
          {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
        <span className="text-xs font-bold text-slate-850 dark:text-slate-200">{layer.name}</span>
      </div>

      <input
        type="color"
        value={layer.color}
        onChange={(e) => onColorChange(e.target.value)}
        className="w-7 h-7 rounded cursor-pointer border-0 p-0"
      />
    </div>
  );
}
