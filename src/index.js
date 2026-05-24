import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MotionConfig } from "framer-motion";
import { Toaster } from "react-hot-toast";

import "./index.css";

import App from "./App";

import { ThemeProvider } from "./context/ThemeContext";

import GlobalErrorBoundary from "./components/common/ErrorBoundary";

import { initializeGlobalErrorHandling } from "./utils/globalErrorHandler";

// Initialize Global Runtime Monitoring
initializeGlobalErrorHandling();

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <GoogleOAuthProvider
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
          >
            <App />

            {/* Global Toast Notification System */}
            <Toaster
              position="top-right"
              reverseOrder={false}
              gutter={12}
              toastOptions={{
                duration: 3000,

                success: {
                  style: {
                    background: "#111827",
                    color: "#ffffff",
                    border: "1px solid #22c55e",
                    borderRadius: "14px",
                    padding: "14px 18px",
                    fontSize: "14px",
                    fontWeight: "500",
                  },
                },

                error: {
                  style: {
                    background: "#111827",
                    color: "#ffffff",
                    border: "1px solid #ef4444",
                    borderRadius: "14px",
                    padding: "14px 18px",
                    fontSize: "14px",
                    fontWeight: "500",
                  },
                },
              }}
            />
          </GoogleOAuthProvider>
        </ThemeProvider>
      </MotionConfig>
    </GlobalErrorBoundary>
  </React.StrictMode>
);