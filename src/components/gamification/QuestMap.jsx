import React, { useState } from "react";
import { Compass, Trophy } from "lucide-react";
import QuestNode from "./QuestNode";
import "./quest-map.css";

export default function QuestMap() {
  const [quests, setQuests] = useState([
    { id: 1, label: "First Step", desc: "Register for your first event", x: 100, y: 150, unlocked: true, completed: true },
    { id: 2, label: "Brainstormer", desc: "Upvote 5 project submissions", x: 250, y: 80, unlocked: true, completed: false },
    { id: 3, label: "Feedback Loop", desc: "Submit an event review", x: 400, y: 180, unlocked: false, completed: false },
    { id: 4, label: "Networking Champ", desc: "Join WebRTC video circle", x: 550, y: 120, unlocked: false, completed: false }
  ]);

  return (
    <div className="quest-map-container p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg max-w-4xl mx-auto my-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Compass className="text-indigo-650 dark:text-indigo-400 w-5 h-5" />
            Adventure Quest Roadmap
          </h2>
          <p className="text-xs text-slate-500 mt-1">Complete quests to level up and earn GSSoC achievements</p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 px-3.5 py-1.5 rounded-xl border border-transparent font-bold text-xs">
          <Trophy className="w-4 h-4" /> Level 2 Adventurer
        </div>
      </div>

      <div className="quest-board relative bg-slate-50 dark:bg-slate-950 h-80 rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-850">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d="M 100 150 Q 175 115 250 80 T 400 180 T 550 120"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="4"
            strokeDasharray="8 6"
            className="dark:stroke-slate-800"
          />
        </svg>

        <div className="relative w-full h-full">
          {quests.map((quest) => (
            <QuestNode key={quest.id} quest={quest} />
          ))}
        </div>
      </div>
    </div>
  );
}
