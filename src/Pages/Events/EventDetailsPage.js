import useRecentlyViewed from "../../hooks/useRecentlyViewed";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import CountdownTimer from "../../components/common/CountdownTimer";
import { Calendar, MapPin, Clock, Users, Tag, ArrowLeft, CalendarPlus, WifiOff } from "lucide-react";
import { Helmet } from "react-helmet-async";
import eventsMockData from "./eventsMockData.json";
import { getEventStatus } from "../../utils/eventUtils";
import { downloadICSFile, generateGoogleCalendarLink, generateOutlookLink } from "../../utils/calendarExporter";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import {
  getCacheAgeLabel,
  getCachedEventDetail,
  saveCachedEventDetail,
} from "../../utils/offlineEventCache";
import { toast } from "react-hot-toast";

const normalizeEvent = (event) => ({
  ...event,
  status: event.status || getEventStatus(event),
});

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { addRecentlyViewed } = useRecentlyViewed();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setCacheInfo(null);

      try {
        const response = await apiUtils.get(API_ENDPOINTS.EVENTS.DETAIL(eventId));
        const fetchedEvent = normalizeEvent(response.data);
        setEvent(fetchedEvent);
        saveCachedEventDetail(fetchedEvent);
      } catch {
        const cached = getCachedEventDetail(eventId);
        if (cached?.event) {
          setEvent(normalizeEvent(cached.event));
          setCacheInfo({
            cachedAt: cached.cachedAt,
            label: getCacheAgeLabel(cached.cachedAt),
          });
        } else {
          const foundEvent = eventsMockData.find((item) => String(item.id) === String(eventId));
          setEvent(foundEvent ? normalizeEvent(foundEvent) : null);
          if (foundEvent) {
            setCacheInfo({ cachedAt: null, label: "bundled fallback" });
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    if (!event) {
      return;
    }

    addRecentlyViewed({
      id: event.id,
      title: event.title,
      date: event.date,
      location: event.location,
      image: event.image,
      category: event.type,
    });
  }, [addRecentlyViewed, event]);

  if (loading) {
    return (
      <main
        className="flex min-h-svh items-center justify-center bg-white safe-area-x dark:bg-black"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="font-medium text-gray-600 dark:text-gray-400">Loading event details...</p>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-white safe-area-x py-10 dark:bg-slate-950">
        <div className="max-w-sm text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Event Not Found
          </h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            The event you're looking for doesn't exist.
          </p>
          <button
            type="button"
            onClick={() => navigate("/events")}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Back to Events
          </button>
        </div>
      </main>
    );
  }

  const isPastEvent = getEventStatus(event) === "past" || getEventStatus(event) === "ended";
  const pageUrl = `${window.location.origin}/events/${event.id}`;
  const pageTitle = `${event.title} | Eventra`;
  const pageDescription = event.description?.substring(0, 160) || "Join this event on Eventra.";

  return (
    <div className="mt-16 min-h-svh overflow-x-hidden bg-gradient-to-l from-sky-50 via-white to-white dark:from-gray-900 dark:to-black">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={event.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={event.image} />
      </Helmet>

      <header className="sticky top-16 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90 md:top-20">
        <div className="mx-auto max-w-6xl safe-area-x py-3 sm:px-6 sm:py-4 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/events")}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg pr-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 sm:text-base"
          >
            <ArrowLeft size={20} aria-hidden="true" />
            Back to Events
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl safe-area-x py-5 sm:px-6 sm:py-10 lg:px-8">
        {cacheInfo && (
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
            <WifiOff size={16} aria-hidden="true" />
            Showing {cacheInfo.label} details
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid min-w-0 grid-cols-1 gap-5 sm:gap-8 lg:grid-cols-3"
        >
          <section className="min-w-0 lg:col-span-2" aria-labelledby="event-details-title">
            <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-2xl shadow-xl xs:aspect-video sm:mb-8">
              <img
                src={event.image}
                alt={`${event.title} event banner`}
                loading="eager"
                decoding="async"
                width={960}
                height={540}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white sm:p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-3">
                  <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold sm:text-sm">
                    {(event.type || event.category || "event").charAt(0).toUpperCase() +
                      (event.type || event.category || "event").slice(1)}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold sm:text-sm ${isPastEvent ? "bg-gray-600" : "bg-green-600"}`}>
                    {isPastEvent ? "Past Event" : "Upcoming"}
                  </span>
                </div>
                <h1 id="event-details-title" className="text-balance text-2xl font-bold leading-tight xs:text-3xl sm:text-4xl">
                  {event.title}
                </h1>
              </div>
            </div>

            <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:mb-8 sm:p-6">
              <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white sm:mb-4 sm:text-2xl">
                About This Event
              </h2>
              <p
                className="overflow-wrap-anywhere text-base leading-7 text-gray-600 dark:text-gray-300 sm:text-lg sm:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description || "") }}
              />
            </section>
          </section>

          <aside className="flex min-w-0 flex-col gap-4 sm:gap-6 lg:col-span-1" aria-label="Event registration and details">
            {!isPastEvent && <CountdownTimer date={event.date} time={event.time} />}

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Event Details</h3>
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex min-w-0 items-start gap-3">
                  <Calendar size={16} className="shrink-0 text-indigo-500" />
                  <span>{new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                <div className="flex min-w-0 items-center gap-3">
                  <Clock size={16} className="shrink-0 text-blue-500" />
                  <span>{event.time}</span>
                </div>
                <div className="flex min-w-0 items-start gap-3">
                  <MapPin size={16} className="shrink-0 text-pink-500" />
                  <span className="min-w-0 break-words">{event.location}</span>
                </div>
                <div className="flex min-w-0 items-center gap-3">
                  <Users size={16} className="shrink-0 text-green-500" />
                  <span>{Number(event.attendees) || 0} / {Number(event.maxAttendees) || 0} registered</span>
                </div>
                <div className="flex min-w-0 items-center gap-3">
                  <Tag size={16} className="shrink-0 text-yellow-500" />
                  <span className="capitalize">{event.type || event.category || "event"}</span>
                </div>
              </div>
            </div>

            {!isPastEvent && (
              <Link to={`/events/${event.id}/register`} className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 px-4 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-indigo-500 hover:via-indigo-600 hover:to-slate-800 hover:shadow-xl">
                Register Now
              </Link>
            )}

            {!isPastEvent && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Add to Calendar</h3>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      downloadICSFile(event);
                      toast.success("Calendar invite downloaded!");
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition-all duration-200 hover:border-green-300 hover:bg-green-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:border-green-700 dark:hover:bg-green-900/20"
                  >
                    <CalendarPlus size={16} className="text-green-500" />
                    Download .ics Invite
                  </button>
                  {generateGoogleCalendarLink(event) && (
                    <a href={generateGoogleCalendarLink(event)} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition-all duration-200 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-blue-900/20">
                      Add to Google Calendar
                    </a>
                  )}
                  {generateOutlookLink(event) && (
                    <a href={generateOutlookLink(event)} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition-all duration-200 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-blue-900/20">
                      Add to Outlook
                    </a>
                  )}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="print-hide flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              Print / Save as PDF
            </button>
          </aside>
        </motion.div>
      </main>
    </div>
  );
};

export default EventDetailsPage;
