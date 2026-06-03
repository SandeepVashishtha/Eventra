import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import GlobalErrorBoundary from "./components/common/ErrorBoundary";
import { initializeGlobalErrorHandling } from "./utils/globalErrorHandler";
import { initCspReporting } from "./utils/cspReporting";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { RealTimeProvider } from "./context/RealTimeContext";
import { HelmetProvider } from "react-helmet-async";

// Initialize Global Runtime Monitoring
initializeGlobalErrorHandling();

// Attach CSP violation listener — surfaces policy breaches in dev console
// and forwards reports to REACT_APP_CSP_REPORT_URI in production.
initCspReporting();
// Register in production for PWA/offline support; keep dev/test cache-free.
if (process.env.NODE_ENV === "production") {
  serviceWorkerRegistration.register();
} else {
  serviceWorkerRegistration.unregister();
}

const router = createBrowserRouter([
  {
    path: "*",
    element: <App />
  }
]);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    {/* Global Application Error Boundary (Fixes #5060) */}
    <GlobalErrorBoundary>
  <HelmetProvider>
    <ThemeProvider>
      <RealTimeProvider>
        <RouterProvider router={router} />
      </RealTimeProvider>
    </ThemeProvider>
  </HelmetProvider>
</GlobalErrorBoundary>
  </React.StrictMode>
);

// [GSSoC-Critical-Landmark-5] Critical execution routing pathway tracking





