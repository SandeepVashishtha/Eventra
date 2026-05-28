import "./EventDetails.print.css";
import useRecentlyViewed from "../../hooks/useRecentlyViewed";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import CountdownTimer from "../../components/common/CountdownTimer";
import { Calendar, MapPin, Clock, Users, Tag, ArrowLeft, WifiOff } from "lucide-react";
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Copy, Check } from "lucide-react";
import eventsMockData from "./eventsMockData.json";
import { getEventStatus } from "../../utils/eventUtils";

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { addRecentlyViewed } = useRecentlyViewed();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [copied, setCopied] = useState(false);

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
      // Clipboard write failed silently
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
      } catch {}
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setCacheInfo(null);

      try {
        const foundEvent = eventsMockData.find(
          (item) => String(item.id) === String(eventId)
        );
        setEvent(foundEvent || null);
        if (foundEvent) {
          setCacheInfo({ cachedAt: null, label: "bundled fallback" });
        }
      } catch {
        setEvent(null);
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

  const isPastEvent =
    getEventStatus(event) === "past" || getEventStatus(event) === "ended";

  return (
    <><div className="min-h-screen mt-16 bg-gradient-to-l from-sky-50 via-white to-white dark:from-gray-900 dark:to-black">
      {/* Back Button */}
      <header className="sticky top-20 md:top-24 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
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
                className="w-full h-96 object-cover" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-indigo-600 rounded-full text-sm font-semibold">
                    {event.type
                      .charAt(0)
                      .toUpperCase() +
                      event.type.slice(
                        1
                      )}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${isPastEvent
                        ? "bg-gray-600"
                        : "bg-green-600"}`}
                  >
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
                className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }} />
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

            {/* Share Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
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
    </div></>
  );
};

export default EventDetailsPage;
