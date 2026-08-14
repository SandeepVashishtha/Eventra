import React from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import "./role-boundary.css";

export default class RoleGuardBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorType: null };
  }

  static getDerivedStateFromError(error) {
    if (error.message?.includes("unauthorized") || error.status === 403) {
      return { hasError: true, errorType: "FORBIDDEN" };
    }
    return { hasError: true, errorType: "UNKNOWN" };
  }

  componentDidCatch(error, errorInfo) {
    console.error("RoleGuardBoundary caught routing error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="role-boundary-container p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl max-w-md mx-auto my-12 text-center text-slate-850 dark:text-white">
          <div className="inline-flex p-3 bg-red-500/10 text-red-500 rounded-full mb-4">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-base font-bold mb-2">Access Restrained</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Your current account credentials do not possess the authorization access scopes required to view this panel interface.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-650"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
            <button
              onClick={() => window.location.replace("/")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
