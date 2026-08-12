import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  X,
} from "lucide-react";

const formatDateTime = (value) => {
  if (!value) return "Unknown time";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const schedulesOverlap = (
  startA,
  endA,
  startB,
  endB
) => {
  const firstStart = new Date(startA).getTime();
  const firstEnd = new Date(endA).getTime();
  const secondStart = new Date(startB).getTime();
  const secondEnd = new Date(endB).getTime();

  if (
    [firstStart, firstEnd, secondStart, secondEnd].some(
      Number.isNaN
    )
  ) {
    return false;
  }

  return (
    firstStart < secondEnd &&
    secondStart < firstEnd
  );
};

export const findScheduleConflicts = (
  newEvent,
  registeredEvents = []
) => {
  if (
    !newEvent?.startTime ||
    !newEvent?.endTime
  ) {
    return [];
  }

  return registeredEvents.filter((event) => {
    if (
      !event?.startTime ||
      !event?.endTime
    ) {
      return false;
    }

    return schedulesOverlap(
      newEvent.startTime,
      newEvent.endTime,
      event.startTime,
      event.endTime
    );
  });
};

const RegistrationConflictWarning = ({
  newEvent,
  registeredEvents = [],
  onContinue,
  onCancel,
}) => {
  const conflicts = findScheduleConflicts(
    newEvent,
    registeredEvents
  );

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-lg dark:border-amber-900/40 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
          <AlertTriangle size={21} />
        </div>

        <div className="flex-1">
          <p className="text-[8px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Schedule Conflict
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            Your event schedule has a conflict
          </h2>

          <p className="mt-1 text-[8px] leading-4 text-slate-500 dark:text-slate-400">
            You are already registered for another event
            during this time. Review the conflict before
            completing registration.
          </p>
        </div>
      </div>

      {/* New Event */}
      <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <p className="text-[7px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          New Registration
        </p>

        <h3 className="mt-1 text-[10px] font-bold text-slate-800 dark:text-white">
          {newEvent?.name ||
            "New Event"}
        </h3>

        <div className="mt-2 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1 text-[7px] text-slate-500 dark:text-slate-400">
            <CalendarDays size={10} />

            {formatDateTime(
              newEvent?.startTime
            )}
          </span>

          <span className="inline-flex items-center gap-1 text-[7px] text-slate-500 dark:text-slate-400">
            <Clock3 size={10} />

            {formatDateTime(
              newEvent?.endTime
            )}
          </span>
        </div>
      </div>

      {/* Conflicting Events */}
      <div className="mt-5">
        <p className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
          Conflicting event
          {conflicts.length > 1 ? "s" : ""}
        </p>

        <div className="mt-3 space-y-3">
          {conflicts.map((event) => (
            <ConflictEvent
              key={event.id}
              event={event}
            />
          ))}
        </div>
      </div>

      {/* Warning */}
      <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-900/10">
        <AlertTriangle
          size={14}
          className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
        />

        <p className="text-[7px] leading-4 text-amber-800 dark:text-amber-300">
          You can still continue with this registration,
          but you may not be able to attend both events.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <X size={13} />
          Cancel Registration
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-[8px] font-bold text-white hover:bg-amber-600"
        >
          <CheckCircle2 size={13} />
          Continue Anyway
        </button>
      </div>
    </div>
  );
};

const ConflictEvent = ({
  event,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400">
          <CalendarDays size={15} />
        </div>

        <div className="min-w-0">
          <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
            {event.name ||
              "Registered Event"}
          </h4>

          {event.venue && (
            <p className="mt-1 text-[7px] text-slate-400">
              Venue: {event.venue}
            </p>
          )}

          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:gap-4">
            <span className="inline-flex items-center gap-1 text-[7px] text-slate-500 dark:text-slate-400">
              <Clock3 size={10} />

              {formatDateTime(
                event.startTime
              )}
            </span>

            <span className="text-[7px] text-slate-400">
              →
            </span>

            <span className="text-[7px] text-slate-500 dark:text-slate-400">
              {formatDateTime(
                event.endTime
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationConflictWarning;