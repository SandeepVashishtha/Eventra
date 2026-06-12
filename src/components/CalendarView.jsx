import { formatTimeRange } from "../utils/conflictDetection";
import { getUserTimezone } from "../utils/timezoneUtils";

/**
 * CalendarView
 * Simple visual representation of the user's registered events.
 * Shows event title, date, and formatted time range in the user's timezone.
 * This component is lightweight and avoids external library dependencies.
 */
const CalendarView = ({ events }) => {
  const userTz = getUserTimezone();

  if (!events || events.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No registered events to display.
      </div>
    );
  }

  return (
    <section className="my-6">
      <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
        Your Registered Events
      </h3>
      <ul className="space-y-3">
        {events.map((reg, index) => {
          // 🔥 FIX: Added optional chaining to prevent crashes if reg is undefined
          const ev = reg?.event || reg;
          if (!ev) return null;

          // 🔥 FIX: Safe date parsing to prevent RangeError crashes
          let formattedDate = "Date TBD";
          if (ev.date) {
            const parsedDate = new Date(ev.date);
            if (!isNaN(parsedDate.getTime())) {
              formattedDate = parsedDate.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              });
            }
          }

          return (
            <li
              key={ev.id ?? `reg-${index}`}
              className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
            >
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {ev.title || "Untitled Event"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formattedDate}{" "}
                {ev.time ? formatTimeRange(ev.time, ev.durationMinutes || 60, ev.date, userTz) : ""}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default CalendarView;
