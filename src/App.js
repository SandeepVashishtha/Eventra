import { BrowserRouter as Router } from "react-router-dom";
import React, { useState } from "react";
import "./App.css";

// --------------- LAYOUT
//import Navbar from "./components/Layout/Navbar";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import ScrollToTop from "./components/ScrollToTop";
import FeedbackButton from "./components/FeedbackButton";
import Chatbot from "./components/Chatbot";
import FluidCursor from "./jhalak/FluidCursor";
import AppRoutes from "./components/AppRoutes";
import Footer from "./components/Layout/Footer";

// --------------- CONTEXT & HOOKS
import NotificationProvider from "./components/common/NotificationProvider";
import { AuthProvider } from "./context/AuthContext";
import { MyEventsProvider } from "./context/MyEventsContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useModelContext } from "./hooks/useModelContext";
import useOfflineSync from "./hooks/useOfflineSync";

const OfflineSyncManager = () => {
  useOfflineSync();
  return null;
};


function App() {
  const [cursorEnabled, setCursorEnabled] = useState(
    localStorage.getItem("cursor") !== "off"
  );

  useModelContext();

  const toggleCursor = () => {
    const newValue = !cursorEnabled;
    setCursorEnabled(newValue);
    localStorage.setItem("cursor", newValue ? "on" : "off");
  };

  React.useEffect(() => {
    const handleCursorPreference = (event) => {
      if (event?.detail?.cursorEnabled !== undefined) {
        setCursorEnabled(event.detail.cursorEnabled);
      }
    };

    window.addEventListener("cursorPreferenceChanged", handleCursorPreference);
    return () => window.removeEventListener("cursorPreferenceChanged", handleCursorPreference);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <MyEventsProvider>
        <NotificationProvider />
        <OfflineSyncManager />
        <Router>
          <div className="App">
            <Navbar
              cursorEnabled={cursorEnabled}
              toggleCursor={toggleCursor}
            />

            <main className="min-h-screen bg-white dark:bg-black ">
              <AppRoutes />
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
