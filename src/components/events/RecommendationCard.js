import { Calendar, MapPin, Tag, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const RecommendationCard = ({
  event,
  reason = "Recommended for you",
}) => {
  if (!event) return null;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700">

      {/* Event Image */}
      {event.image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute top-3 left-3 flex items-center gap-1 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-semibold shadow">
            <Star size={14} fill="currentColor" />
            Recommended
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5">

        <h3 className="text-xl font-bold text-slate-800 dark:text-white line-clamp-1">
          {event.title}
        </h3>

        <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
          {reason}
        </p>

        {event.description && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="mt-5 space-y-2 text-sm text-slate-500 dark:text-slate-400">

          {event.date && (
            <div className="flex items-center gap-2">
              <Calendar size={15} />
              {event.date}
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin size={15} />
              {event.location}
            </div>
          )}

          {event.category && (
            <div className="flex items-center gap-2">
              <Tag size={15} />
              {event.category}
            </div>
          )}

        </div>

        <div className="mt-6 flex items-center justify-between">

          <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            Personalized
          </span>

          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition"
          >
            View
            <ArrowRight size={16} />
          </Link>

        </div>

      </div>

    </div>
  );
};

export default RecommendationCard;