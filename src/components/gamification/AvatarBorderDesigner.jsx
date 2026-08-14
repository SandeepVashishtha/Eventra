import React, { useState } from "react";
import { Sparkles, Palette, Check } from "lucide-react";
import "./avatar-border.css";

export default function AvatarBorderDesigner() {
  const [borders, setBorders] = useState([
    { id: 1, name: "Neon Cyan", styleClass: "border-neon-cyan", unlocked: true, equipped: true },
    { id: 2, name: "Sunset Gold", styleClass: "border-sunset-gold", unlocked: true, equipped: false },
    { id: 3, name: "Cyber Fire", styleClass: "border-cyber-fire", unlocked: false, cost: 200 }
  ]);

  const handleEquip = (id) => {
    setBorders((prev) =>
      prev.map((b) => ({ ...b, equipped: b.id === id }))
    );
  };

  const handleUnlock = (id, cost) => {
    alert(`Unlocked border for ${cost} points!`);
    setBorders((prev) =>
      prev.map((b) => (b.id === id ? { ...b, unlocked: true } : b))
    );
  };

  const activeBorder = borders.find((b) => b.equipped)?.styleClass || "";

  return (
    <div className="avatar-border-designer p-6 bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-xl max-w-sm mx-auto my-8 flex flex-col items-center">
      <h3 className="text-base font-bold mb-6 flex items-center gap-1.5">
        <Palette className="text-indigo-400 w-5 h-5" />
        Avatar Border Customizer
      </h3>

      {/* Live Preview */}
      <div className="preview-avatar-box relative mb-6">
        <div className={`avatar-frame w-24 h-24 rounded-full border-4 flex items-center justify-center p-0.5 overflow-hidden shadow-lg ${activeBorder}`}>
          <img
            src="https://avatars.githubusercontent.com/u/64915843?v=4"
            alt="Preview Profile"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      </div>

      <div className="w-full flex flex-col gap-3">
        {borders.map((b) => (
          <div key={b.id} className="border-option-row p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold">{b.name}</span>
            <div>
              {b.unlocked ? (
                b.equipped ? (
                  <span className="text-[10px] font-black text-emerald-450 uppercase flex items-center gap-0.5">
                    <Check className="w-3.5 h-3.5" /> Equipped
                  </span>
                ) : (
                  <button
                    onClick={() => handleEquip(b.id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg"
                  >
                    Equip
                  </button>
                )
              ) : (
                <button
                  onClick={() => handleUnlock(b.id, b.cost)}
                  className="bg-slate-805 hover:bg-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-700"
                >
                  Unlock {b.cost} Pts
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
