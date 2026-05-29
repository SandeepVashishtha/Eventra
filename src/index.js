import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import GlobalErrorBoundary from "./components/common/ErrorBoundary";
import { initializeGlobalErrorHandling } from "./utils/globalErrorHandler";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

// Initialize Global Runtime Monitoring
initializeGlobalErrorHandling();

// Unregister service worker early to avoid caching conflicts
serviceWorkerRegistration.unregister();

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    {/* Move ThemeProvider to the outside */}
    <ThemeProvider>
      {/* Wrap App inside the GlobalErrorBoundary */}
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
);


