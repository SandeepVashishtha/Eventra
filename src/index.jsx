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

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);

serviceWorkerRegistration.unregister();
