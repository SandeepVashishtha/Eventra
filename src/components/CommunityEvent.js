// src/pages/CommunityEventsPage.jsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import {
  CalendarDays,
  Users,
  MapPin,
  Mic,
  Laptop,
  Briefcase,
  BookOpen,
  Code,
  Globe,
  X,
} from "lucide-react"; // icons

import { darkTheme } from "./styles/theme";

const events = [
  {
    title: "Open Source Meetup",
    date: "28-09-2025",
    location: "Delhi, India",
    description: "A meetup for open-source enthusiasts to share, collaborate, and network.",
    icon: <Users size={20} />,
  },
  {
    title: "Hackathon 2025",
    date: "12-10-2025",
    location: "Bangalore, India",
    description:
      "48 hours of coding, collaboration, and innovation. Team up and build something great!",
    icon: <CalendarDays size={20} />,
  },
  {
    title: "Community Webinar",
    date: "20-10-2025",
    location: "Online",
    description: "Interactive session with industry experts on web development trends.",
    icon: <MapPin size={20} />,
  },
  {
    title: "Tech Talk: AI Future",
    date: "05-11-2025",
    location: "Mumbai, India",
    description: "A keynote session on AI trends and innovations.",
    icon: <Mic size={20} />,
  },
  {
    title: "Remote Dev Summit",
    date: "20-10-2025",
    location: "Online",
    description: "Conference about remote work, productivity, and building scalable products.",
    icon: <Laptop size={20} />,
  },
  {
    title: "Startup Networking",
    date: "02-12-2025",
    location: "Hyderabad, India",
    description: "Connect with startup founders, investors, and tech innovators.",
    icon: <Briefcase size={20} />,
  },
  {
    title: "Open Source Bootcamp",
    date: "10-12-2025",
    location: "Pune, India",
    description: "Hands-on training on Git, GitHub, and contributing to OSS.",
    icon: <BookOpen size={20} />,
  },
  {
    title: "Coding Challenge 2026",
    date: "08-01-2026",
    location: "Chennai, India",
    description: "Competitive programming contest to test your problem-solving skills.",
    icon: <Code size={20} />,
  },
  {
    title: "Global Dev Conference",
    date: "15-02-2026",
    location: "Singapore",
    description: "An international event bringing developers and leaders together.",
    icon: <Globe size={20} />,
  },
];

const CommunityEvent = () => {
  const prefersReducedMotion = useReducedMotion();
  const [selectedEvent, setSelectedEvent] = useState(null);

  // 🔥 FIX: Safe scroll locking that caches and restores the original CSS value
  useEffect(() => {
    if (selectedEvent) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [selectedEvent]);

  // 🔥 FIX: Added Escape key listener to satisfy A11y dialog closing requirements
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedEvent) {
        setSelectedEvent(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEvent]);

  return (
    <div
      className={`/* 🔥 FIX: Changed to for correct Tailwind execution */ relative overflow-hidden bg-linear-to-b bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white dark:from-slate-950 dark:via-slate-900 dark:to-black ${darkTheme.textPrimary} min-h-[80vh] border-b border-gray-100 pt-8 pb-16 sm:pt-16 sm:pb-20 md:pt-10 md:pb-24 dark:border-slate-900`}
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Intro Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
          className="mb-14 text-center"
        >
          <div className="mb-6 flex justify-center">
            <div
              className={`rounded-full bg-indigo-100 p-4 text-indigo-600 shadow-md dark:bg-slate-800 dark:text-indigo-400`}
            >
              <Users size={32} />
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.7 }}
            className={`text-4xl leading-tight font-extrabold tracking-tight sm:text-6xl lg:text-7xl ${darkTheme.textPrimary} `}
            style={{ fontFamily: '"Big Shoulders Display", sans-serif' }}
          >
            Community <span className="text-blue-600 dark:text-blue-500">Events</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: prefersReducedMotion ? 0 : 0.2,
              duration: prefersReducedMotion ? 0 : 0.7,
            }}
            className={`mx-auto mt-6 mb-6 max-w-2xl text-base leading-relaxed sm:text-lg ${darkTheme.textSecondary} `}
          >
            Explore meetups, hackathons, webinars, and global conferences where developers
            collaborate, innovate, and grow together.
          </motion.p>
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={` ${darkTheme.card} rounded-3xl border p-7 shadow-lg transition-all duration-300 hover:border-indigo-400 hover:shadow-2xl dark:hover:border-indigo-500`}
            >
              {/* Event Header */}
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
                  {event.icon}
                </div>

                <h2 className={`text-xl font-bold ${darkTheme.textPrimary} `}>{event.title}</h2>
              </div>

              {/* Event Info */}
              <p className={`text-sm ${darkTheme.textSecondary} `}>
                <strong>Date:</strong> {event.date}
              </p>

              <p className={`text-sm ${darkTheme.textSecondary} `}>
                <strong>Location:</strong> {event.location}
              </p>

              <p className={`mt-4 ${darkTheme.textSecondary} `}>{event.description}</p>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedEvent(event)}
                className={` ${darkTheme.buttonPrimary} mt-6 rounded-lg px-4 py-2 text-sm font-semibold shadow-md transition-all`}
                aria-label={`Learn more about ${event.title}`}
              >
                Learn More -&gt;
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedEvent &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-event-modal-title"
            onClick={() => setSelectedEvent(null)}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={` ${darkTheme.card} relative w-full max-w-lg rounded-2xl p-6 shadow-2xl`}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close event details"
              >
                <X size={20} />
              </button>

              <div className="mb-5 flex items-center gap-3 pr-10">
                <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
                  {selectedEvent.icon}
                </div>

                <h2
                  id="community-event-modal-title"
                  className={`text-2xl font-bold ${darkTheme.textPrimary} `}
                >
                  {selectedEvent.title}
                </h2>
              </div>

              <div className={`space-y-3 text-sm ${darkTheme.textSecondary} `}>
                <p>
                  <strong>Date:</strong> {selectedEvent.date}
                </p>

                <p>
                  <strong>Location:</strong> {selectedEvent.location}
                </p>

                <p className={`text-base leading-relaxed ${darkTheme.textSecondary} `}>
                  {selectedEvent.description}
                </p>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default CommunityEvent;
