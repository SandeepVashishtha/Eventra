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

// Layout & Components
import Navbar from "./components/Layout/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import FeedbackButton from "./components/FeedbackButton";
import FluidCursor from "./jhalak/FluidCursor";
import PageTransition from "./components/common/PageTransition";
import ReminderChecker from "./components/reminders/ReminderChecker";

// Pages
import RegistrationPage from "./Pages/RegistrationPage";

// Context & Hooks
import NotificationProvider from "./components/common/NotificationProvider";
import { AuthProvider } from "./context/AuthContext";
import { MyEventsProvider } from "./context/MyEventsContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SessionRecoveryProvider } from "./context/SessionRecoveryContext";
import useOfflineSync from "./hooks/useOfflineSync";

// Lazy Loaded Components
const Footer = lazy(() =>
  import("./components/Layout/Footer")
);

const Chatbot = lazy(() =>
  import("./components/Chatbot")
);

const SessionRecovery = lazy(() =>
  import("./components/SessionRecovery")
);

const AppRoutes = lazy(() =>
  import("./components/AppRoutes")
);

// Offline Sync
const OfflineSyncManager = () => {
  useOfflineSync();
  return null;
};

function App() {
  const [cursorEnabled, setCursorEnabled] =
    useState(
      localStorage.getItem("cursor") !== "off"
    );

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
    <ThemeProvider>
      <AuthProvider>
        <MyEventsProvider>
          <SessionRecoveryProvider>
            <NotificationProvider />
            <ReminderChecker />

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
                  min-h-screen
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
                      <div
                        className="
                          flex
                          min-h-screen
                          items-center
                          justify-center
                          bg-white
                          dark:bg-slate-950
                          text-black
                          dark:text-white
                          text-xl
                          font-semibold
                        "
                      >
                        Loading...
                      </div>
                    }
                  >
                    <Routes>
                      <Route
                        path="/register/:id"
                        element={<RegistrationPage />}
                      />

                      <Route
                        path="*"
                        element={<AppRoutes />}
                      />
                    </Routes>

                    <Chatbot />
                    <Footer />
                  </Suspense>
                </PageTransition>
              </main>

              <ScrollToTop />
              <FeedbackButton />

              <SessionRecovery />

              <FluidCursor
                enabled={cursorEnabled}
              />
            </div>
          </Router>
          </SessionRecoveryProvider>
        </MyEventsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
