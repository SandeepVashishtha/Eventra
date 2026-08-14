import React from "react";
import { Smile, AlertTriangle, TrendingUp } from "lucide-react";
import "./sentiment.css";

export default function SentimentTracker() {
  const data = [
    { hour: "09 AM", positive: 40, negative: 10 },
    { hour: "10 AM", positive: 65, negative: 8 },
    { hour: "11 AM", positive: 80, negative: 5 }
  ];

  return (
    <div className="sentiment-tracker p-6 bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-xl max-w-sm mx-auto my-8">
      <h3 className="text-base font-bold mb-6 flex items-center gap-1.5">
        <TrendingUp className="text-indigo-400 w-5 h-5" />
        Audience Sentiment Tracker
      </h3>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center bg-slate-950 p-3.5 border border-slate-850 rounded-xl">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Smile className="text-emerald-450 w-4 h-4" /> Positive Rating
          </span>
          <span className="text-xs font-black text-emerald-450">80%</span>
        </div>

        <div className="flex justify-between items-center bg-slate-955 p-3.5 border border-slate-850 rounded-xl">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="text-red-400 w-4 h-4" /> Negative Spikes
          </span>
          <span className="text-xs font-black text-red-400">5%</span>
        </div>
      </div>

      {/* SVG-based mini-chart */}
      <div className="svg-chart-wrapper bg-slate-950 border border-slate-850 p-4 rounded-2xl h-40 relative shadow-inner">
        <svg className="w-full h-full" viewBox="0 0 300 120">
          {/* Grid lines */}
          <line x1="0" y1="30" x2="300" y2="30" stroke="#1e293b" strokeDasharray="4 4" />
          <line x1="0" y1="60" x2="300" y2="60" stroke="#1e293b" strokeDasharray="4 4" />
          <line x1="0" y1="90" x2="300" y2="90" stroke="#1e293b" strokeDasharray="4 4" />

          {/* Positive line path */}
          <path
            d="M 50 80 L 150 50 L 250 20"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Negative line path */}
          <path
            d="M 50 110 L 150 112 L 250 115"
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Data labels */}
          <text x="50" y="115" fill="#475569" fontSize="8" textAnchor="middle">09:00</text>
          <text x="150" y="115" fill="#475569" fontSize="8" textAnchor="middle">10:00</text>
          <text x="250" y="115" fill="#475569" fontSize="8" textAnchor="middle">11:00</text>
        </svg>
      </div>
    </div>
  );
}
