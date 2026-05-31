import { lazy } from "react";
import { Route } from "react-router-dom";
import PageLayout from "../Layout/PageLayout";
import ProtectedRoute from "../auth/ProtectedRoute";
import ErrorBoundary from "../common/ErrorBoundary";

// ─── Lazy-loaded page components ─────────────────────────────────────────────
// 🔥 FIX: Removed duplicate const declarations for all components
const HealthCheckPage = lazy(() => import("../../Pages/HealthCheckPage"));
const CertificateVerifier = lazy(() => import("../../Pages/CertificateVerification/CertificateVerifier"));
const MockApiResponse = lazy(() => import("../MockApiResponse"));

const HomePage = lazy(() => import("../../Pages/Home/HomePage"));
const EventsPage = lazy(() => import("../../Pages/Events/EventsPage"));
const EventDetails = lazy(() => import("../../Pages/Events/EventDetails"));
const EventRegistration = lazy(() => import("../../Pages/Events/EventRegistration"));
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
const EventAnalyticsDashboard = lazy(() => import("../../Pages/Events/EventAnalyticsDashboard"));
const FloorPlanDesignerPage = lazy(() => import("../../Pages/Events/FloorPlanDesignerPage"));
const VirtualVenueWalkthrough = lazy(() => import("../../Pages/Events/VirtualVenueWalkthrough"));
const MyCalendar = lazy(() => import("../../Pages/Calendar/MyCalendar"));

const withModuleBoundary = (children, boundaryName) => (
  <ErrorBoundary
    variant="section"
    boundaryName={boundaryName}
    title={boundaryName + " needs a reset"}
  >
    {children}
  </ErrorBoundary>
);

export const getPublicRoutes = () => [
  <Route key="/health" path="/health" element={<HealthCheckPage />} />,
  <Route key="/" path="/" element={<HomePage />} />,
  <Route key="/events" path="/events" element={withModuleBoundary(<EventsPage />, "Events explorer")} />,
  <Route key="/event-details" path="/events/:eventId" element={withModuleBoundary(<EventDetails />, "Event details")} />,
  
  
  <Route key="/register" path="/events/:eventId/register" element={<ProtectedRoute><EventRegistration /></ProtectedRoute>} />,
  <Route key="/hackathons" path="/hackathons" element={withModuleBoundary(<HackathonPage />, "Hackathon explorer")} />,
  <Route key="/hackathon-details" path="/hackathons/:hackathonId" element={withModuleBoundary(<HackathonDetailsPage />, "Hackathon details")} />,
  <Route key="/hackathons-lifecycle" path="/hackathons/:id/lifecycle" element={withModuleBoundary(<HackathonLifecycle />, "Hackathon lifecycle")} />,
  <Route key="/projects" path="/projects" element={withModuleBoundary(<ProjectsPage />, "Projects explorer")} />,

  <Route key="/api/hackathons" path="/api/hackathons" element={<MockApiResponse />} />,];