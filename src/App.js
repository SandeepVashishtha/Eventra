import { BrowserRouter as Router } from "react-router-dom";
import React, { useEffect, useState, lazy, Suspense } from "react";
import "./App.css";

// --------------- LAYOUT
import Navbar from "./components/Layout/Navbar";

import ScrollToTop from "./components/ScrollToTop";
import FeedbackButton from "./components/FeedbackButton";
import FluidCursor from "./jhalak/FluidCursor";
import PageTransition from "./components/common/PageTransition";

// --------------- CONTEXT & HOOKS
import NotificationProvider from "./components/common/NotificationProvider";
import { AuthProvider } from "./context/AuthContext";
import { MyEventsProvider } from "./context/MyEventsContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useModelContext } from "./hooks/useModelContext";
import useOfflineSync from "./hooks/useOfflineSync";
// Lazy load heavy components
const Footer = lazy(() => import("./components/Layout/Footer"));
const Chatbot = lazy(() => import("./components/Chatbot"));
const AppRoutes = lazy(() => import("./components/AppRoutes")); // This is Heaviestt

const OfflineSyncManager = () => {
  useOfflineSync();
  return null;
};

// Simple Loading Spinner component...
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="spinner">Loading Eventra...</div>
  </div>
);

function App() {
  const [cursorEnabled, setCursorEnabled] = useState(
    localStorage.getItem("cursor") !== "off",
  );

  useModelContext();

  const toggleCursor = () => {
    const newValue = !cursorEnabled;
    setCursorEnabled(newValue);
    localStorage.setItem("cursor", newValue ? "on" : "off");
  };

  useEffect(() => {
    const handleCursorPreference = (event) => {
      if (event?.detail?.cursorEnabled !== undefined) {
        setCursorEnabled(event.detail.cursorEnabled);
      }
    };

    window.addEventListener("cursorPreferenceChanged", handleCursorPreference);
    return () =>
      window.removeEventListener(
        "cursorPreferenceChanged",
        handleCursorPreference,
      );
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <MyEventsProvider>
          <NotificationProvider />
          <OfflineSyncManager />
          <Router>
            <div className="App">
              <Navbar
                cursorEnabled={cursorEnabled}
                toggleCursor={toggleCursor}
              />

              <main className="relative z-10 min-h-screen bg-white dark:bg-black">
                {/* Suspense wrap ... */}
                <Suspense fallback={<LoadingFallback />}>
                  <PageTransition>
                    <AppRoutes />
                  </PageTransition>
                </Suspense>
              </main>

              <ScrollToTop />

              {/* Chatbot and footer load... */}
              <Suspense fallback={null}>
                <Chatbot />
                <Footer />
              </Suspense>

              <FeedbackButton />
              <FluidCursor enabled={cursorEnabled} />
            </div>
          </Router>
        </MyEventsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
