import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // <-- 1. Added this import

import "./index.css";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import GlobalErrorBoundary from "./components/common/ErrorBoundary";
import { initializeGlobalErrorHandling } from "./utils/globalErrorHandler";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { RealTimeProvider } from "./context/RealTimeContext";

// Initialize Global Runtime Monitoring
initializeGlobalErrorHandling();

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <ThemeProvider>
        <RealTimeProvider>
        <BrowserRouter>
          {" "}
          {/* <-- 2. Wrapped the App here */}
          <App />
        </BrowserRouter>
        </RealTimeProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  </React.StrictMode>
);

serviceWorkerRegistration.unregister();
