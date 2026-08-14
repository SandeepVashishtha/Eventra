import React from "react";
import "./live-poll-charts.css";

export default function LivePollResults({ poll = {
  question: "Should we add virtual rooms to next event?",
  options: [
    { text: "Absolutely yes", count: 45 },
    { text: "No, standard chat is fine", count: 12 },
    { text: "Undecided", count: 8 }
  ]
}}) {
  const total = poll.options.reduce((sum, opt) => sum + opt.count, 0);

  return (
    <div className="live-poll-charts p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl max-w-md mx-auto my-8">
      <h3 className="text-base font-bold mb-5 leading-normal">{poll.question}</h3>
      <div className="flex flex-col gap-4">
        {poll.options.map((opt, i) => {
          const percent = total > 0 ? Math.round((opt.count / total) * 100) : 0;
          return (
            <div key={i} className="chart-option">
              <div className="flex justify-between text-xs text-slate-300 font-bold mb-1.5">
                <span>{opt.text}</span>
                <span>{percent}%</span>
              </div>
              <div className="progress-bar-bg w-full h-3 bg-slate-950 rounded-full overflow-hidden relative border border-slate-850">
                <div
                  style={{ width: `${percent}%` }}
                  className="progress-bar-fill h-full bg-indigo-500 rounded-full transition-all duration-700"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
