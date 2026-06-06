import { useCallback, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  addDays,
  addHours,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  parse,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { enUS } from "date-fns/locale";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { darkTheme } from "../../components/styles/theme";
import { getEventStatus } from "../../utils/eventUtils";
import useCalendarEvents from "./useCalendarEvents";
import { SkeletonBlock } from "../../components/common/SkeletonLoaders";
import EmptyState from "../../components/common/EmptyState";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./CalendarPage.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

const parseTimeString = (value = "") => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;

  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const period = ampmMatch[3].toUpperCase();

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return { hours, minutes };
  }

  const twentyFourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourMatch) {
    return {
      hours: parseInt(twentyFourMatch[1], 10),
      minutes: parseInt(twentyFourMatch[2], 10),
    };
  }

  return null;
};

const buildDateTime = (dateValue, timeValue) => {
  if (!dateValue) return null;
  const base = parseISO(dateValue);
  if (Number.isNaN(base.getTime())) return null;

  const timeParts = parseTimeString(timeValue);
  if (!timeParts) return base;

  base.setHours(timeParts.hours, timeParts.minutes, 0, 0);
  return base;
};

const getEventDateRange = (event) => {
  const startDate = event?.startDate || event?.date;
  const endDate = event?.endDate || event?.date || startDate;
  if (!startDate) return null;

  const startTime = event?.startTime || event?.time || "";
  const endTime = event?.endTime || "";

  const start = buildDateTime(startDate, startTime);
  if (!start) return null;

  const hasTime = Boolean(startTime);
  let end = buildDateTime(endDate, endTime);

  if (!end) {
    end = hasTime ? addHours(start, 2) : start;
  }

  if (end < start) {
    end = addHours(start, 1);
  }

  return {
    start: hasTime ? start : startOfDay(start),
    end: hasTime ? end : addDays(startOfDay(end), 1),
    allDay: !hasTime,
  };
};

const toDateKey = (date) => format(date, "yyyy-MM-dd");

const getDateKeysInRange = (start, end) => {
  if (!start || !end) return [];

  const keys = [];
  let cursor = startOfDay(start);
  const last = startOfDay(end);

  while (cursor <= last) {
    keys.push(toDateKey(cursor));
    cursor = addDays(cursor, 1);
  }

  return keys;
};

