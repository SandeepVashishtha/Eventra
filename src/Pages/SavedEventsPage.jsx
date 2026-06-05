import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, Inbox } from "lucide-react";
import EmptyState from "../components/common/EmptyState";
import useBookmarks from "../hooks/useBookmarks";
import { exportToCSV } from "../utils/exportUtils";

const SavedEventsPage = () => {
  const navigate = useNavigate();
  const { bookmarks, toggleBookmark } = useBookmarks();
  const [sortBy, setSortBy] = useState("savedAt");
  const [exporting, setExporting] = useState(false);

  const sorted = [...bookmarks].sort((a, b) =>
    sortBy === "savedAt" ? b.savedAt - a.savedAt : new Date(a.date) - new Date(b.date)
  );

  const handleExportCSV = () => {
    if (sorted.length === 0) return;
    setExporting(true);
    try {
      exportToCSV(sorted, `eventra-saved-events-${new Date().toISOString().slice(0, 10)}`);
    } finally {
      // Brief visual feedback before resetting
      setTimeout(() => setExporting(false), 800);
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7ff] via-[#eef2ff] to-[#f3e8ff] px-4 py-12 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-gray-950 dark:text-gray-100 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-4xl">
          <EmptyState
            title="No saved events yet!"
            description="Bookmark events you're interested in to find them here later."
            icon={Inbox}
            actionLabel="Browse Events"
            actionPath="/events"
          />
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7ff] via-[#eef2ff] to-[#f3e8ff] px-4 py-12 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-gray-950 dark:text-gray-100 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-950 dark:text-slate-100 sm:text-4xl">
              Saved Events ({bookmarks.length})
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 dark:text-slate-400 sm:text-base">
              Revisit the events you saved while exploring Eventra.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sort control */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              <option value="savedAt">Recently Saved</option>
              <option value="date">Event Date</option>
            </select>

            {/* Export CSV button */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={exporting || sorted.length === 0}
              aria-label="Export saved events as CSV"
              title="Download saved events as a CSV file"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-indigo-500 hover:via-indigo-600 hover:to-slate-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={15} aria-hidden="true" />
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((event) => (
            <div
              key={event.id}
              className="rounded-3xl border border-gray-100 bg-white p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:shadow-[0_10px_25px_rgba(0,0,0,0.3)] dark:hover:border-indigo-700"
            >
              <h3 className="mb-2 text-lg font-bold tracking-tight text-gray-950 dark:text-slate-100">
                {event.title || event.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">{event.date}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={`/events/${event.id}`}
                  className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition-all duration-300 hover:bg-indigo-50 hover:text-indigo-800 dark:border-indigo-700 dark:bg-gray-800 dark:text-indigo-300 dark:hover:bg-indigo-900/30 dark:hover:text-white"
                >
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => toggleBookmark(event)}
                  className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SavedEventsPage;
