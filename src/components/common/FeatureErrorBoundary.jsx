import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { logger } from "../../utils/logger";

class FeatureErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, errorInfo) {
    logger.error("Feature Error Boundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    // 1. Reset the local error state
    this.setState({ hasError: false });
    
    // 2. Trigger a manual re-fetch/recalculation callback if provided by the parent
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <AlertTriangle className="mb-3 text-red-400" size={36} />

          <h2 className="mb-2 text-lg font-bold text-red-400">Something went wrong</h2>

          <p className="mb-4 text-sm text-gray-400">This feature failed to load properly.</p>

          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            <RefreshCw size={16} />
            Tap to Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FeatureErrorBoundary;