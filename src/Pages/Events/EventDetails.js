import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, MapPin, Clock, Tag } from "lucide-react";
import {
  getEventStatus,
  isEventRegistrationClosed,
} from "../../utils/eventUtils";
import { isEventBookmarked } from "../../utils/bookmarkUtils";
import { useMyEvents } from "../../context/MyEventsContext";
import ReminderControls from "../../components/reminders/ReminderControls";
import CertificateDownload from "../../components/CertificateDownload";
import EventMaterials from "../../components/common/EventMaterials";
import EventRecommendations from "../../components/events/EventRecommendations";
import CopyLinkButton from "../../components/common/CopyLinkButton";
import { EventDetailSkeleton } from "../../components/common/SkeletonLoaders";
import { apiUtils, API_ENDPOINTS } from "../../config/api";

const EventDetails = () => {
  const { eventId } = useParams();
  const { isRegistered } = useMyEvents();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      setFetchError(null);

      try {
        const res = await apiUtils.get(API_ENDPOINTS.EVENTS.DETAIL(eventId));
        if (cancelled) return;

        if (res.status === 404) {
          setNotFound(true);
          return;
        }

        if (!res.ok) {
          setFetchError(`Failed to load event (${res.status})`);
          return;
        }

        const raw = res.data ?? res;
        setEvent({ ...raw, status: raw.status || getEventStatus(raw) });
      } catch {
        if (cancelled) return;
        if (process.env.NODE_ENV === "development") {
          // Development fallback — use mock data when the API is not running
          const { default: mockEvents } = await import("./eventsMockData.json", {
            assert: { type: "json" },
          }).catch(() => ({ default: [] }));
          const found = mockEvents.find((item) => String(item.id) === eventId);
          if (found) {
            setEvent({ ...found, status: getEventStatus(found) });
          } else {
            setNotFound(true);
          }
        } else {
          setFetchError("Failed to load event. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [eventId]);

  if (loading) return <EventDetailSkeleton />;

  if (notFound || (!loading && !event && !fetchError)) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 py-24">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white dark:bg-gray-900 shadow-xl p-10 text-center">
          <h1 className="text-5xl font-extrabold mb-4">Event Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            We could not find the event you were looking for.
          </p>
          <Link to="/events" className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-white font-semibold shadow hover:bg-indigo-700 transition">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-8 max-w-md text-center">
          <p className="text-red-700 dark:text-red-300 font-semibold mb-4">{fetchError}</p>
          <Link to="/events" className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-white font-semibold shadow hover:bg-indigo-700 transition">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  const canSetReminder = isEventBookmarked(event.id) || isRegistered(event.id);
  const isRegistrationClosed = isEventRegistrationClosed(event.status);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em]">
              {event.type}
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight">
              {event.title}
            </h1>
            <p className="mt-4 max-w-2xl text-gray-600 dark:text-gray-300">
              {event.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {isRegistrationClosed ? (
              <>
                <span className="inline-flex items-center justify-center rounded-full bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 shadow-sm cursor-not-allowed dark:bg-gray-800 dark:text-gray-300">
                  Event Ended
                </span>
                {event.status === "past" && (
                  <CertificateDownload
                    eventName={event.title}
                    eventDate={event.date}
                    eventType={event.type}
                  />
                )}
              </>
            ) : (
              <Link
                to={`/events/${event.id}/register`}
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
              >
                Register Now
              </Link>
            )}

  {/* Copy Link Button */}
  <CopyLinkButton />

  <Link
    to="/events"
    className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
  >
    Back to Events
  </Link>
</div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] items-start">

          {/* Left - Image and Details */}
          <div className="space-y-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900">
            <img
              src={event.image}
              alt={event.title}
              className="w-full rounded-3xl object-cover shadow-lg h-96"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p className="font-semibold">{new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                <Clock className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                  <p className="font-semibold">{event.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                <MapPin className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-semibold">{event.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                <Tag className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className="font-semibold capitalize">{event.status}</p>
                </div>
              </div>
            </div>

{event.status === 'past' && (
  <EventMaterials materials={event.materials || [
    {
      "id": 1,
      "title": `${event.title} - Presentation Slides`,
      "type": "ppt",
      "size": "3.2 MB",
      "url": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1"
    },
    {
      "id": 2,
      "title": `${event.title} - Session Notes`,
      "type": "pdf",
      "size": "1.5 MB",
      "url": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1"
    },
    {
      "id": 3,
      "title": `${event.title} - Resource Guide`,
      "type": "doc",
      "size": "0.8 MB",
      "url": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1"
    }
  ]} />
)}
          </div>

          {/* Right - Sidebar */}
          <aside className="space-y-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900">
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
              <ReminderControls event={event} canSetReminder={canSetReminder} />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Event Details</h2>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <p><span className="font-semibold">Attendees:</span> {event.attendees}/{event.maxAttendees}</p>
                <p><span className="font-semibold">Type:</span> {event.type}</p>
                <p><span className="font-semibold">Tags:</span> {event.tags.join(", ")}</p>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Summary</h3>
              <p className="mt-3 text-gray-700 dark:text-gray-300 text-sm leading-6">
                {event.description}
              </p>
            </div>
          </aside>

        </div>

        {/* PERSONALIZED RECOMMENDATIONS SECTION */}
        <div className="mt-12">
          <EventRecommendations currentEventId={event.id} currentCategory={event.category} />
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
