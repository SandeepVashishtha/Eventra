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
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";
import { MyEventsProvider } from "./context/MyEventsContext";
import { SessionRecoveryProvider } from "./context/SessionRecoveryContext";
import useOfflineSync from "./hooks/useOfflineSync";
import useLenis from "./hooks/useLenis";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import { useRoutePrefetch } from "./hooks/useRoutePrefetch";
import PageTransition from "./components/common/PageTransition";
import Breadcrumbs from "./components/common/Breadcrumbs";
import { 
  AuthFormSkeleton, 
  ExploreEventsSkeleton, 
  EventDetailSkeleton,
  DashboardHomeSkeleton,
} from "./components/common/SkeletonLoaders";

// Route-level lazy splits - loaded only when route is visited
const Footer = lazy(() => import("./components/Layout/Footer"));
const Chatbot = lazy(() => import("./components/Chatbot"));
const AppRoutes = lazy(() => import("./components/AppRoutes"));
const EventRegistration = lazy(() => import("./Pages/Events/EventRegistration"));
const SavedEventsPage = lazy(() => import("./Pages/SavedEventsPage"));
const EventRecommendation = lazy(() => import("./Pages/EventRecommendation/EventRecommendation"));
const EventDetails = lazy(() => import("./Pages/Events/EventDetails"));
const ExploreEvents = lazy(() => import("./Pages/Events/ExploreEvents"));
const Login = lazy(() => import("./Pages/Auth/Login"));
const Signup = lazy(() => import("./Pages/Auth/Signup"));
const Profile = lazy(() => import("./Pages/User/Profile"));
const Dashboard = lazy(() => import("./Pages/Dashboard/Dashboard"));
const AdminPanel = lazy(() => import("./Pages/Admin/AdminPanel"));

// Non-critical UI - deferred after first paint
const FluidCursor = lazy(() => import("./components/visual/FluidCursor"));
const KeyboardShortcutsModal = lazy(() => import("./components/common/KeyboardShortcutsModal"));
const OnboardingChecklist = lazy(() => import("./components/user/OnboardingChecklist"));
const FeedbackButton = lazy(() => import("./components/FeedbackButton"));
const ScrollToTopButton = lazy(() => import("./components/ScrollToTopButton"));
const BackToTop = lazy(() => import("./components/common/BackToTop"));
const ReminderChecker = lazy(() => import("./components/reminders/ReminderChecker"));
const SessionRecovery = lazy(() => import("./components/SessionRecovery"));

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
      return localStorage.getItem("cursor") !== "off";
    } catch {
      return true; // fallback safe default
    }
  });
  const [showKeyboardModal, setShowKeyboardModal] = useState(false);

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

                <Breadcrumbs />

                <main
                  id="main-content"
                  className="relative z-10 min-h-[85vh] bg-bg text-text transition-colors duration-300"
                >
                  <PageTransition>
                    <ErrorBoundary>
                      <Routes location={location} key={location.pathname}>
                        <Route
                          path="/register/:id"
                          element={
                            <ProtectedRoute>
                              <Suspense fallback={<AuthFormSkeleton />}>
                                <EventRegistration />
                              </Suspense>
                            </ProtectedRoute>
                          }
                        />
                        <Route 
                          path="/explore" 
                          element={
                            <Suspense fallback={<ExploreEventsSkeleton />}>
                              <ExploreEvents />
                            </Suspense>
                          } 
                        />
                        <Route 
                          path="/events/:id" 
                          element={
                            <Suspense fallback={<EventDetailSkeleton />}>
                              <EventDetails />
                            </Suspense>
                          } 
                        />
                        <Route 
                          path="/login" 
                          element={
                            <Suspense fallback={<AuthFormSkeleton />}>
                              <Login />
                            </Suspense>
                          } 
                        />
                        <Route 
                          path="/signup" 
                          element={
                            <Suspense fallback={<AuthFormSkeleton />}>
                              <Signup />
                            </Suspense>
                          } 
                        />
                        <Route 
                          path="/dashboard" 
                          element={
                            <ProtectedRoute>
                              <Suspense fallback={<DashboardHomeSkeleton />}>
                                <Dashboard />
                              </Suspense>
                            </ProtectedRoute>
                          } 
                        />
                        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                        <Route path="/event-recommendation" element={<EventRecommendation />} />
                        <Route path="/saved-events" element={<SavedEventsPage />} />
                        <Route path="*" element={<AppRoutes />} />
                      </Routes>
                    </ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
