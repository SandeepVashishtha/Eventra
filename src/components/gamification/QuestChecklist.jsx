import React, { useState } from "react";
import { CheckSquare, Square, Trophy, Award } from "lucide-react";
import "./quest-checklist.css";

export default function QuestChecklist() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Register for your first workshop", points: 10, done: true },
    { id: 2, text: "Upvote 3 projects in the gallery", points: 15, done: false },
    { id: 3, text: "Join a WebRTC networking circle", points: 20, done: false }
  ]);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const totalPoints = tasks.filter((t) => t.done).reduce((sum, t) => sum + t.points, 0);

  return (
    <div className="quest-checklist p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg max-w-sm mx-auto my-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Award className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
          Active Quests checklist
        </h3>
        <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 px-3 py-1 rounded-xl font-black text-xs">
          +{totalPoints} Pts
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`task-row flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
              task.done
                ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10 text-slate-800 dark:text-slate-100"
                : "border-slate-200 dark:border-slate-850 hover:bg-slate-50"
            }`}
          >
            <span className="text-xs font-semibold">{task.text}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400">+{task.points}</span>
              {task.done ? (
                <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-450" />
              ) : (
                <Square className="w-5 h-5 text-slate-300 dark:text-slate-700" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
