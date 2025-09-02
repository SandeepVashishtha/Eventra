import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhatsHappening from './components/WhatsHappening';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import Community from './components/Community';
import Contributors from './components/Contributors';
import Footer from './components/Footer';
import EventCreation from './components/common/EventCreation';
import AboutPage from './components/AboutPage';
import EventsSection from './components/EventsSection';
import HackathonHub from './components/HackathonHub';
import ProjectGallery from './components/ProjectGallery';
import createScrollToTopButton from './components/scrolltotopButton';
import NotFound from './components/NotFound';
import './App.css';

// Import Auth components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Unauthorized from './components/auth/Unauthorized';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Import Theme context
import { ThemeProvider } from './context/ThemeContext';

// Import Dashboard components
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';


function App() {
  useEffect(() => {
    createScrollToTopButton(); 
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />

            <main>
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <Hero />
                      <WhatsHappening />
                      <Features />
                      <Testimonials />
                      <Contributors />
                      <Community />
                    </>
                  }
                />
                <Route path="/events" element={<EventsSection />} />
                <Route path="/hackathons" element={<HackathonHub />} />
                <Route path="/projects" element={<ProjectGallery />} />
                <Route path="/contributors" element={<Contributors />} />
                
                {/* Protected route for event creation */}
                <Route 
                  path="/create-event" 
                  element={
                    <ProtectedRoute requiredPermissions={['CREATE_EVENT']}>
                      <EventCreation />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Dashboard routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute requiredRoles={['ADMIN']}>
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
                
                <Route path="/about" element={<AboutPage />} />
                
                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                <Route path="/*" element={<NotFound />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