const CalendarToolbar = ({ label, onNavigate }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <CalendarDays className="h-5 w-5 text-sky-500" />
        <span className="tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onNavigate("PREV")}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onNavigate("TODAY")}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => onNavigate("NEXT")}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const CalendarPage = () => {
  const { events, isLoading, loadError, refresh } = useCalendarEvents();
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));

  const normalizedEvents = useMemo(
    () => events.map((event) => ({ ...event, status: getEventStatus(event) })),
    [events]
  );

  const upcomingEvents = useMemo(
    () =>
      normalizedEvents.filter((event) => {
        const status = event.status || getEventStatus(event);
        return status !== "past" && status !== "ended";
      }),
    [normalizedEvents]
  );

  const upcomingEventsWithRange = useMemo(
    () =>
      upcomingEvents
        .map((event) => ({ event, range: getEventDateRange(event) }))
        .filter((entry) => entry.range),
    [upcomingEvents]
  );

  const calendarEvents = useMemo(
    () =>
      upcomingEventsWithRange.map(({ event, range }) => ({
        id: event.id,
        title: event.title,
        start: range.start,
        end: range.end,
        allDay: range.allDay,
        resource: event,
      })),
    [upcomingEventsWithRange]
  );

  const eventsByDay = useMemo(() => {
    const map = new Map();

    upcomingEventsWithRange.forEach(({ event, range }) => {
      const endForKeys = range.allDay ? addDays(range.end, -1) : range.end;
      const keys = getDateKeysInRange(range.start, endForKeys);
      const entry = {
        ...event,
        start: range.start,
        end: range.end,
        allDay: range.allDay,
      };

      keys.forEach((key) => {
        if (!map.has(key)) {
          map.set(key, [entry]);
        } else {
          map.get(key).push(entry);
        }
      });
    });

    map.forEach((items) =>
      items.sort((first, second) => first.start - second.start)
    );

    return map;
  }, [upcomingEventsWithRange]);

  const selectedDateKey = toDateKey(selectedDate);
  const selectedEvents = eventsByDay.get(selectedDateKey) || [];

  const handleSelectSlot = useCallback((slotInfo) => {
    setSelectedDate(startOfDay(slotInfo.start));
  }, []);

  const handleSelectEvent = useCallback((calendarEvent) => {
    if (calendarEvent?.start) {
      setSelectedDate(startOfDay(calendarEvent.start));
    }
  }, []);

  const handleNavigate = useCallback(
    (date) => {
      if (!isSameMonth(date, selectedDate)) {
        setSelectedDate(startOfDay(date));
      }
    },
    [selectedDate]
  );

  const dayPropGetter = useCallback(
    (date) => {
      const key = toDateKey(date);
      const hasEvents = eventsByDay.has(key);
      const isSelected = isSameDay(date, selectedDate);
      const classes = [
        hasEvents ? "calendar-day--has-events" : "",
        isSelected ? "calendar-day--selected" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return { className: classes };
    },
    [eventsByDay, selectedDate]
  );

  return (
    <div className={`${darkTheme.section} min-h-screen`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
              Calendar View
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Upcoming Events Calendar
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Explore upcoming events in a monthly grid. Tap any date to review what is happening
              that day and jump into the details.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              Upcoming events: {upcomingEvents.length}
            </div>
            <button
              type="button"
              onClick={refresh}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
             aria-label="button">
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {loadError && !isLoading ? (
          <div className="mt-6 rounded-3xl border border-red-200 bg-white p-6 text-sm text-red-700 shadow-sm dark:border-red-500/30 dark:bg-slate-950 dark:text-red-300">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>{loadError}</span>
              <button
                type="button"
                onClick={refresh}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
               aria-label="button">
                Try again
              </button>
            </div>
          </div>
        ) : null}

          <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-2 items-start">
          <div className="eventra-calendar rounded-3xl bg-white/80 p-4 shadow-lg backdrop-blur-sm dark:bg-slate-950/80">
            <div className="h-[450px] lg:h-[620px]">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                defaultView="month"
                views={["month"]}
                toolbar
                popup
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onNavigate={handleNavigate}
                dayPropGetter={dayPropGetter}
                components={{ toolbar: CalendarToolbar }}
              />
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-lg dark:border-slate-800 dark:bg-slate-950 mt-2 lg:mt-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Selected Day
                </p>
                <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                  {format(selectedDate, "EEEE, MMM d, yyyy")}
                </h2>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {selectedEvents.length} event{selectedEvents.length === 1 ? "" : "s"}
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {isLoading ? (
                <>
                  <div className="sr-only" role="status" aria-live="polite">
                    Loading events for this day...
                  </div>
                  <div className="space-y-4" aria-hidden="true">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse">
                        <SkeletonBlock className="h-5 w-3/4 mb-3" />
                        <SkeletonBlock className="h-4 w-1/2" />
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

              {!isLoading && selectedEvents.length === 0 ? (
                <EmptyState
                  compact={true}
                  icon={CalendarDays}
                  title="No events scheduled"
                  description="No upcoming events scheduled for this day."
                />
              ) : null}

              {!isLoading && selectedEvents.length > 0
                ? selectedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {event.title}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {event.time || event.startTime || (event.allDay ? "All day" : "TBD")}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {event.location || "Location TBD"}
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/events/${event.id}`}
                          className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-600 transition hover:bg-sky-500/20 dark:text-sky-300"
                        >
                          Details
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                      {event.type ? (
                        <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                          {event.type}
                        </span>
                      ) : null}
                    </div>
                  ))
                : null}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
