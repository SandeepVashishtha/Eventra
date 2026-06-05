/**
 * HealthCheckPage
 *
 * Renders a minimal health-check response for uptime monitors.
 * The page is accessible at /health and returns HTTP 200 (the default
 * for any successfully rendered React page).
 *
 * Monitors can poll this URL to verify:
 *   - The frontend bundle was served (JS executed)
 *   - The React tree rendered without a fatal error
 *   - Basic app metadata (version, build time)
 */

import { useEffect } from "react";

const APP_VERSION = import.meta.env.REACT_APP_VERSION || "1.0.0";
const BUILD_TIME = import.meta.env.REACT_APP_BUILD_TIME || new Date().toISOString();

const HealthCheckPage = () => {
  // Update the document title so monitor screenshots are unambiguous
  useEffect(() => {
    const prev = document.title;
    document.title = "Eventra — Health Check";
    return () => {
      document.title = prev;
    };
  }, []);

  const info = {
    status: "ok",
    app: "Eventra",
    version: APP_VERSION,
    buildTime: BUILD_TIME,
    timestamp: new Date().toISOString(),
    environment: import.meta.env.NODE_ENV || "production",
  };

  return (
    <main
      role="main"
      aria-label="Health check"
      className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 p-8"
    >
      <div className="max-w-lg w-full">
        {/* Status indicator */}
        <div className="flex items-center gap-3 mb-6">
          <span
            className="inline-block w-4 h-4 rounded-full bg-green-500 animate-pulse"
            aria-hidden="true"
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            System Operational
          </h1>
        </div>

        {/* Machine-readable JSON block (used by simple text-match monitors) */}
        <pre
          aria-label="Health check details"
          className="rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-auto"
        >
          {JSON.stringify(info, null, 2)}
        </pre>

        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
          This page is intended for automated uptime monitoring only.
        </p>
      </div>
    </main>
  );
};

export default HealthCheckPage;
