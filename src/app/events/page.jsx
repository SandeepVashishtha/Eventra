"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  Filter, 
  RefreshCw, 
  Sparkles, 
  ArrowRight, 
  PlusCircle,
  History,
  Trash2,
  X,
  CheckCircle2
} from "lucide-react";
import { getEvents } from "@/lib/api";
import { createSingleFlightGate } from "@/lib/single-flight.mjs";
import EventCard from "@/components/ui/EventCard";
import DetailDrawer from "@/components/ui/DetailDrawer";
import { CardSkeleton } from "@/components/ui/Skeleton";

const SEARCH_HISTORY_KEY = "eventra_recent_searches";
const SEARCH_HISTORY_EVENT = "eventra:recent-searches-changed";
const EMPTY_RECENT_SEARCHES = Object.freeze([]);
let cachedSearchHistoryRaw;
let cachedRecentSearches = EMPTY_RECENT_SEARCHES;

function getStoredRecentSearches() {
  if (typeof window === "undefined") return EMPTY_RECENT_SEARCHES;
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (raw === cachedSearchHistoryRaw) return cachedRecentSearches;
    const parsed = raw ? JSON.parse(raw) : [];
    cachedSearchHistoryRaw = raw;
    cachedRecentSearches = Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === "string" && item.trim().length > 0)
      : EMPTY_RECENT_SEARCHES;
    return cachedRecentSearches;
  } catch (e) {
    return EMPTY_RECENT_SEARCHES;
  }
}

function getServerRecentSearchesSnapshot() {
  return EMPTY_RECENT_SEARCHES;
}

function subscribeToRecentSearches(onStoreChange) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SEARCH_HISTORY_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SEARCH_HISTORY_EVENT, onStoreChange);
  };
}

function notifyRecentSearchesChanged() {
  window.dispatchEvent(new Event(SEARCH_HISTORY_EVENT));
}

function saveStoredSearchQuery(term) {
  if (typeof window === "undefined" || typeof term !== "string" || !term.trim()) return [];
  const cleanTerm = term.trim();
  try {
    const existing = getStoredRecentSearches();
    const filtered = existing.filter((t) => t.toLowerCase() !== cleanTerm.toLowerCase());
    const updated = [cleanTerm, ...filtered].slice(0, 5);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    notifyRecentSearchesChanged();
    return updated;
  } catch (e) {
    return EMPTY_RECENT_SEARCHES;
  }
}

