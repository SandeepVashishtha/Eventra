import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Sliders, RotateCcw, Palette } from "lucide-react";

export default function ThemeCustomizer() {
  const { customHsl, setCustomHsl } = useTheme();
  const { h, s, l, active } = customHsl;

  const updateHsl = (field, value) => {
    setCustomHsl((prev) => ({
      ...prev,
      [field]: parseInt(value, 10),
      active: true,
    }));
  };

  const handleToggle = () => {
    setCustomHsl((prev) => ({ ...prev, active: !prev.active }));
  };

  const handleReset = () => {
    setCustomHsl({ h: 220, s: 90, l: 56, active: false });
  };

  const hslColor = `hsl(${h}, ${s}%, ${l}%)`;

  return (
    <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Theme Customizer</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Adjust the sliders to customize the primary theme color.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button onClick={handleReset} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition" aria-label="Reset theme color">
            <RotateCcw className="w-4.5 h-4.5" aria-hidden="true" />
          </button>
          <button onClick={handleToggle} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${active ? "bg-indigo-600 text-white" : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"}`} aria-label={active ? "Disable custom theme color" : "Enable custom theme color"}>
            {active ? "Custom Active" : "Enable Custom"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900/50 p-5 flex flex-col justify-between items-center text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">Color Preview</span>
          <div className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-800 shadow-md transition-colors" style={{ backgroundColor: hslColor }} />
          <span className="text-xs font-mono text-slate-500 mt-3">hsl({h}, {s}%, {l}%)</span>
        </div>

        <div className="md:col-span-2 space-y-4">
          {/* Hue */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
              <label htmlFor="theme-hue">Hue</label>
              <span className="font-mono">{h}°</span>
            </div>
            <input id="theme-hue" type="range" min="0" max="360" value={h} onChange={(e) => updateHsl("h", e.target.value)} className="w-full h-2 rounded-lg appearance-none cursor-pointer" style={{ background: "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)" }} />
          </div>

          {/* Saturation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
              <label htmlFor="theme-saturation">Saturation</label>
              <span className="font-mono">{s}%</span>
            </div>
            <input id="theme-saturation" type="range" min="0" max="100" value={s} onChange={(e) => updateHsl("s", e.target.value)} className="w-full h-2 rounded-lg appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, hsl(${h}, 0%, 50%), hsl(${h}, 100%, 50%))` }} />
          </div>

          {/* Lightness */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold">
              <label htmlFor="theme-lightness">Lightness</label>
              <span className="font-mono">{l}%</span>
            </div>
            <input id="theme-lightness" type="range" min="10" max="90" value={l} onChange={(e) => updateHsl("l", e.target.value)} className="w-full h-2 rounded-lg appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #000000, hsl(${h}, ${s}%, 50%), #ffffff)` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
