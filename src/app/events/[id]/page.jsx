"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  Share2, 
  Globe, 
  Sparkles,
  Award,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { getEventById, registerForEvent } from "@/lib/api";
import { CardSkeleton } from "@/components/ui/Skeleton";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params?.id;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [actionError, setActionError] = useState("");
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      try {
        const data = await getEventById(eventId);
        setEvent(data);
      } catch (err) {
        console.warn("Failed to load event details", err);
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const handleRegister = async () => {
    setIsRegistering(true);
    setActionError("");
    try {
      await registerForEvent(eventId);
      setRegistered(true);
      setEvent((prev) => ({
        ...prev,
        registeredCount: (prev?.registeredCount || 0) + 1
      }));
    } catch (err) {
      console.warn("Registration error", err);
      setActionError(err?.message || "Could not complete your registration. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4fbf7] py-12 px-4 max-w-4xl mx-auto space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-[#f4fbf7] py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-zinc-800">Event Not Found</h2>
        <Link href="/events" className="text-[#00b887] hover:underline text-sm font-semibold">
          Return to Events List
        </Link>
      </main>
    );
  }

  const formattedDate = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    : "Date TBD";

  const formattedTime = event.eventDate
    ? new Date(event.eventDate).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit"
      })
    : "6:00 PM UTC";

  const capacity = event.capacity || 250;
  const registeredCount = event.registeredCount || 184;
  const percentFilled = Math.min(100, Math.round((registeredCount / capacity) * 100));

  return (
    <main className="min-h-screen bg-[#f4fbf7] text-zinc-900 font-sans py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Link */}
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Main Details */}
          <div className="lg:col-span-8 space-y-8">
            
            <div className="bg-white border border-emerald-900/10 rounded-3xl p-8 shadow-2xs space-y-6">
              
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-[#00b887]" />
                  <span>Public Event</span>
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 font-semibold border border-zinc-200">
                  <Globe className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{event.location || "Online"}</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                {event.title}
              </h1>

              {/* Description */}
              <div className="space-y-3 pt-2 text-sm text-zinc-600 leading-relaxed font-normal">
                <p>{event.description}</p>
                <p>
                  This session is designed for developers, architects, and technology enthusiasts. Participants will have access to live Q&A, slide decks, and code samples following the event.
                </p>
              </div>

              {/* Agenda Highlights */}
              <div className="pt-6 border-t border-zinc-100 space-y-4">
                <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00b887]" />
                  <span>Session Agenda</span>
                </h3>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-[#00b887] shrink-0 mt-0.5">00:00</span>
                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold text-zinc-900">Welcome & Technical Keynote</div>
                      <div className="text-zinc-500">Opening remarks, overview of modern toolchain updates.</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-[#00b887] shrink-0 mt-0.5">00:30</span>
                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold text-zinc-900">Deep-Dive Technical Demonstration</div>
                      <div className="text-zinc-500">Live coding lab demonstrating production deployment strategies.</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-[#00b887] shrink-0 mt-0.5">01:15</span>
                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold text-zinc-900">Q&A & Community Networking</div>
                      <div className="text-zinc-500">Interactive floor Q&A with speakers and maintainers.</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Right Sidebar - RSVP Action Card */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-md space-y-6 sticky top-24">
              
              <div className="space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                  Event Schedule
                </div>

                <div className="space-y-2 text-xs font-medium text-zinc-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>{formattedTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>{event.location || "Online / Virtual"}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Bar */}
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-600">Capacity Status</span>
                  <span className="text-[#00b887]">{registeredCount} / {capacity} Seats</span>
                </div>

                <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#00b887] rounded-full transition-all duration-500"
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  {percentFilled}% seats reserved
                </div>
              </div>

              {/* RSVP Button */}
              {registered ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-[#00b887] mx-auto" />
                  <div className="text-sm font-bold">You are Registered!</div>
                  <div className="text-xs text-emerald-600">Calendar invite sent to your account.</div>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className="w-full py-3.5 px-6 bg-[#00b887] hover:bg-[#049d73] text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isRegistering ? "Registering..." : "RSVP / Register Now"}</span>
                </button>
              )}

              {actionError && (
                <div
                  role="alert"
                  className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-start gap-2 font-medium"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-px" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 pt-2 border-t border-zinc-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Free Entry • Instant RSVP</span>
              </div>

              <div className="pt-2">
                <Link
                  href={`/events/${eventId}/analytics`}
                  className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-900 border border-zinc-200 hover:border-emerald-300 text-zinc-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-4 h-4 text-[#00b887]" />
                  <span>View Organizer Analytics</span>
                </Link>
              </div>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
