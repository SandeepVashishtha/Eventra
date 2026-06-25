import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Archive,
  Calendar,
  Users,
  Star,
  ChevronDown,
  Search,
  ExternalLink,
  Trophy,
  Clock,
} from "lucide-react";

// Mock archived events data - in production this comes from API
const ARCHIVED_EVENTS = [
  {
    id: "arch-2024-001",
    title: "Tech Summit 2024",
    year: 2024,
    month: "March",
    category: "Technology",
    attendees: 1200,
    rating: 4.8,
    speakers: 24,
    sessions: 18,
    description: "Annual technology conference bringing together industry leaders.",
    highlights: ["Keynote by industry leaders", "18 technical sessions", "Networking dinner"],
    image: "https://images.unsplash.com/photo-1540575861501-7c90b707a27d?w=400&q=80",
    stats: { registrations: 1500, attendance: 1200, feedback: 340, satisfaction: 96 },
  },
  {
    id: "arch-2024-002",
    title: "Design Conference 2024",
    year: 2024,
    month: "June",
    category: "Design",
    attendees: 800,
    rating: 4.6,
    speakers: 16,
    sessions: 12,
    description: "Showcasing the latest trends in UI/UX and product design.",
    highlights: ["Live design sprints", "Portfolio reviews", "Workshop sessions"],
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80",
    stats: { registrations: 950, attendance: 800, feedback: 210, satisfaction: 92 },
  },
  {
    id: "arch-2023-001",
    title: "Startup Expo 2023",
    year: 2023,
    month: "November",
    category: "Business",
    attendees: 2000,
    rating: 4.9,
    speakers: 32,
    sessions: 24,
    description: "Connecting startups with investors and industry mentors.",
    highlights: ["Pitch competitions", "Investor meetups", "50+ startup booths"],
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&q=80",
    stats: { registrations: 2400, attendance: 2000, feedback: 580, satisfaction: 98 },
  },
  {
    id: "arch-2023-002",
    title: "AI Hackathon 2023",
    year: 2023,
    month: "August",
    category: "Technology",
    attendees: 600,
    rating: 4.7,
    speakers: 10,
    sessions: 8,
    description: "48-hour hackathon focused on AI and machine learning solutions.",
    highlights: ["48-hour build sprint", "Expert mentorship", "$50k prize pool"],
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80",
    stats: { registrations: 700, attendance: 600, feedback: 180, satisfaction: 94 },
  },
  {
    id: "arch-2022-001",
    title: "Community Fest 2022",
    year: 2022,
    month: "October",
    category: "Community",
    attendees: 3000,
    rating: 4.5,
    speakers: 40,
    sessions: 30,
    description: "Celebrating our community with talks, workshops and networking.",
    highlights: ["30+ workshops", "Community awards", "Open mic sessions"],
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&q=80",
    stats: { registrations: 3500, attendance: 3000, feedback: 820, satisfaction: 90 },
  },
];

const YEARS = [...new Set(ARCHIVED_EVENTS.map((e) => e.year))].sort((a, b) => b - a);
const CATEGORIES = ["All", ...new Set(ARCHIVED_EVENTS.map((e) => e.category))];

function StatChip({ label, value, color }) {
  return (
    <div className={`flex flex-col items-center px-3 py-2 rounded-lg ${color}`}>
      <span className="text-lg font-bold">{value}</span>
      <span className="text-xs opacity-75">{label}</span>
    </div>
  );
}

