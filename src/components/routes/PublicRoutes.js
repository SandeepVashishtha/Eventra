import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import PageLayout from '../Layout/PageLayout';
import SectionErrorBoundary from '../common/SectionErrorBoundary';
import ProtectedRoute from '../auth/ProtectedRoute';

// ─── Lazy-loaded page components ─────────────────────────────────────────────
// 🔥 FIX: Removed duplicate const declarations for all components
const OAuthCallback = lazy(() => import('../auth/OAuthCallback'));
const MockApiResponse = lazy(() => import('../MockApiResponse'));
const HomePage = lazy(() => import('../../Pages/Home/HomePage'));
const EventsPage = lazy(() => import('../../Pages/Events/EventsPage'));
const EventDetails = lazy(() => import('../../Pages/Events/EventDetails'));
const EventRegistration = lazy(() => import('../../Pages/Events/EventRegistration'));
const HackathonPage = lazy(() => import('../../Pages/Hackathons/HackathonPage'));
const HackathonDetailsPage = lazy(() => import('../../Pages/Hackathons/HackathonDetailsPage'));
const HackathonLifecycle = lazy(() => import('../../Pages/Hackathons/HackathonLifecycle'));
const ProjectsPage = lazy(() => import('../../Pages/Projects/ProjectsPage'));
const Contributors = lazy(() => import('../Contributors'));
const CommunityEvent = lazy(() => import('../CommunityEvent'));
const LeaderBoard = lazy(() => import('../../Pages/Leaderboard/Leaderboard'));
const ContributorGuide = lazy(() => import('../../Pages/Leaderboard/ContributorGuide'));
const AboutPage = lazy(() => import('../../Pages/About/AboutPage'));
const FAQPage = lazy(() => import('../../Pages/FAQ/FAQPage'));
const Terms = lazy(() => import('../../Pages/Terms'));
const Privacy = lazy(() => import('../../Pages/Privacy').then((module) => ({ default: module.Privacy })));
const ApiDocs = lazy(() => import('../../Pages/ApiDocs'));
const HelpCenter = lazy(() => import('../../Pages/HelpCenter'));
const ContactUs = lazy(() => import('../../Pages/Contact/ContactUs'));
const FeedbackPage = lazy(() => import('../../Pages/Feedback/FeedbackPage'));
const DocumentationPage = lazy(() => import('../../Pages/About/DocumentationPage'));
const MyCalendar = lazy(() => import('../../Pages/Calendar/MyCalendar'));

// ─── Auth-required page components ───────────────────────────────────────────
const BookmarkedEvents = lazy(() => import('../../Pages/Events/BookmarkedEvents'));
const RemindersPage = lazy(() => import('../../Pages/Events/RemindersPage'));
const EventAnalyticsDashboard = lazy(() => import('../../Pages/Events/EventAnalyticsDashboard'));
const FloorPlanDesignerPage = lazy(() => import('../../Pages/Events/FloorPlanDesignerPage'));
const SubmitProject = lazy(() => import('../../Pages/Projects/SubmitProject'));

