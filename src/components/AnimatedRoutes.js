import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";

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
import HomePage from "../Pages/Home/HomePage";
import Terms from "../Pages/Terms";
import { Privacy } from "../Pages/Privacy";
import ApiDocs from "../Pages/ApiDocs";
import HelpCenter from "../Pages/HelpCenter";
import FAQPage from "../Pages/FAQ/FAQPage";
import EventRegistration from "../Pages/Events/EventRegistration";

/**
 * AnimatedRoutes – extracts the <Routes> block from App.js and
 * wraps it with AnimatePresence + location-key so Framer Motion
 * can orchestrate enter / exit animations on route changes.
 *
 * `mode="wait"` ensures the old page fully exits before the new
 * page enters, preventing overlap / double-scroll issues.
 */
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/events" element={<PageTransition><EventsPage /></PageTransition>} />
        <Route
          path="/events/:eventId/register"
          element={<PageTransition><EventRegistration /></PageTransition>}
        />
        <Route path="/hackathons" element={<PageTransition><HackathonPage /></PageTransition>} />
        <Route path="/projects" element={<PageTransition><ProjectsPage /></PageTransition>} />
        <Route path="/contributors" element={<PageTransition><Contributors /></PageTransition>} />
        <Route path="/communityEvent" element={<PageTransition><CommunityEvent /></PageTransition>} />
        <Route path="/leaderBoard" element={<PageTransition><LeaderBoard /></PageTransition>} />
        <Route
          path="/contributorguide"
          element={<PageTransition><ContributorGuide /></PageTransition>}
        />
        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/faq" element={<PageTransition><FAQPage /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/apiDocs" element={<PageTransition><ApiDocs /></PageTransition>} />
        <Route path="/helpcenter" element={<PageTransition><HelpCenter /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><ContactUs /></PageTransition>} />
        <Route path="/feedback" element={<PageTransition><FeedbackPage /></PageTransition>} />

        {/* Protected Routes */}
        <Route
          path="/create-event"
          element={
            <ProtectedRoute requiredPermissions={["CREATE_EVENT"]}>
              <PageTransition><EventCreation /></PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRoles={["ADMIN"]}>
              <PageTransition><AdminDashboard /></PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documentation"
          element={<PageTransition><DocumentationPage /></PageTransition>}
        />

        <Route
          path="/submit-project"
          element={<PageTransition><SubmitProject /></PageTransition>}
        />

        <Route
          path="/host-hackathon"
          element={
            <ProtectedRoute requiredPermissions={["HOST_HACKATHON"]}>
              <PageTransition><HostHackathon /></PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition><Dashboard /></PageTransition>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageTransition><EditProfile /></PageTransition>
            </ProtectedRoute>
          }
        />

        {/* Auth Routes */}
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route
          path="/unauthorized"
          element={<PageTransition><Unauthorized /></PageTransition>}
        />
        <Route
          path="/password-reset"
          element={<PageTransition><PasswordReset /></PageTransition>}
        />

        <Route path="/*" element={<PageTransition><NotFound /></PageTransition>} />

      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