function ArchiveCard({ event, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={() => onClick(event)}
    >
      <div className="relative h-40 overflow-hidden">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className="text-white font-semibold text-sm">
            {event.month} {event.year}
          </span>
          <span className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
            <Star className="w-3.5 h-3.5 fill-yellow-400" />
            {event.rating}
          </span>
        </div>
        <span className="absolute top-3 left-3 px-2 py-0.5 bg-indigo-600 text-white text-xs font-medium rounded-full">
          {event.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{event.title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
          {event.description}
        </p>
        <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {event.attendees.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" />
            {event.speakers} speakers
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {event.sessions} sessions
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function EventDetailModal({ event, onClose }) {
  if (!event) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-52 overflow-hidden rounded-t-2xl">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
          >
            ✕
          </button>
          <div className="absolute bottom-4 left-4">
            <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-medium rounded-full mb-2 inline-block">
              {event.category}
            </span>
            <h2 className="text-2xl font-bold text-white">{event.title}</h2>
            <p className="text-white/80 text-sm">
              {event.month} {event.year}
            </p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <p className="text-gray-600 dark:text-gray-400">{event.description}</p>
          <div className="grid grid-cols-4 gap-3">
            <StatChip
              label="Registered"
              value={event.stats.registrations.toLocaleString()}
              color="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
            />
            <StatChip
              label="Attended"
              value={event.stats.attendance.toLocaleString()}
              color="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
            />
            <StatChip
              label="Feedback"
              value={event.stats.feedback}
              color="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
            />
            <StatChip
              label="Satisfaction"
              value={`${event.stats.satisfaction}%`}
              color="bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Event Highlights</h3>
            <ul className="space-y-1.5">
              {event.highlights.map((h, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1 text-yellow-500 font-bold">
              <Star className="w-4 h-4 fill-yellow-500" />
              {event.rating} / 5.0
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              <ExternalLink className="w-4 h-4" /> View Full Archive
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function YearSection({ year, events, onSelect }) {
  if (!events.length) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-5 h-5 text-indigo-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{year}</h2>
        <span className="text-sm text-gray-400">
          {events.length} event{events.length !== 1 ? "s" : ""}
        </span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((event) => (
          <ArchiveCard key={event.id} event={event} onClick={onSelect} />
        ))}
      </div>
    </div>
  );
}

function filterEvents(events, selectedYear, selectedCategory, search) {
  return events.filter((event) => {
    if (selectedYear !== "All" && event.year !== Number(selectedYear)) {
      return false;
    }

    if (selectedCategory !== "All" && event.category !== selectedCategory) {
      return false;
    }

    if (search && !event.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    return true;
  });
}

export default function EventArchivePage() {
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filtered = useMemo(
    () => filterEvents(ARCHIVED_EVENTS, selectedYear, selectedCategory, search),
    [selectedYear, selectedCategory, search]
  );

  const totalStats = useMemo(
    () => ({
      events: ARCHIVED_EVENTS.length,
      attendees: ARCHIVED_EVENTS.reduce((s, e) => s + e.attendees, 0),
      speakers: ARCHIVED_EVENTS.reduce((s, e) => s + e.speakers, 0),
      avgRating: (
        ARCHIVED_EVENTS.reduce((s, e) => s + e.rating, 0) / ARCHIVED_EVENTS.length
      ).toFixed(1),
    }),
    []
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-medium">
            <Archive className="w-4 h-4" /> Event Archive
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Our Event Legacy
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Browse through our history of successful events, milestones, and community achievements.
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Archived Events",
              value: totalStats.events,
              icon: Archive,
              color: "text-indigo-600",
            },
            {
              label: "Total Attendees",
              value: totalStats.attendees.toLocaleString(),
              icon: Users,
              color: "text-green-600",
            },
            {
              label: "Total Speakers",
              value: totalStats.speakers,
              icon: Trophy,
              color: "text-yellow-600",
            },
            {
              label: "Avg Rating",
              value: `${totalStats.avgRating}★`,
              icon: Star,
              color: "text-pink-600",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-center"
            >
              <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search archives..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200"
          >
            <option value="All">All Years</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Year Groups */}
        {YEARS.filter((year) => selectedYear === "All" || year === Number(selectedYear)).map(
          (year) => (
            <YearSection
              key={year}
              year={year}
              events={filtered.filter((event) => event.year === year)}
              onSelect={setSelectedEvent}
            />
          )
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Archive className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No archived events found for your filters.</p>
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
