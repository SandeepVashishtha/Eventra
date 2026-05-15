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

// --------------- ROUTES
import AppRoutes from "./components/AppRoutes";

// --------------- PROVIDERS
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const [cursorEnabled, setCursorEnabled] = useState(
    localStorage.getItem("cursor") !== "off"
  );

  const toggleCursor = () => {
    const newValue = !cursorEnabled;
    setCursorEnabled(newValue);
    localStorage.setItem("cursor", newValue ? "on" : "off");
  };

  return (
    <ThemeProvider>
      <ToastProvider />
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />

            <main className="min-h-screen bg-bg text-text">
              <AppRoutes />
            </main>

            <ScrollToTop />
            <Chatbot />
            <FeedbackButton />
            <Footer />

            {cursorEnabled && <FluidCursor />}
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
