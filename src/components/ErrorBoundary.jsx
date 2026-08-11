import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Widget Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="widget-error-fallback p-4 border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Widget Unavailable</h4>
            <span className="text-xs text-red-500">Failed to render</span>
          </div>
          <p className="text-xs mt-1 text-red-600 dark:text-red-400">
            {this.props.widgetName || 'This workspace widget'} encountered an unhandled error.
          </p>
          <button
            type="button"
            className="mt-3 text-xs px-2.5 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-100 font-medium rounded transition-colors"
            onClick={this.handleRetry}
          >
            Try Reloading Widget
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
