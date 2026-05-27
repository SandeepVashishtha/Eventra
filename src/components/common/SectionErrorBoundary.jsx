import React from "react";
import { logError } from "../../utils/errorLogger";

/**
 * SectionErrorBoundary
 *
 * Wraps an isolated section of the UI (Navbar, Footer, Chatbot, etc.).
 * On error it shows a compact inline fallback instead of crashing the whole app.
 *
 * Props:
 *  - label      {string}   Human-readable name shown in the fallback UI
 *  - fallback   {function} Optional render-prop (error, reset) => ReactNode
 *  - silent     {boolean}  If true, renders nothing on error (for non-critical widgets)
 */
class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
    };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const { label = "Unknown Section" } = this.props;
    logError(error, errorInfo, { section: label });
  }

  handleReset() {
    if (this.state.retryCount >= 3) {
      // Too many retries — hard reload
      window.location.reload();
      return;
    }
    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryCount: prev.retryCount + 1,
    }));
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { label = "This section", fallback, silent } = this.props;
    const { error, retryCount } = this.state;

    // Silent mode — non-critical widget (e.g. FluidCursor, Chatbot)
    if (silent) return null;

    // Custom fallback render-prop
    if (fallback) {
      return fallback(error, this.handleReset);
    }

    // Default inline fallback
    return (
      <div
        role="alert"
        aria-live="assertive"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
          padding: "32px 24px",
          textAlign: "center",
          borderRadius: "16px",
          border: "1px solid rgba(239,68,68,0.2)",
          background: "rgba(239,68,68,0.04)",
          margin: "16px",
        }}
      >
        {/* Warning icon */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          style={{ color: "#f87171", marginBottom: "12px" }}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v4m0 4h.01M10.293 3.757L2.05 18.243A2 2 0 003.757 21h16.486a2 2 0 001.708-3.05L13.708 3.757a2 2 0 00-3.414 0z"
          />
        </svg>

        <h2
          style={{
            fontSize: "1rem",
            fontWeight: "700",
            color: "#ef4444",
            marginBottom: "6px",
          }}
        >
          {label} failed to load
        </h2>

        <p
          style={{
            fontSize: "0.85rem",
            color: "#94a3b8",
            marginBottom: "20px",
            maxWidth: "300px",
            lineHeight: "1.5",
          }}
        >
          {error?.message || "An unexpected error occurred in this section."}
        </p>

        <button
          onClick={this.handleReset}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 20px",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "0.875rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "transform 0.15s ease, opacity 0.15s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          aria-label={
            retryCount >= 3
              ? "Reload the full page"
              : `Try loading ${label} again (attempt ${retryCount + 1})`
          }
        >
          {/* Refresh icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {retryCount >= 3 ? "Reload Page" : "Try Again"}
        </button>
      </div>
    );
  }
}

export default SectionErrorBoundary;
