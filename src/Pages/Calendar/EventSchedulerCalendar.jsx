import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  Save,
  Users,
} from "lucide-react";
import toast from 'react-hot-toast';
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import useEventScheduling from "../../hooks/useEventScheduling";
import {
  buildCalendarDays,
  buildTimeSlots,
  formatDisplayTime,
  getCategoryColorClass,
  getEventIdentity,
  getSlotDateTime,
  navigateCalendarDate,
  normalizeScheduledEvents,
  toDateKey,
} from "../../utils/eventSchedulingUtils";
import mockEvents from "../Events/eventsMockData.json";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./CalendarPage.css";

const VIEW_OPTIONS = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
];

const SCHEDULER_OVERRIDES_KEY = "eventra.eventScheduler.overrides";

const readScheduleOverrides = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SCHEDULER_OVERRIDES_KEY) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    localStorage.removeItem(SCHEDULER_OVERRIDES_KEY);
    return {};
  }
};

const writeScheduleOverride = (eventId, event) => {
  try {
    const overrides = readScheduleOverrides();
    overrides[eventId] = {
      date: event.date,
      time: event.time,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      durationMinutes: event.durationMinutes,
      updatedAt: event.updatedAt,
    };
    localStorage.setItem(SCHEDULER_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // Non-fatal: the API save still completed or the current UI state remains updated.
  }
};

const mergeScheduleOverrides = (events) => {
  const overrides = readScheduleOverrides();
  return events.map((event) => {
    const id = getEventIdentity(event);
    return overrides[id] ? { ...event, ...overrides[id] } : event;
  });
};

const formatPeriodLabel = (date, view) => {
  if (view === "day") {
    return date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
  }
  if (view === "week") {
    const days = buildCalendarDays("week", date);
    return `${days[0].toLocaleDateString([], { month: "short", day: "numeric" })} - ${days[6].toLocaleDateString([], { month: "short", day: "numeric" })}`;
  }
  return date.toLocaleDateString([], { month: "long", year: "numeric" });
};

const EventCard = ({ event, compact = false, isConflict = false }) => {
  const colorClass = getCategoryColorClass(event.category || event.type);

  return (
    <article
      draggable
      onDragStart={(dragEvent) => {
        dragEvent.dataTransfer.setData("text/plain", String(event.id));
        dragEvent.dataTransfer.effectAllowed = "move";
      }}
      className={`cursor-grab rounded-md border px-2 py-1.5 shadow-sm transition active:cursor-grabbing ${colorClass} ${
        isConflict ? "ring-2 ring-red-400" : ""
      }`}
      title={`Drag ${event.title} to reschedule`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`min-w-0 truncate font-semibold ${compact ? "text-[11px]" : "text-xs"}`}>
          {event.title}
        </p>
        <span className="shrink-0 rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase">
          {event.status || "draft"}
        </span>
      </div>
      {!compact && (
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] opacity-80">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {event.timeLabel}
          </span>
          {event.organizerLabel && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {event.organizerLabel}
            </span>
          )}
        </div>
      )}
    </article>
  );
};

