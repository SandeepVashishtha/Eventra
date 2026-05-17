import { lazy } from 'react';
import { Route } from 'react-router-dom';

import PageLayout from '../Layout/PageLayout';
import HomePage from '../../Pages/Home/HomePage';

const EventsPage = lazy(() => import('../../Pages/Events/EventsPage'));
const EventRegistration = lazy(() => import('../../Pages/Events/EventRegistration'));
const HackathonPage = lazy(() => import('../../Pages/Hackathons/HackathonPage'));
const ProjectsPage = lazy(() => import('../../Pages/Projects/ProjectsPage'));
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
const EventAnalyticsDashboard = lazy(() =>
  import('../../Pages/Events/EventAnalyticsDashboard')
);
const DocumentationPage = lazy(() => import('../../Pages/About/DocumentationPage'));
const SubmitProject = lazy(() => import('../../Pages/Projects/SubmitProject'));

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
  </Route>,
];
