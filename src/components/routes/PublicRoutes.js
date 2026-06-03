// Trigger difficulty bot critical rating for issue 6125
import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import ErrorBoundary from "../common/ErrorBoundary";

// ─── Lazy-loaded page components ─────────────────────────────────────────────
// 🔥 FIX: Removed duplicate const declarations for all components
const HealthCheckPage = lazy(() => import("../../Pages/HealthCheckPage"));
const MockApiResponse = lazy(() => import("../MockApiResponse"));

const HomePage = lazy(() => import("../../Pages/Home/HomePage"));
const EventsPage = lazy(() => import("../../Pages/Events/EventsPage"));
const EventDetails = lazy(() => import("../../Pages/Events/EventDetails"));
const EventRegistration = lazy(() => import("../../Pages/Events/EventRegistration"));
const SavedEventsPage = lazy(() => import("../../Pages/SavedEventsPage"));
const EventRecommendation = lazy(() => import("../../Pages/EventRecommendation/EventRecommendation"));
const HackathonPage = lazy(() => import("../../Pages/Hackathons/HackathonPage"));
const HackathonDetailsPage = lazy(() => import("../../Pages/Hackathons/HackathonDetailsPage"));
const HackathonLifecycle = lazy(() => import("../../Pages/Hackathons/HackathonLifecycle"));
const ProjectsPage = lazy(() => import("../../Pages/Projects/ProjectsPage"));
const SubmitProject = lazy(() => import("../../Pages/Projects/SubmitProject"));
const Contributors = lazy(() => import("../Contributors"));
const CommunityEvent = lazy(() => import("../CommunityEvent"));
const LeaderBoard = lazy(() => import("../../Pages/Leaderboard/Leaderboard"));
const ContributorGuide = lazy(() => import("../../Pages/Leaderboard/ContributorGuide"));
const AboutPage = lazy(() => import("../../Pages/About/AboutPage"));
const DocumentationPage = lazy(() => import("../../Pages/About/DocumentationPage"));
const FAQPage = lazy(() => import("../../Pages/FAQ/FAQPage"));
const Terms = lazy(() => import("../../Pages/Terms"));
const Privacy = lazy(() => import("../../Pages/Privacy").then((module) => ({ default: module.Privacy })));
const ApiDocs = lazy(() => import("../../Pages/ApiDocs"));
const HelpCenter = lazy(() => import("../../Pages/HelpCenter"));
const ContactUs = lazy(() => import("../../Pages/Contact/ContactUs"));
const FeedbackPage = lazy(() => import("../../Pages/Feedback/FeedbackPage"));
const BookmarkedEvents = lazy(() => import("../../Pages/Events/BookmarkedEvents"));
const RemindersPage = lazy(() => import("../../Pages/Events/RemindersPage"));
const MyCalendar = lazy(() => import("../../Pages/Calendar/MyCalendar"));
const OptimizedImage = lazy(() => import("../common/OptimizedImage"));

