import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import "./styles/reduced-motion.css";
import "./styles/print.css";
import { toast } from "react-toastify";

// Critical path - loaded eagerly (needed before first paint)
import Navbar from "./components/navbar/Navbar";
import OfflineBanner from "./components/common/OfflineBanner";
import OfflineConflictModal from "./components/common/OfflineConflictModal";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/common/ErrorBoundary";
import SectionErrorBoundary from "./components/common/SectionErrorBoundary";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NotificationToastContainer from "./components/common/NotificationProvider";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";
import { MyEventsProvider } from "./context/MyEventsContext";
import { SessionRecoveryProvider } from "./context/SessionRecoveryContext";
import useOfflineSync from "./hooks/useOfflineSync";
import useLenis from "./hooks/useLenis";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import { safeGetItem, safeSetItem } from "./utils/safeStorage.js";


// Route-level lazy splits - loaded only when route is visited
const Footer = lazy(() => import("./components/Layout/Footer"));
const Chatbot = lazy(() => import("./components/Chatbot"));
const AppRoutes = lazy(() => import("./components/AppRoutes"));
const EventRegistration = lazy(() => import("./Pages/Events/EventRegistration"));
const SavedEventsPage = lazy(() => import("./Pages/SavedEventsPage"));
const EventRecommendation = lazy(() => import("./Pages/EventRecommendation/EventRecommendation"));

// Non-critical UI - deferred after first paint
const FluidCursor = lazy(() => import("./components/visual/FluidCursor"));
const ThemeCustomizerDrawer = lazy(() => import("./components/common/ThemeCustomizerDrawer"));
const KeyboardShortcutsModal = lazy(() => import("./components/common/KeyboardShortcutsModal"));
const OnboardingChecklist = lazy(() => import("./components/user/OnboardingChecklist"));
const FeedbackButton = lazy(() => import("./components/FeedbackButton"));
const ScrollToTopButton = lazy(() => import("./components/ScrollToTopButton"));
const BackToTop = lazy(() => import("./components/common/BackToTop"));
const ReminderChecker = lazy(() => import("./components/reminders/ReminderChecker"));
const SessionRecovery = lazy(() => import("./components/SessionRecovery"));
const PageTransition = lazy(() => import("./components/common/PageTransition"));

const OfflineSyncManager = () => {
  useOfflineSync();
  return null;
};

function App() {
  const location = useLocation();
  const isDashboardOrAdmin =
    location.pathname === "/dashboard" || location.pathname === "/admin";
  const pageLoader = (
    <div className="flex items-center justify-center min-h-screen text-gray-500">
      Loading page...
    </div>
  );
  const [cursorEnabled, setCursorEnabled] = useState(() => {
    try {
      return safeGetItem("cursor") !== "off";
    } catch {
      return true; // fallback safe default
    }
  });
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
      safeSetItem("cursor", newValue ? "on" : "off");
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
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <MyEventsProvider>
              <SessionRecoveryProvider>
                <NotificationToastContainer />
                <Suspense fallback={null}>
                  <ReminderChecker />
                </Suspense>
                <OfflineSyncManager />

                <div className="App">
                  <SectionErrorBoundary label="Navigation Bar">
                    <Navbar cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />
                  </SectionErrorBoundary>

                  <OfflineBanner />
                  <OfflineConflictModal />

                  <Suspense fallback={null}>
                    <KeyboardShortcutsModal
                      isOpen={showKeyboardModal}
                      onClose={() => setShowKeyboardModal(false)}
                    />
                  </Suspense>

                  <Suspense fallback={null}>
                    <OnboardingChecklist />
                  </Suspense>

                  <main
                    id="main-content"
                    className="relative z-10 min-h-[85vh] bg-white dark:bg-slate-950 text-black dark:text-white transition-colors duration-300"
                  >
                    <Suspense fallback={pageLoader}>
                      <PageTransition>
                        <ErrorBoundary>
                          <Routes>
                            <Route
                              path="/register/:id"
                              element={
                                <ProtectedRoute>
                                  <EventRegistration />
                                </ProtectedRoute>
                              }
                            />
                            <Route path="/event-recommendation" element={<EventRecommendation />} />
                            <Route path="/saved-events" element={<SavedEventsPage />} />
                            <Route path="*" element={<AppRoutes />} />
                          </Routes>
                        </ErrorBoundary>
                      </PageTransition>
                    </Suspense>
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

                  <Suspense fallback={null}>
                    <ScrollToTopButton />
                  </Suspense>
                  {/* Enhanced back-to-top with progress ring - appears at 400px */}
                  <Suspense fallback={null}>
                    <BackToTop />
                  </Suspense>
                  <Suspense fallback={null}>
                    <FeedbackButton />
                  </Suspense>
                  <Suspense fallback={null}>
                    <ThemeCustomizerDrawer />
                  </Suspense>
                  <Suspense fallback={null}>
                    <SessionRecovery />
                  </Suspense>

                  <SectionErrorBoundary label="Custom Cursor" silent>
                    <Suspense fallback={null}>
                      <FluidCursor enabled={cursorEnabled} />
                    </Suspense>
                  </SectionErrorBoundary>
                </div>
              </SessionRecoveryProvider>
            </MyEventsProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
