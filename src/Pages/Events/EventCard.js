import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  Tag,
  Star,
  Heart,
  Zap,
  BookOpen,
  Gift,
  Share2,
} from "lucide-react";

import { addEventToGoogleCalendar } from "../../utils/calendarUtils";
import ShareMenu from "../../components/common/ShareMenu";
import { generateEventSharingData } from "../../utils/shareUtils";
import StatusBadge from "../../components/common/StatusBadge";

const EventCard = ({ event }) => {
  const icons = [
    <Star size={18} className="text-yellow-400" />,
    <Heart size={18} className="text-red-400" />,
    <Zap size={18} className="text-pink-400" />,
    <BookOpen size={18} className="text-indigo-400" />,
    <Gift size={18} className="text-orange-400" />,
  ];

  const randomIcon = icons[Math.floor(Math.random() * icons.length)];

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

    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div
      data-aos="zoom-in"
      className="
        group
        relative
        h-full
        overflow-hidden
        rounded-[28px]
        border
        border-white/20
        bg-white/80
        dark:bg-gray-900/80
        backdrop-blur-xl
        shadow-lg
        hover:shadow-2xl
        transition-all
        duration-500
        hover:-translate-y-2
        flex
        flex-col
      "
    >
      {/* Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-indigo-500/10 via-pink-500/10 to-cyan-500/10" />

      {/* Top Actions */}
      <div className="absolute top-4 right-4 z-30 flex gap-2">
        <ShareMenu
          shareData={eventSharingData}
          position="above"
        >
          <button
            className="
              w-10 h-10
              rounded-full
              bg-white/90
              dark:bg-gray-800/90
              backdrop-blur-lg
              border border-white/20
              flex items-center justify-center
              shadow-lg
              hover:scale-110
              transition
            "
          >
            <Share2 size={16} className="text-gray-700 dark:text-white" />
          </button>
        </ShareMenu>

        <button
          onClick={handleCopyLink}
          className="
            w-10 h-10
            rounded-full
            bg-white/90
            dark:bg-gray-800/90
            backdrop-blur-lg
            border border-white/20
            flex items-center justify-center
            shadow-lg
            hover:scale-110
            transition
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-700 dark:text-white"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        </button>
      </div>

      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          loading="lazy"
          className="
            w-full
            h-full
            object-cover
            transition-transform
            duration-700
            group-hover:scale-110
          "
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Floating Status */}
        <div className="absolute top-4 left-4">
          {event.status && <StatusBadge status={event.status} />}
        </div>

        {/* Event Type */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/20">
            {randomIcon}
          </div>

          <span className="text-white font-semibold text-sm backdrop-blur-md bg-white/10 px-3 py-1 rounded-full border border-white/20">
            {event.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-6">
        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-500 transition">
          {event.title}
        </h3>

        {/* Description */}
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-3 min-h-[72px]">
          {event.description}
        </p>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-gray-100/70 dark:bg-gray-800/60">
            <MapPin size={16} className="text-pink-500" />
            <span className="text-sm truncate">
              {event.location}
            </span>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-2xl bg-gray-100/70 dark:bg-gray-800/60">
            <Clock size={16} className="text-blue-500" />
            <span className="text-sm">
              {event.time}
            </span>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-2xl bg-gray-100/70 dark:bg-gray-800/60">
            <Tag size={16} className="text-green-500" />
            <span className="text-sm truncate">
              {event.type}
            </span>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-2xl bg-gray-100/70 dark:bg-gray-800/60">
            <Calendar size={16} className="text-indigo-500" />
            <span className="text-sm">
              {new Date(event.date).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex gap-3">
          <Link
            to={`/events/${event.id}/register`}
            className="flex-1"
          >
            <button
              className="
                w-full
                py-3
                rounded-2xl
                font-semibold
                text-white
                bg-gradient-to-r
                from-indigo-600
                via-purple-600
                to-pink-600
                hover:opacity-90
                shadow-lg
                hover:shadow-xl
                transition-all
                duration-300
              "
            >
              Register
            </button>
          </Link>

          <Link
            to={`/events/${event.id}`}
            className="flex-1"
          >
            <button
              className="
                w-full
                py-3
                rounded-2xl
                font-semibold
                border
                border-gray-300
                dark:border-gray-700
                bg-white/70
                dark:bg-gray-800/70
                backdrop-blur-md
                hover:bg-gray-100
                dark:hover:bg-gray-700
                transition-all
                duration-300
              "
            >
              Details
            </button>
          </Link>
        </div>

        {/* Google Calendar */}
        <a
          href={addEventToGoogleCalendar(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="
            mt-4
            text-center
            text-sm
            text-indigo-500
            hover:text-indigo-600
            transition
          "
        >
          + Add to Google Calendar
        </a>
      </div>
    </div>
  );
};

export default EventCard;