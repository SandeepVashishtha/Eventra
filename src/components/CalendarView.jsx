import React from 'react';
import { formatTimeRange } from '../utils/conflictDetection';
import { getUserTimezone } from '../utils/timezoneUtils';

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
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
        Your Registered Events
      </h3>
      <ul className="space-y-3">
        {events.map((reg) => {
          const ev = reg.event || reg;
          return (
            <li
              key={ev.id}
              className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {ev.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(ev.date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                {formatTimeRange(
                  ev.time,
                  ev.durationMinutes || 60,
                  ev.date,
                  userTz
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default CalendarView;
