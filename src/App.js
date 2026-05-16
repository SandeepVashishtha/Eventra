import { BrowserRouter as Router } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// --------------- LAYOUT
import Navbar from "./components/Layout/Navbar";
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

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.modelContext) {
      navigator.modelContext.provideContext({
        tools: [
          {
            name: "search_events",
            description: "Search for events on Eventra",
            inputSchema: {
              type: "object",
              properties: {
                query: { type: "string", description: "Search term for events" }
              }
            },
            execute: async ({ query }) => {
              window.location.href = `/events?search=${encodeURIComponent(query)}`;
              return { success: true, message: `Searching for ${query}` };
            }
          },
          {
            name: "get_api_docs",
            description: "Get information about Eventra APIs",
            inputSchema: { type: "object", properties: {} },
            execute: async () => {
              window.location.href = "/apiDocs";
              return { success: true, message: "Navigating to API documentation" };
            }
          }
        ]
      });
    }
  }, []);

  return (
    <ThemeProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
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