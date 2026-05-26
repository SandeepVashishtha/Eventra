// src/pages/CommunityEventsPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
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
    description:
      "A meetup for open-source enthusiasts to share, collaborate, and network.",
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
    description:
      "Interactive session with industry experts on web development trends.",
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
    description:
      "Conference about remote work, productivity, and building scalable products.",
    icon: <Laptop size={20} />,
  },
  {
    title: "Startup Networking",
    date: "02-12-2025",
    location: "Hyderabad, India",
    description:
      "Connect with startup founders, investors, and tech innovators.",
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
    description:
      "Competitive programming contest to test your problem-solving skills.",
    icon: <Code size={20} />,
  },
  {
    title: "Global Dev Conference",
    date: "15-02-2026",
    location: "Singapore",
    description:
      "An international event bringing developers and leaders together.",
    icon: <Globe size={20} />,
  },
];

const CommunityEvent = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div
      className={`
        relative overflow-hidden
        bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white 
        dark:from-slate-950 dark:via-slate-900 dark:to-black
        ${darkTheme.textPrimary}
        min-h-[80vh]
        pt-8 pb-16 sm:pt-16 sm:pb-20 md:pt-10 md:pb-24
        border-b border-gray-100 dark:border-slate-900
      `}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Intro Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="flex justify-center mb-6">
            <div
              className={`
                p-4 rounded-full
                bg-indigo-100 dark:bg-slate-800
                text-indigo-600 dark:text-indigo-400
                shadow-md
              `}
            >
              <Users size={32} />
            </div>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className={`
              text-4xl sm:text-6xl lg:text-7xl
              font-extrabold
              leading-tight
              tracking-tight
              ${darkTheme.textPrimary}
            `}
            style={{ fontFamily: '"Big Shoulders Display", sans-serif' }}
          >
            Community{" "}
            <span className="text-blue-600 dark:text-blue-500">Events</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className={`
              text-base sm:text-lg
              max-w-2xl
              mx-auto
              mt-6
              mb-6
              leading-relaxed
              ${darkTheme.textSecondary}
            `}
          >
            Explore meetups, hackathons, webinars, and global conferences where
            developers collaborate, innovate, and grow together.
          </motion.p>
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`
                ${darkTheme.card}
                p-7
                rounded-3xl
                shadow-lg
                border
                hover:border-indigo-400
                dark:hover:border-indigo-500
                hover:shadow-2xl
                transition-all duration-300
              `}
            >
              {/* Event Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="
                    p-3
                    bg-indigo-100 dark:bg-slate-800
                    text-indigo-600 dark:text-indigo-400
                    rounded-xl
                  "
                >
                  {event.icon}
                </div>

                <h2
                  className={`
                    text-xl font-bold
                    ${darkTheme.textPrimary}
                  `}
                >
                  {event.title}
                </h2>
              </div>

              {/* Event Info */}
              <p
                className={`
                  text-sm
                  ${darkTheme.textSecondary}
                `}
              >
                <strong>Date:</strong> {event.date}
              </p>

              <p
                className={`
                  text-sm
                  ${darkTheme.textSecondary}
                `}
              >
                <strong>Location:</strong> {event.location}
              </p>

              <p
                className={`
                  mt-4
                  ${darkTheme.textSecondary}
                `}
              >
                {event.description}
              </p>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedEvent(event)}
                className={`
                  ${darkTheme.buttonPrimary}
                  mt-6 px-4 py-2
                  text-sm font-semibold
                  rounded-lg shadow-md
                  transition-all
                `}
                aria-label={`Learn more about ${event.title}`}
              >
                Learn More -&gt;
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="community-event-modal-title"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`
              ${darkTheme.card}
              relative w-full max-w-lg
              rounded-2xl
              p-6
              shadow-2xl
            `}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="
                absolute right-4 top-4
                rounded-full p-2
                text-gray-500 dark:text-gray-300
                transition
                hover:bg-gray-100 dark:hover:bg-slate-800
                hover:text-gray-900 dark:hover:text-white
              "
              aria-label="Close event details"
            >
              <X size={20} />
            </button>

            <div className="mb-5 flex items-center gap-3 pr-10">
              <div
                className="
                  rounded-xl
                  bg-indigo-100 dark:bg-slate-800
                  p-3
                  text-indigo-600 dark:text-indigo-400
                "
              >
                {selectedEvent.icon}
              </div>

              <h2
                id="community-event-modal-title"
                className={`
                  text-2xl font-bold
                  ${darkTheme.textPrimary}
                `}
              >
                {selectedEvent.title}
              </h2>
            </div>

            <div
              className={`
                space-y-3 text-sm
                ${darkTheme.textSecondary}
              `}
            >
              <p>
                <strong>Date:</strong> {selectedEvent.date}
              </p>

              <p>
                <strong>Location:</strong> {selectedEvent.location}
              </p>

              <p
                className={`
                  text-base leading-relaxed
                  ${darkTheme.textSecondary}
                `}
              >
                {selectedEvent.description}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CommunityEvent;
