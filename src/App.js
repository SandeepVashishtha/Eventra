import React, { useState, useEffect, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Layout & Components
import Navbar from "./components/Layout/Navbar";
// Lazy load heavy components

import ScrollToTop from "./components/ScrollToTop";
import FeedbackButton from "./components/FeedbackButton";
import FluidCursor from "./jhalak/FluidCursor";
import PageTransition from "./components/common/PageTransition";
// Ensure this path matches the exact location of your file
import RegistrationPage from "./Pages/RegistrationPage"; 

// Context & Hooks
import NotificationProvider from "./components/common/NotificationProvider";
import { AuthProvider } from "./context/AuthContext";
import { MyEventsProvider } from "./context/MyEventsContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useModelContext } from "./hooks/useModelContext";
import useOfflineSync from "./hooks/useOfflineSync";
const Footer = lazy(() => import("./components/Layout/Footer"));
const Chatbot = lazy(() => import("./components/Chatbot"));
const AppRoutes = lazy(() => import("./components/AppRoutes")); // This is Heaviestt

const OfflineSyncManager = () => {
  useOfflineSync();
  return null;
};

function App() {
  const [cursorEnabled, setCursorEnabled] = useState(
    localStorage.getItem("cursor") !== "off",
  );

  useModelContext();

  const toggleCursor = () => {
    const newValue = !cursorEnabled;
    setCursorEnabled(newValue);
    localStorage.setItem("cursor", newValue ? "on" : "off");
  };

  useEffect(() => {
    const handleCursorPreference = (event) => {
      if (event?.detail?.cursorEnabled !== undefined) {
        setCursorEnabled(event.detail.cursorEnabled);
      }
    };
    window.addEventListener("cursorPreferenceChanged", handleCursorPreference);
    return () =>
      window.removeEventListener(
        "cursorPreferenceChanged",
        handleCursorPreference,
      );
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <MyEventsProvider>
          <NotificationProvider />
          <OfflineSyncManager />
          <Router>
            <div className="App">
              <Navbar cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />
              <main className="relative z-10 min-h-screen bg-white dark:bg-black">
                <PageTransition>
                  <Routes>
                    <Route path="/register/:id" element={<RegistrationPage />} />
                    <Route path="*" element={<AppRoutes />} />
                  </Routes>
                </PageTransition>
              </main>
              <ScrollToTop />
              <Chatbot />
              <FeedbackButton />
              <Footer />
              <FluidCursor enabled={cursorEnabled} />
            </div>
          </Router>
        </MyEventsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;