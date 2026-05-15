import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --------------- PAGES
import HomePage from "../Pages/Home/HomePage";
import EventsPage from "../Pages/Events/EventsPage";
import EventRegistration from "../Pages/Events/EventRegistration";
import HackathonPage from "../Pages/Hackathons/HackathonPage";
import ProjectsPage from "../Pages/Projects/ProjectsPage";
import Contributors from "./Contributors";
import CommunityEvent from "./CommunityEvent";
import LeaderBoard from "../Pages/Leaderboard/Leaderboard";
import ContributorGuide from "../Pages/Leaderboard/ContributorGuide";
import AboutPage from "../Pages/About/AboutPage";
import FAQPage from "../Pages/FAQ/FAQPage";
import Terms from "../Pages/Terms";
import { Privacy } from "../Pages/Privacy";
import ApiDocs from "../Pages/ApiDocs";
import HelpCenter from "../Pages/HelpCenter";
import ContactUs from "../Pages/Contact/ContactUs";
import FeedbackPage from "../Pages/Feedback/FeedbackPage";
import EventAnalyticsDashboard from "../Pages/Events/EventAnalyticsDashboard";
import DocumentationPage from "../Pages/About/DocumentationPage";
import SubmitProject from "../Pages/Projects/SubmitProject";
import HostHackathon from "../Pages/Hackathons/HostHackathon";
import EventCreation from "./common/EventCreation";
import NotFound from "./NotFound";

// --------------- AUTH & DASHBOARD
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Unauthorized from "./auth/Unauthorized";
import ProtectedRoute from "./auth/ProtectedRoute";
import PasswordReset from "./auth/PasswordReset";
import Dashboard from "./Dashboard";
import AdminDashboard from "./admin/AdminDashboard";
import EditProfile from "./user/EditProfile";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:eventId/register" element={<EventRegistration />} />
      <Route path="/hackathons" element={<HackathonPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/contributors" element={<Contributors />} />
      <Route path="/communityEvent" element={<CommunityEvent />} />
      <Route path="/leaderBoard" element={<LeaderBoard />} />
      <Route path="/contributorguide" element={<ContributorGuide />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/apiDocs" element={<ApiDocs />} />
      <Route path="/helpcenter" element={<HelpCenter />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/analytics" element={<EventAnalyticsDashboard />} />

      {/* Protected Routes */}
      <Route
        path="/create-event"
        element={
          <ProtectedRoute requiredPermissions={["CREATE_EVENT"]}>
            <EventCreation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/documentation" element={<DocumentationPage />} />
      <Route path="/submit-project" element={<SubmitProject />} />

      <Route
        path="/host-hackathon"
        element={
          <ProtectedRoute requiredPermissions={["HOST_HACKATHON"]}>
            <HostHackathon />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/password-reset" element={<PasswordReset />} />

      <Route path="/*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
