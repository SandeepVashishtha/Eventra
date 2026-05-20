import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Tag,
  Share2,
  ArrowLeft,
  LayoutTemplate,
} from "lucide-react";
import eventsMockData from "./eventsMockData.json";
import { addEventToGoogleCalendar } from "../../utils/calendarUtils";
import ShareMenu from "../../components/common/ShareMenu";
import { generateEventSharingData } from "../../utils/shareUtils";

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // Find the event from mock data
  const event = eventsMockData.find((e) => e.id === parseInt(eventId));

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-l from-sky-50 via-white to-white dark:from-gray-900 dark:to-black flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Event Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The event you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/events")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const eventDateTime = new Date(`${event.date} ${event.time}`);
  const isPastEvent = eventDateTime < new Date();
  const attendeePercentage = (event.attendees / event.maxAttendees) * 100;
  const popularEvents = eventsMockData
    .filter((e) => e.id !== event.id)
    .sort((a, b) => b.attendees - a.attendees)
    .slice(0, 4);

  const eventSharingData = generateEventSharingData({
    ...event,
    title: event.title,
    description: event.description,
    date: event.date,
    id: event.id,
  });

  const handleCopyLink = (e) => {
    e.preventDefault();
    const shareUrl = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert("Event link copied to clipboard!");
    });
  };

  return (
    <div className="min-h-screen mt-16 bg-gradient-to-l from-sky-50 via-white to-white dark:from-gray-900 dark:to-black">
      {/* Back Button */}
      <div className="sticky top-20 md:top-24 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/events")}
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Events
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden mb-8 shadow-xl">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-indigo-600 rounded-full text-sm font-semibold">
                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      isPastEvent
                        ? "bg-gray-600"
                        : "bg-green-600"
                    }`}
                  >
                    {isPastEvent ? "Past Event" : "Upcoming"}
                  </span>
                </div>
                <h1 className="text-4xl font-bold">{event.title}</h1>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                About This Event
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Date & Time */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Calendar className="text-indigo-600 dark:text-indigo-400" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Date & Time
                    </h3>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <Clock size={16} className="inline mr-2" />
                      {event.time}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                    <MapPin className="text-pink-600 dark:text-pink-400" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Location
                    </h3>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                      {event.location}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {event.location.includes("Online") ? "Virtual Event" : "In-Person"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendees */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Users className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Attendees
                    </h3>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                      {event.attendees} / {event.maxAttendees}
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min(attendeePercentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {Math.round(attendeePercentage)}% capacity
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Type */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Tag className="text-yellow-600 dark:text-yellow-400" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Event Type
                    </h3>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-2 capitalize">
                      {event.type}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Events */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mt-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Popular Events
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {popularEvents.map((popularEvent) => (
                  <Link
                    key={popularEvent.id}
                    to={`/events/${popularEvent.id}`}
                    className="block rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {popularEvent.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                      {popularEvent.location} • {popularEvent.attendees} attendees
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* CTA Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-32">
              <div className="mb-6">
                {isPastEvent ? (
                  <div className="w-full py-3 px-4 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-semibold text-center cursor-not-allowed">
                    Event Ended
                  </div>
                ) : event.attendees >= event.maxAttendees ? (
                  <div className="w-full py-3 px-4 bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-semibold text-center cursor-not-allowed">
                    Event Full
                  </div>
                ) : (
                  <Link to={`/events/${event.id}/register`} className="block">
                    <div className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold text-center cursor-pointer transition-all">
                      Register Now
                    </div>
                  </Link>
                )}
              </div>

              {/* Share & Actions */}
              <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
                <Link
                  to={`/events/${event.id}/floor-plan`}
                  className="w-full py-2.5 px-4 flex items-center justify-center gap-2 border border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg font-semibold text-center cursor-pointer transition-all duration-300"
                >
                  <LayoutTemplate size={18} />
                  Floor Plan Designer
                </Link>

                <ShareMenu
                  shareData={eventSharingData}
                  position="above"
                  menuClassName="!z-[999]"
                >
                  <div className="w-full py-2 px-4 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors font-semibold text-gray-700 dark:text-gray-300">
                    <Share2 size={18} />
                    Share Event
                  </div>
                </ShareMenu>

                <div
                  onClick={handleCopyLink}
                  className="w-full py-2 px-4 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors font-semibold text-gray-700 dark:text-gray-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  Copy Link
                </div>

                <a
                  href={addEventToGoogleCalendar(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-4 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors font-semibold text-gray-700 dark:text-gray-300"
                >
                  <Calendar size={18} />
                  Add to Calendar
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default EventDetailsPage;