export const getPublicRoutes = () => [
  // ── Fully public routes (no login required) ────────────────────────────────
  <Route key="/" path="/" element={<HomePage />} />,
  <Route key="/events" path="/events" element={<EventsPage />} />,
  <Route key="/event-details" path="/events/:eventId" element={<EventDetails />} />,
  <Route key="/oauth/callback" path="/oauth/callback" element={<OAuthCallback />} />,
  
  <Route
    key="/register"
    path="/events/:eventId/register"
    element={
      <ProtectedRoute>
        <EventRegistration />
      </ProtectedRoute>
    }
  />,
  <Route key="/hackathons" path="/hackathons" element={<HackathonPage />} />,
  <Route key="/hackathon-details" path="/hackathons/:hackathonId" element={<HackathonDetailsPage />} />,
  <Route key="/hackathons-lifecycle" path="/hackathons/:id/lifecycle" element={<HackathonLifecycle />} />,
  <Route key="/projects" path="/projects" element={<ProjectsPage />} />,
  
  <Route key="/api/hackathons" path="/api/hackathons" element={<MockApiResponse />} />,
  <Route key="/api/projects" path="/api/projects" element={<MockApiResponse />} />,
  <Route key="/api/contributors" path="/api/contributors" element={<MockApiResponse />} />,
  <Route key="/api/leaderboard" path="/api/leaderboard" element={<MockApiResponse />} />,

  // Mock API endpoints (demo/documentation purposes)
  <Route key="/mock-api/hackathons" path="/mock-api/hackathons" element={<MockApiResponse />} />,
  <Route key="/mock-api/projects" path="/mock-api/projects" element={<MockApiResponse />} />,
  <Route key="/mock-api/contributors" path="/mock-api/contributors" element={<MockApiResponse />} />,
  <Route key="/mock-api/leaderboard" path="/mock-api/leaderboard" element={<MockApiResponse />} />,

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
  // 🔥 FIX: Consolidated duplicate routes into this clean nested layout structure
  // 🔥 FIX: Added the missing comma after this block
  <Route key="page-layout" element={<PageLayout />}>
    <Route key="/contributors" path="/contributors" element={<Contributors />} />
    <Route key="/communityEvent" path="/communityEvent" element={<CommunityEvent />} />
    <Route key="/community-event-fallback" path="/community-event" element={<CommunityEvent />} />
    <Route 
      key="/leaderBoard" 
      path="/leaderBoard" 
      element={
        <ProtectedRoute>
          <SectionErrorBoundary label="Leaderboard"><LeaderBoard /></SectionErrorBoundary>
        </ProtectedRoute>
      } 
    />
    <Route 
      key="/leaderboard-fallback" 
      path="/leaderboard" 
      element={
        <ProtectedRoute>
          <SectionErrorBoundary label="Leaderboard"><LeaderBoard /></SectionErrorBoundary>
        </ProtectedRoute>
      } 
    />
    <Route key="/contributorguide" path="/contributorguide" element={<ProtectedRoute><ContributorGuide /></ProtectedRoute>} />
    <Route key="/contributor-guide-fallback" path="/contributor-guide" element={<ProtectedRoute><ContributorGuide /></ProtectedRoute>} />
    <Route key="/about" path="/about" element={<AboutPage />} />
    <Route key="/about-fallback" path="/about/*" element={<AboutPage />} />
    <Route key="/faq" path="/faq" element={<FAQPage />} />
    <Route key="/terms" path="/terms" element={<Terms />} />
    <Route key="/privacy" path="/privacy" element={<Privacy />} />
    <Route key="/apiDocs" path="/apiDocs" element={<ApiDocs />} />
    <Route key="/api-docs-fallback" path="/api-docs" element={<ApiDocs />} />
    <Route key="/helpcenter" path="/helpcenter" element={<HelpCenter />} />
    <Route key="/contact" path="/contact" element={<ContactUs />} />
    <Route key="/feedback" path="/feedback" element={<FeedbackPage />} />
    <Route key="/documentation" path="/documentation" element={<DocumentationPage />} />
    
    <Route 
      key="/analytics" 
      path="/analytics" 
      element={
        <ProtectedRoute>
          <EventAnalyticsDashboard />
        </ProtectedRoute>
      } 
    />
    <Route 
      key="/events/:eventId/floor-plan" 
      path="/events/:eventId/floor-plan" 
      element={
        <ProtectedRoute>
          <FloorPlanDesignerPage />
        </ProtectedRoute>
      } 
    />
    <Route 
      key="/submit-project" 
      path="/submit-project" 
      element={
        <ProtectedRoute>
          <SubmitProject />
        </ProtectedRoute>
      } 
    />
  </Route>
];