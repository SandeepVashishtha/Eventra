import { useEffect, useMemo, useState, useRef  } from "react";
import { Bookmark, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import EventCard from "./EventCard";
import { getEventStatus } from "../../utils/eventUtils";
import {
  getBookmarkedEvents,
  subscribeToBookmarkChanges,
} from "../../utils/bookmarkUtils";

const BookmarkedEvents = () => {
  useDocumentTitle("Eventra | Bookmarked Events");
  const [bookmarkedEvents, setBookmarkedEvents] = useState(() => getBookmarkedEvents());

  useEffect(() => {
    setBookmarkedEvents(getBookmarkedEvents());
    return subscribeToBookmarkChanges(setBookmarkedEvents);
  }, []);

  const normalizedEvents = useMemo(
    () =>
      bookmarkedEvents.map((event) => ({
        ...event,
        status: getEventStatus(event),
      })),
    [bookmarkedEvents]
  );

  return (
    <div className="min-h-screen dark:from-slate-950 dark:via-slate-950 dark:to-gray-950 text-slate-900 dark:text-gray-100 pt-12 pb-16 bg-gradient-to-br from-[#f5f7ff] via-[#eef2ff] to-[#f3e8ff] " style={{
    backgroundImage: "url('/assets/bookmarkbg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    width:"100vw"
  }}>
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
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-indigo-500 hover:via-indigo-600 hover:to-slate-800 hover:shadow-xl"
          >
            <CalendarDays size={18} />
            Explore Events
          </Link>
        </div>

        {normalizedEvents.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 sm:p-12 text-center shadow-[0_10px_25px_rgba(0,0,0,0.05)] dark:border-gray-800 dark:bg-gray-900 dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Bookmark size={30} />
            </div>
            <h2 className="text-2xl font-bold text-gray-950 dark:text-slate-200">
              No bookmarked events yet
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base leading-7 text-gray-600 dark:text-slate-400">
              Tap the bookmark icon on any event card to save it here for quick access later.
            </p>
            <Link
              to="/events"
              className="mt-6 inline-flex items-center justify-center rounded-2xl border border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-md transition-all duration-300 hover:bg-indigo-50 hover:text-indigo-800 dark:border-indigo-700 dark:bg-gray-800 dark:text-indigo-300 dark:hover:bg-indigo-900/30 dark:hover:text-white"
            >
              Browse All Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
