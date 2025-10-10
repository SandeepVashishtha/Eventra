import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import ToastProvider from "./components/Toastprovider";

// --------------- LAYOUT
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import ScrollToTop from "./components/ScrollToTop";
import FeedbackButton from "./components/FeedbackButton";

// --------------- PAGES
import Contributors from "./components/Contributors";
import EventCreation from "./components/common/EventCreation";
import AboutPage from "./Pages/About/AboutPage";
import EventsPage from "./Pages/Events/EventsPage";
import HackathonPage from "./Pages/Hackathons/HackathonPage";
import ProjectsPage from "./Pages/Projects/ProjectsPage";
import ContactUs from "./Pages/Contact/ContactUs"; // Import ContactUs page
import FeedbackPage from "./Pages/Feedback/FeedbackPage"; // Import FeedbackPage
import LeaderBoard from "./Pages/Leaderboard/Leaderboard";
import ContributorGuide from "./Pages/Leaderboard/ContributorGuide";

import NotFound from "./components/NotFound";
import DocumentationPage from "./Pages/About/DocumentationPage";
import SubmitProject from "./Pages/Projects/SubmitProject";
import HostHackathon from "./Pages/Hackathons/HostHackathon";
import CommunityEvent from "./components/CommunityEvent";

// --------------- AUTH PAGES
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Unauthorized from "./components/auth/Unauthorized";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import PasswordReset from "./components/auth/PasswordReset";

// --------------- DASHBOARD PAGES
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import EditProfile from "./components/user/EditProfile";
import HomePage from "./Pages/Home/HomePage";
import Terms from "./Pages/Terms";
import { Privacy } from "./Pages/Privacy";
import ApiDocs from "./Pages/ApiDocs";
import HelpCenter from "./Pages/HelpCenter";
import FAQPage from "./Pages/FAQ/FAQPage";

import { ThemeProvider } from "./context/ThemeContext";
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <ToastProvider/>

            <main className="min-h-screen bg-white dark:bg-black">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/hackathons" element={<HackathonPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/contributors" element={<Contributors />} />
                <Route path="/communityEvent" element={<CommunityEvent />} />
                <Route path="/leaderBoard" element={<LeaderBoard />} />
                <Route
                  path="/contributorguide"
                  element={<ContributorGuide />}
                />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/apiDocs" element={<ApiDocs />} />
                <Route path="/helpcenter" element={<HelpCenter />} />
                <Route path="/contact" element={<ContactUs />} />{" "}
                {/* Add ContactUs route */}
                <Route path="/feedback" element={<FeedbackPage />} />{" "}
                {/* Add FeedbackPage route */}
                {/* Protected route for event creation */}
                <Route
                  path="/create-event"
                  element={
                    <ProtectedRoute requiredPermissions={["CREATE_EVENT"]}>
                      <EventCreation />
                    </ProtectedRoute>
                  }
                />
                {/* Dashboard routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRoles={["ADMIN"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                {/* Conatct page documentation page route */}
                <Route path="/documentation" element={<DocumentationPage />} />
                <Route path="/submit-project" element={<SubmitProject />} />
                {/* Protected route for host hackathon */}
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
                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/password-reset" element={<PasswordReset />} />
                <Route path="/*" element={<NotFound />} />
              </Routes>
            </main>

            <ScrollToTop />

            {/* Global floating Feedback button */}
            <FeedbackButton />

            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