function clearStoredRecentSearches() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
      notifyRecentSearchesChanged();
    } catch (e) {}
  }
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const cancelledRef = useRef(false);
  const loadGateRef = useRef(createSingleFlightGate());
  const recentSearches = useSyncExternalStore(
    subscribeToRecentSearches,
    getStoredRecentSearches,
    getServerRecentSearchesSnapshot
  );

  const fetchEventsData = async () => {
    const lease = loadGateRef.current.acquire();
    if (!lease) return;

    setLoading(true);
    try {
      const data = await getEvents();
      if (!cancelledRef.current) {
        setEvents(data || []);
      }
    } catch (err) {
      if (!cancelledRef.current) {
        console.warn("Failed to fetch events", err);
      }
    } finally {
      lease.release();
      if (!cancelledRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    cancelledRef.current = false;
    const lease = loadGateRef.current.acquire();
    if (!lease) {
      return () => {
        cancelledRef.current = true;
      };
    }

    async function loadInitialEvents() {
      try {
        const data = await getEvents();
        if (!cancelledRef.current) {
          setEvents(data || []);
        }
      } catch (err) {
        if (!cancelledRef.current) {
          console.warn("Failed to fetch events", err);
        }
      } finally {
        lease.release();
        if (!cancelledRef.current) {
          setLoading(false);
        }
      }
    }

    loadInitialEvents();
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim().length > 0) {
      saveStoredSearchQuery(searchQuery);
    }
  };

  const handleSearchBlur = () => {
    if (searchQuery.trim().length > 0) {
      saveStoredSearchQuery(searchQuery);
    }
  };

  const handleSelectRecentSearch = (term) => {
    setSearchQuery(term);
    saveStoredSearchQuery(term);
  };

  const handleClearAllRecentSearches = () => {
    clearStoredRecentSearches();
    setToastMessage("Search history cleared successfully!");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleRemoveSingleSearch = (e, termToRemove) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const filtered = recentSearches.filter((t) => t !== termToRemove);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered));
        notifyRecentSearchesChanged();
      } catch (err) {}
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      (e.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.location || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFormat =
      selectedFormat === "all" ||
      (e.title || "").toLowerCase().includes(selectedFormat.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(selectedFormat.toLowerCase());

    const matchesLocation =
      selectedLocation === "all" ||
      (selectedLocation === "online" && (e.location || "").toLowerCase().includes("online")) ||
      (selectedLocation === "onsite" && !(e.location || "").toLowerCase().includes("online"));

    return matchesSearch && matchesFormat && matchesLocation;
  });

  const featuredEvent = events[0];

  return (
    <main className="min-h-screen bg-[#f4fbf7] text-zinc-900 font-sans py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-900 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-[#00b887]" />
            <span>Verified Technical Events</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight">
            Discover & Attend Tech Events
          </h1>

          <p className="text-base text-zinc-600 leading-relaxed font-normal">
            RSVP for hands-on developer workshops, architecture summits, keynotes, and regional tech meetups synced live from Eventra API.
          </p>

          <div className="pt-2 flex justify-center">
            <Link
              href="/host"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00b887] hover:bg-[#049d73] text-white font-bold text-xs rounded-full shadow-md shadow-emerald-200 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Host an Event</span>
            </Link>
          </div>
        </div>

        {/* Toast Alert Feedback Banner */}
        {toastMessage && (
          <div className="max-w-md mx-auto p-3.5 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage("")} className="p-1 hover:bg-emerald-700 rounded-full transition-colors cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {featuredEvent && !loading && (
          <div className="bg-white border border-emerald-900/10 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-[#00b887]" />
                    <span>Spotlight Event</span>
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    {new Date(featuredEvent.eventDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                </div>

                <h2 className="text-2xl font-extrabold text-zinc-900">
                  {featuredEvent.title}
                </h2>

                <p className="text-sm text-zinc-600 leading-relaxed">
                  {featuredEvent.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 font-medium pt-2">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{featuredEvent.location || "Online / Virtual"}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>{featuredEvent.registeredCount || 184} Attendees RSVP&apos;d</span>
                  </span>
                </div>
              </div>

              <div className="w-full lg:w-auto">
                <button
                  onClick={() => setSelectedEvent(featuredEvent)}
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  <span>Quick View Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-5 rounded-2xl border border-emerald-900/10 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search events by keyword, topic, or location..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                onBlur={handleSearchBlur}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-900 placeholder-zinc-400 transition-all"
              />
            </div>

            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full md:w-48 px-3.5 py-2.5 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-800 cursor-pointer"
            >
              <option value="all">All Formats</option>
              <option value="workshop">Workshops</option>
              <option value="summit">Summits</option>
              <option value="meetup">Meetups</option>
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full md:w-48 px-3.5 py-2.5 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b887] text-zinc-800 cursor-pointer"
            >
              <option value="all">All Locations</option>
              <option value="online">Online / Virtual</option>
              <option value="onsite">On-Site / In-Person</option>
            </select>

            <button
              onClick={fetchEventsData}
              disabled={loading}
              className="p-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              title="Refresh events list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Recent Search History Section with Clear All Action */}
          {recentSearches.length > 0 && (
            <div className="pt-2 pb-1 border-t border-zinc-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                  <History className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Recent Searches</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearAllRecentSearches}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer transition-colors"
                  aria-label="Clear all recent search history"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {recentSearches.map((term, idx) => (
                  <span
                    key={`recent-search-${idx}-${term}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 hover:bg-emerald-50 hover:border-emerald-300 text-zinc-700 hover:text-emerald-900 text-xs font-semibold rounded-full border border-zinc-200/80 transition-all select-none group"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectRecentSearch(term)}
                      className="hover:underline cursor-pointer bg-transparent border-none p-0 text-left font-semibold text-zinc-700 hover:text-emerald-900"
                    >
                      {term}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveSingleSearch(e, term)}
                      className="p-0.5 text-zinc-400 hover:text-red-500 rounded-full transition-colors cursor-pointer"
                      title="Remove search"
                      aria-label={`Remove ${term} from recent searches`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium pt-1 border-t border-zinc-100">
            <span>Showing {filteredEvents.length} public events</span>
            {searchQuery || selectedFormat !== "all" || selectedLocation !== "all" ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFormat("all");
                  setSelectedLocation("all");
                }}
                className="text-[#00b887] hover:underline font-semibold"
              >
                Reset Filters
              </button>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-emerald-900/10 space-y-3">
            <Filter className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="text-lg font-bold text-zinc-800">No events found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              We couldn&apos;t find any events matching your selected filters. Try searching for different keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={`events-page-${event.id}`}
                event={event}
                onClick={(data) => setSelectedEvent(data)}
              />
            ))}
          </div>
        )}
      </div>

      <DetailDrawer
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        type="event"
        data={selectedEvent}
      />
    </main>
  );
}
