import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Cpu,
  Zap,
  Clock,
  ShieldCheck,
} from "lucide-react";

/**
 * Generator Status Indicator for WASM PDF Generation (#17704)
 * Shows real-time progress and status of PDF generation in background worker
 */
export default function GeneratorStatusIndicator({
  progress = 0,
  status = "idle",
  message = "Ready to generate",
  metadata = null,
  onCancel = () => {},
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  // Animate pulse effect when generating
  useEffect(() => {
    if (status === "generating") {
      const interval = setInterval(() => {
        setIsPulsing((prev) => !prev);
      }, 800);
      return () => clearInterval(interval);
    }
    setIsPulsing(false);
  }, [status]);

  // Status configurations
  const statusConfig = {
    idle: {
      icon: Zap,
      color: "text-gray-400",
      bg: "bg-gray-100 dark:bg-gray-800",
      label: "Idle",
    },
    initializing: {
      icon: Cpu,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-950",
      label: "Initializing WASM",
    },
    generating: {
      icon: Loader2,
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-950",
      label: "Generating",
    },
    signing: {
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950",
      label: "Signing",
    },
    completed: {
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950",
      label: "Completed",
    },
    error: {
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950",
      label: "Error",
    },
    cancelled: {
      icon: XCircle,
      color: "text-gray-400",
      bg: "bg-gray-100 dark:bg-gray-800",
      label: "Cancelled",
    },
  };

  const config = statusConfig[status] || statusConfig.idle;
  const Icon = config.icon;

  // Format time estimate
  const formatTime = (ms) => {
    if (ms < 1000) return "<1s";
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}m`;
  };

  // Calculate ETA
  const calculateETA = () => {
    if (status !== "generating" || progress <= 0) return null;
    const elapsed = Date.now() - (metadata?.startTime || Date.now());
    const remaining = (elapsed / progress) * (100 - progress);
    return formatTime(remaining);
  };

  const eta = calculateETA();

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl ${config.bg} ${isPulsing && status === "generating" ? "animate-pulse" : ""}`}
          >
            <Icon className={`w-5 h-5 ${config.color} ${status === "generating" ? "animate-spin" : ""}`} />
          </div>
          <div className="space-y-0.5">
            <p className="font-bold text-gray-900 dark:text-white text-sm">
              PDF Generation Status
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {config.label}
              {status === "generating" && (
                <span className="ml-2">
                  ~{eta ? `${eta} remaining` : "Calculating..."}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {status === "generating" && (
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-xs transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            Cancel
          </button>
        )}

        {status === "completed" && metadata && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-semibold text-xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            {showDetails ? "Hide" : "Show"} Details
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 dark:text-gray-400">
          <span>Progress</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {progress.toFixed(1)}%
          </span>
        </div>

        <div className="relative h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {/* Progress Fill */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />

          {/* Animated Shimmer Effect */}
          {status === "generating" && progress < 100 && (
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          )}

          {/* Status Indicator Dots */}
          <div className="absolute inset-0 flex items-center justify-center gap-1 px-2">
            {[20, 40, 60, 80, 100].map((mark) => (
              <div
                key={mark}
                className={`h-1.5 w-1 rounded-full transition-colors ${
                  progress >= mark
                    ? "bg-white dark:bg-white"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Status Message */}
        <p
          className={`text-sm font-medium text-center transition-colors ${
            status === "error"
              ? "text-red-500"
              : status === "completed"
              ? "text-emerald-600"
              : "text-gray-600 dark:text-gray-300"
          }`}
        >
          {message}
        </p>

        {/* Metadata Details Panel */}
        {showDetails && metadata && (
          <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">File Size:</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                {metadata.fileSize ? `${(metadata.fileSize / 1024).toFixed(2)} KB` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Pages:</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                {metadata.pages || "1"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Resolution:</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                {metadata.resolution || "300 DPI"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Signature:</span>
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                {metadata.signature ? `${metadata.signature.substring(0, 8)}...` : "Pending"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Time Taken:</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                {metadata.startTime && metadata.endTime
                  ? formatTime(metadata.endTime - metadata.startTime)
                  : "N/A"}
              </span>
            </div>
          </div>
        )}

        {/* Error Details */}
        {status === "error" && message && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
            <p className="text-[11px] font-mono text-red-600 dark:text-red-400 break-all">
              {message}
            </p>
          </div>
        )}
      </div>

      {/* Worker Info Footer */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[10px] font-mono text-gray-400">
            Background Web Worker Active
          </span>
          <Zap className="w-3 h-3 text-indigo-400" />
        </div>
      </div>
    </div>
  );
}
