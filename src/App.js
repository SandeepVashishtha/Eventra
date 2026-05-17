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

<<<<<<< HEAD
// --------------- ROUTES
import AppRoutes from "./components/AppRoutes";

// --------------- PROVIDERS
=======
// --------------- CONTEXT & HOOKS
>>>>>>> 481cbb0f9c46982337d082d5f25e87471f5c281a
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
            <Navbar cursorEnabled={cursorEnabled} toggleCursor={toggleCursor} />

<<<<<<< HEAD
            <main className="min-h-screen bg-bg text-text">
=======
            <main className="min-h-screen bg-white dark:bg-black ">
>>>>>>> 481cbb0f9c46982337d082d5f25e87471f5c281a
              <AppRoutes />
            </main>

            <ScrollToTop />
            <Chatbot />
            <FeedbackButton />
            <Footer />

<<<<<<< HEAD
            {cursorEnabled && <FluidCursor />}
=======
            <FluidCursor enabled={cursorEnabled} />
>>>>>>> 481cbb0f9c46982337d082d5f25e87471f5c281a
          </div>
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
