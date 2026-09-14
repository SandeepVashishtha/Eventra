import React from "react";
import { AlertTriangle } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Widget Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const title = this.props.fallbackTitle || "Widget Error";

      return (
        <div className="bg-red-50/50 border border-red-200 rounded-3xl p-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-[#center] mx-auto p-2">
            <AlertTriangle className="w-full h-full" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-red-900">{title}</h4>
            <p className="text-xs text-red-600 font-medium max-w-xs mx-auto">
              This widget encountered an error and failed to render, but the rest of the workspace remains active.
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Retry Widget
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;