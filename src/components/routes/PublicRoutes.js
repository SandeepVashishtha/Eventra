import React, { lazy } from 'react';
import { Route } from 'react-router-dom';
import PageLayout from '../Layout/PageLayout';
import ErrorBoundary from '../common/ErrorBoundary';

// --------------- PAGES
import HomePage from "../../Pages/Home/HomePage";
import EventDetails from "../../Pages/Events/EventDetails";
import EventRegistration from "../../Pages/Events/EventRegistration";
import BookmarkedEvents from "../../Pages/Events/BookmarkedEvents";
import RemindersPage from "../../Pages/Events/RemindersPage";
import HackathonLifecycle from "../../Pages/Hackathons/HackathonLifecycle";
import Contributors from "../Contributors";
import CommunityEvent from "../CommunityEvent";
import LeaderBoard from "../../Pages/Leaderboard/Leaderboard";
import ContributorGuide from "../../Pages/Leaderboard/ContributorGuide";
import AboutPage from "../../Pages/About/AboutPage";
import FAQPage from "../../Pages/FAQ/FAQPage";
import Terms from "../../Pages/Terms";
import { Privacy } from "../../Pages/Privacy";
import ApiDocs from "../../Pages/ApiDocs";
import HelpCenter from "../../Pages/HelpCenter";
import ContactUs from "../../Pages/Contact/ContactUs";
import FeedbackPage from "../../Pages/Feedback/FeedbackPage";
import FloorPlanDesignerPage from "../../Pages/Events/FloorPlanDesignerPage";
import DocumentationPage from "../../Pages/About/DocumentationPage";
import SubmitProject from "../../Pages/Projects/SubmitProject";
import MockApiResponse from "../MockApiResponse";

const EventsPage = lazy(() => import("../../Pages/Events/EventsPage"));
const HackathonPage = lazy(() => import("../../Pages/Hackathons/HackathonPage"));
const HackathonDetailsPage = lazy(() => import("../../Pages/Hackathons/HackathonDetailsPage"));
const ProjectsPage = lazy(() => import("../../Pages/Projects/ProjectsPage"));
const EventAnalyticsDashboard = lazy(() => import("../../Pages/Events/EventAnalyticsDashboard"));

const withModuleBoundary = (children, boundaryName) => (
  <ErrorBoundary
    variant="section"
    boundaryName={boundaryName}
    title={`${boundaryName} needs a reset`}
  >
    {children}
  </ErrorBoundary>
);

export const getPublicRoutes = () => [
  <Route key="/" path="/" element={<HomePage />} />,
  <Route key="/events" path="/events" element={withModuleBoundary(<EventsPage />, "Events explorer")} />,
  <Route key="/bookmarks" path="/bookmarks" element={withModuleBoundary(<BookmarkedEvents />, "Bookmarked events")} />,
  <Route key="/reminders" path="/reminders" element={withModuleBoundary(<RemindersPage />, "Event reminders")} />,
  <Route key="/event-details" path="/events/:eventId" element={withModuleBoundary(<EventDetails />, "Event details")} />,
  <Route key="/register" path="/events/:eventId/register" element={withModuleBoundary(<EventRegistration />, "Event registration")} />,
  <Route key="/hackathons" path="/hackathons" element={withModuleBoundary(<HackathonPage />, "Hackathon explorer")} />,
  <Route key="/hackathon-details" path="/hackathons/:hackathonId" element={withModuleBoundary(<HackathonDetailsPage />, "Hackathon details")} />,
  <Route key="/hackathons-lifecycle" path="/hackathons/:id/lifecycle" element={withModuleBoundary(<HackathonLifecycle />, "Hackathon lifecycle")} />,
  <Route key="/projects" path="/projects" element={withModuleBoundary(<ProjectsPage />, "Projects explorer")} />,
  <Route key="/api/hackathons" path="/api/hackathons" element={<MockApiResponse />} />,
  <Route key="/api/projects" path="/api/projects" element={<MockApiResponse />} />,
  <Route key="/api/contributors" path="/api/contributors" element={<MockApiResponse />} />,
  <Route key="/api/leaderboard" path="/api/leaderboard" element={<MockApiResponse />} />,
  <Route key="page-layout" element={<PageLayout />}>
    <Route key="/contributors" path="/contributors" element={<Contributors />} />
    <Route key="/communityEvent" path="/communityEvent" element={<CommunityEvent />} />
    <Route key="/leaderBoard" path="/leaderBoard" element={<LeaderBoard />} />
    <Route key="/contributorguide" path="/contributorguide" element={<ContributorGuide />} />
    <Route key="/about" path="/about" element={<AboutPage />} />
    <Route key="/about-fallback" path="/about/*" element={<AboutPage />} />
    <Route key="/faq" path="/faq" element={<FAQPage />} />
    <Route key="/terms" path="/terms" element={<Terms />} />
    <Route key="/privacy" path="/privacy" element={<Privacy />} />
    <Route key="/apiDocs" path="/apiDocs" element={<ApiDocs />} />
    <Route key="/helpcenter" path="/helpcenter" element={<HelpCenter />} />
    <Route key="/contact" path="/contact" element={<ContactUs />} />
    <Route key="/feedback" path="/feedback" element={withModuleBoundary(<FeedbackPage />, "Feedback center")} />
    <Route key="/analytics" path="/analytics" element={withModuleBoundary(<EventAnalyticsDashboard />, "Event analytics dashboard")} />
    <Route key="/events/:eventId/floor-plan" path="/events/:eventId/floor-plan" element={withModuleBoundary(<FloorPlanDesignerPage />, "Floor plan designer")} />
    <Route key="/documentation" path="/documentation" element={<DocumentationPage />} />
    <Route key="/submit-project" path="/submit-project" element={withModuleBoundary(<SubmitProject />, "Project submission")} />
  </Route>
];
