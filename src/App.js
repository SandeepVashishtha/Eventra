import React, { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import "./styles/reduced-motion.css";
import "./styles/print.css";
import { toast } from "react-toastify";

import OfflinePage from "./components/common/OfflinePage";
import OnlineBanner from "./components/common/OnlineBanner";
import ScrollToTopButton from "./components/ScrollToTopButton";
import Navbar from "./components/navbar/Navbar";
import OfflineBanner from "./components/common/OfflineBanner";
import OfflineConflictModal from "./components/common/OfflineConflictModal";
import ScrollToTop from "./components/ScrollToTop";
import FeedbackButton from "./components/FeedbackButton";
import FluidCursor from "./components/visual/FluidCursor";
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
import EventRecommendation from "./Pages/EventRecommendation/EventRecommendation";

const Footer = lazy(() => import("./components/Layout/Footer"));
const Chatbot = lazy(() => import("./components/Chatbot"));
const AppRoutes = lazy(() => import("./components/AppRoutes"));
const EventRegistration = lazy(() => import("./Pages/Events/EventRegistration"));

const OfflineSyncManager = () => {
  useOfflineSync();
  return null;
};

const PageFallback = () => (
  <div className="flex min-h-svh items-center justify-center safe-area-x">
    Loading...
  </div>
);

function App() {
  const location = useLocation();
  const isDashboardOrAdmin =
    location.pathname === "/dashboard" || location.pathname === "/admin";
  const [cursorEnabled, setCursorEnabled] = useState(
    localStorage.getItem("cursor") !== "off",
  );
  const [showKeyboardModal, setShowKeyboardModal] = useState(false);
const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

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
    } catch {
      // Ignore storage failures in private browsing or restricted contexts.
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

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      toast.success("Back online! Your connections have been restored.", {
        position: "bottom-right",
        autoClose: 4000,
      });
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You are currently offline.", {
        position: "bottom-right",
        autoClose: 5000,
      });
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

  useEffect(() => {
    localStorage.setItem("lastRoute", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    try {
      const events = JSON.parse(localStorage.getItem('myEvents') || '[]');
      if (events.length > 0) {
        localStorage.setItem('cachedEvents', JSON.stringify(events));
      }
    } catch {
      // ignore
    }
  }, [location.pathname]);

  if (!isOnline) {
    return <OfflinePage />;
  }

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
                 {wasOffline && <OnlineBanner />}
                <a href="#main-content" className="skip-to-content">
                  Skip to main content
                </a>

                <SectionErrorBoundary label="Navigation Bar">
                  <Navbar cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />
                </SectionErrorBoundary>

                <OfflineBanner />
                <OfflineConflictModal />
                <KeyboardShortcutsModal
                  isOpen={showKeyboardModal}
                  onClose={() => setShowKeyboardModal(false)}
                />
                <OnboardingChecklist />

                <main
                  id="main-content"
                  tabIndex={-1}
                  className="
                    relative z-10 min-h-[85vh]
                    bg-white dark:bg-slate-950
                    text-black dark:text-white
                    transition-colors duration-300
                  "
                >
                  <PageTransition>
                    <SectionErrorBoundary label="Page Content">
                      <Suspense fallback={<PageFallback />}>
                        <Routes>
                          <Route
                            path="/register/:id"
                            element={
                              <ProtectedRoute>
                                <EventRegistration />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/event-recommendation"
                            element={<EventRecommendation />}
                          />
                          <Route path="*" element={<AppRoutes />} />
                        </Routes>
                      </Suspense>
                    </SectionErrorBoundary>
                  </PageTransition>
                </main>

                <ScrollToTop />

                <SectionErrorBoundary label="Chatbot Assist" silent>
                  <Suspense fallback={null}>
                    <Chatbot />
                  </Suspense>
                </SectionErrorBoundary>

                <SectionErrorBoundary label="Footer">
                  <Suspense fallback={null}>
                    {!isDashboardOrAdmin && <Footer />}
                  </Suspense>
                </SectionErrorBoundary>

                <ScrollToTopButton />
                <FeedbackButton />
                <ThemeCustomizerDrawer />
                <SessionRecovery />
                <SectionErrorBoundary label="Custom Cursor" silent>
                  <FluidCursor enabled={cursorEnabled} />
                </SectionErrorBoundary>
              </div>
            </SessionRecoveryProvider>
          </MyEventsProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
