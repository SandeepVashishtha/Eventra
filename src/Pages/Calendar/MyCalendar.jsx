import { useState } from "react";
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
  {
    id: "all",
    label: "All Events",
    color: "from-indigo-500 to-indigo-600",
    glow: "shadow-indigo-500/20",
  },
  { id: "gssoc", label: "GSSoC", color: "from-pink-500 to-rose-600", glow: "shadow-pink-500/20" },
  {
    id: "ai/web3",
    label: "AI / Web3",
    color: "from-purple-500 to-violet-600",
    glow: "shadow-purple-500/20",
  },
  {
    id: "workshops",
    label: "Workshops",
    color: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/20",
  },
  {
    id: "hackathons",
    label: "Hackathons",
    color: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
  },
  {
    id: "community",
    label: "Community",
    color: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
  },
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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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
    setAnnouncement(
      `Switched to calendar view for ${monthNames[newDate.getMonth()]} ${newDate.getFullYear()}`
    );
  };

  const nextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    setCurrentDate(newDate);
    setAnnouncement(
      `Switched to calendar view for ${monthNames[newDate.getMonth()]} ${newDate.getFullYear()}`
    );
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
      gssoc: "#ec4899",
      "ai/web3": "#a855f7",
      workshops: "#06b6d4",
      hackathons: "#10b981",
      community: "#f59e0b",
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

  const today = new Date();
  const selectedEvents = getSelectedDateEvents();
  const timelineEvents = getFilteredAllEvents();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-20 text-slate-900 transition-colors duration-300 md:px-8 dark:bg-slate-950 dark:text-slate-100">
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

      <div className="mx-auto max-w-6xl space-y-8">
        {/* HEADER */}
        <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-black tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
              <CalendarIcon className="h-4 w-4" />
              Scheduling Studio
            </div>
            <h1 className="mt-1.5 bg-gradient-to-r from-slate-950 to-indigo-700 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl dark:from-slate-100 dark:to-indigo-400">
              Registrations Calendar
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm dark:text-slate-400">
              Organize, filter, and synchronize your GSSoC registrations. Switch between calendar
              matrices and interactive chronological timelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* VIEW SWITCHER */}
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200/40 bg-slate-100/80 p-1.5 shadow-inner dark:border-slate-800/30 dark:bg-slate-900/60">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex cursor-pointer items-center gap-1.5 rounded-xl p-2 px-3 text-xs font-black tracking-wider uppercase transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-indigo-600 shadow-md dark:bg-slate-800 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
                aria-label="Grid calendar view"
              >
                <Grid className="h-3.5 w-3.5" />
                Calendar Grid
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`flex cursor-pointer items-center gap-1.5 rounded-xl p-2 px-3 text-xs font-black tracking-wider uppercase transition-all ${
                  viewMode === "timeline"
                    ? "bg-white text-indigo-600 shadow-md dark:bg-slate-800 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
                aria-label="Chronological timeline view"
              >
                <Activity className="h-3.5 w-3.5" />
                Timeline View ({timelineEvents.length})
              </button>
            </div>

            {/* BULK EXPORT */}
            {myEvents.length > 0 && (
              <button
                onClick={() => downloadBulkICSFile(myEvents)}
                className="flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 p-2.5 px-4 text-xs font-black tracking-wider text-white uppercase shadow-md transition-all hover:from-indigo-500 hover:to-indigo-600 hover:shadow-lg"
                aria-label="Export all events as ICS"
              >
                <Download className="h-3.5 w-3.5" />
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
              <div className="flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
                <Filter className="h-3.5 w-3.5" />
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
                      className={`relative cursor-pointer rounded-xl border p-2.5 px-4 text-xs font-black tracking-wide transition-all ${
                        isActive
                          ? "border-indigo-500 bg-gradient-to-r from-indigo-500/10 to-indigo-600/15 text-indigo-600 shadow-md dark:text-indigo-400"
                          : "border-slate-200/50 bg-white/50 text-slate-500 hover:text-slate-800 dark:border-slate-800/40 dark:bg-slate-900/30 dark:hover:text-slate-200"
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${cat.color}`} />
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
                  className="grid grid-cols-1 gap-8 lg:grid-cols-3"
                >
                  {/* CALENDAR GRID */}
                  <div className="space-y-6 rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-md backdrop-blur-xl lg:col-span-2 dark:border-slate-800/60 dark:bg-slate-900/60">
                    {/* MONTH CONTROLS */}
                    <div className="flex items-center justify-between border-b border-slate-100/80 pb-4 dark:border-slate-800/50">
                      <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
                        {monthNames[currentMonth]} {currentYear}
                      </h2>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={prevMonth}
                          className="cursor-pointer rounded-xl border border-slate-100 bg-slate-50 p-2 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                          aria-label="Previous month"
                        >
                          <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button
                          onClick={nextMonth}
                          className="cursor-pointer rounded-xl border border-slate-100 bg-slate-50 p-2 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                          aria-label="Next month"
                        >
                          <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </button>
                      </div>
                    </div>

                    {/* CALENDAR BODY */}
                    <div role="grid" aria-label="Monthly Schedule Grid" className="space-y-3">
                      {/* DAY HEADERS */}
                      <div
                        role="row"
                        className="grid grid-cols-7 gap-2.5 text-center text-[10px] font-black tracking-widest text-slate-400 uppercase dark:text-slate-500"
                      >
                        {daysOfWeek.map((day) => (
                          <div key={day} role="columnheader">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* DATE GRID */}
                      <div className="grid grid-cols-7 gap-2.5">
                        {/* EMPTY CELLS */}
                        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                          <div
                            key={`empty-${idx}`}
                            className="aspect-square rounded-2xl border border-dashed border-slate-100/50 bg-slate-50/20 opacity-20 dark:border-slate-900/40 dark:bg-slate-950/10"
                          />
                        ))}

                        {/* DAY CELLS */}
                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                          const day = idx + 1;
                          const dayEvents = getEventsForDate(day);
                          const selected = isSelected(day);
                          const isToday =
                            today.getDate() === day &&
                            today.getMonth() === currentMonth &&
                            today.getFullYear() === currentYear;

                          return (
                            <button
                              key={`day-${day}`}
                              id={`calendar-cell-${day}`}
                              role="gridcell"
                              onClick={() => selectDay(day)}
                              onKeyDown={(e) => handleDayKeyDown(e, day)}
                              aria-selected={selected}
                              className={`flex aspect-square cursor-pointer flex-col items-start justify-between rounded-2xl border p-2 transition-all ${
                                selected
                                  ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                                  : isToday
                                    ? "border-indigo-200 bg-indigo-50 font-extrabold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/20 dark:text-indigo-400"
                                    : "border-slate-200/60 bg-white hover:border-slate-300 dark:border-slate-800/70 dark:bg-slate-900 dark:hover:border-slate-700"
                              }`}
                            >
                              <span
                                className={`text-[11px] font-black ${selected ? "text-white" : "text-slate-400 dark:text-slate-500"}`}
                              >
                                {day}
                              </span>
                              {dayEvents.length > 0 && (
                                <div className="flex w-full items-center justify-end gap-1">
                                  {dayEvents.slice(0, 3).map((item, i) => {
                                    const theme = getCategoryTheme(item.event?.category);
                                    return (
                                      <span
                                        key={`${item.eventId}-${i}`}
                                        className={`h-1.5 w-1.5 rounded-full ${
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
                    <div className="rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-md backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60">
                      <h3 className="border-b border-slate-100/80 pb-3 text-sm font-black tracking-wider text-slate-900 uppercase dark:border-slate-800 dark:text-slate-100">
                        📅 Day Schedule
                      </h3>
                      <p className="mt-3 text-xs font-black tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
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
                              className="border-slate-150 rounded-2xl border bg-slate-50/50 p-4 dark:border-slate-800/50 dark:bg-slate-800/15"
                            >
                              <div>
                                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-black text-indigo-700 uppercase dark:bg-indigo-950 dark:text-indigo-300">
                                  {item.event.category || "General"}
                                </span>
                                <h4
                                  title={item.event.title}
                                  className="mt-1 line-clamp-2 min-w-0 text-sm font-extrabold break-words text-slate-900 dark:text-slate-100"
                                >
                                  {item.event.title}
                                </h4>
                                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span>
                                    {new Date(item.event.date).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                                  <span className="max-w-[200px] truncate">
                                    {item.event.location || "Virtual / Online"}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200/60 pt-2 dark:border-slate-800/60">
                                <button
                                  type="button"
                                  onClick={() => downloadICSFile(item.event)}
                                  aria-label={`Download ICS for ${item.event.title}`}
                                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                >
                                  <Download className="h-3 w-3 text-slate-500" aria-hidden="true" />
                                  Download ICS
                                </button>
                                <a
                                  href={generateGoogleCalendarLink(item.event)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                >
                                  <ExternalLink
                                    className="h-3 w-3 text-indigo-500"
                                    aria-hidden="true"
                                  />
                                  Google Calendar
                                </a>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center space-y-3 py-10 text-center">
                            <AlertCircle
                              className="h-8 w-8 text-slate-300 dark:text-slate-600"
                              aria-hidden="true"
                            />
                            <p className="max-w-[200px] text-xs leading-relaxed text-slate-400">
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
                  className="relative space-y-8 pl-6 sm:pl-10"
                >
                  {timelineEvents.length > 0 ? (
                    <>
                      {/* Vertical line */}
                      <div className="absolute top-2 bottom-2 left-3.5 w-0.5 rounded-full bg-slate-200 sm:left-5 dark:bg-slate-800/80" />
                      <div className="absolute top-2 left-3.5 h-1/2 w-0.5 rounded-full bg-gradient-to-b from-indigo-500 to-pink-500 shadow-[0_0_8px_rgba(99,102,241,0.5)] sm:left-5" />

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
                              className="relative flex flex-col items-start gap-5 md:flex-row"
                            >
                              {/* Timeline node */}
                              <div
                                className="absolute top-1.5 -left-[30px] z-10 flex h-5 w-5 items-center justify-center rounded-full border-4 bg-white sm:-left-[37px] dark:bg-slate-950"
                                style={{ borderColor: getCategoryBorderColor(theme) }}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${theme.color} animate-ping`}
                                />
                              </div>

                              {/* Date label */}
                              <div className="w-[110px] shrink-0 pt-0.5 text-left md:text-right">
                                <span className="block text-xs font-black tracking-widest text-slate-400 uppercase dark:text-slate-500">
                                  {eventDate.toLocaleDateString("en-US", { weekday: "short" })}
                                </span>
                                <span className="mt-1 block text-xl leading-none font-black tracking-tight text-slate-900 dark:text-slate-100">
                                  {eventDate.getDate()}{" "}
                                  {eventDate.toLocaleDateString("en-US", { month: "short" })}
                                </span>
                                <span className="mt-1.5 block text-[10px] font-black tracking-wider text-indigo-500 uppercase dark:text-indigo-400">
                                  {eventDate.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>

                              {/* Event card */}
                              <motion.div
                                whileHover={{ y: -4, scale: 1.01 }}
                                className="w-full flex-1 rounded-3xl border border-slate-200/50 bg-white/60 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-indigo-400/40 hover:shadow-lg dark:border-slate-800/40 dark:bg-slate-900/60 dark:hover:border-indigo-500/30"
                              >
                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2.5">
                                      <span
                                        className={`rounded-lg bg-gradient-to-r px-2.5 py-0.5 text-[9px] font-black uppercase ${theme.color} text-white`}
                                      >
                                        {item.event.category || "General"}
                                      </span>
                                      <span className="text-[11px] font-semibold text-slate-400">
                                        Registered:{" "}
                                        {new Date(item.registeredAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <h4
                                      title={item.event.title}
                                      className="line-clamp-2 min-w-0 text-base font-extrabold break-words text-slate-900 dark:text-slate-100"
                                    >
                                      {item.event.title}
                                    </h4>
                                    <p className="mt-1 max-w-xl truncate text-xs text-slate-500">
                                      {item.event.description}
                                    </p>
                                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                                      <span className="flex items-center gap-1">
                                        <CalendarIcon
                                          className="h-3.5 w-3.5 text-indigo-500"
                                          aria-hidden="true"
                                        />
                                        {new Date(item.event.date).toLocaleDateString()}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock
                                          className="h-3.5 w-3.5 text-indigo-500"
                                          aria-hidden="true"
                                        />
                                        {new Date(item.event.date).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <MapPin
                                          className="h-3.5 w-3.5 text-indigo-500"
                                          aria-hidden="true"
                                        />
                                        {item.event.location || "Online"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-4 flex items-center gap-2 sm:mt-0">
                                    <button
                                      type="button"
                                      onClick={() => downloadICSFile(item.event)}
                                      aria-label={`Download ICS for ${item.event.title}`}
                                      className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                      title="Download .ics file"
                                    >
                                      <Download className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                    <a
                                      href={generateGoogleCalendarLink(item.event)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                      Sync Google
                                    </a>
                                  </div>
                                </div>
                              </motion.div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
                      <CalendarIcon
                        className="h-12 w-12 animate-pulse text-slate-300 dark:text-slate-700"
                        aria-hidden="true"
                      />
                      <div>
                        <h4 className="font-extrabold text-slate-800 dark:text-slate-200">
                          No Active Registrations
                        </h4>
                        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-400">
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
