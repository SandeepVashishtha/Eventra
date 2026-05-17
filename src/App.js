import { BrowserRouter as Router } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import ToastProvider from "./components/Toastprovider";

// --------------- LAYOUT
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/Layout/Footer";
import ScrollToTop from "./components/ScrollToTop";
import FeedbackButton from "./components/FeedbackButton";
import Chatbot from "./components/Chatbot";
import FluidCursor from "./jhalak/FluidCursor";
import AppRoutes from "./components/AppRoutes";

// --------------- CONTEXT
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

            {/* KEEP CURSOR MOUNTED BUT TOGGLE VIA PROP */}
            <FluidCursor enabled={cursorEnabled} />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;