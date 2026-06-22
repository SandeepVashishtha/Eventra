import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { eventService } from "../../services/eventService";
import EventCard from "../../Pages/Events/EventCard";
import {Calendar,TrendingUp,Users,Bookmark,Eye,} from "lucide-react";

import { normalizeEvents } from "../../utils/eventFetchUtils";

const EVENT_LIST_KEYS = ["content", "events", "items", "results", "data"];

const extractEventList = (payload) => {
  if (Array.isArray(payload)) return payload;

  if (!payload || typeof payload !== "object") return [];

  for (const key of EVENT_LIST_KEYS) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
    const nestedEvents = extractEventList(value);
    if (nestedEvents.length > 0) return nestedEvents;
  }

  return [];
};

const toNumber = (value) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

const firstNumber = (event, keys) =>
  keys.reduce((acc, key) => {
    if (acc) return acc;

    const val = toNumber(event?.[key]);

    return val ? val : 0;
  }, 0);

/**
 * Derive a score for trending using whatever metrics are available on
 * event objects. Backends may differ; this keeps UI resilient.
 */
const getTrendingScore = (event) => {
  const registrations = firstNumber(event, [
    "registrations",
    "registrationCount",
    "attendees",
    "participants",
  ]);

  const pageViews = firstNumber(event, [
    "pageViews",
    "views",
    "viewCount",
  ]);

  const bookmarks = firstNumber(event, [
    "bookmarks",
    "bookmarkCount",
    "saves",
    "saveCount",
  ]);

  const engagement = firstNumber(event, [
    "engagement",
    "likes",
    "comments",
  ]);

  const score =
    registrations * 4 +
    engagement * 3 +
    bookmarks * 2 +
    pageViews * 1;

  return {
    score,
    registrations,
    pageViews,
    bookmarks,
    engagement,
  };
};

const TrendingEvents = ({
  title = "Trending Events",
  limit = 6,
  fetchSize = 24,
}) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        // eventService uses 0-based page index in backend pagination
        const res = await eventService.getAllEvents(0, fetchSize);
        const content = extractEventList(res?.data);
        if (!active) return;

        const normalizedEvents = normalizeEvents(content);
        setEvents(normalizedEvents);
      } catch (err) {
        if (!active) return;

        console.error("Failed to fetch trending events:", err);

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
      .map((e) => ({
        event: e,
        ...(getTrendingScore(e)),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;

        return String(a.event?.title || "").localeCompare(
          String(b.event?.title || "")
        );
      });

    return withScore.slice(0, limit);
  }, [events, limit]);

  // Loading Skeleton UI
  if (isLoading) {
    return (
      <section aria-label="Trending events" className="my-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">
                {title}
              </h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: limit }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 animate-pulse"
                >
                  {/* Image Skeleton */}
                  <div className="h-48 bg-slate-200 dark:bg-slate-800" />

                  {/* Content Skeleton */}
                  <div className="p-5 space-y-4">
                    <div className="h-6 rounded bg-slate-200 dark:bg-slate-800 w-3/4" />
                    <div className="space-y-2">
                      <div className="h-4 rounded bg-slate-200 dark:bg-slate-800 w-full" />
                      <div className="h-4 rounded bg-slate-200 dark:bg-slate-800 w-5/6" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <div className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
                    </div>
                  </div>
                </div>
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
            <h2 className="text-lg sm:text-xl font-bold">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (trending.length === 0) {
    return (
      <section aria-label="Trending events" className="my-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
              </div>

              <h2 className="text-lg sm:text-xl font-bold">
                {title}
              </h2>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              No trending events are available yet.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Trending events" className="my-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
              </div>

              <h2 className="text-lg sm:text-xl font-bold">
                {title}
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Based on registrations, page views, bookmarks,
              and engagement.
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
          {trending.map(
            ({
              event,
              registrations,
              pageViews,
              bookmarks,
              engagement,
            }) => (
              <div
                key={event.id ?? event.title}
                className="rounded-3xl overflow-hidden"
              >
                <EventCard
                  event={{
                    ...event,
                    attendees:
                      event.attendees ??
                      registrations ??
                      event.participants,

                    participants:
                      event.participants ??
                      event.attendees ??
                      registrations,
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
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default TrendingEvents;