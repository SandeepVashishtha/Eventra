import { BrowserRouter as Router } from "react-router-dom";
import { useState } from "react";
import "./App.css";

// --------------- LAYOUT
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import ScrollToTop from "./components/ScrollToTop";
import FeedbackButton from "./components/FeedbackButton";
import Chatbot from "./components/Chatbot";
import FluidCursor from "./jhalak/FluidCursor";
import AppRoutes from "./components/AppRoutes";
import NotificationProvider from "./components/common/NotificationProvider";

// --------------- CONTEXT & HOOKS
import { AuthProvider } from "./context/AuthContext";
import { useModelContext } from "./hooks/useModelContext";

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

  return (
    <>
      <NotificationProvider />
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar
              cursorEnabled={cursorEnabled}
              toggleCursor={toggleCursor}
            />

            <main className="min-h-screen bg-white dark:bg-black">
              <AppRoutes />
            </main>

            <ScrollToTop />
            <Chatbot />
            <FeedbackButton />
            <Footer />

            <FluidCursor enabled={cursorEnabled} />
          </div>
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;