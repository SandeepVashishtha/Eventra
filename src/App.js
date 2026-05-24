import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { toast } from "react-toastify";

/* =========================
   Layout & Components
========================= */
import Navbar from "./components/Layout/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import FeedbackButton from "./components/FeedbackButton";
import SessionRecovery from "./components/SessionRecovery"; // CLEANED UP: Left this single import intact
import FluidCursor from "./jhalak/FluidCursor";
import PageTransition from "./components/common/PageTransition";
import ReminderChecker from "./components/reminders/ReminderChecker";
import ScrollProgressBar from "./components/common/ScrollProgressBar";
import KeyboardShortcutsModal from "./components/common/KeyboardShortcutsModal";
import ThemeCustomizerDrawer from "./components/common/ThemeCustomizerDrawer";

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
import { RealTimeProvider } from "./context/RealTimeContext";

import useOfflineSync from "./hooks/useOfflineSync";
import useLenis from "./hooks/useLenis";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
// REMOVED: The duplicate SessionRecovery import from line 45 has been stripped out.

/* =========================
   Lazy Loaded Components
========================= */
const Footer = lazy(() => import("./components/Layout/Footer"));
const Chatbot = lazy(() => import("./components/Chatbot"));
const AppRoutes = lazy(() => import("./components/AppRoutes"));

/* =========================
   Offline Sync Manager
========================= */
const OfflineSyncManager = () => {
  useOfflineSync();
  return null;
};

const KeyboardShortcutManager = ({ setShowKeyboardModal }) => {
  useKeyboardShortcuts({
    onOpenHelp: () => setShowKeyboardModal(true),
    onCloseHelp: () => setShowKeyboardModal(false),
  });
  return null;
};

function App() {
  const [cursorEnabled, setCursorEnabled] = useState(
    localStorage.getItem("cursor") !== "off"
  );
  const [showKeyboardModal, setShowKeyboardModal] = useState(false);

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
    localStorage.setItem("cursor", newValue ? "on" : "off");
  };

  /* =========================
     Listen For Cursor Changes
  ========================= */
  useEffect(() => {
    const handleCursorPreference = (event) => {
      if (event?.detail?.cursorEnabled !== undefined) {
        setCursorEnabled(event.detail.cursorEnabled);
      }
    };

    window.addEventListener("cursorPreferenceChanged", handleCursorPreference);

    return () => {
      window.removeEventListener("cursorPreferenceChanged", handleCursorPreference);
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

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <MyEventsProvider>
          {/* FIXED: Added opening <RealTimeProvider> tag here to match the nested structural architecture */}
          <RealTimeProvider>
            <SessionRecoveryProvider>
              <ReminderChecker />
              <NotificationToastContainer />
              <OfflineSyncManager />

              <Router>
                <KeyboardShortcutManager setShowKeyboardModal={setShowKeyboardModal} />

                <div className="App">
                  <ScrollProgressBar />
                  <Navbar cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />

                  <KeyboardShortcutsModal
                    isOpen={showKeyboardModal}
                    onClose={() => setShowKeyboardModal(false)}
                  />

                  <ThemeCustomizerDrawer />

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
                          <Route path="/register/:id" element={<RegistrationPage />} />
                          <Route path="/*" element={<AppRoutes />} />
                        </Routes>
                      </Suspense>
                    </PageTransition>
                  </main>

                  <ScrollToTop />

                  <Suspense fallback={null}>
                    <Footer />
                    <Chatbot />
                  </Suspense>

                  <FeedbackButton />
                  <SessionRecovery />
                  <FluidCursor enabled={cursorEnabled} />
                </div>
              </Router>
            </SessionRecoveryProvider>
          </RealTimeProvider>
        </MyEventsProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;