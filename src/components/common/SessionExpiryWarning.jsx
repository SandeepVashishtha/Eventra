import React, { useState, useEffect } from "react";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import "./session-expiry.css";

export default function SessionExpiryWarning({
  isOpen = true,
  warningSeconds = 300, // 5 minutes warning
  onExtend,
  onClose
}) {
  const [secondsLeft, setSecondsLeft] = useState(warningSeconds);

  useEffect(() => {
    if (!isOpen || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, secondsLeft]);

  if (!isOpen || secondsLeft <= 0) return null;

  return (
    <div className="expiry-warning-banner p-4 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-xl flex items-center justify-between gap-4 max-w-xl mx-auto my-4 relative">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
        <div>
          <h4 className="text-xs font-bold leading-tight">Session Expiring Soon</h4>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Your login authorization session will lapse in {Math.floor(secondsLeft / 60)}m {secondsLeft % 60}s.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onExtend}
          className="flex items-center gap-1 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Renew Session
        </button>
        <button onClick={onClose} className="p-1 hover:bg-slate-805 rounded text-slate-500 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
