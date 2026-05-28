import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { logger } from "../../utils/logger";

/**
 * FeatureErrorBoundary
 *
 * Lightweight boundary for individual feature components (cards, panels, widgets).
 * Shows a compact inline error card with retry support.
 *
 * Props:
 * - featureName {string}   Optional name of the feature for better error messages
 * - onError     {function} Optional callback invoked with (error, errorInfo)
 * - fallback    {ReactNode} Optional custom fallback node
 * - onRetry     {function} Optional callback invoked on retry
 */
class FeatureErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const { featureName = "Feature", onError } = this.props;
    logger.error(`[FeatureErrorBoundary] ${featureName} crashed:`, error, errorInfo);

    // Persist a lightweight error entry to localStorage for diagnosis
    try {
      const entry = {
        feature: featureName,
        message: error?.toString(),
        timestamp: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem("eventra_feature_errors") || "[]");
      existing.unshift(entry);
      localStorage.setItem("eventra_feature_errors", JSON.stringify(existing.slice(0, 10)));
    } catch (_) {}

    if (typeof onError === "function") {
      try {
        onError(error, errorInfo);
      } catch (_) {}
    }
  }

  handleRetry = () => {
    if (this.state.retryCount >= 3) {
      window.location.reload();
      return;
    }

    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryCount: prev.retryCount + 1,
    }));

    if (this.props.onRetry) {
      try {
        this.props.onRetry();
      } catch (_) {}
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // If there is an error but a custom fallback is provided, use that
    if (this.props.fallback) {
      return this.props.fallback;
    }

    // Otherwise, render the default advanced error UI
    const { featureName = "Feature" } = this.props;
    const { retryCount } = this.state;
    const tooManyRetries = retryCount >= 3;

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"
      >
        <AlertTriangle
          className="mb-3 text-red-400"
          size={36}
          aria-hidden="true"
        />

        <h2 className="mb-1 text-base font-bold text-red-400">
          {featureName} failed to load
        </h2>

        <p className="mb-5 text-sm text-gray-400 max-w-xs leading-relaxed">
          {this.state.error?.message ||
            "This feature encountered an unexpected error."}
        </p>

        <button
          onClick={this.handleRetry}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label={
            tooManyRetries
              ? "Reload the full page"
              : `Retry loading ${featureName} (attempt ${retryCount + 1} of 3)`
          }
        >
          <RefreshCw size={14} aria-hidden="true" />
          {tooManyRetries ? "Reload Page" : "Retry"}
          {retryCount > 0 && !tooManyRetries && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
              {retryCount}/3
            </span>
          )}
        </button>
      </div>
    );
  }
}

export default FeatureErrorBoundary;