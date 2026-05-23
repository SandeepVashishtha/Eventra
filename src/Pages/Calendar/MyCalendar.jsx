import React, { useState } from "react";
import { useMyEvents } from "../../context/MyEventsContext";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  ExternalLink,
  Download,
  AlertCircle,
  List,
  Grid
} from "lucide-react";
import {
  downloadICSFile,
  generateGoogleCalendarLink,
  generateOutlookLink
} from "../../utils/calendarExporter";

const MyCalendar = () => {
  const { myEvents } = useMyEvents();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Calendar Helpers
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

  // Filter events registered in the current displayed month
  const getEventsForDate = (day) => {
    return myEvents.filter((item) => {
      if (!item.event?.date) return false;
      const eventDate = new Date(item.event.date);
      return (
        eventDate.getFullYear() === currentYear &&
        eventDate.getMonth() === currentMonth &&
        eventDate.getDate() === day
      );
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
      return (
        eventDate.getFullYear() === selectedDate.getFullYear() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getDate() === selectedDate.getDate()
      );
    });
  };

  const selectedEvents = getSelectedDateEvents();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-20 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm tracking-wide uppercase">
              <CalendarIcon className="w-4 h-4" />
              Calendar Center
            </div>
            <h1 className="text-4xl font-black tracking-tight mt-1 bg-clip-text text-transparent bg-gradient-to-r from-slate-950 to-indigo-700 dark:from-slate-100 dark:to-indigo-400">
              My Registrations Calendar
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm max-w-xl">
              Keep track of registered events in a beautiful, synced grid schedule. Download standard iCal payloads or sync directly to Google Calendar and Outlook.
            </p>
          </div>

          {/* VIEW SWITCHER */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl self-start md:self-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-850 shadow text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              aria-label="Grid calendar view"
            >
              <Grid className="w-4 h-4" />
              Calendar Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-850 shadow text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
              Event List ({myEvents.length})
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* GRID CALENDAR (COLSPAN: 2) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-md space-y-6">
              
              {/* MONTH CONTROLS */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={prevMonth}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-350" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-355" />
                  </button>
                </div>
              </div>

              {/* CALENDAR BODY */}
              <div role="grid" aria-label="Monthly Schedule Grid" className="space-y-2">
                {/* Days Of Week Headers */}
                <div role="row" className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {daysOfWeek.map((day) => (
                    <div key={day} role="columnheader">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Day Grid cells */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty offsets for first day offset */}
                  {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="aspect-square rounded-2xl bg-slate-50/40 dark:bg-slate-950/20 border border-dashed border-slate-100 dark:border-slate-900/60 opacity-30"
                    />
                  ))}

                  {/* Monthly days */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const cellDate = new Date(currentYear, currentMonth, day);
                    const dayEvents = getEventsForDate(day);
                    const selected = isSelected(day);
                    const isToday =
                      new Date().getDate() === day &&
                      new Date().getMonth() === currentMonth &&
                      new Date().getFullYear() === currentYear;

                    return (
                      <button
                        key={`day-${day}`}
                        role="gridcell"
                        aria-label={`Select date ${day} ${monthNames[currentMonth]}, ${dayEvents.length} events`}
                        onClick={() => setSelectedDate(cellDate)}
                        className={`aspect-square rounded-2xl border p-2 flex flex-col justify-between items-start transition-all ${
                          selected
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                            : isToday
                            ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900 text-indigo-750 dark:text-indigo-400"
                            : "bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700"
                        }`}
                      >
                        <span className={`text-xs font-bold ${selected ? "text-white" : "text-slate-500 dark:text-slate-400"}`}>
                          {day}
                        </span>

                        {dayEvents.length > 0 && (
                          <div className="w-full flex items-center justify-end gap-1">
                            {dayEvents.slice(0, 3).map((item, i) => (
                              <span
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  selected ? "bg-white" : "bg-indigo-500 dark:bg-indigo-400"
                                }`}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <span className={`text-[9px] font-black leading-none ${selected ? "text-white" : "text-indigo-500"}`}>
                                +
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* DYNAMIC SELECTED DATE DETAILS SIDEBAR */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-md">
                <h3 className="text-lg font-black text-slate-950 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
                  📅 Selected Date Overview
                </h3>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-2">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </p>

                <div className="mt-5 space-y-4">
                  {selectedEvents.length > 0 ? (
                    selectedEvents.map((item) => (
                      <div
                        key={item.eventId}
                        className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-150 dark:border-slate-800/60 shadow-sm space-y-4"
                      >
                        <div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-755 dark:text-indigo-300">
                            {item.event.category || "General"}
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 mt-1 truncate">
                            {item.event.title}
                          </h4>
                          
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{new Date(item.event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[200px]">{item.event.location || "Virtual / Online"}</span>
                          </div>
                        </div>

                        {/* EXPORT BUTTONS */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                          <button
                            onClick={() => downloadICSFile(item.event)}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition"
                            title="Download standard .ics iCalendar file"
                          >
                            <Download className="w-3 h-3 text-slate-500" />
                            Download ICS
                          </button>
                          
                          <a
                            href={generateGoogleCalendarLink(item.event)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition"
                          >
                            <ExternalLink className="w-3 h-3 text-indigo-500" />
                            Google Calendar
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                      <AlertCircle className="w-8 h-8 text-slate-350 dark:text-slate-655" />
                      <p className="text-slate-400 text-xs leading-relaxed max-w-[200px]">
                        No registrations scheduled for this date. Check active events or registration forms.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* EVENT LIST VIEW */
          <div className="bg-white dark:bg-slate-900 border border-slate-250/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-md">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              📝 Registered Events Schedule ({myEvents.length})
            </h3>
            
            <div className="mt-6 space-y-4">
              {myEvents.length > 0 ? (
                myEvents.map((item) => (
                  <div
                    key={item.eventId}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 bg-slate-50 dark:bg-slate-800/20 hover:bg-slate-100/60 dark:hover:bg-slate-800/30 border border-slate-150 dark:border-slate-800/60 rounded-2xl transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-755 dark:text-indigo-300">
                          {item.event.category || "General"}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          Registered: {new Date(item.registeredAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base text-slate-850 dark:text-slate-100">
                        {item.event.title}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-xl truncate mt-1">
                        {item.event.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                          {new Date(item.event.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          {new Date(item.event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          {item.event.location || "Online"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                      <button
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
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse" />
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-205">No Active Registrations</h4>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-sm mt-1 mx-auto">
                      Get involved by exploring the Eventra portal events, team projects, and registering yourself to compile your grid schedule!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyCalendar;
