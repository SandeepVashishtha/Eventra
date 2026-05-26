import React, { useMemo, useState } from "react";
import { useMyEvents } from "../../context/MyEventsContext";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Filter,
  Grid,
  MapPin,
} from "lucide-react";
import {
  downloadBulkICSFile,
  downloadICSFile,
  generateGoogleCalendarLink,
} from "../../utils/calendarExporter";
import SkeletonCalendar from "../../components/common/SkeletonCalendar";

const CATEGORIES = [
  { id: "all", label: "All Events", color: "from-indigo-500 to-indigo-600" },
  { id: "gssoc", label: "GSSoC", color: "from-pink-500 to-rose-600" },
  { id: "ai/web3", label: "AI / Web3", color: "from-purple-500 to-violet-600" },
  { id: "workshops", label: "Workshops", color: "from-cyan-500 to-blue-600" },
  { id: "hackathons", label: "Hackathons", color: "from-emerald-500 to-teal-600" },
  { id: "community", label: "Community", color: "from-amber-500 to-orange-600" },
];

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

const isSameDate = (date, compareDate) =>
  date.getFullYear() === compareDate.getFullYear() &&
  date.getMonth() === compareDate.getMonth() &&
  date.getDate() === compareDate.getDate();

const MyCalendar = () => {
  const { myEvents = [], loading } = useMyEvents();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("grid");
  const [activeCategory, setActiveCategory] = useState("all");

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const normalizedEvents = useMemo(() => {
    return myEvents
      .filter((item) => item && item.event)
      .map((item) => ({
        ...item,
        eventDate: new Date(item.event.date),
        title: item.event.title || "Untitled Event",
        category: item.event.category || "General",
        description: item.event.description || "No description provided.",
        location: item.event.location || "Online",
      }));
  }, [myEvents]);

  const filteredEvents = useMemo(() => {
    return normalizedEvents.filter((item) =>
      matchesCategory(item.category, activeCategory)
    );
  }, [normalizedEvents, activeCategory]);

  const timelineEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => a.eventDate - b.eventDate);
  }, [filteredEvents]);

  const selectedEvents = useMemo(() => {
    return filteredEvents.filter((item) => isSameDate(item.eventDate, selectedDate));
  }, [filteredEvents, selectedDate]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const getEventsForDate = (day) => {
    const targetDate = new Date(currentYear, currentMonth, day);
    return filteredEvents.filter((item) => isSameDate(item.eventDate, targetDate));
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-20 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-xs tracking-wider uppercase">
              <CalendarIcon className="w-4.5 h-4.5" />
              Scheduling Studio
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1.5 bg-clip-text text-transparent bg-gradient-to-r from-slate-950 to-indigo-700 dark:from-slate-100 dark:to-indigo-400">
              Registrations Calendar
            </h1>
            <p className="text-slate-550 dark:text-slate-400 mt-2 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Organize, filter, and synchronize your registered events across a clean calendar view.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/30 backdrop-blur-xs shadow-inner">
              <button
                type="button"
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
                type="button"
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

            {filteredEvents.length > 0 && (
              <button
                type="button"
                onClick={() => downloadBulkICSFile(filteredEvents)}
                className="p-2.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md hover:shadow-lg hover:scale-102"
                aria-label="Export all filtered events as ICS"
              >
                <Download className="w-3.5 h-3.5" />
                Export All ({filteredEvents.length})
              </button>
            )}
          </div>
        </header>

        <div className="flex flex-wrap gap-2.5">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`relative p-2.5 px-4 rounded-xl text-xs font-black tracking-wide border cursor-pointer transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/10 to-indigo-600/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-500/5"
                    : "bg-white/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/50 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5" />
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div role="status" aria-live="polite" aria-label="Loading calendar">
            <span className="sr-only">Loading calendar registrations...</span>
            <SkeletonCalendar />
          </div>
        ) : viewMode === "grid" ? (
          <section className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8" aria-labelledby="calendar-grid-title">
            <div className="bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-md space-y-6">
              <div className="flex items-center justify-between">
                <h2 id="calendar-grid-title" className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-350" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-350" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div role="grid" aria-label="Monthly Schedule Grid" className="space-y-2">
                <div role="row" className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {daysOfWeek.map((day) => (
                    <div key={day} role="columnheader">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="aspect-square rounded-2xl bg-slate-50/40 dark:bg-slate-950/20 border border-dashed border-slate-100 dark:border-slate-900/60 opacity-30"
                    />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const cellDate = new Date(currentYear, currentMonth, day);
                    const dayEvents = getEventsForDate(day);
                    const selected = isSameDate(cellDate, selectedDate);
                    const isToday =
                      new Date().getDate() === day &&
                      new Date().getMonth() === currentMonth &&
                      new Date().getFullYear() === currentYear;

                    return (
                      <button
                        key={`day-${day}`}
                        type="button"
                        role="gridcell"
                        aria-label={`Select date ${day} ${monthNames[currentMonth]}, ${dayEvents.length} events`}
                        aria-selected={selected}
                        onClick={() => setSelectedDate(cellDate)}
                        className={`aspect-square rounded-2xl border p-2 flex flex-col justify-between items-start transition-all ${
                          selected
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                            : "border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/30"
                        } ${isToday ? "ring-2 ring-indigo-200 dark:ring-indigo-900" : ""}`}
                      >
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{day}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {dayEvents.length} event{dayEvents.length === 1 ? "" : "s"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-md space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 font-black">
                  Selected Day
                </p>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-2">
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
              </div>

              {selectedEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedEvents.map((item) => (
                    <div
                      key={item.eventId || `${item.title}-${item.eventDate.toISOString()}`}
                      className="rounded-2xl border border-slate-150 dark:border-slate-800 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            {item.category}
                          </p>
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-1">{item.title}</h4>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{item.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3 text-xs text-slate-600 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {item.eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {item.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          type="button"
                          onClick={() => downloadICSFile(item.event)}
                          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition"
                        >
                          <Download className="w-3 h-3 text-slate-500" aria-hidden="true" />
                          Download ICS
                        </button>
                        <a
                          href={generateGoogleCalendarLink(item.event)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition"
                        >
                          <ExternalLink className="w-3 h-3 text-indigo-500" aria-hidden="true" />
                          Google Calendar
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-slate-350 dark:text-slate-655" aria-hidden="true" />
                  <p className="text-slate-400 text-xs leading-relaxed max-w-[220px]">
                    No registrations scheduled for this date. Check your filters or select another day.
                  </p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-md"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Timeline View ({timelineEvents.length})
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Sorted by event date
              </span>
            </div>

            {timelineEvents.length > 0 ? (
              <div className="space-y-4">
                {timelineEvents.map((item) => (
                  <div
                    key={item.eventId || `${item.title}-${item.eventDate.toISOString()}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/20"
                  >
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {item.category}
                      </p>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-1">{item.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                        <span className="inline-flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                          {item.eventDate.toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          {item.eventDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          {item.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => downloadICSFile(item.event)}
                        className="p-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-350 shadow-sm"
                        title="Download standard .ics iCalendar file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <a
                        href={generateGoogleCalendarLink(item.event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Sync Google
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                <p className="text-slate-400 text-sm mt-3">
                  No events match the current filters.
                </p>
              </div>
            )}
          </motion.section>
        )}
      </div>
    </main>
  );
};

export default MyCalendar;
