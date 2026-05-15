import { Routes, Route } from "react-router-dom";

// --------------- PAGES
import Contributors from "./Contributors";
import EventCreation from "./common/EventCreation";
import AboutPage from "../Pages/About/AboutPage";
import EventsPage from "../Pages/Events/EventsPage";
import HackathonPage from "../Pages/Hackathons/HackathonPage";
import ProjectsPage from "../Pages/Projects/ProjectsPage";
import ContactUs from "../Pages/Contact/ContactUs";
import FeedbackPage from "../Pages/Feedback/FeedbackPage";
import LeaderBoard from "../Pages/Leaderboard/Leaderboard";
import ContributorGuide from "../Pages/Leaderboard/ContributorGuide";
import NotFound from "./NotFound";
import DocumentationPage from "../Pages/About/DocumentationPage";
import SubmitProject from "../Pages/Projects/SubmitProject";
import HostHackathon from "../Pages/Hackathons/HostHackathon";
import CommunityEvent from "./CommunityEvent";
import HomePage from "../Pages/Home/HomePage";
import Terms from "../Pages/Terms";
import { Privacy } from "../Pages/Privacy";
import ApiDocs from "../Pages/ApiDocs";
import HelpCenter from "../Pages/HelpCenter";
import FAQPage from "../Pages/FAQ/FAQPage";
import EventRegistration from "../Pages/Events/EventRegistration";

// --------------- AUTH PAGES
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Unauthorized from "./auth/Unauthorized";
import ProtectedRoute from "./auth/ProtectedRoute";
import PasswordReset from "./auth/PasswordReset";

// --------------- DASHBOARD PAGES
import Dashboard from "./Dashboard";
import AdminDashboard from "./admin/AdminDashboard";
import EditProfile from "./user/EditProfile";

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
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
    <Route path="/documentation" element={<DocumentationPage />} />
    <Route path="/submit-project" element={<SubmitProject />} />

    {/* Auth routes */}
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/unauthorized" element={<Unauthorized />} />
    <Route path="/password-reset" element={<PasswordReset />} />

    {/* Protected routes */}
    <Route
      path="/create-event"
      element={
        <ProtectedRoute requiredPermissions={["CREATE_EVENT"]}>
          <EventCreation />
        </ProtectedRoute>
      }
    />
    <Route
      path="/host-hackathon"
      element={
        <ProtectedRoute requiredPermissions={["HOST_HACKATHON"]}>
          <HostHackathon />
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

    {/* Fallback */}
    <Route path="/*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
