import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { eventService } from "../../services/eventService";
import EventCard from "../../Pages/Events/EventCard";
import { Calendar, TrendingUp, Users, Bookmark, Eye } from "lucide-react";

const toNumber = (value) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Derive a score for trending using whatever metrics are available on
 * event objects. Backends may differ; this keeps UI resilient.
 */
const getTrendingScore = (event) => {
  // Common candidates across versions
  const registrations =
    toNumber(event.registrations) ||
    toNumber(event.registrationCount) ||
    toNumber(event.attendees) ||
    toNumber(event.participants);

  const pageViews =
    toNumber(event.pageViews) ||
    toNumber(event.views) ||
    toNumber(event.viewCount);

  const bookmarks =
    toNumber(event.bookmarks) ||
    toNumber(event.bookmarkCount) ||
    toNumber(event.saves) ||
    toNumber(event.saveCount);

  const engagement =
    toNumber(event.engagement) ||
    toNumber(event.likes) ||
    toNumber(event.comments);

  // Weights tuned to keep score stable even when only one metric exists.
  const score =
    registrations * 4 +
    engagement * 3 +
    bookmarks * 2 +
    pageViews * 1;

  return { score, registrations, pageViews, bookmarks, engagement };
};

const TrendingEvents = ({ title = "Trending Events", limit = 6, fetchSize = 24 }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        // eventService uses 0-based page index in backend pagination (consistent with existing hooks)
        const res = await eventService.getAllEvents(0, fetchSize);
        const content = res?.data?.content ?? res?.data ?? [];
        if (!active) return;

        const normalized = Array.isArray(content) ? content : [];
        setEvents(normalized);
      } catch {
        if (!active) return;
        setError("Failed to load trending events.");
        setEvents([]);
      } finally {
        if (!active) return;
        setIsLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [fetchSize]);

  const trending = useMemo(() => {
    const withScore = events
      .map((e) => ({ event: e, ...(getTrendingScore(e)) }))
      .sort((a, b) => b.score - a.score);

    return withScore.slice(0, limit);
  }, [events, limit]);

  if (isLoading) {
    return (
      <section aria-label="Trending events" className="my-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
              {Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="h-[420px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-label="Trending events" className="my-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (trending.length === 0) return null;

  return (
    <section aria-label="Trending events" className="my-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Based on registrations, page views, bookmarks, and engagement.
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-200"
          >
            View all <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map(({ event, registrations, pageViews, bookmarks, engagement }) => (
            <div key={event.id} className="rounded-3xl overflow-hidden">
              <EventCard
                event={{
                  ...event,
                  // Provide some fallback fields so EventCard doesn't break
                  attendees: event.attendees ?? registrations ?? event.participants,
                  participants: event.participants ?? event.attendees ?? registrations,
                }}
              />

              <div className="px-5 py-3 bg-white/60 dark:bg-slate-950/20 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    {registrations} regs
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-sky-500" />
                    {pageViews} views
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                    {bookmarks} saves
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                    {engagement} eng
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingEvents;

