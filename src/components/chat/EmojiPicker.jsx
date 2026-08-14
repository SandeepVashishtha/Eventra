import React, { useState } from "react";
import { Smile } from "lucide-react";
import ReactionBadge from "./ReactionBadge";
import "./emoji.css";

export default function EmojiPicker() {
  const [reactions, setReactions] = useState([
    { emoji: "👍", count: 12 },
    { emoji: "🚀", count: 8 },
    { emoji: "🔥", count: 24 }
  ]);

  const addReaction = (emoji) => {
    setReactions((prev) =>
      prev.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1 } : r))
    );
  };

  return (
    <div className="emoji-picker-container p-4 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl max-w-xs mx-auto my-8 text-white flex flex-col items-center">
      <div className="flex gap-2.5 mb-4 p-2 bg-slate-950 rounded-2xl border border-slate-850">
        {["👍", "❤️", "🔥", "🚀", "🎉", "👏"].map((emoji) => (
          <button
            key={emoji}
            onClick={() => addReaction(emoji)}
            className="text-xl hover:scale-125 active:scale-95 transition-all p-1"
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {reactions.map((r, i) => (
          <ReactionBadge key={i} reaction={r} onClick={() => addReaction(r.emoji)} />
        ))}
      </div>
    </div>
  );
}
