import "./EventDetails.print.css";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { sanitizeHtml } from "../../utils/sanitizeHtml";
import CountdownTimer from "../../components/common/CountdownTimer";
import { Calendar, MapPin, Clock, Users, Tag, ArrowLeft, WifiOff } from "lucide-react";
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Copy, Check } from "lucide-react";
import { toast } from "react-toastify";
import { getEventStatus, isEventRegistrationClosed } from "../../utils/eventUtils";
import { logError } from "../../utils/errorLogger";
import { useAuth } from "../../context/AuthContext";
import { useMyEvents } from "../../context/MyEventsContext";
// Note: eventsMockData.json is NOT statically imported here.
// It is loaded dynamically (and only in development/fallback mode) so that
// the mock JSON is not bundled into the production build.

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const latestRequestIdRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [, setError] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  const { user } = useAuth();
  const { isRegistered, waitlistUpdated, triggerWaitlistUpdate } = useMyEvents();
  const userId = user?.id || user?.email || null;
  const [queuePosition, setQueuePosition] = useState(-1);
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    if (userId && event) {
      import("../../utils/waitlistUtils").then(({ getQueuePosition }) => {
        setQueuePosition(getQueuePosition(event.id, userId));
      }).catch(() => setQueuePosition(-1));
    } else {
      setQueuePosition(-1);
    }
  }, [userId, event, waitlistUpdated]);

  useEffect(() => {
    if (event) {
      import("../../utils/waitlistUtils").then(({ getEventWaitlist }) => {
        setWaitlistCount(getEventWaitlist(event.id).length);
      }).catch(() => setWaitlistCount(0));
    }
  }, [event, waitlistUpdated]);

  const handleLeaveWaitlist = async () => {
    if (!userId || !event) return;
    try {
      const { leaveWaitlist } = await import("../../utils/waitlistUtils");
      await leaveWaitlist(event.id, userId);
      toast.success("Successfully left the waitlist.");
      triggerWaitlistUpdate();
    } catch (err) {
      toast.error(err.message || "Failed to leave waitlist.");
    }
  };

  const shareUrl = event ? `${window.location.origin}/events/${event.id}` : "";
  const shareText = event ? `Check out this event: ${event.title}` : "";

  const shareLinks = event
    ? {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      }
    : {};

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link to clipboard");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error("Unable to share event");
        }
      }
    }
  };

  useEffect(() => {
    let isCancelled = false;
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;
    const controller = new AbortController();
    const isLatestRequest = () =>
      latestRequestIdRef.current === requestId && !controller.signal.aborted;

    const fetchEvent = async () => {
      setLoading(true);
      setCacheInfo(null);
      setError(null);

      try {
        // Try the live API first
        const apiUrl = `/api/events/${encodeURIComponent(eventId)}`;
        const response = await fetch(apiUrl, { signal: controller.signal });

        if (response.ok) {
          const data = await response.json();
          const evt = data.event || data || null;
          if (!isCancelled && isLatestRequest()) {
            setEvent(evt);
            setError(null);
            setCacheInfo({ cachedAt: null, label: "live" });
          }
        } else {
          // API returned error — fall back to mock data
          const responseError = new Error(`Failed to load event details (${response.status})`);
          const { default: mockData } = await import("./eventsMockData.json");
          const foundEvent = mockData.find((item) => String(item.id) === String(eventId));
          if (!isCancelled && isLatestRequest()) {
            setEvent(foundEvent || null);
            setError(foundEvent ? null : responseError);
            if (foundEvent) setCacheInfo({ cachedAt: null, label: "mock fallback" });
          }
        }
      } catch (err) {
        if (err?.name === "AbortError") {
          return;
        }

        // Network error or other failure — try mock data as last resort
        try {
          const { default: mockData } = await import("./eventsMockData.json");
          const foundEvent = mockData.find((item) => String(item.id) === String(eventId));
          if (!isCancelled && isLatestRequest()) {
            setEvent(foundEvent || null);
            setError(foundEvent ? null : err);
            if (foundEvent) setCacheInfo({ cachedAt: null, label: "offline fallback" });
          }
        } catch (fallbackErr) {
          if (!isCancelled && isLatestRequest()) {
            logError(fallbackErr, null, {
              cause: err?.message || String(err),
              eventId,
              source: "EventDetailsPage",
            });
            setEvent(null);
            setError(fallbackErr);
          }
        }
      } finally {
        if (!isCancelled && isLatestRequest()) setLoading(false);
      }
    };

    fetchEvent();
    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [eventId]);



  if (loading) {
    return (
      <main
        className="flex min-h-svh items-center justify-center bg-bg safe-area-x"
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
      <main className="flex min-h-svh items-center justify-center bg-bg safe-area-x py-10">
        <div className="max-w-sm text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Event Not Found
          </h1>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            The event you&apos;re looking for doesn&apos;t exist.
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

  const eventStatus = getEventStatus(event);
  const isPastEvent = eventStatus === "past" || eventStatus === "ended";
  const isCancelledEvent = eventStatus === "cancelled";
  const isRegistrationBlocked = isEventRegistrationClosed(event);

  return (
    <>
      <div className="min-h-screen mt-16 bg-bg">
        {/* Back Button */}
        <header className="sticky top-20 md:top-24 z-40 bg-navbar/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                  className="w-full h-96 object-cover"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-indigo-600 rounded-full text-sm font-semibold">
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        isRegistrationBlocked ? "bg-gray-600" : "bg-green-600"
                      }`}
                    >
                      {isCancelledEvent ? "Cancelled" : isPastEvent ? "Past Event" : "Upcoming"}
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

              <section className="mb-5 rounded-2xl border border-gray-200 bg-card-bg p-4 shadow-sm dark:border-gray-700 dark:bg-card-bg sm:mb-8 sm:p-6">
                <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white sm:mb-4 sm:text-2xl">
                  About This Event
                </h2>
                <p
                  className="overflow-wrap-anywhere text-base leading-7 text-gray-600 dark:text-gray-300 sm:text-lg sm:leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(event.description),
                  }}
                />
              </section>
            </section>

            <aside
              className="flex min-w-0 flex-col gap-4 sm:gap-6 lg:col-span-1"
              aria-label="Event registration and details"
            >
              {!isRegistrationBlocked && <CountdownTimer date={event.date} time={event.time} />}

              <div className="rounded-2xl border border-gray-200 bg-card-bg p-4 shadow-sm dark:border-gray-700 dark:bg-card-bg sm:p-6">
                <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                  Event Details
                </h3>
                <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex min-w-0 items-start gap-3">
                    <Calendar size={16} className="shrink-0 text-indigo-500" />
                    <span>
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex min-w-0 items-center gap-3">
                    <Clock size={16} className="shrink-0 text-blue-500" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex min-w-0 items-start gap-3">
                    <MapPin size={16} className="shrink-0 text-pink-500" />
                    <span className="min-w-0 break-words">{event.location}</span>
                  </div>
                  <div className="flex min-w-0 items-start gap-3">
                    <Users size={16} className="shrink-0 text-green-500" />
                    <span>
                      {Number(event.attendees) || 0} / {Number(event.maxAttendees) || 0} registered
                      {event.attendees >= event.maxAttendees && " (Sold Out)"}
                    </span>
                  </div>
                  {waitlistCount > 0 && (
                    <div className="flex min-w-0 items-center gap-3">
                      <Clock size={16} className="shrink-0 text-amber-500" />
                      <span className="text-amber-650 dark:text-amber-400 font-medium">{waitlistCount} user(s) on waitlist</span>
                    </div>
                  )}
                  <div className="flex min-w-0 items-center gap-3">
                    <Tag size={16} className="shrink-0 text-yellow-500" />
                    <span className="capitalize">{event.type || event.category || "event"}</span>
                  </div>
                </div>
              </div>

              {!isRegistrationBlocked && (
                isRegistered(event.id) ? (
                  <div className="w-full text-center py-3 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-2xl font-semibold">
                    You are registered!
                  </div>
                ) : queuePosition > 0 ? (
                  <div className="flex flex-col gap-3 w-full">
                    <div className="w-full text-center py-3 bg-amber-50 dark:bg-amber-950/20 text-amber-650 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-2xl font-semibold">
                      On Waitlist (Position #{queuePosition})
                    </div>
                    <button
                      onClick={handleLeaveWaitlist}
                      className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-red-300 text-red-650 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20 px-4 py-3 text-sm font-semibold transition-all duration-300 cursor-pointer"
                    >
                      Leave Waitlist
                    </button>
                  </div>
                ) : (
                  <Link
                    to={`/events/${event.id}/register`}
                    className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 px-4 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-indigo-500 hover:via-indigo-600 hover:to-slate-800 hover:shadow-xl"
                  >
                    {event.attendees >= event.maxAttendees ? "Join Waitlist" : "Register Now"}
                  </Link>
                )
              )}

              {/* Share Section */}
              <div className="bg-card-bg rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Share2 size={16} className="text-indigo-500" />
                  Share this Event
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <a
                    href={shareLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 transition-all text-xs font-semibold"
                    aria-label="Share on WhatsApp"
                  >
                    <MessageCircle size={14} />
                    WhatsApp
                  </a>

                  <a
                    href={shareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all text-xs font-semibold"
                    aria-label="Share on Twitter"
                  >
                    <Twitter size={14} />
                    Twitter
                  </a>

                  <a
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all text-xs font-semibold"
                    aria-label="Share on Facebook"
                  >
                    <Facebook size={14} />
                    Facebook
                  </a>

                  <a
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all text-xs font-semibold"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin size={14} />
                    LinkedIn
                  </a>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all text-xs font-semibold"
                  aria-label="Copy event link"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-green-500" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy Link
                    </>
                  )}
                </button>

                {navigator.share && (
                  <button
                    onClick={handleNativeShare}
                    className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-xs font-semibold"
                    aria-label="Share via device"
                  >
                    <Share2 size={14} />
                    Share via Device
                  </button>
                )}
              </div>

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
    </>
  );
};

export default EventDetailsPage;
