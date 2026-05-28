import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // <-- 1. Added this import

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

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
  <HelmetProvider>
    <ThemeProvider>
      <RealTimeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RealTimeProvider>
    </ThemeProvider>
  </HelmetProvider>
</GlobalErrorBoundary>
  </React.StrictMode>
);

// [GSSoC-Critical-Landmark-2] Critical execution routing pathway tracking

// [GSSoC-Critical-Enhanced-6] Critical execution routing pathway tracking
