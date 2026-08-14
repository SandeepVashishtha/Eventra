import React, { useState, useEffect } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";
import "./rate-limit.css";

export default function RateLimitIndicator({
  isOpen = true,
  blockDurationSeconds = 60,
  onExpiry
}) {
  const [secondsLeft, setSecondsLeft] = useState(blockDurationSeconds);

  useEffect(() => {
    if (!isOpen || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onExpiry) onExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, secondsLeft]);

  if (!isOpen) return null;

  return (
    <div className="limit-modal-overlay">
      <div className="limit-modal-card p-6 bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl max-w-sm w-full text-center">
        <div className="inline-flex p-3 bg-red-500/10 text-red-500 rounded-full mb-4">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-base font-black mb-1">Too Many Requests</h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          You have triggered rate limitations on this API endpoint. Please wait before retrying.
        </p>

        <div className="timer-display min-h-[50px] bg-slate-950 px-6 py-3 rounded-2xl border border-slate-850 flex items-center justify-center font-mono text-xl font-bold text-red-400 mb-6 w-full max-w-[150px] mx-auto">
          00:{String(secondsLeft).padStart(2, "0")}
        </div>

        <button
          disabled={secondsLeft > 0}
          onClick={() => window.location.reload()}
          className="w-full flex items-center justify-center gap-1.5 bg-indigo-650 hover:bg-indigo-755 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 text-xs"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    </div>
  );
}
