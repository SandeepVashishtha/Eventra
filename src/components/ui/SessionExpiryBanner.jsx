"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Clock, RefreshCw, X, AlertTriangle } from "lucide-react";
import { getTokenExpiration, attemptTokenRefresh, clearAuthStorage } from "@/lib/api";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export default function SessionExpiryBanner() {
  const [remainingTime, setRemainingTime] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [renewedSuccess, setRenewedSuccess] = useState(false);

  const checkSession = useCallback(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("eventra_token");
    if (!token) {
      setShowBanner(false);
      setRemainingTime(null);
      return;
    }

    const expMs = getTokenExpiration(token);
    if (!expMs) {
      setShowBanner(false);
      return;
    }

    const diff = expMs - Date.now();
    setRemainingTime(diff);

    if (diff <= 0) {
      setShowBanner(false);
      clearAuthStorage();
      window.location.href = "/login?reason=session_expired";
    } else if (diff <= FIVE_MINUTES_MS) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkSession();
    }, 0);

    const interval = setInterval(checkSession, 10000);

    const handleRefreshed = () => {
      checkSession();
      setRenewedSuccess(true);
      setTimeout(() => setRenewedSuccess(false), 3000);
    };

    const handleExpired = () => {
      setShowBanner(false);
    };

    window.addEventListener("eventra:token_refreshed", handleRefreshed);
    window.addEventListener("eventra:session_expired", handleExpired);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener("eventra:token_refreshed", handleRefreshed);
      window.removeEventListener("eventra:session_expired", handleExpired);
    };
  }, [checkSession]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const success = await attemptTokenRefresh();
      if (success) {
        setRenewedSuccess(true);
        setShowBanner(false);
        setTimeout(() => setRenewedSuccess(false), 3000);
      } else {
        clearAuthStorage();
        window.location.href = "/login?reason=session_expired";
      }
    } catch (err) {
      console.error("Manual refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const formatRemaining = (ms) => {
    if (!ms || ms <= 0) return "0s";
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  if (renewedSuccess) {
    return (
      <div className="fixed bottom-5 right-5 z-50 bg-emerald-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-emerald-700 flex items-center gap-2 animate-bounce">
        <Clock className="w-4 h-4 text-emerald-400" />
        <span>Session renewed successfully!</span>
      </div>
    );
  }

  if (!showBanner || remainingTime === null) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-zinc-900 text-white rounded-2xl p-4 shadow-2xl border border-amber-500/30 space-y-3 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
          <span>Session Expiring Soon</span>
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-zinc-300">
        Your session expires in{" "}
        <span className="font-mono font-bold text-amber-300">
          {formatRemaining(remainingTime)}
        </span>
        . Stay logged in to keep working without losing changes.
      </p>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex-1 py-2 px-3 bg-[#00b887] hover:bg-[#049d73] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Renewing..." : "Stay Logged In"}</span>
        </button>
      </div>
    </div>
  );
}
