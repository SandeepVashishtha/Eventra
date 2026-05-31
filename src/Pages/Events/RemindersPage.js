import { useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, Clock, MapPin, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import {
  getActiveReminders,
  removeReminderById,
  subscribeToReminderChanges,
} from "../../utils/reminderUtils";

import { parseEventDateTimeLocal } from "../../utils/timezoneUtils";

const formatEventDate = (event) => {
  const parsed = parseEventDateTimeLocal(event.date, event.time);
  return parsed
    ? parsed.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";
};

const formatTriggerDate = (triggerAt) =>
  new Date(triggerAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const RemindersPage = () => {
  useDocumentTitle("Eventra | Reminders");
  const [reminders, setReminders] = useState(() => getActiveReminders());

  useEffect(() => {
    const refreshReminders = () => setReminders(getActiveReminders());

    refreshReminders();
    return subscribeToReminderChanges(refreshReminders);
  }, []);

  const groupedReminders = useMemo(
    () =>
      reminders.reduce((groups, reminder) => {
        const key = reminder.eventId;
        return {
          ...groups,
          [key]: [...(groups[key] || []), reminder],
        };
      }, {}),
    [reminders]
  );

  const reminderGroups = Object.values(groupedReminders).map((eventReminders) =>
    [...eventReminders].sort((a, b) => new Date(a.triggerAt) - new Date(b.triggerAt))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white pt-12 pb-16 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-gray-950 dark:text-gray-100" style={{
    backgroundImage: "url('/assets/bookmarkbg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    width:"100vw"
  }}>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-600">
              <Bell size={16} />
              {reminders.length} active
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-950 dark:text-slate-100 sm:text-4xl">
              Event Reminders
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 dark:text-slate-400 sm:text-base">
              Manage upcoming reminder alerts for events you have bookmarked or registered for.
            </p>
          </div>

          <Link
            to="/bookmarks"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-indigo-500 hover:via-indigo-600 hover:to-slate-800 hover:shadow-xl"
          >
            <CalendarDays size={18} />
            View Bookmarks
          </Link>
        </div>

        {reminders.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:border-gray-800 dark:bg-gray-900 dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)] sm:p-12">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Bell size={30} />
            </div>
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white">
              No active reminders
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-600 dark:text-gray-400 sm:text-base">
              Bookmark or register for an upcoming event, then choose a reminder time from its event card or details page.
            </p>
            <Link
              to="/events"
              className="mt-6 inline-flex items-center justify-center rounded-2xl border border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-md transition-all duration-300 hover:bg-indigo-50 hover:text-indigo-800 dark:border-indigo-700 dark:bg-gray-800 dark:text-indigo-300 dark:hover:bg-indigo-900/30 dark:hover:text-white"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {reminderGroups.map((eventReminders) => {
              const event = eventReminders[0].event;

              return (
                <article
                  key={eventReminders[0].eventId}
                  className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="grid gap-0 sm:grid-cols-[160px_1fr]">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-44 w-full object-cover sm:h-full" loading="lazy"/>

                    <div className="p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-xl font-bold text-gray-950 dark:text-white">
                            {event.title}
                          </h2>
                          <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                            <p className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                              {formatEventDate(event)}
                            </p>
                            <p className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-pink-500" />
                              {event.location}
                            </p>
                          </div>
                        </div>

                        <Link
                          to={`/events/${event.id}`}
                          className="inline-flex items-center justify-center rounded-xl border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
                        >
                          Details
                        </Link>
                      </div>

                      <div className="mt-5 space-y-3">
                        {eventReminders.map((reminder) => (
                          <div
                            key={reminder.id}
                            className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-slate-50 p-3 dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {reminder.timingLabel}
                              </p>
                              <p className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="h-3.5 w-3.5" />
                                Alerts on {formatTriggerDate(reminder.triggerAt)}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeReminderById(reminder.id)}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/70 dark:bg-gray-900 dark:text-red-300 dark:hover:bg-red-950/30"
                              aria-label={`Remove ${reminder.timingLabel} reminder for ${event.title}`}
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default RemindersPage;
