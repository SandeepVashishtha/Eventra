import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import PageLayout from '../Layout/PageLayout';

// Auth guard — redirects unauthenticated users to /login
import ProtectedRoute from '../auth/ProtectedRoute';

// ─── Lazy-loaded page components ─────────────────────────────────────────────
// All components are loaded on-demand to keep the initial bundle small.
const MockApiResponse = lazy(() => import('../MockApiResponse'));
const HomePage = lazy(() => import('../../Pages/Home/HomePage'));
const EventDetails = lazy(() => import('../../Pages/Events/EventDetails'));
const EventRegistration = lazy(() => import('../../Pages/Events/EventRegistration'));
const HackathonLifecycle = lazy(() => import('../../Pages/Hackathons/HackathonLifecycle'));
const Contributors = lazy(() => import('../Contributors'));
const CommunityEvent = lazy(() => import('../CommunityEvent'));
const LeaderBoard = lazy(() => import('../../Pages/Leaderboard/Leaderboard'));
const ContributorGuide = lazy(() => import('../../Pages/Leaderboard/ContributorGuide'));
const AboutPage = lazy(() => import('../../Pages/About/AboutPage'));
const FAQPage = lazy(() => import('../../Pages/FAQ/FAQPage'));
const Terms = lazy(() => import('../../Pages/Terms'));
const Privacy = lazy(() =>
  import('../../Pages/Privacy').then((module) => ({ default: module.Privacy }))
);
const ApiDocs = lazy(() => import('../../Pages/ApiDocs'));
const HelpCenter = lazy(() => import('../../Pages/HelpCenter'));
const ContactUs = lazy(() => import('../../Pages/Contact/ContactUs'));
const FeedbackPage = lazy(() => import('../../Pages/Feedback/FeedbackPage'));
const DocumentationPage = lazy(() => import('../../Pages/About/DocumentationPage'));
const EventsPage = lazy(() => import('../../Pages/Events/EventsPage'));
const HackathonPage = lazy(() => import('../../Pages/Hackathons/HackathonPage'));
const HackathonDetailsPage = lazy(() => import('../../Pages/Hackathons/HackathonDetailsPage'));
const ProjectsPage = lazy(() => import('../../Pages/Projects/ProjectsPage'));
const MyCalendar = lazy(() => import('../../Pages/Calendar/MyCalendar'));

// ─── Auth-required page components ───────────────────────────────────────────
// These are imported separately to make the intent explicit: they MUST be
// wrapped with <ProtectedRoute> — do not move them to the public list above.
const BookmarkedEvents = lazy(() => import('../../Pages/Events/BookmarkedEvents'));
const RemindersPage = lazy(() => import('../../Pages/Events/RemindersPage'));
const EventAnalyticsDashboard = lazy(() => import('../../Pages/Events/EventAnalyticsDashboard'));
const FloorPlanDesignerPage = lazy(() => import('../../Pages/Events/FloorPlanDesignerPage'));
const SubmitProject = lazy(() => import('../../Pages/Projects/SubmitProject'));

/**
 * getPublicRoutes
 *
 * Returns the array of <Route> elements that make up the application's
 * publicly accessible URL surface.
 *
 * SECURITY RULE
 * -------------
 * Routes that expose user-specific data (bookmarks, reminders, calendar,
 * personal analytics) or allow writing data on behalf of a user
 * (submit-project, floor-plan editor) MUST be wrapped with <ProtectedRoute>.
 * ProtectedRoute redirects unauthenticated visitors to /login and restores
 * them to the intended page after sign-in via React Router's `state.from`.
 *
 * Do NOT add authenticated-only pages to the bare public route list; use
 * ProtectedRoutes.js for that, or wrap individually here as shown below.
 */
