import React, { useState } from "react";
import { useMyEvents } from "../../context/MyEventsContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  ExternalLink,
  Download,
  AlertCircle,
  Grid,
  Filter,
  Activity,
  Share2,
} from "lucide-react";
import {
  downloadICSFile,
  downloadBulkICSFile,
  generateGoogleCalendarLink,
  generateOutlookLink,
} from "../../utils/calendarExporter";
import SkeletonCalendar from "../../components/common/SkeletonCalendar";

// Category Configuration Map
const CATEGORIES = [
  { id: "all", label: "All Events", color: "from-indigo-500 to-indigo-600", glow: "shadow-indigo-500/20" },
  { id: "gssoc", label: "GSSoC", color: "from-pink-500 to-rose-600", glow: "shadow-pink-500/20" },
  { id: "ai/web3", label: "AI / Web3", color: "from-purple-500 to-violet-600", glow: "shadow-purple-500/20" },
  { id: "workshops", label: "Workshops", color: "from-cyan-500 to-blue-600", glow: "shadow-cyan-500/20" },
  { id: "hackathons", label: "Hackathons", color: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/20" },
  { id: "community", label: "Community", color: "from-amber-500 to-orange-600", glow: "shadow-amber-500/20" },
];

const MyCalendar = () => {
  const { myEvents, loading } = useMyEvents();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "timeline"
  const [activeCategory, setActiveCategory] = useState("all");

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handleMonthChange = (e) => {
    setCurrentDate(new Date(currentYear, parseInt(e.target.value), 1));
  };

  const handleYearChange = (e) => {
    setCurrentDate(new Date(parseInt(e.target.value), currentMonth, 1));
  };

  // Detect scheduling conflicts (overlapping time slots on the same day)
  const hasOverlappingEvents = (events) => {
    if (events.length <= 1) return false;
    
    // Sort events by their date/time
    const sorted = [...events]
      .filter(item => item.event?.date)
      .sort((a, b) => new Date(a.event.date) - new Date(b.event.date));
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = new Date(sorted[i].event.date);
      const currentDuration = sorted[i].event.durationMinutes || 60;
      const currentEnd = new Date(current.getTime() + currentDuration * 60000);
      
      const next = new Date(sorted[i + 1].event.date);
      
      if (next < currentEnd) {
        return true;
      }
    }
    return false;
  };

  // Calendar Date Calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Matches item's category to the active selector
  const matchesCategory = (itemCategory, selectedCat) => {
    if (selectedCat === "all") return true;
    if (!itemCategory) return false;
    const ic = itemCategory.toLowerCase();
    const sc = selectedCat.toLowerCase();
    if (sc === "hackathons") return ic.includes("hackathon");
    if (sc === "workshops") return ic.includes("workshop");
    if (sc === "community") return ic.includes("community");
    if (sc === "gssoc") return ic.includes("gssoc");
    if (sc === "ai/web3") return ic.includes("ai") || ic.includes("web3");
    return ic === sc;
  };

  // Get active category colors
  const getCategoryTheme = (categoryName) => {
    if (!categoryName) return CATEGORIES[0];
    const name = categoryName.toLowerCase();
    if (name.includes("hackathon")) return CATEGORIES[4];
    if (name.includes("workshop")) return CATEGORIES[3];
    if (name.includes("community")) return CATEGORIES[5];
    if (name.includes("gssoc")) return CATEGORIES[1];
    if (name.includes("ai") || name.includes("web3")) return CATEGORIES[2];
    return CATEGORIES[0];
  };

  // Filter events registered in the current displayed month & selected category
  const getEventsForDate = (day) => {
    return myEvents.filter((item) => {
      if (!item.event?.date) return false;
      const eventDate = new Date(item.event.date);
      const inMonth =
        eventDate.getFullYear() === currentYear &&
        eventDate.getMonth() === currentMonth &&
        eventDate.getDate() === day;
      return inMonth && matchesCategory(item.event.category, activeCategory);
    });
  };

  // Check if a specific date is selected
  const isSelected = (day) => {
    return (
      selectedDate.getFullYear() === currentYear &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getDate() === day
    );
  };

  // Get active selected date's events
  const getSelectedDateEvents = () => {
    return myEvents.filter((item) => {
      if (!item.event?.date) return false;
      const eventDate = new Date(item.event.date);
      const isSameDate =
        eventDate.getFullYear() === selectedDate.getFullYear() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getDate() === selectedDate.getDate();
      return isSameDate && matchesCategory(item.event.category, activeCategory);
    });
  };

  // Filter all events across time by active category
  const getFilteredAllEvents = () => {
    return myEvents
      .filter((item) => item.event && matchesCategory(item.event.category, activeCategory))
      .sort((a, b) => new Date(a.event.date) - new Date(b.event.date));
  };

  const selectedEvents = getSelectedDateEvents();
  const timelineEvents = getFilteredAllEvents();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-20 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xs tracking-wider uppercase">
              <CalendarIcon className="w-4.5 h-4.5" />
              Scheduling Studio
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1.5 bg-clip-text text-transparent bg-gradient-to-r from-slate-950 to-indigo-700 dark:from-slate-100 dark:to-indigo-400">
              Registrations Calendar
            </h1>
            <p className="text-slate-550 dark:text-slate-400 mt-2 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Organize, filter, and synchronize your GSSoC registrations. Switch between high-contrast calendar matrices and interactive chronological timelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* VIEW SWITCHER */}
            <div className="flex items-center gap-2 bg-slate-150/80 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/30 backdrop-blur-xs shadow-inner">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-800 shadow-md text-indigo-650 dark:text-indigo-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                aria-label="Grid calendar view"
              >
                <Grid className="w-3.5 h-3.5" />
                Calendar Grid
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`p-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "timeline"
                    ? "bg-white dark:bg-slate-800 shadow-md text-indigo-650 dark:text-indigo-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                aria-label="Chronological timeline view"
              >
                <Activity className="w-3.5 h-3.5" />
                Timeline View ({timelineEvents.length})
              </button>
            </div>

            {/* BULK EXPORT BUTTON */}
            {myEvents.length > 0 && (
              <button
                onClick={() => downloadBulkICSFile(myEvents)}
                className="p-2.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md hover:shadow-lg hover:scale-102"
                aria-label="Export all events as ICS"
              >
                <Download className="w-3.5 h-3.5" />
                Export All ({myEvents.length})
              </button>
            )}
          </div>
        </div>

       {loading ? (
  <div
    role="status"
    aria-live="polite"
    aria-label="Loading calendar"
  >
    <span className="sr-only">
      Loading calendar registrations...
    </span>

    <SkeletonCalendar />
  </div>
) : (
  <>
    {/* PREMIUM FILTER ROW */}
    <div className="space-y-3.5">
      <div className="flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
        <Filter className="w-3.5 h-3.5" />
        <span>Category Filters</span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {CATEGORIES.map((cat) => {
          const isActive =
            activeCategory === cat.id;

          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() =>
                setActiveCategory(cat.id)
              }
              className={`relative p-2.5 px-4 rounded-xl text-xs font-black tracking-wide border cursor-pointer transition-all ${
                isActive
                  ? "bg-gradient-to-r from-indigo-500/10 to-indigo-600/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-500/5"
                  : "bg-white/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/40 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-350 dark:hover:border-slate-700"
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full bg-gradient-to-r ${cat.color}`}
                />
                {cat.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>

    {/* VIEW SWITCH */}
    <AnimatePresence mode="wait">
      {viewMode === "grid" ? (
        <motion.div
          key="grid-container"
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -15,
          }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* GRID CALENDAR */}
          <div className="lg:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-250/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-md space-y-6">
            
            {/* MONTH CONTROLS */}
            <div className="flex items-center justify-between border-b border-slate-100/80 dark:border-slate-850/50 pb-4">
              <h2 className="text-lg font-black text-slate-850 dark:text-slate-100 tracking-tight flex items-center gap-2">
                {monthNames[currentMonth]}{" "}
                {currentYear}
              </h2>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-100 dark:border-slate-800/40 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-350" />
                </button>

                <button
                  onClick={nextMonth}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-100 dark:border-slate-800/40 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-355" />
                </button>
              </div>
            </div>

            {/* CALENDAR BODY */}
            <div
              role="grid"
              aria-label="Monthly Schedule Grid"
              className="space-y-3"
            >
              {/* DAYS */}
              <div
                role="row"
                className="grid grid-cols-7 gap-2.5 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
              >
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    role="columnheader"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* DATE GRID */}
              <div className="grid grid-cols-7 gap-2.5">

                {/* EMPTY CELLS */}
                {Array.from({
                  length: firstDayOfMonth,
                }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="aspect-square rounded-2xl bg-slate-50/20 dark:bg-slate-950/10 border border-dashed border-slate-100/50 dark:border-slate-900/40 opacity-20"
                  />
                ))}

                {/* DAYS */}
                {Array.from({
                  length: daysInMonth,
                }).map((_, idx) => {
                  const day = idx + 1;

                  const cellDate =
                    new Date(
                      currentYear,
                      currentMonth,
                      day
                    );

                  const dayEvents =
                    getEventsForDate(day);

                  const selected =
                    isSelected(day);

                  const isToday =
                    new Date().getDate() ===
                      day &&
                    new Date().getMonth() ===
                      currentMonth &&
                    new Date().getFullYear() ===
                      currentYear;

                  return (
                    <button
                      key={`day-${day}`}
                      role="gridcell"
                      onClick={() =>
                        setSelectedDate(
                          cellDate
                        )
                      }
                      className={`aspect-square rounded-2xl border p-2 flex flex-col justify-between items-start cursor-pointer transition-all ${
                        selected
                          ? "bg-indigo-650 border-indigo-600 text-white shadow-lg shadow-indigo-600/10 scale-102"
                          : isToday
                          ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 text-indigo-750 dark:text-indigo-400 font-extrabold"
                          : "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/70 hover:border-slate-350 dark:hover:border-slate-700"
                      }`}
                    >
                      <span
                        className={`text-[11px] font-black ${
                          selected
                            ? "text-white"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {day}
                      </span>

                      {dayEvents.length >
                        0 && (
                        <div className="w-full flex items-center justify-end gap-1">
                          {dayEvents
                            .slice(0, 3)
                            .map(
                              (
                                item,
                                i
                              ) => {
                                const theme =
                                  getCategoryTheme(
                                    item
                                      .event
                                      ?.category
                                  );

                                return (
                                  <span
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      selected
                                        ? "bg-white"
                                        : `bg-gradient-to-r ${theme.color}`
                                    }`}
                                  />
                                );
                              }
                            )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-250/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-md">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-slate-100 border-b border-slate-100/80 dark:border-slate-800 pb-3">
                📅 Day Schedule
              </h3>

              <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-3 uppercase tracking-wider">
                {selectedDate.toLocaleDateString(
                  "en-US",
                  {
                    weekday:
                      "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </p>

              <div className="mt-5 space-y-4">
                {selectedEvents.length >
                0 ? (
                  selectedEvents.map(
                    (item) => (
                      <div
                        key={
                          item.eventId
                        }
                        className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/15"
                      >
                        <h4 className="font-bold">
                          {
                            item.event
                              .title
                          }
                        </h4>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    No events scheduled.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="timeline-container"
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -15,
          }}
          className="relative pl-6 sm:pl-10 space-y-8"
        >
          {/* TIMELINE VIEW */}
        </motion.div>
      )}
    </AnimatePresence>
  </>
)}

      </div>
    </div>
  );
};

export default MyCalendar;
