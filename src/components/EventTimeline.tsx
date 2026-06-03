import React, { useState, useEffect } from "react";
import { useMyEvents } from "../context/MyEventsContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Trash2,
  Plus,
  AlertCircle,
  Sparkles,
  MapPin,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

// 1. Explicit TypeScript Interface for Event
export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  location?: string;
  description?: string;
}

// Helper to convert date ("YYYY-MM-DD") and time ("HH:MM AM/PM") into a Unix timestamp for precise sorting/comparison
const parseDateTime = (dateStr: string, timeStr: string): number => {
  // 🔥 FIX: Added safe fallbacks to prevent NaN sorting breaks
  if (!dateStr) return 0;
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 0;

  let hours = 0;
  let minutes = 0;

  if (timeStr) {
    const match = timeStr.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === "PM" && hours < 12) {
        hours += 12;
      } else if (ampm === "AM" && hours === 12) {
        hours = 0;
      }
    }
  }

  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
};

export const EventTimeline: React.FC = () => {
  const { myEvents } = useMyEvents();

  // 2. React Hooks to manage state & localStorage synchronization
  const [timeline, setTimeline] = useState<Event[]>(() => {
    // 🔥 FIX: SSR Guard to prevent ReferenceError crashes in test/server environments
    if (typeof window === "undefined") return [];
    
    try {
      const stored = localStorage.getItem("eventra_timeline");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load timeline from localStorage", e);
      return [];
    }
  });

  const [clashAlert, setClashAlert] = useState<{
    show: boolean;
    newEventTitle: string;
    clashingEventTitle: string;
    dateTime: string;
  } | null>(null);

  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("eventra_timeline", JSON.stringify(timeline));
    } catch (e) {
      console.error("Failed to save timeline to localStorage", e);
    }
  }, [timeline]);

  // Clear clash alert after 4 seconds
  useEffect(() => {
    if (clashAlert?.show) {
      const timer = setTimeout(() => {
        setClashAlert(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [clashAlert]);

  // Clear success toast after 3 seconds
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => {
        setSuccessToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // 3. Add to Planner Function with Dynamic Clash Detection
  const addToPlanner = (event: Event) => {
    // Check if event already exists in planner to avoid duplicates
    if (timeline.some((item) => item.id === event.id)) {
      setSuccessToast("This event is already scheduled in your timeline!");
      return;
    }

    // Check for a time conflict: shares the exact same date and time
    const conflictingEvent = timeline.find(
      (item) => item.date === event.date && item.time === event.time
    );

    if (conflictingEvent) {
      // Trigger a temporary visual alert banner with clash info
      setClashAlert({
        show: true,
        newEventTitle: event.title,
        clashingEventTitle: conflictingEvent.title,
        dateTime: `${event.date} at ${event.time}`,
      });
      return;
    }

    // Add to planner state
    setTimeline((prev) => [...prev, event]);
    setSuccessToast(`Successfully scheduled "${event.title}"!`);
  };

  // 4. Remove from Planner Function
  const removeFromPlanner = (id: string) => {
    setTimeline((prev) => prev.filter((item) => item.id !== id));
    setSuccessToast("Event removed from your timeline.");
  };

  // 5. Chronological Sorting by Date & Time
  const sortedTimeline = [...timeline].sort((a, b) => {
    const timeA = parseDateTime(a.date, a.time);
    const timeB = parseDateTime(b.date, b.time);
    return timeA - timeB;
  });

  // Get list of registered events from context, mapped to our Event interface shape
  const availableRegisteredEvents: Event[] = myEvents.map((record) => {
    const summary = record.eventSummary || {};
    return {
      id: String(record.eventId),
      title: summary.title || "Untitled Event",
      date: summary.date || "",
      time: record.event?.time || summary.event?.time || "12:00 PM", // Fallback to safe defaults
      category: summary.type || summary.category || "General",
      location: summary.location || "Online",
      description: record.event?.description || "",
    };
  });

  // Filter out registered events that are already in the timeline to suggest what is available
  const unscheduledEvents = availableRegisteredEvents.filter(
    (event) => !timeline.some((item) => item.id === event.id)
  );

  // Category Color Map (Slate/Dark Aesthetic HSL Colors)
  const getCategoryStyles = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("web") || cat.includes("react")) {
      return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
    }
    if (cat.includes("ai") || cat.includes("machine")) {
      return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
    }
    if (cat.includes("devops") || cat.includes("cloud")) {
      return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
    }
    if (cat.includes("design") || cat.includes("ux")) {
      return "bg-pink-500/10 text-pink-400 border border-pink-500/20";
    }
    if (cat.includes("blockchain") || cat.includes("web3")) {
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    }
    return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
  };

  return (
    <section className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.4)] my-12 relative overflow-hidden">
      {/* Absolute Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-indigo-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
                Interactive Schedule
              </span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
              My Timeline Planner
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Design your personalized conference day. Seamlessly schedule your registered events, track timing, and resolve conflicts instantly.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-center bg-slate-900/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Timeline Slots
              </span>
              <span className="text-lg font-bold text-indigo-400 tabular-nums">
                {timeline.length} {timeline.length === 1 ? "Event" : "Events"} Scheduled
              </span>
            </div>
          </div>
        </div>

        {/* Temporary Visual Notifications Banner (Clash Detection / Success Toast) */}
        <AnimatePresence>
          {clashAlert && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-8 p-4.5 bg-red-950/60 border border-red-500/40 rounded-2xl text-red-200 flex items-start gap-4 shadow-[0_10px_30px_rgba(239,68,68,0.15)] backdrop-blur-md"
            >
              <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="font-bold text-red-300 text-sm">Schedule Conflict Detected!</h4>
                <p className="text-xs text-red-200/90 mt-1">
                  Cannot schedule <strong className="text-white">"{clashAlert.newEventTitle}"</strong>. It conflicts directly with <strong className="text-white">"{clashAlert.clashingEventTitle}"</strong> on <strong className="underline decoration-red-400/50">{clashAlert.dateTime}</strong>.
                </p>
              </div>
              <button
                onClick={() => setClashAlert(null)}
                className="text-red-400 hover:text-red-300 text-xs font-bold transition"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {successToast && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="fixed bottom-6 right-6 z-50 px-5 py-3.5 bg-slate-900 border border-indigo-500/30 rounded-2xl text-indigo-200 flex items-center gap-3 shadow-[0_15px_30px_rgba(0,0,0,0.5)] backdrop-blur-md"
            >
              <CheckCircle className="text-indigo-400" size={18} />
              <span className="text-sm font-semibold">{successToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unified Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Available Registered Events (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-indigo-400" />
                Registered Events
              </h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                These are the events you are registered to attend. Select them below to add to your custom visual schedule timeline.
              </p>

              {availableRegisteredEvents.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/50">
                  <HelpCircle className="mx-auto text-slate-600 mb-3" size={32} />
                  <p className="text-sm text-slate-400 font-medium">No registrations yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Register for upcoming events on the dashboard above, and they will appear here to plan!
                  </p>
                </div>
              ) : unscheduledEvents.length === 0 ? (
                <div className="text-center py-6 px-4 rounded-xl border border-dashed border-indigo-900/20 bg-indigo-950/5">
                  <CheckCircle className="mx-auto text-indigo-400 mb-2" size={24} />
                  <p className="text-xs text-indigo-300 font-semibold">All set!</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    All your registered events have been successfully scheduled in your timeline.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                  <AnimatePresence initial={false}>
                    {unscheduledEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{ y: -1 }}
                        className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${getCategoryStyles(event.category)}`}>
                            {event.category}
                          </span>
                          <h4 className="text-sm font-semibold text-slate-200 truncate pr-2">
                            {event.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1 font-medium text-slate-400">
                              <Calendar size={11} className="text-slate-500" />
                              {event.date}
                            </span>
                            <span className="flex items-center gap-1 font-medium text-indigo-400/90">
                              <Clock size={11} className="text-indigo-400/70" />
                              {event.time}
                            </span>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => addToPlanner(event)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl p-2 cursor-pointer flex items-center justify-center shrink-0 shadow-lg hover:shadow-indigo-500/20 transition-all border border-indigo-500/20"
                          title="Schedule this event"
                        >
                          <Plus size={16} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Sleek Chronological Vertical Timeline (7 Columns) */}
          <div className="lg:col-span-7 bg-slate-900/20 border border-slate-850 rounded-2xl p-6 flex flex-col gap-6 min-h-[400px]">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-400" />
              My Schedule Timeline
            </h3>

            {sortedTimeline.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 rounded-xl border border-dashed border-slate-800 bg-slate-950/20 text-center">
                <Clock className="text-slate-600 mb-3 animate-pulse" size={40} />
                <p className="text-sm font-semibold text-slate-300">Your timeline is empty</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Schedule some of your registered events using the panel on the left to map your day visually.
                </p>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 border-l border-slate-800 ml-3 flex flex-col gap-6 py-2">
                <AnimatePresence initial={false}>
                  {sortedTimeline.map((item, index) => {
                    const parsedDate = new Date(item.date);
                    // 🔥 FIX: Safe date formatting to prevent RangeError crash
                    const formattedDate = isNaN(parsedDate.getTime()) 
                      ? "Date TBD" 
                      : parsedDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        });

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                        className="relative group"
                      >
                        {/* 5. Custom bullet points on the border-left vertical line */}
                        <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4.5 h-4.5 rounded-full border-3 border-indigo-950 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] group-hover:bg-purple-500 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.7)] transition-all duration-300 z-10 shrink-0" />

                        {/* Event Details Card */}
                        <div className="p-4 bg-slate-950/80 hover:bg-slate-900/90 rounded-2xl border border-slate-850 hover:border-slate-750 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Date, Time & Category Tags */}
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md px-2 py-0.5">
                                {formattedDate}
                              </span>
                              <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase flex items-center gap-1 bg-indigo-950/30 border border-indigo-900/20 rounded-md px-2 py-0.5">
                                <Clock size={10} />
                                {item.time}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getCategoryStyles(item.category)}`}>
                                {item.category}
                              </span>
                            </div>

                            {/* Title */}
                            <h4 className="text-base font-bold text-white tracking-tight leading-tight group-hover:text-indigo-400 transition duration-300">
                              {item.title}
                            </h4>

                            {/* Optional Details (Location, Description) */}
                            <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-400">
                              <span className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                                <MapPin size={11} className="text-pink-500/80" />
                                {item.location || "Online"}
                              </span>
                              {item.description && (
                                <span className="hidden sm:inline-block text-[11px] text-slate-500 truncate max-w-sm">
                                  — {item.description}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Button: Remove */}
                          <motion.button
                            whileHover={{ scale: 1.1, color: "#f87171" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromPlanner(item.id)}
                            className="text-slate-500 hover:text-red-400 p-2 rounded-xl bg-slate-900 border border-slate-800/80 cursor-pointer hover:border-red-500/20 transition-all self-end sm:self-center shrink-0 shadow-inner"
                            title="Remove from timeline"
                            aria-label={`Remove ${item.title} from timeline`}
                          >
                            <Trash2 size={14} />
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};