export const getPublicRoutes = () => [
  // ── Fully public routes (no login required) ────────────────────────────────
  <Route key="/" path="/" element={<HomePage />} />,
  <Route key="/events" path="/events" element={<EventsPage />} />,
  <Route key="/event-details" path="/events/:eventId" element={<EventDetails />} />,
  <Route key="/register" path="/events/:eventId/register" element={<EventRegistration />} />,
  <Route key="/hackathons" path="/hackathons" element={<HackathonPage />} />,
  <Route key="/hackathon-details" path="/hackathons/:hackathonId" element={<HackathonDetailsPage />} />,
  <Route key="/hackathons-lifecycle" path="/hackathons/:id/lifecycle" element={<HackathonLifecycle />} />,
  <Route key="/projects" path="/projects" element={<ProjectsPage />} />,

  // Mock API endpoints (demo/documentation purposes)
  <Route key="/api/hackathons"  path="/api/hackathons"  element={<MockApiResponse />} />,
  <Route key="/api/projects"    path="/api/projects"    element={<MockApiResponse />} />,
  <Route key="/api/contributors" path="/api/contributors" element={<MockApiResponse />} />,
  <Route key="/api/leaderboard" path="/api/leaderboard" element={<MockApiResponse />} />,

  // ── Auth-protected routes (login required) ─────────────────────────────────
  <Route
    key="/bookmarks"
    path="/bookmarks"
    element={
      <ProtectedRoute>
        <BookmarkedEvents />
      </ProtectedRoute>
    }
   />,

  <Route
    key="/reminders"
    path="/reminders"
    element={
      <ProtectedRoute>
        <RemindersPage />
      </ProtectedRoute>
    }
   />,

  <Route
    key="/calendar"
    path="/calendar"
    element={
      <ProtectedRoute>
        <MyCalendar />
      </ProtectedRoute>
    }
   />,

  // ── PageLayout-wrapped routes ──────────────────────────────────────────────
  <Route key="/contributors" path="/contributors" element={<PageLayout><Contributors /></PageLayout>} />,
  <Route key="/communityEvent" path="/communityEvent" element={<PageLayout><CommunityEvent /></PageLayout>} />,
  <Route key="/community-event" path="/community-event" element={<PageLayout><CommunityEvent /></PageLayout>} />,
  <Route key="/leaderBoard" path="/leaderBoard" element={<PageLayout><LeaderBoard /></PageLayout>} />,
  <Route key="/leaderboard" path="/leaderboard" element={<PageLayout><LeaderBoard /></PageLayout>} />,
  <Route key="/contributorguide" path="/contributorguide" element={<PageLayout><ContributorGuide /></PageLayout>} />,
  <Route key="/contributor-guide" path="/contributor-guide" element={<PageLayout><ContributorGuide /></PageLayout>} />,
  <Route key="/about" path="/about" element={<PageLayout><AboutPage /></PageLayout>} />,
  <Route key="/about-fallback" path="/about/*" element={<PageLayout><AboutPage /></PageLayout>} />,
  <Route key="/faq" path="/faq" element={<PageLayout><FAQPage /></PageLayout>} />,
  <Route key="/terms" path="/terms" element={<PageLayout><Terms /></PageLayout>} />,
  <Route key="/privacy" path="/privacy" element={<PageLayout><Privacy /></PageLayout>} />,
  <Route key="/apiDocs" path="/apiDocs" element={<PageLayout><ApiDocs /></PageLayout>} />,
  <Route key="/api-docs" path="/api-docs" element={<PageLayout><ApiDocs /></PageLayout>} />,
  <Route key="/helpcenter" path="/helpcenter" element={<PageLayout><HelpCenter /></PageLayout>} />,
  <Route key="/contact" path="/contact" element={<PageLayout><ContactUs /></PageLayout>} />,
  <Route key="/feedback" path="/feedback" element={<PageLayout><FeedbackPage /></PageLayout>} />,
  <Route key="/documentation" path="/documentation" element={<PageLayout><DocumentationPage /></PageLayout>} />,

  <Route
    key="/analytics"
    path="/analytics"
    element={
      <PageLayout>
        <ProtectedRoute>
          <EventAnalyticsDashboard />
        </ProtectedRoute>
      </PageLayout>
    }
   />,

  <Route
    key="/events/:eventId/floor-plan"
    path="/events/:eventId/floor-plan"
    element={
      <PageLayout>
        <ProtectedRoute>
          <FloorPlanDesignerPage />
        </ProtectedRoute>
      </PageLayout>
    }
   />,

  <Route
    key="/submit-project"
    path="/submit-project"
    element={
      <PageLayout>
        <ProtectedRoute>
          <SubmitProject />
        </ProtectedRoute>
      </PageLayout>
    }
   />
];