const ConflictDialog = ({ pendingConflict, onCancel, onOverride, isSaving }) => {
  if (!pendingConflict) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full max-w-lg rounded-lg border border-red-200 bg-white p-5 shadow-2xl dark:border-red-900 dark:bg-slate-950">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-red-100 p-2 text-red-600 dark:bg-red-950 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Scheduling conflict detected
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              This move overlaps existing scheduled activity. Review the conflicts before saving.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {pendingConflict.conflicts.map((conflict) => (
            <div
              key={conflict.event.id}
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
            >
              <p className="font-semibold">{conflict.event.title}</p>
              <p className="mt-1 text-xs">
                {conflict.event.timeLabel} - {conflict.types.join(", ")} conflict
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Cancel Move
          </button>
          <button
            type="button"
            onClick={onOverride}
            disabled={isSaving}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-red-300"
          >
            Override Conflict
          </button>
        </div>
      </div>
    </div>
  );
};

const EventSchedulerCalendar = () => {
  const [sourceEvents, setSourceEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [view, setView] = useState("week");
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [dragOverKey, setDragOverKey] = useState("");

  const persistSchedule = useCallback(async ({ eventId, start, end, event, overrideConflicts }) => {
    const endpoint = API_ENDPOINTS.EVENTS.SCHEDULE(eventId);
    try {
      const response = await apiUtils.patch(endpoint, {
        eventId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        overrideConflicts,
      });
      writeScheduleOverride(eventId, event);
      return response;
    } catch (error) {
      writeScheduleOverride(eventId, event);
      toast("Saved locally. The schedule will remain available in this browser.");
      return { ok: true, offline: true, error };
    }
  }, []);

  const {
    events,
    scheduledEvents,
    isSaving,
    scheduleError,
    lastChange,
    pendingConflict,
    setEvents,
    scheduleEvent,
    undoLastChange,
    overridePendingConflict,
    cancelPendingConflict,
  } = useEventScheduling({
    initialEvents: sourceEvents,
    persistSchedule,
    onScheduleUpdated: () => {
      toast.success("Event schedule updated.");
    },
  });

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await apiUtils.get(API_ENDPOINTS.EVENTS.LIST);
      const responseData = response?.data || {};
      const list = Array.isArray(responseData.content)
        ? responseData.content
        : Array.isArray(responseData)
          ? responseData
          : [];
      const merged = mergeScheduleOverrides(list);
      setSourceEvents(merged);
      setEvents(merged);
    } catch (error) {
      setLoadError(error?.message || "Loaded mock events because live events are unavailable.");
      const merged = mergeScheduleOverrides(mockEvents);
      setSourceEvents(merged);
      setEvents(merged);
    } finally {
      setIsLoading(false);
    }
  }, [setEvents]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (scheduleError) toast.error(scheduleError);
  }, [scheduleError]);

  const days = useMemo(() => buildCalendarDays(view, anchorDate), [anchorDate, view]);
  const timeSlots = useMemo(() => buildTimeSlots(), []);
  const eventsByDay = useMemo(() => {
    const map = new Map();
    scheduledEvents.forEach((event) => {
      const key = toDateKey(event.start);
      const list = map.get(key) || [];
      list.push(event);
      map.set(key, list);
    });
    return map;
  }, [scheduledEvents]);

  const conflictIds = useMemo(() => {
    const ids = new Set();
    pendingConflict?.conflicts?.forEach((conflict) => ids.add(String(conflict.event.id)));
    return ids;
  }, [pendingConflict]);

  const handleDrop = useCallback(
    async (dropEvent, day, minutes = null) => {
      dropEvent.preventDefault();
      const eventId = dropEvent.dataTransfer.getData("text/plain");
      if (!eventId) return;

      const source = events.find((event) => String(getEventIdentity(event)) === String(eventId));
      const normalized = normalizeScheduledEvents([source])[0];
      const targetStart =
        minutes === null
          ? new Date(day.getFullYear(), day.getMonth(), day.getDate(), normalized?.start?.getHours() || 9, normalized?.start?.getMinutes() || 0)
          : getSlotDateTime(day, minutes);

      const result = await scheduleEvent(eventId, targetStart);
      if (result.ok) {
        toast.success(`Moved ${result.event.title} to ${formatDisplayTime(targetStart)}.`);
      }
      setDragOverKey("");
    },
    [events, scheduleEvent],
  );

  const handleUndo = async () => {
    const result = await undoLastChange();
    if (result.ok) {
      toast("Schedule change undone.");
    }
  };

  const handleOverride = async () => {
    const result = await overridePendingConflict();
    if (result.ok) {
      toast.success("Schedule saved with conflict override.");
    }
  };

  const periodLabel = formatPeriodLabel(anchorDate, view);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CalendarDays className="h-4 w-4" />
              Organizer Scheduler
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Drag-and-Drop Event Scheduling
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Move events across dates and time slots, catch conflicts before saving, and undo the most recent change.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAnchorDate(navigateCalendarDate(anchorDate, view, "prev"))}
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
              aria-label="Previous period"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setAnchorDate(new Date())}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setAnchorDate(navigateCalendarDate(anchorDate, view, "next"))}
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
              aria-label="Next period"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="flex rounded-md border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
              {VIEW_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setView(option.value)}
                  className={`rounded px-3 py-1.5 text-sm font-semibold ${
                    view === option.value
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleUndo}
              disabled={!lastChange || isSaving}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:bg-slate-300 dark:bg-slate-100 dark:text-slate-950"
            >
              <RotateCcw className="h-4 w-4" />
              Undo
            </button>
          </div>
        </header>

        <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Current period</p>
            <h2 className="text-xl font-black">{periodLabel}</h2>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <span>{scheduledEvents.length} scheduled events</span>
            {isSaving && (
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                <Save className="h-4 w-4 animate-pulse" />
                Saving
              </span>
            )}
          </div>
        </section>

        {loadError && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {loadError}
          </div>
        )}

        <section className="eventra-calendar rounded-lg bg-white p-3 shadow-sm dark:bg-slate-900">
          {isLoading ? (
            <div className="flex min-h-[420px] items-center justify-center text-sm text-slate-500">
              Loading scheduler...
            </div>
          ) : view === "month" ? (
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const key = toDateKey(day);
                const dayEvents = eventsByDay.get(key) || [];
                const isCurrentMonth = day.getMonth() === anchorDate.getMonth();
                const isOver = dragOverKey === key;

                return (
                  <div
                    key={key}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOverKey(key);
                    }}
                    onDragLeave={() => setDragOverKey("")}
                    onDrop={(event) => handleDrop(event, day)}
                    className={`min-h-32 rounded-md border p-2 transition ${
                      isOver
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                        : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
                    } ${isCurrentMonth ? "" : "opacity-45"}`}
                  >
                    <p className="mb-2 text-xs font-bold text-slate-500">
                      {day.toLocaleDateString([], { weekday: "short", day: "numeric" })}
                    </p>
                    <div className="space-y-1.5">
                      {dayEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          compact
                          isConflict={conflictIds.has(String(event.id))}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div
                className="grid min-w-[840px] gap-2"
                style={{ gridTemplateColumns: `80px repeat(${days.length}, minmax(140px, 1fr))` }}
              >
                <div />
                {days.map((day) => (
                  <div key={toDateKey(day)} className="rounded-md bg-slate-100 p-2 text-center text-xs font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {day.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                  </div>
                ))}
                {timeSlots.map((slot) => (
                  <Fragment key={slot.minutes}>
                    <div key={`label-${slot.minutes}`} className="py-3 text-right text-xs font-semibold text-slate-500">
                      {slot.label}
                    </div>
                    {days.map((day) => {
                      const slotKey = `${toDateKey(day)}-${slot.minutes}`;
                      const slotStart = getSlotDateTime(day, slot.minutes);
                      const slotEvents = scheduledEvents.filter(
                        (event) =>
                          toDateKey(event.start) === toDateKey(day) &&
                          event.start.getHours() * 60 + event.start.getMinutes() === slot.minutes,
                      );

                      return (
                        <div
                          key={slotKey}
                          onDragOver={(event) => {
                            event.preventDefault();
                            setDragOverKey(slotKey);
                          }}
                          onDragLeave={() => setDragOverKey("")}
                          onDrop={(event) => handleDrop(event, day, slot.minutes)}
                          className={`min-h-24 rounded-md border p-2 transition ${
                            dragOverKey === slotKey
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                              : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                          }`}
                          aria-label={`Drop events at ${formatDisplayTime(slotStart)}`}
                        >
                          <div className="space-y-2">
                            {slotEvents.map((event) => (
                              <EventCard
                                key={event.id}
                                event={event}
                                isConflict={conflictIds.has(String(event.id))}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <ConflictDialog
        pendingConflict={pendingConflict}
        onCancel={cancelPendingConflict}
        onOverride={handleOverride}
        isSaving={isSaving}
      />
    </main>
  );
};

export default EventSchedulerCalendar;
