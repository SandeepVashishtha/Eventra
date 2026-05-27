import useRecentlyViewed from "../../hooks/useRecentlyViewed";  
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import CountdownTimer from "../../components/common/CountdownTimer";
import { Calendar, MapPin, Clock, Users, Tag, ArrowLeft } from "lucide-react";

import eventsMockData from "./eventsMockData.json";
import { getEventStatus } from "../../utils/eventUtils";

// Removed unused imports: addEventToGoogleCalendar, ShareMenu, CertificateDownload, generateEventSharingData

const EventDetailsPage = () => {
  const { eventId } = useParams();

  const navigate = useNavigate();

  const { addRecentlyViewed } = useRecentlyViewed();

  const [loading, setLoading] =
    useState(true);

  const [event, setEvent] =
    useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);

        // Simulate API delay
        await new Promise((resolve) =>
          setTimeout(resolve, 1000)
        );

        const foundEvent =
          eventsMockData.find(
            (e) =>
              e.id ===
              parseInt(eventId)
          );

        setEvent(foundEvent);
        if (foundEvent) {
          addRecentlyViewed({
            id:       foundEvent.id,
            title:    foundEvent.title,
            date:     foundEvent.date,
            location: foundEvent.location,
            image:    foundEvent.image,
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
  }, [eventId , addRecentlyViewed]);

  // Loading State
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-black" role="status" aria-live="polite" aria-busy="true">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>

          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Loading event details...
          </p>
        </div>
      </main>
    );
  }

  // Event Not Found
  if (!event) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Event Not Found
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The event you're looking
            for doesn't exist.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/events")
            }
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
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

  // Removed unused derived values and handlers to satisfy linting rules

  return (
    <div className="min-h-screen mt-16 bg-gradient-to-l from-sky-50 via-white to-white dark:from-gray-900 dark:to-black">
      {/* Back Button */}
      <header className="sticky top-20 md:top-24 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            type="button"
            onClick={() =>
              navigate("/events")
            }
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
          >
            <ArrowLeft size={20} aria-hidden="true" />
            Back to Events
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <section className="lg:col-span-2" aria-labelledby="event-details-title">
            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden mb-8 shadow-xl">
              <img
                src={event.image}
                alt={`${event.title} event banner`}
                className="w-full h-96 object-cover"
              />

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
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      isPastEvent
                        ? "bg-gray-600"
                        : "bg-green-600"
                    }`}
                  >
                    {isPastEvent
                      ? "Past Event"
                      : "Upcoming"}
                  </span>
                </div>

                <h1 id="event-details-title" className="text-4xl font-bold">
                  {event.title}
                </h1>
              </div>
            </div>

            {/* Description */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-sm border border-gray-200 dark:border-gray-700" aria-labelledby="event-about-title">
              <h2 id="event-about-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                About This Event
              </h2>

              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                {event.description}
              </p>
            </section>
          </section>
          {/* Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Countdown Timer */}
            {!isPastEvent && (
              <CountdownTimer date={event.date} time={event.time} />
            )}

            {/* Event Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Event Details
              </h3>
              <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-indigo-500 flex-shrink-0" />
                  <span>{new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-blue-500 flex-shrink-0" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-pink-500 flex-shrink-0" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-green-500 flex-shrink-0" />
                  <span>{event.attendees} / {event.maxAttendees} registered</span>
                </div>
                <div className="flex items-center gap-3">
                  <Tag size={16} className="text-yellow-500 flex-shrink-0" />
                  <span className="capitalize">{event.type}</span>
                </div>
              </div>
            </div>

            {/* Register Button */}
            {!isPastEvent && (
              <Link to={`/events/${event.id}/register`}>
                <div className="inline-flex items-center justify-center w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 hover:from-indigo-500 hover:via-indigo-600 hover:to-slate-800 text-white px-4 py-4 text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                  Register Now
                </div>
              </Link>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default EventDetailsPage;
