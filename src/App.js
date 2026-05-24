import React, {
  useState,
  useEffect,
  lazy,
  Suspense,
} from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import "./App.css";

/* =========================
   Layout & Components
========================= */

import Navbar from "./components/Layout/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import FeedbackButton from "./components/FeedbackButton";
import FluidCursor from "./jhalak/FluidCursor";
import PageTransition from "./components/common/PageTransition";
import ReminderChecker from "./components/reminders/ReminderChecker";
import ScrollProgressBar from "./components/common/ScrollProgressBar";

/* =========================
   Pages
========================= */

import RegistrationPage from "./Pages/RegistrationPage";

/* =========================
   Context & Hooks
========================= */

import NotificationToastContainer from "./components/common/NotificationProvider";

import { NotificationProvider } from "./context/NotificationContext";

import { AuthProvider } from "./context/AuthContext";

import { MyEventsProvider } from "./context/MyEventsContext";

import { SessionRecoveryProvider } from "./context/SessionRecoveryContext";

import useOfflineSync from "./hooks/useOfflineSync";

import useLenis from "./hooks/useLenis";

/* =========================
   Lazy Loaded Components
========================= */

const Footer = lazy(() =>
  import("./components/Layout/Footer")
);

const Chatbot = lazy(() =>
  import("./components/Chatbot")
);

const AppRoutes = lazy(() =>
  import("./components/AppRoutes")
);

/* =========================
   Offline Sync Manager
========================= */

const OfflineSyncManager = () => {
  useOfflineSync();

  return null;
};

function App() {
  const [cursorEnabled, setCursorEnabled] =
    useState(
      localStorage.getItem("cursor") !== "off"
    );

  /* =========================
     Initialize Smooth Scroll
  ========================= */

  useLenis();

  /* =========================
     Toggle Cursor
  ========================= */

  const toggleCursor = () => {
    const newValue = !cursorEnabled;

    setCursorEnabled(newValue);

    localStorage.setItem(
      "cursor",
      newValue ? "on" : "off"
    );
  };

  /* =========================
     Listen For Cursor Changes
  ========================= */

  useEffect(() => {
    const handleCursorPreference = (
      event
    ) => {
      if (
        event?.detail?.cursorEnabled !==
        undefined
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

            {/* Toast Notifications */}
            <NotificationProvider />

            {/* Reminder System */}
            <ReminderChecker />

            {/* Notification Container */}
            <NotificationToastContainer />

            {/* Offline Sync */}
            <OfflineSyncManager />

            <Router>
              <div className="App">

                {/* =========================
                    Global Scroll Progress Bar
                ========================= */}

                <ScrollProgressBar />

                {/* =========================
                    Navbar
                ========================= */}

                <Navbar
                  cursorEnabled={cursorEnabled}
                  toggleCursor={toggleCursor}
                />

                {/* =========================
                    Main Content
                ========================= */}

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
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center min-h-screen">
                          Loading...
                        </div>
                      }
                    >
                      <Routes>

                        {/* Registration Route */}
                        <Route
                          path="/register/:id"
                          element={
                            <RegistrationPage />
                          }
                        />

                        {/* Main Routes */}
                        <Route
                          path="*"
                          element={<AppRoutes />}
                        />
                      </Routes>
                    </Suspense>
                  </PageTransition>
                </main>

                {/* =========================
                    Scroll To Top
                ========================= */}

                <ScrollToTop />

                {/* =========================
                    Lazy Loaded Components
                ========================= */}

                <Suspense fallback={null}>
                  <Chatbot />

                  <Footer />
                </Suspense>

                {/* =========================
                    Floating Feedback Button
                ========================= */}

                <FeedbackButton />

                {/* =========================
                    Fluid Cursor
                ========================= */}

                <FluidCursor
                  enabled={cursorEnabled}
                />
              </div>
            </Router>

          </SessionRecoveryProvider>
        </MyEventsProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;