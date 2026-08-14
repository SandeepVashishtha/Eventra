import React from "react";
import { Sparkles, Trophy } from "lucide-react";

export default function LevelUpModal({ newLevel, onClose }) {
  return (
    <div className="level-modal-overlay fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="level-modal-card bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full text-center text-white relative shadow-2xl animate-scaleUp">
        <div className="inline-flex p-4 bg-indigo-600 rounded-full mb-4 shadow-lg shadow-indigo-650/20 text-white">
          <Trophy className="w-10 h-10 animate-bounce" />
        </div>
        
        <h2 className="text-2xl font-black mb-1 flex items-center justify-center gap-1">
          <Sparkles className="text-yellow-500 w-6 h-6" />
          Level Up!
        </h2>
        <p className="text-sm text-slate-400 mb-6">You have reached Level {newLevel}</p>

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl transition-all shadow-md"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}
