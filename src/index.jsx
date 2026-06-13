import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import * as Sentry from "@sentry/react";

import "./index.css";
import "./i18n/i18n";
import App from "./App";
import TranslationProvider from "./components/TranslationProvider";
import { ThemeProvider } from "./context/ThemeContext";
import GlobalErrorBoundary from "./components/common/ErrorBoundary";
import { initializeGlobalErrorHandling } from "./utils/globalErrorHandler";
import { initCspReporting } from "./utils/cspReporting";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { RealTimeProvider } from "./context/RealTimeContext";
import { HelmetProvider } from "react-helmet-async";

// Initialize Sentry
Sentry.init({
  dsn: "https://0f5776d794dcf89120ca6b00a5923f93@o4511372299075584.ingest.de.sentry.io/4511556614946896",
});

// Initialize Global Runtime Monitoring
initializeGlobalErrorHandling();


// Attach CSP violation listener — surfaces policy breaches in dev console
// and forwards reports to REACT_APP_CSP_REPORT_URI in production.
initCspReporting();
// Register in production for PWA/offline support; keep dev/test cache-free.
if (import.meta.env.PROD) {
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

// Mount the React application to the DOM
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    {/* Global Application Error Boundary (Fixes #5060) */}
    <GlobalErrorBoundary>
  <HelmetProvider>
    <TranslationProvider>
      <ThemeProvider>
        <RealTimeProvider>
          <RouterProvider router={router} />
        </RealTimeProvider>
      </ThemeProvider>
    </TranslationProvider>
  </HelmetProvider>
</GlobalErrorBoundary>
  </React.StrictMode>
);

