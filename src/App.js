import EventRecommendation from "./Pages/EventRecommendation/EventRecommendation";
import React, { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom"; 
import "./App.css";
import "./styles/reduced-motion.css";
import "./styles/print.css";
import { toast } from "react-toastify";
import BackToTopButton from "./components/common/BackToTopButton";
import Navbar from "./components/Layout/Navbar";
import OfflineBanner from "./components/common/OfflineBanner";
import OfflineConflictModal from "./components/common/OfflineConflictModal";
import ScrollToTop from "./components/ScrollToTop";
import FeedbackButton from "./components/FeedbackButton";
import FluidCursor from "./jhalak/FluidCursor";
import PageTransition from "./components/common/PageTransition";
import ReminderChecker from "./components/reminders/ReminderChecker";
import KeyboardShortcutsModal from "./components/common/KeyboardShortcutsModal";
import ThemeCustomizerDrawer from "./components/common/ThemeCustomizerDrawer";
import SessionRecovery from "./components/SessionRecovery";
import ErrorBoundary from "./components/common/ErrorBoundary";
import OnboardingChecklist from "./components/user/OnboardingChecklist";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import NotificationToastContainer from "./components/common/NotificationProvider";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";
import { MyEventsProvider } from "./context/MyEventsContext";
import { SessionRecoveryProvider } from "./context/SessionRecoveryContext";
import SectionErrorBoundary from "./components/common/SectionErrorBoundary";

import useOfflineSync from "./hooks/useOfflineSync";
import useLenis from "./hooks/useLenis";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";

const Footer = lazy(() => import("./components/Layout/Footer"));
const Chatbot = lazy(() => import("./components/Chatbot"));
const AppRoutes = lazy(() => import("./components/AppRoutes"));
const RegistrationPage = lazy(() => import("./Pages/RegistrationPage"));

const OfflineSyncManager = () => {
  useOfflineSync();
  return null;
};

function App() {
  const location = useLocation();
  const isDashboardOrAdmin = location.pathname === "/dashboard" || location.pathname === "/admin";
  const [cursorEnabled, setCursorEnabled] = useState(localStorage.getItem("cursor") !== "off");
  const [showKeyboardModal, setShowKeyboardModal] = useState(false);

  useLenis();

  useKeyboardShortcuts({
    onOpenHelp: () => setShowKeyboardModal(true),
    onCloseHelp: () => setShowKeyboardModal(false),
    isOpen: showKeyboardModal,
  });

  const toggleCursor = () => {
    const newValue = !cursorEnabled;
    setCursorEnabled(newValue);
    try {
      localStorage.setItem("cursor", newValue ? "on" : "off");
    } catch (error) {
    }
  };

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

  // Handle Online/Offline Status Notification
  useEffect(() => {
    const handleOnline = () => {
      toast.success("Back online! Your connections have been restored and sync is complete.", {
        position: "bottom-right",
        autoClose: 4000,
      });
    };

    const handleOffline = () => {
      toast.warning("You are currently offline. Running in secure local offline caching mode.", {
        position: "bottom-right",
        autoClose: 5000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check on mount
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
      <NotificationProvider>
        <MyEventsProvider>
          <SessionRecoveryProvider>
            <ReminderChecker />
            <NotificationToastContainer />
            <OfflineSyncManager />

            <div className="App">
              <Navbar cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />
              <OfflineBanner />
              <OfflineConflictModal />
              <KeyboardShortcutsModal
                isOpen={showKeyboardModal}
                onClose={() => setShowKeyboardModal(false)}
              />
              <OnboardingChecklist />

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
                  <SectionErrorBoundary label="Page Content">
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center min-h-screen">
                          Loading...
                        </div>
                      }
                    >
                      <Routes>
                        {/* Registration writes user-specific data and must stay behind auth. */}
                        <Route
                          path="/register/:id"
                          element={
                            <ProtectedRoute>
                              <RegistrationPage />
                            </ProtectedRoute>
                          }
                        />

                        <Route
                          path="/event-recommendation"
                          element={<EventRecommendation />}
                        />

                        <Route
                          path="*"
                          element={<AppRoutes />}
                        />
                      </Routes>
                    </Suspense>
                  </SectionErrorBoundary>
                </PageTransition>
              </main>

              <ScrollToTop />
              
              {/* FIXED THE TAG BELOW: Added the missing '>' closure */}
              <Suspense fallback={null}>
                <Chatbot />
                {!isDashboardOrAdmin && <Footer />}
              </Suspense>

              <BackToTopButton />
              <FeedbackButton />
              <ThemeCustomizerDrawer />
              <SessionRecovery />
              <FluidCursor enabled={cursorEnabled} />
            </div>
          </SessionRecoveryProvider>
        </MyEventsProvider>
      </NotificationProvider>
    </AuthProvider>
  </ErrorBoundary>
  );
}

export default App;
