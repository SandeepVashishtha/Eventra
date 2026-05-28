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
} from "lucide-react";
import {
  downloadICSFile,
  downloadBulkICSFile,
  generateGoogleCalendarLink,
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
  const [viewMode, setViewMode] = useState("grid");
  const [activeCategory, setActiveCategory] = useState("all");
  const [announcement, setAnnouncement] = useState("");

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const selectDay = (day) => {
    const cellDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(cellDate);
    const dayEvents = getEventsForDate(day);
    setAnnouncement(
      `Selected ${cellDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}. ${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"} scheduled.`
    );
  };

  const prevMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    setCurrentDate(newDate);
    setAnnouncement(`Switched to calendar view for ${monthNames[newDate.getMonth()]} ${newDate.getFullYear()}`);
  };

  const nextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    setCurrentDate(newDate);
    setAnnouncement(`Switched to calendar view for ${monthNames[newDate.getMonth()]} ${newDate.getFullYear()}`);
  };

  const handleDayKeyDown = (e, day) => {
    let nextFocusDay = null;
    if (e.key === "ArrowRight") nextFocusDay = day + 1;
    else if (e.key === "ArrowLeft") nextFocusDay = day - 1;
    else if (e.key === "ArrowDown") nextFocusDay = day + 7;
    else if (e.key === "ArrowUp") nextFocusDay = day - 7;

    if (nextFocusDay !== null && nextFocusDay >= 1 && nextFocusDay <= daysInMonth) {
      e.preventDefault();
      selectDay(nextFocusDay);
      setTimeout(() => {
        const btn = document.getElementById(`calendar-cell-${nextFocusDay}`);
        btn?.focus();
      }, 0);
    }
  };

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

  const getCategoryBorderColor = (theme) => {
    const colorMap = {
      "gssoc": "#ec4899",
      "ai/web3": "#a855f7",
      "workshops": "#06b6d4",
      "hackathons": "#10b981",
      "community": "#f59e0b",
    };
    return colorMap[theme.id] || "#6366f1";
  };

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

  const isSelected = (day) => {
    return (
      selectedDate.getFullYear() === currentYear &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getDate() === day
    );
  };

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

  const getFilteredAllEvents = () => {
    return myEvents
      .filter((item) => item.event && matchesCategory(item.event.category, activeCategory))
      .sort((a, b) => new Date(a.event.date) - new Date(b.event.date));
  };

  const selectedEvents = getSelectedDateEvents();
  const timelineEvents = getFilteredAllEvents();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-20 px-4 md:px-8 transition-colors duration-300">
      {/* Screen reader live region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {announcement}
      </div>

      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xs tracking-wider uppercase">
              <CalendarIcon className="w-4 h-4" />
              Scheduling Studio
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1.5 bg-clip-text text-transparent bg-gradient-to-r from-slate-950 to-indigo-700 dark:from-slate-100 dark:to-indigo-400">
              Registrations Calendar
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Organize, filter, and synchronize your GSSoC registrations. Switch between calendar matrices and interactive chronological timelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* VIEW SWITCHER */}
            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/30 shadow-inner">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-800 shadow-md text-indigo-600 dark:text-indigo-400"
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
                    ? "bg-white dark:bg-slate-800 shadow-md text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                aria-label="Chronological timeline view"
              >
                <Activity className="w-3.5 h-3.5" />
                Timeline View ({timelineEvents.length})
              </button>
            </div>

            {/* BULK EXPORT */}
            {myEvents.length > 0 && (
              <button
                onClick={() => downloadBulkICSFile(myEvents)}
                className="p-2.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md hover:shadow-lg"
                aria-label="Export all events as ICS"
              >
                <Download className="w-3.5 h-3.5" />
                Export All ({myEvents.length})
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div role="status" aria-live="polite" aria-label="Loading calendar">
            <span className="sr-only">Loading calendar registrations...</span>
            <SkeletonCalendar />
          </div>
        ) : (
          <>
            {/* CATEGORY FILTERS */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                <Filter className="w-3.5 h-3.5" />
                <span>Category Filters</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <motion.button
                      key={cat.id}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`relative p-2.5 px-4 rounded-xl text-xs font-black tracking-wide border cursor-pointer transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-500/10 to-indigo-600/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-md"
                          : "bg-white/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/40 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${cat.color}`} />
                        {cat.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* VIEW */}
            <AnimatePresence mode="wait">
              {viewMode === "grid" ? (
                <motion.div
                  key="grid-container"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  {/* CALENDAR GRID */}
                  <div className="lg:col-span-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-md space-y-6">
                    {/* MONTH CONTROLS */}
                    <div className="flex items-center justify-between border-b border-slate-100/80 dark:border-slate-800/50 pb-4">
                      <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                        {monthNames[currentMonth]} {currentYear}
                      </h2>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={prevMonth}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 transition cursor-pointer"
                          aria-label="Previous month"
                        >
                          <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button
                          onClick={nextMonth}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 transition cursor-pointer"
                          aria-label="Next month"
                        >
                          <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </button>
                      </div>
                    </div>

                    {/* CALENDAR BODY */}
                    <div role="grid" aria-label="Monthly Schedule Grid" className="space-y-3">
                      {/* DAY HEADERS */}
                      <div
                        role="row"
                        className="grid grid-cols-7 gap-2.5 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
                      >
                        {daysOfWeek.map((day) => (
                          <div key={day} role="columnheader">{day}</div>
                        ))}
                      </div>

                      {/* DATE GRID */}
                      <div className="grid grid-cols-7 gap-2.5">
                        {/* EMPTY CELLS */}
                        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                          <div
                            key={`empty-${idx}`}
                            className="aspect-square rounded-2xl bg-slate-50/20 dark:bg-slate-950/10 border border-dashed border-slate-100/50 dark:border-slate-900/40 opacity-20"
                          />
                        ))}

                        {/* DAY CELLS */}
                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                          const day = idx + 1;
                          const dayEvents = getEventsForDate(day);
                          const selected = isSelected(day);
                          const isToday =
                            new Date().getDate() === day &&
                            new Date().getMonth() === currentMonth &&
                            new Date().getFullYear() === currentYear;

                          return (
                            <button
                              key={`day-${day}`}
                              id={`calendar-cell-${day}`}
                              role="gridcell"
                              onClick={() => selectDay(day)}
                              onKeyDown={(e) => handleDayKeyDown(e, day)}
                              aria-selected={selected}
                              className={`aspect-square rounded-2xl border p-2 flex flex-col justify-between items-start cursor-pointer transition-all ${
                                selected
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                                  : isToday
                                  ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 font-extrabold"
                                  : "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700"
                              }`}
                            >
                              <span className={`text-[11px] font-black ${selected ? "text-white" : "text-slate-400 dark:text-slate-500"}`}>
                                {day}
                              </span>
                              {dayEvents.length > 0 && (
                                <div className="w-full flex items-center justify-end gap-1">
                                  {dayEvents.slice(0, 3).map((item, i) => {
                                    const theme = getCategoryTheme(item.event?.category);
                                    return (
                                      <span
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          selected ? "bg-white" : `bg-gradient-to-r ${theme.color}`
                                        }`}
                                      />
                                    );
                                  })}
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
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-md">
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-100/80 dark:border-slate-800 pb-3">
                        📅 Day Schedule
                      </h3>
                      <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-3 uppercase tracking-wider">
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <div className="mt-5 space-y-4">
                        {selectedEvents.length > 0 ? (
                          selectedEvents.map((item) => (
                            <div
                              key={item.eventId}
                              className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/15"
                            >
                              <div>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                  {item.event.category || "General"}
                                </span>
                                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 mt-1 truncate">
                                  {item.event.title}
                                </h4>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-2">
                                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>{new Date(item.event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-1">
                                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span className="truncate max-w-[200px]">{item.event.location || "Virtual / Online"}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 mt-3">
                                <button
                                  type="button"
                                  onClick={() => downloadICSFile(item.event)}
                                  aria-label={`Download ICS for ${item.event.title}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition"
                                >
                                  <Download className="w-3 h-3 text-slate-500" aria-hidden="true" />
                                  Download ICS
                                </button>
                                <a
                                  href={generateGoogleCalendarLink(item.event)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition"
                                >
                                  <ExternalLink className="w-3 h-3 text-indigo-500" aria-hidden="true" />
                                  Google Calendar
                                </a>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                            <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" aria-hidden="true" />
                            <p className="text-slate-400 text-xs leading-relaxed max-w-[200px]">
                              No registrations scheduled for this date.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* TIMELINE VIEW */
                <motion.div
                  key="timeline-container"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="relative pl-6 sm:pl-10 space-y-8"
                >
                  {/* Vertical line */}
                  <div className="absolute left-3.5 sm:left-5 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800/80 rounded-full" />
                  <div className="absolute left-3.5 sm:left-5 top-2 h-1/2 w-0.5 bg-gradient-to-b from-indigo-500 to-pink-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />

                  {timelineEvents.length > 0 ? (
                    <div className="space-y-8">
                      {timelineEvents.map((item, index) => {
                        const theme = getCategoryTheme(item.event?.category);
                        const eventDate = new Date(item.event.date);

                        return (
                          <motion.div
                            key={item.eventId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.08, type: "spring", stiffness: 150 }}
                            className="relative flex flex-col md:flex-row gap-5 items-start"
                          >
                            {/* Timeline node */}
                            <div
                              className="absolute -left-[30px] sm:-left-[37px] top-1.5 w-5 h-5 rounded-full bg-white dark:bg-slate-950 border-4 flex items-center justify-center z-10"
                              style={{ borderColor: getCategoryBorderColor(theme) }}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${theme.color} animate-ping`} />
                            </div>

                            {/* Date label */}
                            <div className="w-[110px] shrink-0 text-left md:text-right pt-0.5">
                              <span className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                {eventDate.toLocaleDateString("en-US", { weekday: "short" })}
                              </span>
                              <span className="block text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none mt-1">
                                {eventDate.getDate()} {eventDate.toLocaleDateString("en-US", { month: "short" })}
                              </span>
                              <span className="block text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mt-1.5">
                                {eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>

                            {/* Event card */}
                            <motion.div
                              whileHover={{ y: -4, scale: 1.01 }}
                              className="flex-1 w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 p-5 rounded-3xl shadow-sm hover:shadow-lg hover:border-indigo-400/40 dark:hover:border-indigo-500/30 transition-all duration-300"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2.5">
                                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase bg-gradient-to-r ${theme.color} text-white`}>
                                      {item.event.category || "General"}
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-400">
                                      Registered: {new Date(item.registeredAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                                    {item.event.title}
                                  </h4>
                                  <p className="text-xs text-slate-500 max-w-xl truncate mt-1">
                                    {item.event.description}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                                    <span className="flex items-center gap-1">
                                      <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                                      {new Date(item.event.date).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                                      {new Date(item.event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                                      {item.event.location || "Online"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                                  <button
                                    type="button"
                                    onClick={() => downloadICSFile(item.event)}
                                    aria-label={`Download ICS for ${item.event.title}`}
                                    className="p-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm"
                                    title="Download .ics file"
                                  >
                                    <Download className="w-4 h-4" aria-hidden="true" />
                                  </button>
                                  <a
                                    href={generateGoogleCalendarLink(item.event)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm flex items-center gap-1.5"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                                    Sync Google
                                  </a>
                                </div>
                              </div>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                      <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse" aria-hidden="true" />
                      <div>
                        <h4 className="font-extrabold text-slate-800 dark:text-slate-200">No Active Registrations</h4>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm mt-1 mx-auto">
                          Explore Eventra events and register to build your schedule!
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </main>
  );
};

export default MyCalendar;