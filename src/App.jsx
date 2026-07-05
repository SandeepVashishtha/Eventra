import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";
import "./styles/reduced-motion.css";
import "./styles/print.css";
import { toast } from "react-toastify";
import ScrollRestoration from "./components/ScrollRestoration";
// Critical path - loaded eagerly (needed before first paint)
import Navbar from "./components/navbar/Navbar";
import OfflineBanner from "./components/common/OfflineBanner";
import OfflineConflictModal from "./components/common/OfflineConflictModal";
import UpdateAvailableBanner from "./components/common/UpdateAvailableBanner";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NotificationToastContainer from "./components/common/NotificationProvider";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";
// FIX (#7653): ThemeProvider moved here (inside AuthProvider) so useAuth()
// is available for cross-device theme sync via validateSession().
import { ThemeProvider } from "./context/ThemeContext";
import { MyEventsProvider } from "./context/MyEventsContext";
import { SessionRecoveryProvider } from "./context/SessionRecoveryContext";
import useOfflineSync from "./hooks/useOfflineSync";
import useLenis from "./hooks/useLenis";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import { useRoutePrefetch } from "./hooks/useRoutePrefetch";
import PageTransition from "./components/common/PageTransition";
import Breadcrumbs from "./components/common/Breadcrumbs";
import { getAuthRoutes, getProtectedRoutes } from "./components/routes/ProtectedRoutes";
import {
  AuthFormSkeleton,
  ExploreEventsSkeleton,
} from "./components/common/SkeletonLoaders";

// Route-level lazy splits - loaded only when route is visited
const Footer = lazy(() => import("./components/Layout/Footer"));
const Chatbot = lazy(() => import("./components/Chatbot"));
const AppRoutes = lazy(() => import("./components/AppRoutes"));
const SavedEventsPage = lazy(() => import("./Pages/SavedEventsPage"));
const EventRecommendation = lazy(() => import("./Pages/EventRecommendation/EventRecommendation"));
const ExploreEvents = lazy(() => import("./Pages/Events/EventsPage"));

// Non-critical UI - deferred after first paint
const FluidCursor = lazy(() => import("./components/visual/FluidCursor"));
const KeyboardShortcutsModal = lazy(() => import("./components/common/KeyboardShortcutsModal"));
const OnboardingChecklist = lazy(() => import("./components/user/OnboardingChecklist"));
const FeedbackButton = lazy(() => import("./components/FeedbackButton"));
const BackToTop = lazy(() => import("./components/common/BackToTop"));
const ReminderChecker = lazy(() => import("./components/reminders/ReminderChecker"));
const SessionRecovery = lazy(() => import("./components/SessionRecovery"));
const ThemeCustomizer = lazy(() => import("./components/Layout/ThemeCustomizer"));


const OfflineSyncManager = () => {
  useOfflineSync();
  return null;
};

function App() {
  const { t } = useTranslation();
  const location = useLocation();
  const isDashboardOrAdmin =
    location?.pathname === "/dashboard" || location?.pathname === "/admin";
  const isHomePage = location?.pathname === "/";
  const pageLoader = (
    <div className="flex items-center justify-center min-h-screen text-gray-500">
      {t("app.loading")}
    </div>
  );
  const [cursorEnabled, setCursorEnabled] = useState(() => {
    try {
      return localStorage.getItem("cursor") !== "off";
    } catch {
      return true; // fallback safe default
    }
  });
  const [showKeyboardModal, setShowKeyboardModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useLenis();
  useRoutePrefetch(); // Predictive route pre-loading

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
    const timer = setTimeout(() => {
      setShowChatbot(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
      toast.success(t("app.backOnline"), {
        position: "bottom-right",
        autoClose: 4000,
      });
    };
    const handleOffline = () => {
      toast.warning(t("app.offline"), {
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
  }, [t]);

  return (
    
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
        <NotificationProvider>
          <MyEventsProvider>
            <SessionRecoveryProvider>
              <NotificationToastContainer />
              <Suspense fallback={null}>
                <ReminderChecker />
              </Suspense>
              <OfflineSyncManager />
<ScrollRestoration />
              <div className="App">
                <ErrorBoundary level="section" label="Navigation Bar">
                  <Navbar cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />
                </ErrorBoundary>

                <OfflineBanner />
                <OfflineConflictModal />
                <UpdateAvailableBanner />

                <Suspense fallback={null}>
                  <KeyboardShortcutsModal
                    isOpen={showKeyboardModal}
                    onClose={() => setShowKeyboardModal(false)}
                  />
                </Suspense>

                <Suspense fallback={null}>
                  <OnboardingChecklist />
                </Suspense>

                <Breadcrumbs />

                <main
                  id="main-content"
                  className="relative z-10 min-h-[85vh] bg-bg text-text transition-colors duration-300"
                >
                  <PageTransition>
                    <ErrorBoundary>
                      <Routes location={location} key={location?.pathname || "default"}>
                        {/* /explore is a legacy alias for the Events page */}
                        <Route
                          path="/explore"
                          element={
                            <Suspense fallback={<ExploreEventsSkeleton />}>
                              <ExploreEvents />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/event-recommendation"
                          element={
                            <Suspense fallback={null}>
                              <EventRecommendation />
                            </Suspense>
                          }
                        />
                        {getAuthRoutes()}
                        {getProtectedRoutes()}
                        <Route
                          path="/event-recommendation"
                          element={<Suspense fallback={null}><EventRecommendation /></Suspense>}
                        />
                        <Route
                          path="/saved-events"
                          element={
                            <ProtectedRoute>
                              <Suspense fallback={<AuthFormSkeleton />}>
                                <SavedEventsPage />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        {/* All other routes (auth, dashboard, admin, profile, events, etc.)
                            are handled by AppRoutes → PublicRoutes / ProtectedRoutes */}
                        <Route
                          path="*"
                          element={
                            <Suspense fallback={pageLoader}>
                              <AppRoutes />
                            </Suspense>
                          }
                        />
                      </Routes>
                    </ErrorBoundary>
                  </PageTransition>
                </main>

                
                {showChatbot && (
                  <ErrorBoundary level="section" label="Chatbot Assist" silent>
                    <Suspense fallback={null}>
                      <Chatbot />
                    </Suspense>
                  </ErrorBoundary>
                )}

                <ErrorBoundary level="section" label="Footer">
                  <Suspense fallback={null}>
                    {!isDashboardOrAdmin && <Footer />}
                  </Suspense>
                </ErrorBoundary>

                <Suspense fallback={null}>
                  <BackToTop />
                </Suspense>
                <Suspense fallback={null}>
                  <FeedbackButton />
                </Suspense>
                <Suspense fallback={null}>
                  <ThemeCustomizer />
                </Suspense>
                <Suspense fallback={null}>
                  <SessionRecovery />
                </Suspense>

                {isDesktop && (
                  <ErrorBoundary level="section" label="Custom Cursor" silent>
                    <Suspense fallback={null}>
                      <FluidCursor enabled={cursorEnabled && !isHomePage} />
                    </Suspense>
                  </ErrorBoundary>
                )}

                
              </div>
              <UpdateAvailableBanner />
            </SessionRecoveryProvider>
          </MyEventsProvider>
        </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
