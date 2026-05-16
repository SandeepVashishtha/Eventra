import React from 'react';
import { Route } from 'react-router-dom';

// --------------- PAGES
import HomePage from "../../Pages/Home/HomePage";
import EventsPage from "../../Pages/Events/EventsPage";
import EventRegistration from "../../Pages/Events/EventRegistration";
import HackathonPage from "../../Pages/Hackathons/HackathonPage";
import ProjectsPage from "../../Pages/Projects/ProjectsPage";
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
import EventAnalyticsDashboard from "../../Pages/Events/EventAnalyticsDashboard";
import DocumentationPage from "../../Pages/About/DocumentationPage";
import SubmitProject from "../../Pages/Projects/SubmitProject";
import EventDetails from "../../Pages/EventDetails";
export const getPublicRoutes = () => [
  <Route key="/" path="/" element={<HomePage />} />,
  <Route key="/events" path="/events" element={<EventsPage />} />,
  <Route key="/register" path="/events/:eventId/register" element={<EventRegistration />} />,
  <Route key="/hackathons" path="/hackathons" element={<HackathonPage />} />,
  <Route key="/projects" path="/projects" element={<ProjectsPage />} />,
  <Route key="/contributors" path="/contributors" element={<Contributors />} />,
  <Route key="/communityEvent" path="/communityEvent" element={<CommunityEvent />} />,
  <Route key="/leaderBoard" path="/leaderBoard" element={<LeaderBoard />} />,
  <Route key="/contributorguide" path="/contributorguide" element={<ContributorGuide />} />,
  <Route key="/about" path="/about" element={<AboutPage />} />,
  <Route key="/faq" path="/faq" element={<FAQPage />} />,
  <Route key="/terms" path="/terms" element={<Terms />} />,
  <Route key="/privacy" path="/privacy" element={<Privacy />} />,
  <Route key="/apiDocs" path="/apiDocs" element={<ApiDocs />} />,
  <Route key="/helpcenter" path="/helpcenter" element={<HelpCenter />} />,
  <Route key="/contact" path="/contact" element={<ContactUs />} />,
  <Route key="/feedback" path="/feedback" element={<FeedbackPage />} />,
  <Route key="/analytics" path="/analytics" element={<EventAnalyticsDashboard />} />,
  <Route key="/documentation" path="/documentation" element={<DocumentationPage />} />,
  <Route key="/submit-project" path="/submit-project" element={<SubmitProject />} />,
];
