import { useMemo } from "react";
import { Bookmark, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import useDocumentTitle from "hooks/useDocumentTitle";
import EventCard from "./EventCard";
import { getEventStatus } from "utils/eventUtils";
import { useAuth } from "context/AuthContext";
import useBookmarks from "hooks/useBookmarks";

const BookmarkedEvents = () => {
  useDocumentTitle("Eventra | Bookmarked Events");
  const { user } = useAuth();
  const { bookmarks } = useBookmarks(user?.id || user?.email || "guest");

  const normalizedEvents = useMemo(
    () =>
      bookmarks.map((event) => ({
        ...event,
        status: getEventStatus(event),
      })),
    [bookmarks]
  );

  return (
    <div
  className="min-h-screen bg-gray-50 dark:from-slate-950 dark:via-slate-950 dark:to-gray-950 text-slate-900 dark:text-gray-100 pt-12 pb-16"
  style={{
    backgroundImage: document.documentElement.classList.contains("dark")
      ? "url('/assets/bookmarkbg.png')"
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    width: "100%"
  }}
>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-600">
              <Bookmark size={16} fill="currentColor" />
              {normalizedEvents.length} saved
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-950 dark:text-slate-100">
              Bookmarked Events
            </h1>
            <p className="mt-3 max-w-2xl text-sm sm:text-base leading-7 text-gray-600 dark:text-slate-400">
              Revisit the events you saved while exploring Eventra.
            </p>
          </div>

          <Link
            to="/events"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <CalendarDays size={16} />
            Browse Events
          </Link>
        </div>

        {normalizedEvents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-slate-900/50 p-12 text-center">
            <Bookmark className="mx-auto mb-4 h-10 w-10 text-indigo-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">No bookmarks yet</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Save events from the events page to see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {normalizedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default BookmarkedEvents;
