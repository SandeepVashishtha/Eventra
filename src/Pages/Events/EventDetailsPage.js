import useRecentlyViewed from "../../hooks/useRecentlyViewed";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import CountdownTimer from "../../components/common/CountdownTimer";
import { Calendar, MapPin, Clock, Users, Tag, ArrowLeft, CalendarPlus } from "lucide-react";
import { Helmet } from "react-helmet-async";
import eventsMockData from "./eventsMockData.json";
import { getEventStatus } from "../../utils/eventUtils";
import { downloadICSFile, generateGoogleCalendarLink, generateOutlookLink } from "../../utils/calendarExporter";
import { toast } from "react-hot-toast";

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { addRecentlyViewed } = useRecentlyViewed();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const foundEvent = eventsMockData.find((item) => item.id === parseInt(eventId, 10));

        setEvent(foundEvent);
        if (foundEvent) {
          addRecentlyViewed({
            id: foundEvent.id,
            title: foundEvent.title,
            date: foundEvent.date,
            location: foundEvent.location,
            image: foundEvent.image,
            category: foundEvent.type,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, addRecentlyViewed]);

  if (loading) {
    return (
      <main
        className="flex min-h-svh items-center justify-center bg-white safe-area-x dark:bg-black"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"
            aria-hidden="true"
          />
          <p className="font-medium text-gray-600 dark:text-gray-400">
            Loading event details...
          </p>
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
            aria-label="Back to Events"
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
    <div className="min-h-screen mt-16 bg-gradient-to-l from-sky-50 via-white to-white dark:from-gray-900 dark:to-black">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={event.image} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={event.image} />
      </Helmet>

      {/* Back Button */}
      <header className="sticky top-20 md:top-24 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            type="button"
            onClick={() => navigate("/events")}
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
            aria-label="Back to Events"
          >
            <ArrowLeft size={20} aria-hidden="true" />
            Back to Events
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl safe-area-x py-5 sm:px-6 sm:py-10 lg:px-8">
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
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold sm:text-sm ${
                      isPastEvent ? "bg-gray-600" : "bg-green-600"
                    }`}
                  >
                    {isPastEvent ? "Past Event" : "Upcoming"}
                  </span>
                </div>
                <h1
                  id="event-details-title"
                  className="text-balance text-2xl font-bold leading-tight xs:text-3xl sm:text-4xl"
                >
                  {event.title}
                </h1>
              </div>
            </div>

            <section
              className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:mb-8 sm:p-6"
              aria-labelledby="event-about-title"
            >
              <h2
                id="event-about-title"
                className="mb-3 text-xl font-bold text-gray-900 dark:text-white sm:mb-4 sm:text-2xl"
              >
                About This Event
              </h2>
              <p
                className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }}
              />
            </section>
          </section>

          <aside
            className="flex min-w-0 flex-col gap-4 sm:gap-6 lg:col-span-1"
            aria-label="Event registration and details"
          >
            {!isPastEvent && <CountdownTimer date={event.date} time={event.time} />}

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
              <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                Event Details
              </h3>
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex min-w-0 items-start gap-3">
                  <Calendar size={16} className="shrink-0 text-indigo-500" aria-hidden="true" />
                  <span className="min-w-0">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex min-w-0 items-center gap-3">
                  <Clock size={16} className="shrink-0 text-blue-500" aria-hidden="true" />
                  <span>{event.time}</span>
                </div>
                <div className="flex min-w-0 items-start gap-3">
                  <MapPin size={16} className="shrink-0 text-pink-500" aria-hidden="true" />
                  <span className="min-w-0 break-words">{event.location}</span>
                </div>
                <div className="flex min-w-0 items-center gap-3">
                  <Users size={16} className="shrink-0 text-green-500" aria-hidden="true" />
                  <span>{event.attendees} / {event.maxAttendees} registered</span>
                </div>
                <div className="flex min-w-0 items-center gap-3">
                  <Tag size={16} className="shrink-0 text-yellow-500" aria-hidden="true" />
                  <span className="capitalize">{event.type}</span>
                </div>
              </div>
            </div>

            {!isPastEvent && (
              <Link to={`/events/${event.id}/register`}>
                <div className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 px-4 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-indigo-500 hover:via-indigo-600 hover:to-slate-800 hover:shadow-xl sm:hover:scale-[1.02]">
                  Register Now
                </div>
              </Link>
            )}

            {/* Add to Calendar Section */}
            {!isPastEvent && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Add to Calendar
                </h3>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      downloadICSFile(event);
                      toast.success("Calendar invite downloaded!");
                    }}
                    className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-3 text-sm font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200"
                    aria-label="Download .ics calendar invite"
                  >
                    <CalendarPlus size={16} className="text-green-500" />
                    Download .ics Invite
                  </button>
                  
                  {generateGoogleCalendarLink(event) && (
                    <a
                      href={generateGoogleCalendarLink(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-3 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                      aria-label="Add to Google Calendar"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                        <path fill="#4285F4" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10z"/>
                        <path fill="#fff" d="M13 7h-2v6l5.25 3.15.75-1.23-4-2.37z"/>
                      </svg>
                      Add to Google Calendar
                    </a>
                  )}
                  
                  {generateOutlookLink(event) && (
                    <a
                      href={generateOutlookLink(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-3 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                      aria-label="Add to Outlook Calendar"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                        <path fill="#0078D4" d="M2 6l10-4 10 4v12l-10 4L2 18z"/>
                        <path fill="#fff" d="M12 4L4 7v10l8 3 8-3V7z"/>
                      </svg>
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
              aria-label="Print or save as PDF"
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