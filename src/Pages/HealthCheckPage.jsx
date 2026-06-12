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

const APP_VERSION =
  import.meta.env.VITE_APP_VERSION || import.meta.env.REACT_APP_VERSION || "1.0.0";
const BUILD_TIME =
  import.meta.env.VITE_APP_BUILD_TIME ||
  import.meta.env.REACT_APP_BUILD_TIME ||
  new Date().toISOString();

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
    environment: process.env.NODE_ENV || "production",
  };

  return (
    <main
      role="main"
      aria-label="Health check"
      className="flex min-h-screen items-center justify-center bg-white p-8 dark:bg-gray-950"
    >
      <div className="w-full max-w-lg">
        {/* Status indicator */}
        <div className="mb-6 flex items-center gap-3">
          <span
            className="inline-block h-4 w-4 animate-pulse rounded-full bg-green-500"
            aria-hidden="true"
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Operational</h1>
        </div>

        {/* Machine-readable JSON block (used by simple text-match monitors) */}
        <pre
          aria-label="Health check details"
          className="overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-6 font-mono text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
        >
          {JSON.stringify(info, null, 2)}
        </pre>

        <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          This page is intended for automated uptime monitoring only.
        </p>
      </div>
    </main>
  );
};

export default HealthCheckPage;
