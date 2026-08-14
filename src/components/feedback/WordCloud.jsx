import React from "react";
import { MessageSquare } from "lucide-react";
import WordNode from "./WordNode";
import "./word-cloud.css";

export default function WordCloud() {
  const words = [
    { text: "Workshop", value: 45, sentiment: "positive" },
    { text: "Awesome", value: 38, sentiment: "positive" },
    { text: "Informative", value: 30, sentiment: "positive" },
    { text: "Audio Lag", value: 15, sentiment: "negative" },
    { text: "Great Speaker", value: 35, sentiment: "positive" },
    { text: "Slow Internet", value: 18, sentiment: "negative" }
  ];

  return (
    <div className="word-cloud-container p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-lg max-w-xl mx-auto my-8">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-850 pb-4 mb-5">
        <MessageSquare className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
        <h3 className="font-bold text-slate-950 dark:text-white">Feedback Keyword Cloud</h3>
      </div>

      <div className="cloud-wrapper p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl flex flex-wrap gap-4 items-center justify-center min-h-[180px] border border-slate-200 dark:border-slate-850 shadow-inner">
        {words.map((w, idx) => (
          <WordNode key={idx} word={w} />
        ))}
      </div>
    </div>
  );
}
