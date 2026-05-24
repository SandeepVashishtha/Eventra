import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";

import App from "./App";

import { MotionConfig } from "framer-motion";

import { ThemeProvider } from "./context/ThemeContext";
import GlobalErrorBoundary from "./components/common/ErrorBoundary";
import { initializeGlobalErrorHandling } from "./utils/globalErrorHandler";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

// Initialize Global Runtime Monitoring
initializeGlobalErrorHandling();

const root =
  ReactDOM.createRoot(
    document.getElementById(
      "root"
    )
  );

root.render(
  <GlobalErrorBoundary>
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </ThemeProvider>
    </MotionConfig>
  </GlobalErrorBoundary>
);

// Register the PWA service worker for robust offline performance and caching.
serviceWorkerRegistration.register();
