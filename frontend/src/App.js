import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// --------------- LAYOUT
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import ScrollToTop from "./components/ScrollToTop";

// --------------- PAGES
import Contributors from "./components/Contributors";
import EventCreation from "./components/common/EventCreation";
import AboutPage from "./Pages/About/AboutPage";
import EventsPage from "./Pages/Events/EventsPage";
import HackathonPage from "./Pages/Hackathons/HackathonPage";
import ProjectsPage from "./Pages/Projects/ProjectsPage";
import ContactUs from "./Pages/Contact/ContactUs"; // Import ContactUs page
import LeaderBoard from "./Pages/Leaderboard/Leaderboard";
import NotFound from "./components/NotFound";

// --------------- AUTH PAGES
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Unauthorized from "./components/auth/Unauthorized";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

// --------------- DASHBOARD PAGES
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import HomePage from "./Pages/Home/HomePage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />

          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/hackathons" element={<HackathonPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/contributors" element={<Contributors />} />
              <Route path="/leaderBoard" element={<LeaderBoard />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactUs />} />{" "}
              {/* Add ContactUs route */}
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
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/*" element={<NotFound />} />
            </Routes>
          </main>

          <ScrollToTop />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
