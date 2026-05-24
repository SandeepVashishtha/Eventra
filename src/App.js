import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Layout & Components
import Navbar from "./components/Layout/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import FeedbackButton from "./components/FeedbackButton";
import FluidCursor from "./jhalak/FluidCursor";
import PageTransition from "./components/common/PageTransition";
import ReminderChecker from "./components/reminders/ReminderChecker";

// Context & Hooks
import NotificationToastContainer from "./components/common/NotificationProvider";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";
import { MyEventsProvider } from "./context/MyEventsContext";
import { SessionRecoveryProvider } from "./context/SessionRecoveryContext";
import useOfflineSync from "./hooks/useOfflineSync";
import useLenis from "./hooks/useLenis";

// Lazy load heavy components
const Footer = lazy(() => import("./components/Layout/Footer"));
const Chatbot = lazy(() => import("./components/Chatbot"));
const AppRoutes = lazy(() => import("./components/AppRoutes"));
const RegistrationPage = lazy(() => import("./Pages/RegistrationPage"));
const NotFoundPage = lazy(() => import("./Pages/NotFoundPage"));

const OfflineSyncManager = () => {
  useOfflineSync();
  return null;
};

function App() {
  const [cursorEnabled, setCursorEnabled] =
    useState(
      localStorage.getItem("cursor") !== "off"
    );

  // Initialize Lenis smooth scrolling
  useLenis();

  // Toggle Cursor
  const toggleCursor = () => {
    const newValue = !cursorEnabled;

    setCursorEnabled(newValue);

    localStorage.setItem(
      "cursor",
      newValue ? "on" : "off"
    );
  };

  // Listen For Cursor Preference Changes
  useEffect(() => {
    const handleCursorPreference = (event) => {
      if (
        event?.detail?.cursorEnabled !== undefined
      ) {
        setCursorEnabled(
          event.detail.cursorEnabled
        );
      }
    };

    window.addEventListener(
      "cursorPreferenceChanged",
      handleCursorPreference
    );

    return () => {
      window.removeEventListener(
        "cursorPreferenceChanged",
        handleCursorPreference
      );
    };
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <MyEventsProvider>
          <SessionRecoveryProvider>
            <NotificationProvider />
            <ReminderChecker />
            <NotificationToastContainer />

            <OfflineSyncManager />

            <Router>
              <div className="App">
                <Navbar
                  cursorEnabled={cursorEnabled}
                  toggleCursor={toggleCursor}
                />

              <main
                className="
                  relative
                  z-10
                min-h-[85vh]
                  bg-white
                  dark:bg-slate-950
                  text-black
                  dark:text-white
                  transition-colors
                  duration-300
                "
              >
                <PageTransition>
                  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                    <Routes>
                      <Route path="/register/:id" element={<RegistrationPage />} />
                      <Route path="/*" element={<AppRoutes />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                </PageTransition>
              </main>

                <ScrollToTop />
                <Suspense fallback={null}>
                  <Chatbot />
                  <Footer />
                </Suspense>
                <FeedbackButton />
                <FluidCursor enabled={cursorEnabled} />
              </div>
            </Router>
          </SessionRecoveryProvider>
        </MyEventsProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
