import React, { Component } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    this.setState({
      error,
      errorInfo
    });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <div>
              <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">
                Oops! Something went wrong.
              </h2>
              <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                We're sorry, but an unexpected error occurred. Our team has been notified.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </button>
              
              {/* If we are inside a Router, Link will work. But if ErrorBoundary wraps the Router itself, it might fail if Router crashed. 
                  However, usually we wrap the App content inside the Router. */}
              <a 
                href="/" 
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
              >
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </a>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 text-left">
                <details className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <summary className="font-medium outline-none">Error Details</summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-48 whitespace-pre-wrap text-red-600 dark:text-red-400">
                    {this.state.error.toString()}
                    <br />
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
