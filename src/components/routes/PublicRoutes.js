import React from 'react';
import { Route } from 'react-router-dom';
import PageLayout from '../Layout/PageLayout';

// --------------- PAGES
const HomePage = React.lazy(() => import("../../Pages/Home/HomePage"));
const EventsPage = React.lazy(() => import("../../Pages/Events/EventsPage"));
const EventRegistration = React.lazy(() => import("../../Pages/Events/EventRegistration"));
const HackathonPage = React.lazy(() => import("../../Pages/Hackathons/HackathonPage"));
const ProjectsPage = React.lazy(() => import("../../Pages/Projects/ProjectsPage"));
const Contributors = React.lazy(() => import("../Contributors"));
const CommunityEvent = React.lazy(() => import("../CommunityEvent"));
const LeaderBoard = React.lazy(() => import("../../Pages/Leaderboard/Leaderboard"));
const ContributorGuide = React.lazy(() => import("../../Pages/Leaderboard/ContributorGuide"));
const AboutPage = React.lazy(() => import("../../Pages/About/AboutPage"));
const FAQPage = React.lazy(() => import("../../Pages/FAQ/FAQPage"));
const Terms = React.lazy(() => import("../../Pages/Terms"));
const Privacy = React.lazy(() => import("../../Pages/Privacy").then(module => ({ default: module.Privacy })));
const ApiDocs = React.lazy(() => import("../../Pages/ApiDocs"));
const HelpCenter = React.lazy(() => import("../../Pages/HelpCenter"));
const ContactUs = React.lazy(() => import("../../Pages/Contact/ContactUs"));
const FeedbackPage = React.lazy(() => import("../../Pages/Feedback/FeedbackPage"));
const EventAnalyticsDashboard = React.lazy(() => import("../../Pages/Events/EventAnalyticsDashboard"));
const DocumentationPage = React.lazy(() => import("../../Pages/About/DocumentationPage"));
const SubmitProject = React.lazy(() => import("../../Pages/Projects/SubmitProject"));

export const getPublicRoutes = () => [
  <Route key="/" path="/" element={<HomePage />} />,
  <Route key="/events" path="/events" element={<EventsPage />} />,
  <Route key="/register" path="/events/:eventId/register" element={<EventRegistration />} />,
  <Route key="/hackathons" path="/hackathons" element={<HackathonPage />} />,
  <Route key="/projects" path="/projects" element={<ProjectsPage />} />,
  <Route key="page-layout" element={<PageLayout />}>
    <Route key="/contributors" path="/contributors" element={<Contributors />} />
    <Route key="/communityEvent" path="/communityEvent" element={<CommunityEvent />} />
    <Route key="/leaderBoard" path="/leaderBoard" element={<LeaderBoard />} />
    <Route key="/contributorguide" path="/contributorguide" element={<ContributorGuide />} />
    <Route key="/about" path="/about" element={<AboutPage />} />
    <Route key="/faq" path="/faq" element={<FAQPage />} />
    <Route key="/terms" path="/terms" element={<Terms />} />
    <Route key="/privacy" path="/privacy" element={<Privacy />} />
    <Route key="/apiDocs" path="/apiDocs" element={<ApiDocs />} />
    <Route key="/helpcenter" path="/helpcenter" element={<HelpCenter />} />
    <Route key="/contact" path="/contact" element={<ContactUs />} />
    <Route key="/feedback" path="/feedback" element={<FeedbackPage />} />
    <Route key="/analytics" path="/analytics" element={<EventAnalyticsDashboard />} />
    <Route key="/documentation" path="/documentation" element={<DocumentationPage />} />
    <Route key="/submit-project" path="/submit-project" element={<SubmitProject />} />
  </Route>
];
