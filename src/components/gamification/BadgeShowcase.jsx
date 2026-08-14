import React, { useState } from "react";
import { Share2, Pinned, Award } from "lucide-react";
import PinnedBadge from "./PinnedBadge";
import "./badge-showcase.css";

export default function BadgeShowcase() {
  const [badges, setBadges] = useState([
    { id: 1, name: "Contributed PR", icon: "⭐", desc: "Merged your first pull request", pinned: true },
    { id: 2, name: "Beta Tester", icon: "🚀", desc: "Helped test dynamic layout systems", pinned: true },
    { id: 3, name: "Clean Coder", icon: "💻", desc: "No formatting errors in 5 commits", pinned: false }
  ]);

  const togglePin = (id) => {
    setBadges((prev) =>
      prev.map((b) => (b.id === id ? { ...b, pinned: !b.pinned } : b))
    );
  };

  const handleShare = () => {
    alert("Share link copied to clipboard!");
  };

  return (
    <div className="badge-showcase-container p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg max-w-2xl mx-auto my-8">
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <h2 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
          <Award className="text-indigo-650 dark:text-indigo-400 w-5 h-5" />
          Achievement Badge Showcase
        </h2>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs px-3.5 py-1.5 rounded-xl border border-transparent transition-all"
        >
          <Share2 className="w-4 h-4" /> Share Credentials
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <PinnedBadge key={badge.id} badge={badge} onPin={() => togglePin(badge.id)} />
        ))}
      </div>
    </div>
  );
}
