import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import PageLayout from '../Layout/PageLayout';

const MockApiResponse = lazy(() => import("../MockApiResponse"));

const HomePage = lazy(() => import("../../Pages/Home/HomePage"));
const EventDetails = lazy(() => import("../../Pages/Events/EventDetails"));
const EventRegistration = lazy(() => import("../../Pages/Events/EventRegistration"));
const BookmarkedEvents = lazy(() => import("../../Pages/Events/BookmarkedEvents"));
const RemindersPage = lazy(() => import("../../Pages/Events/RemindersPage"));
const HackathonLifecycle = lazy(() => import("../../Pages/Hackathons/HackathonLifecycle"));
const Contributors = lazy(() => import("../Contributors"));
const CommunityEvent = lazy(() => import("../CommunityEvent"));
const LeaderBoard = lazy(() => import("../../Pages/Leaderboard/Leaderboard"));
const ContributorGuide = lazy(() => import("../../Pages/Leaderboard/ContributorGuide"));
const AboutPage = lazy(() => import("../../Pages/About/AboutPage"));
const FAQPage = lazy(() => import("../../Pages/FAQ/FAQPage"));
const Terms = lazy(() => import("../../Pages/Terms"));
const Privacy = lazy(() =>
  import("../../Pages/Privacy").then((module) => ({
    default: module.Privacy,
  }))
);
const ApiDocs = lazy(() => import("../../Pages/ApiDocs"));
const HelpCenter = lazy(() => import("../../Pages/HelpCenter"));
const ContactUs = lazy(() => import("../../Pages/Contact/ContactUs"));
const FeedbackPage = lazy(() => import("../../Pages/Feedback/FeedbackPage"));
const FloorPlanDesignerPage = lazy(() => import("../../Pages/Events/FloorPlanDesignerPage"));
const DocumentationPage = lazy(() => import("../../Pages/About/DocumentationPage"));
const SubmitProject = lazy(() => import("../../Pages/Projects/SubmitProject"));

const EventsPage = lazy(() => import("../../Pages/Events/EventsPage"));
const HackathonPage = lazy(() => import("../../Pages/Hackathons/HackathonPage"));
const HackathonDetailsPage = lazy(() => import("../../Pages/Hackathons/HackathonDetailsPage"));
const ProjectsPage = lazy(() => import("../../Pages/Projects/ProjectsPage"));
const EventAnalyticsDashboard = lazy(() => import("../../Pages/Events/EventAnalyticsDashboard"));
const MyCalendar = lazy(() => import("../../Pages/Calendar/MyCalendar"));

export const getPublicRoutes = () => [
  <Route key="/" path="/" element={<HomePage />} />,
  <Route key="/events" path="/events" element={<EventsPage />} />,
  <Route key="/calendar" path="/calendar" element={<MyCalendar />} />,
  <Route key="/bookmarks" path="/bookmarks" element={<BookmarkedEvents />} />,
  <Route key="/reminders" path="/reminders" element={<RemindersPage />} />,
  <Route key="/event-details" path="/events/:eventId" element={<EventDetails />} />,
  <Route key="/register" path="/events/:eventId/register" element={<EventRegistration />} />,
  <Route key="/hackathons" path="/hackathons" element={<HackathonPage />} />,
  <Route key="/hackathon-details" path="/hackathons/:hackathonId" element={<HackathonDetailsPage />} />,
  <Route key="/hackathons-lifecycle" path="/hackathons/:id/lifecycle" element={<HackathonLifecycle />} />,
  <Route key="/projects" path="/projects" element={<ProjectsPage />} />,
  <Route key="/api/hackathons" path="/api/hackathons" element={<MockApiResponse />} />,
  <Route key="/api/projects" path="/api/projects" element={<MockApiResponse />} />,
  <Route key="/api/contributors" path="/api/contributors" element={<MockApiResponse />} />,
  <Route key="/api/leaderboard" path="/api/leaderboard" element={<MockApiResponse />} />,
  <Route key="page-layout" element={<PageLayout />}>
    <Route key="/contributors" path="/contributors" element={<Contributors />} />
    <Route key="/communityEvent" path="/communityEvent" element={<CommunityEvent />} />
    <Route key="/community-event" path="/community-event" element={<CommunityEvent />} />
    <Route key="/leaderBoard" path="/leaderBoard" element={<LeaderBoard />} />
    <Route key="/leaderboard" path="/leaderboard" element={<LeaderBoard />} />
    <Route key="/contributorguide" path="/contributorguide" element={<ContributorGuide />} />
    <Route key="/contributor-guide" path="/contributor-guide" element={<ContributorGuide />} />
    <Route key="/about" path="/about" element={<AboutPage />} />
    <Route key="/about-fallback" path="/about/*" element={<AboutPage />} />
    <Route key="/faq" path="/faq" element={<FAQPage />} />
    <Route key="/terms" path="/terms" element={<Terms />} />
    <Route key="/privacy" path="/privacy" element={<Privacy />} />
    <Route key="/apiDocs" path="/apiDocs" element={<ApiDocs />} />
    <Route key="/api-docs" path="/api-docs" element={<ApiDocs />} />
    <Route key="/helpcenter" path="/helpcenter" element={<HelpCenter />} />
    <Route key="/contact" path="/contact" element={<ContactUs />} />
    <Route key="/feedback" path="/feedback" element={<FeedbackPage />} />
    <Route key="/analytics" path="/analytics" element={<EventAnalyticsDashboard />} />
    <Route key="/events/:eventId/floor-plan" path="/events/:eventId/floor-plan" element={<FloorPlanDesignerPage />} />
    <Route key="/documentation" path="/documentation" element={<DocumentationPage />} />
    <Route key="/submit-project" path="/submit-project" element={<SubmitProject />} />
  </Route>
];