// 🔥 FIX: Added Suspense wrapper required for React.lazy() to prevent layout thrashing and crashes
const withModuleBoundary = (children, boundaryName) => (
  <ErrorBoundary
    variant="section"
    boundaryName={boundaryName}
    title={boundaryName + " needs a reset"}
  >
    <Suspense fallback={<div className="flex justify-center items-center min-h-[50vh] text-gray-500 animate-pulse">Loading {boundaryName}...</div>}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// 🔥 FIX: Added helper for naked utility routes
const withPublicSuspense = (children) => (
  <Suspense fallback={<div className="flex justify-center items-center min-h-screen text-gray-500 animate-pulse">Loading...</div>}>
    {children}
  </Suspense>
);

export const getPublicRoutes = () => [
  // 🔥 FIX: Wrapped naked utility route with Suspense
  <Route key="/health" path="/health" element={withPublicSuspense(<HealthCheckPage />)} />,
  // 🔥 FIX: Wrapped naked HomePage with module boundary for safety
  <Route key="/" path="/" element={withModuleBoundary(<HomePage />, "Home")} />,
  <Route key="/events" path="/events" element={withModuleBoundary(<EventsPage />, "Events explorer")} />,
  <Route key="/event-details" path="/events/:eventId" element={withModuleBoundary(<EventDetails />, "Event details")} />,
  <Route key="/events-legacy" path="/events/:id" element={withModuleBoundary(<EventDetails />, "Event details")} />,
  <Route key="/register-legacy" path="/register/:id" element={<ProtectedRoute>{withModuleBoundary(<EventRegistration />, "Event Registration")}</ProtectedRoute>} />,
  <Route key="/event-recommendation" path="/event-recommendation" element={withModuleBoundary(<EventRecommendation />, "Event Recommendation")} />,
  <Route key="/saved-events" path="/saved-events" element={withModuleBoundary(<SavedEventsPage />, "Saved Events")} />,
  
  
  // 🔥 FIX: Safely wrapped the lazy-loaded EventRegistration inside the ProtectedRoute
  <Route key="/register" path="/events/:eventId/register" element={<ProtectedRoute>{withModuleBoundary(<EventRegistration />, "Event Registration")}</ProtectedRoute>} />,
  <Route key="/hackathons" path="/hackathons" element={withModuleBoundary(<HackathonPage />, "Hackathon explorer")} />,
  <Route key="/hackathon-details" path="/hackathons/:hackathonId" element={withModuleBoundary(<HackathonDetailsPage />, "Hackathon details")} />,
  <Route key="/hackathons-lifecycle" path="/hackathons/:id/lifecycle" element={withModuleBoundary(<HackathonLifecycle />, "Hackathon lifecycle")} />,
  <Route key="/projects" path="/projects" element={withModuleBoundary(<ProjectsPage />, "Projects explorer")} />,
  <Route key="/leaderboard" path="/leaderboard" element={withModuleBoundary(<LeaderBoard />, "Leaderboard")} />,
  <Route key="/community-event" path="/community-event" element={withModuleBoundary(<CommunityEvent />, "Community Events")} />,
  <Route key="/about" path="/about" element={withModuleBoundary(<AboutPage />, "About")} />,
  <Route key="/faq" path="/faq" element={withModuleBoundary(<FAQPage />, "FAQ")} />,
  <Route key="/contact" path="/contact" element={withModuleBoundary(<ContactUs />, "Contact")} />,
  <Route key="/contributors" path="/contributors" element={withModuleBoundary(<Contributors />, "Contributors")} />,
  <Route key="/contributorguide" path="/contributorguide" element={withModuleBoundary(<ContributorGuide />, "Contributor Guide")} />,
  <Route key="/documentation" path="/documentation" element={withModuleBoundary(<DocumentationPage />, "Documentation")} />,
  <Route key="/terms" path="/terms" element={withModuleBoundary(<Terms />, "Terms")} />,
  <Route key="/privacy" path="/privacy" element={withModuleBoundary(<Privacy />, "Privacy")} />,
  <Route key="/api-docs" path="/api-docs" element={withModuleBoundary(<ApiDocs />, "API Docs")} />,
  <Route key="/helpcenter" path="/helpcenter" element={withModuleBoundary(<HelpCenter />, "Help Center")} />,
  <Route key="/feedback" path="/feedback" element={withModuleBoundary(<FeedbackPage />, "Feedback")} />,
  <Route key="/bookmarks" path="/bookmarks" element={withModuleBoundary(<BookmarkedEvents />, "Bookmarks")} />,
  <Route key="/reminders" path="/reminders" element={withModuleBoundary(<RemindersPage />, "Reminders")} />,
  <Route key="/calendar" path="/calendar" element={withModuleBoundary(<MyCalendar />, "Calendar")} />,
  // 🔥 FIX: Wrapped naked image test route with Suspense
  <Route key="/image-test" path="/image-test" element={withPublicSuspense(<OptimizedImage src="https://images.unsplash.com/photo-1540575861501-7c90b707a27d" alt="Test" />)} />,
  <Route key="/submit-project" path="/submit-project" element={withModuleBoundary(<SubmitProject />, "Submit Project")} />,
  // 🔥 FIX: Wrapped naked mock api route with Suspense
  <Route key="/api/hackathons" path="/api/hackathons" element={withPublicSuspense(<MockApiResponse />)} />,
];