import React from "react";
import { logError } from "../../utils/errorLogger";

class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logError(error, errorInfo);
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      const { label = "This section" } = this.props;

      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20"
        >
          <svg
            className="w-10 h-10 text-red-400 dark:text-red-500 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v4m0 4h.01M10.293 3.757L2.05 18.243A2 2 0 003.757 21h16.486a2 2 0 001.708-3.05L13.708 3.757a2 2 0 00-3.414 0z"
            />
          </svg>
          <h2 className="text-base font-semibold text-red-700 dark:text-red-400 mb-1">
            {label} failed to load
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xs">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
