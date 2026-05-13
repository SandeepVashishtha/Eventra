import { BrowserRouter as Router } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import ToastProvider from "./components/Toastprovider";

// --------------- LAYOUT
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import ScrollToTop from "./components/ScrollToTop";
import FeedbackButton from "./components/FeedbackButton";
import Chatbot from "./components/Chatbot";
import FluidCursor from "./jhalak/FluidCursor";

// --------------- ANIMATED ROUTES (handles all page routes + transitions)
import AnimatedRoutes from "./components/AnimatedRoutes";

// --------------- AUTH
import { AuthProvider } from "./context/AuthContext";

import { ThemeProvider } from "./context/ThemeContext";

function App() {
  // Cursor state with persistence
  const [cursorEnabled, setCursorEnabled] = useState(
    localStorage.getItem("cursor") !== "off"
  );

  // Toggle function
  const toggleCursor = () => {
    const newValue = !cursorEnabled;
    setCursorEnabled(newValue);

    localStorage.setItem(
      "cursor",
      newValue ? "on" : "off"
    );
  };

  return (
    <ThemeProvider>
      <ToastProvider />
      <AuthProvider>
        <Router>
          <div className="App">

            {/* PASS PROPS TO NAVBAR */}
            <Navbar
              cursorEnabled={cursorEnabled}
              toggleCursor={toggleCursor}
            />

            <main className="min-h-screen bg-white dark:bg-black">
              <AnimatedRoutes />
            </main>

            <ScrollToTop />
            <Chatbot />

            <FeedbackButton />

            <Footer />

            {/* CONDITIONAL CURSOR */}
            {cursorEnabled && <FluidCursor />}

          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;