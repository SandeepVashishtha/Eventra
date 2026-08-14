"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Flame, CalendarX } from "lucide-react";
import { getEvents } from "@/lib/api";
import TrendingEventCard from "@/components/ui/TrendingEventCard";
import DetailDrawer from "@/components/ui/DetailDrawer";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function TrendingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const data = await getEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load trending events from API", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <section className="py-16 bg-[#f4fbf7] border-b border-emerald-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold border border-emerald-200">
              <Flame className="w-3.5 h-3.5 text-[#00b887]" />
              <span>Trending Opportunities</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              Trending Events
            </h2>
            <p className="text-sm text-zinc-600 max-w-xl">
              Live technical workshops, developer conferences, and architecture summits fetched live from API.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#00b887] hover:text-[#049d73] transition-colors"
          >
            <span>View All Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : events.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-3xl border border-emerald-900/10 space-y-3">
            <CalendarX className="w-8 h-8 text-zinc-300 mx-auto" />
            <h4 className="text-base font-bold text-zinc-800">No events currently live on API</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Check back soon for new public event announcements.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event, idx) => (
              <TrendingEventCard
                key={`trending-${event.id || idx}`}
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
    </section>
  );
}
