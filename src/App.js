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
import { toast } from "react-toastify";

/* =========================
   Layout & Components
========================= */

import Navbar from "./components/Layout/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import FeedbackButton from "./components/FeedbackButton";
import SessionRecovery from "./components/SessionRecovery";
import FluidCursor from "./jhalak/FluidCursor";
import PageTransition from "./components/common/PageTransition";
import ReminderChecker from "./components/reminders/ReminderChecker";
import ScrollProgressBar from "./components/common/ScrollProgressBar";
import KeyboardShortcutsModal from "./components/common/KeyboardShortcutsModal";

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

import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";

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

  const [showKeyboardModal, setShowKeyboardModal] =
    useState(false);

  /* =========================
     Initialize Smooth Scroll
  ========================= */

  useLenis();

  /* =========================
     Keyboard Shortcuts
  ========================= */

  useKeyboardShortcuts({
    onOpenHelp: () =>
      setShowKeyboardModal(true),

    onCloseHelp: () =>
      setShowKeyboardModal(false),
  });

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

  /* =========================
     Online / Offline Toasts
  ========================= */

  useEffect(() => {
    const handleOnline = () => {
      toast.success(
        "Back online! Your connections have been restored and sync is complete.",
        {
          position: "bottom-right",
          autoClose: 4000,
        }
      );
    };

    const handleOffline = () => {
      toast.warning(
        "You are currently offline. Running in secure local offline caching mode.",
        {
          position: "bottom-right",
          autoClose: 5000,
        }
      );
    };

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
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

                {/* Global Scroll Progress Bar */}
                <ScrollProgressBar />

                {/* Navbar */}
                <Navbar
                  cursorEnabled={
                    cursorEnabled
                  }
                  toggleCursor={
                    toggleCursor
                  }
                />

                {/* Keyboard Shortcuts Modal */}
                <KeyboardShortcutsModal
                  isOpen={
                    showKeyboardModal
                  }
                  onClose={() =>
                    setShowKeyboardModal(
                      false
                    )
                  }
                />

                {/* Main Content */}
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

                        {/* Registration */}
                        <Route
                          path="/register/:id"
                          element={
                            <RegistrationPage />
                          }
                        />

                        {/* Main Routes */}
                        <Route
                          path="*"
                          element={
                            <AppRoutes />
                          }
                        />
                      </Routes>
                    </Suspense>
                  </PageTransition>
                </main>

                {/* Scroll To Top */}
                <ScrollToTop />

                {/* Lazy Components */}
                <Suspense fallback={null}>
                  <Footer />

                  <Chatbot />
                </Suspense>

                {/* Feedback Button */}
                <FeedbackButton />

                {/* Fluid Cursor */}
                <FluidCursor
                  enabled={
                    cursorEnabled
                  }
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