import React, { useState } from "react";
import { Palette, Layers, Award } from "lucide-react";
import LayerControl from "./LayerControl";
import "./badge-designer.css";

export default function BadgeDesigner() {
  const [layers, setLayers] = useState([
    { id: 1, name: "Gold Border Style", type: "border", color: "#fbbf24", visible: true },
    { id: 2, name: "GSSoC Star Emblem", type: "icon", color: "#4f46e5", visible: true },
    { id: 3, name: "Completion Banner Text", type: "text", color: "#1e293b", visible: true }
  ]);

  const toggleVisibility = (id) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  const updateColor = (id, newColor) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, color: newColor } : l))
    );
  };

  return (
    <div className="badge-designer p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl max-w-4xl mx-auto my-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Palette className="text-indigo-650 dark:text-indigo-400 w-5 h-5" />
            Organizer Custom Badge Designer
          </h2>
          <p className="text-xs text-slate-500 mt-1">Design completion achievements by layering vectors and text</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Visual Preview */}
        <div className="preview-container bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl flex items-center justify-center h-80 relative shadow-inner">
          <div className="badge-preview-wrapper flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-full w-48 h-48 border-4 shadow-lg border-indigo-500/20">
            <Award className="w-20 h-20 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest mt-1">Completed</span>
          </div>
        </div>

        {/* Layer Controls */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1">
            <Layers className="w-4 h-4" /> Layout Layers
          </h3>
          <div className="flex flex-col gap-3">
            {layers.map((layer) => (
              <LayerControl
                key={layer.id}
                layer={layer}
                onToggle={() => toggleVisibility(layer.id)}
                onColorChange={(color) => updateColor(layer.id, color)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
