import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Link } from 'react-router-dom';
import { X, MapPin, Tag, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const EventPopover = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
        >
          <X size={16} />
        </button>

        <div className="relative h-48 w-full">
          <img src={event.resource.image} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl font-bold text-white line-clamp-2">{event.title}</h3>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-indigo-500 shrink-0" />
              <span className="truncate">{event.resource.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-pink-500 shrink-0" />
              <span className="truncate">{event.resource.location}</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Tag size={16} className="text-green-500 shrink-0" />
              <span className="truncate">{event.resource.type}</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
            {event.resource.description}
          </p>

          <div className="flex gap-3 pt-2">
            <Link
              to={`/events/${event.resource.id}`}
              className="flex-1 flex justify-center py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              View Details
            </Link>
            <Link
              to={`/events/${event.resource.id}/register`}
              className="flex-1 flex justify-center py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-lg shadow-indigo-600/20"
            >
              Register
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const EventCalendarView = ({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const calendarEvents = useMemo(() => {
    return events.map((evt) => {
      const date = new Date(evt.date);
      if (evt.time && evt.time !== 'TBA') {
        try {
          // Attempt basic time parsing, assuming 12-hour AM/PM format (e.g. "10:00 AM")
          const timeMatch = evt.time.match(/(\d+):?(\d*)\s*(am|pm)/i);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1], 10);
            const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
            const period = timeMatch[3].toLowerCase();
            
            if (period === 'pm' && hours < 12) hours += 12;
            if (period === 'am' && hours === 12) hours = 0;
            
            date.setHours(hours, minutes, 0, 0);
          }
        } catch (e) {
          // Ignore time parsing errors
        }
      }
      return {
        id: evt.id,
        title: evt.title,
        start: date,
        end: new Date(date.getTime() + 2 * 60 * 60 * 1000), // Default 2 hr duration
        resource: evt,
      };
    });
  }, [events]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const eventPropGetter = (event) => {
    return {
      className: 'bg-indigo-600 border-none rounded-md text-xs font-semibold px-2 py-0.5 shadow-sm text-white !overflow-hidden !whitespace-nowrap !text-ellipsis',
    };
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 mb-8 overflow-hidden calendar-container">
      <style dangerouslySetInnerHTML={{__html: `
        .calendar-container .rbc-calendar {
          font-family: inherit;
          min-height: 700px;
        }
        .calendar-container .rbc-header {
          padding: 10px;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }
        .dark .calendar-container .rbc-header {
          color: #94a3b8;
          border-bottom-color: #334155;
          border-left-color: #334155;
        }
        .calendar-container .rbc-month-view, .calendar-container .rbc-time-view {
          border-color: #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }
        .dark .calendar-container .rbc-month-view, .dark .calendar-container .rbc-time-view {
          border-color: #334155;
        }
        .calendar-container .rbc-day-bg {
          border-color: #e2e8f0;
        }
        .dark .calendar-container .rbc-day-bg {
          border-color: #334155;
        }
        .calendar-container .rbc-today {
          background-color: #f8fafc;
        }
        .dark .calendar-container .rbc-today {
          background-color: #1e293b;
        }
        .calendar-container .rbc-off-range-bg {
          background-color: #f1f5f9;
        }
        .dark .calendar-container .rbc-off-range-bg {
          background-color: #0f172a;
        }
        .calendar-container .rbc-date-cell {
          padding: 4px 8px;
          font-weight: 500;
        }
        .calendar-container .rbc-btn-group button {
          color: #475569;
          border-color: #e2e8f0;
          transition: all 0.2s;
        }
        .dark .calendar-container .rbc-btn-group button {
          color: #cbd5e1;
          border-color: #334155;
        }
        .calendar-container .rbc-btn-group button:hover {
          background-color: #f1f5f9;
        }
        .dark .calendar-container .rbc-btn-group button:hover {
          background-color: #334155;
        }
        .calendar-container .rbc-btn-group button.rbc-active {
          background-color: #e2e8f0;
          box-shadow: none;
        }
        .dark .calendar-container .rbc-btn-group button.rbc-active {
          background-color: #475569;
          color: white;
        }
        .calendar-container .rbc-toolbar button:active, .calendar-container .rbc-toolbar button.rbc-active:active {
            box-shadow: none;
        }
        .calendar-container .rbc-time-content, .calendar-container .rbc-time-header {
            border-color: #e2e8f0;
        }
        .dark .calendar-container .rbc-time-content, .dark .calendar-container .rbc-time-header {
            border-color: #334155;
        }
        .calendar-container .rbc-timeslot-group {
            border-bottom-color: #e2e8f0;
        }
        .dark .calendar-container .rbc-timeslot-group {
            border-bottom-color: #334155;
        }
      `}} />
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700 }}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventPropGetter}
        views={['month', 'week', 'day']}
        popup
      />

      <AnimatePresence>
        {selectedEvent && (
          <EventPopover event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventCalendarView;
