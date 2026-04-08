// src/pages/CommunityEventsPage.jsx
import React from "react";
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
} from "lucide-react"; // icons

const events = [
  {
    title: "Open Source Meetup",
    date: "September 28, 2025",
    location: "Delhi, India",
    description:
      "A meetup for open-source enthusiasts to share, collaborate, and network.",
    icon: <Users size={20} />,
  },
  {
    title: "Hackathon 2025",
    date: "October 12, 2025",
    location: "Bangalore, India",
    description:
      "48 hours of coding, collaboration, and innovation. Team up and build something great!",
    icon: <CalendarDays size={20} />,
  },
  {
    title: "Community Webinar",
    date: "October 20, 2025",
    location: "Online",
    description:
      "Interactive session with industry experts on web development trends.",
    icon: <MapPin size={20} />,
  },
  {
    title: "Tech Talk: AI Future",
    date: "November 5, 2025",
    location: "Mumbai, India",
    description: "A keynote session on AI trends and innovations.",
    icon: <Mic size={20} />,
  },
  {
    title: "Remote Dev Summit",
    date: "November 20, 2025",
    location: "Online",
    description:
      "Conference about remote work, productivity, and building scalable products.",
    icon: <Laptop size={20} />,
  },
  {
    title: "Startup Networking",
    date: "December 2, 2025",
    location: "Hyderabad, India",
    description:
      "Connect with startup founders, investors, and tech innovators.",
    icon: <Briefcase size={20} />,
  },
  {
    title: "Open Source Bootcamp",
    date: "December 10, 2025",
    location: "Pune, India",
    description: "Hands-on training on Git, GitHub, and contributing to OSS.",
    icon: <BookOpen size={20} />,
  },
  {
    title: "Coding Challenge 2026",
    date: "January 8, 2026",
    location: "Chennai, India",
    description:
      "Competitive programming contest to test your problem-solving skills.",
    icon: <Code size={20} />,
  },
  {
    title: "Global Dev Conference",
    date: "February 15, 2026",
    location: "Singapore",
    description:
      "An international event bringing developers and leaders together.",
    icon: <Globe size={20} />,
  },
];

const CommunityEvent = () => {
  return (
    // UPDATED: Main page background
    <div className="bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Intro Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="flex justify-center mb-6">
            {/* UPDATED: Icon wrapper */}
            <div className="p-4 rounded-full bg-indigo-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-md">
              <Users size={32} />
            </div>
          </div>
          {/* UPDATED: Text colors */}
          <h1 className="text-5xl font-extrabold text-indigo-900 dark:text-gray-100 mb-4">
            Community Events
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            "Explore meetups, hackathons, webinars, and global conferences where
            developers collaborate, innovate, and grow together."
          </p>
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              // UPDATED: Card background and border
              className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              {/* Event Header */}
              <div className="flex items-center gap-3 mb-4">
                {/* UPDATED: Icon wrapper */}
                <div className="p-3 bg-indigo-100 dark:bg-gray-700/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  {event.icon}
                </div>
                {/* UPDATED: Text color */}
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{event.title}</h2>
              </div>

              {/* Event Info */}
              {/* UPDATED: Text colors */}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Date:</strong> {event.date}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Location:</strong> {event.location}
              </p>
              <p className="mt-4 text-gray-700 dark:text-gray-300">{event.description}</p>

              {/* Learn More Button is fine for both themes */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="mt-6 px-4 py-2 text-sm font-semibold text-white bg-black rounded-lg shadow-md hover:bg-zinc-800 transition-all"
              >
                Learn More →
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityEvent;