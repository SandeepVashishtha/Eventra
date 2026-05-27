import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Captured by ErrorBoundary:", error, errorInfo);
  }

  handleResetCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  handleCopyReport = () => {
    const { error, errorInfo } = this.state;
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      error: error ? error.toString() : "No error message",
      stack: error?.stack || "No stack trace available",
      componentStack: errorInfo ? errorInfo.componentStack : "No component stack trace",
      localStorage: { ...localStorage },
    };

    const textReport = `--- EVENTRA DIAGNOSTIC REPORT ---
Timestamp: ${report.timestamp}
URL: ${report.url}
User Agent: ${report.userAgent}

Error:
${report.error}

Stack Trace:
${report.stack}

Component Stack:
${report.componentStack}

Local Storage Snapshot:
${JSON.stringify(report.localStorage, null, 2)}
---------------------------------`;

    navigator.clipboard.writeText(textReport).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }).catch(err => {
      console.error("Failed to copy report", err);
    });
  };

  render() {
    if (this.state.hasError) {
      const timestamp = new Date().toLocaleString();
      const url = typeof window !== "undefined" ? window.location.href : "";
      const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
      const lsSnapshot = typeof localStorage !== "undefined" ? JSON.stringify(localStorage, null, 2) : "{}";

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-4 text-white">
          {/* Decorative glowing background elements */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Glassmorphic Card */}
          <div className="max-w-2xl w-full bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
            
            {/* Header Icon + Title */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30 animate-pulse">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-350 bg-clip-text text-transparent">
                Something Went Wrong
              </h1>
              <p className="text-slate-300 max-w-md text-sm sm:text-base">
                An unexpected runtime error has occurred. We have captured a diagnostic report to help troubleshoot the issue.
              </p>
            </div>

            {/* Error Message */}
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-left">
              <span className="text-xs uppercase tracking-wider font-bold text-rose-400 block mb-1">Error Message</span>
              <p className="font-mono text-sm break-all font-semibold text-rose-250">
                {this.state.error ? this.state.error.toString() : "Unknown runtime error"}
              </p>
            </div>

            {/* Metadata (Glass Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-left">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-slate-400 block mb-1 font-semibold">Current URL</span>
                <span className="font-mono text-slate-200 break-all">{url}</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-slate-400 block mb-1 font-semibold">Timestamp</span>
                <span className="font-mono text-slate-200">{timestamp}</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:col-span-2">
                <span className="text-slate-400 block mb-1 font-semibold">User Agent</span>
                <span className="font-mono text-slate-200 break-all">{userAgent}</span>
              </div>
            </div>

            {/* Collapsible Details Sections */}
            <div className="space-y-3">
              {/* Stack Trace */}
              <details className="group border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all duration-300">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition font-semibold text-sm select-none">
                  <span>View Stack Trace</span>
                  <svg className="w-4 h-4 transform group-open:rotate-180 transition-transform text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="p-4 pt-0 border-t border-white/5">
                  <pre className="font-mono text-xs text-left overflow-x-auto max-h-48 p-3 bg-black/40 rounded-xl text-slate-300 select-all whitespace-pre-wrap break-all leading-relaxed">
                    {this.state.error?.stack || "No JavaScript stack trace available."}
                    {this.state.errorInfo?.componentStack && `\n\nComponent Stack:\n${this.state.errorInfo.componentStack}`}
                  </pre>
                </div>
              </details>

              {/* localStorage Snapshot */}
              <details className="group border border-white/10 rounded-2xl overflow-hidden bg-white/5 transition-all duration-300">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition font-semibold text-sm select-none">
                  <span>View LocalStorage Snapshot</span>
                  <svg className="w-4 h-4 transform group-open:rotate-180 transition-transform text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="p-4 pt-0 border-t border-white/5">
                  <pre className="font-mono text-xs text-left overflow-x-auto max-h-48 p-3 bg-black/40 rounded-xl text-slate-300 select-all whitespace-pre-wrap break-all leading-relaxed">
                    {lsSnapshot}
                  </pre>
                </div>
              </details>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-sm font-semibold transition"
              >
                Reload App
              </button>
              <button
                onClick={this.handleResetCache}
                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-500 rounded-xl text-sm font-semibold transition shadow-md shadow-rose-900/30"
              >
                Reset Cache & Reload
              </button>
              <button
                onClick={this.handleCopyReport}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 border border-indigo-500/30 ${
                  this.state.copied
                    ? "bg-emerald-600/90 text-white border-emerald-500/30"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30"
                }`}
              >
                {this.state.copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy Diagnostic Report
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;