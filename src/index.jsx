import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/index.js';
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
if (import.meta.env.MODE === "production") {
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
    <I18nextProvider i18n={i18n}>  
      <GlobalErrorBoundary>
        <HelmetProvider>
          <ThemeProvider>
            <RealTimeProvider>
              <RouterProvider router={router} />
            </RealTimeProvider>
          </ThemeProvider>
        </HelmetProvider>
      </GlobalErrorBoundary>
    </I18nextProvider> 
  </React.StrictMode>
);

// [GSSoC-Critical-Landmark-5] Critical execution routing pathway tracking





