import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhatsHappening from './components/WhatsHappening';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import Community from './components/Community';
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


function App() {
  useEffect(() => {
    createScrollToTopButton(); 
  }, []);

  return (
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
                    <Community />
                  </>
                }
              />
              <Route path="/events" element={<EventsSection />} />
              <Route path="/hackathons" element={<HackathonHub />} />
              <Route path="/projects" element={<ProjectGallery />} />
              
              {/* Protected route for event creation */}
              <Route 
                path="/create-event" 
                element={
                  <ProtectedRoute requiredPermissions={['CREATE_EVENT']}>
                    <EventCreation />
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
  );
}

export default App;
