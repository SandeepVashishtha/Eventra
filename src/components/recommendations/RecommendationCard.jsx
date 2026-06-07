import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Sparkles, Trophy } from "lucide-react";
import { getSmartDateLabel } from "../../utils/relativeTime";

const RecommendationCard = ({ item, index = 0 }) => {
  const isHackathon = item.itemType === "hackathon";
  const href = isHackathon ? `/hackathons/${item.id}` : `/events/${item.id}`;
  const Icon = isHackathon ? Trophy : Calendar;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="relative h-36 overflow-hidden bg-gray-100 dark:bg-gray-800">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <Icon className="h-10 w-10 text-indigo-500/60" aria-hidden="true" />
          </div>
        )}

        <div className="absolute left-3 top-3 rounded-full bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white shadow">
          {item.recommendationScore}% match
        </div>

        {isHackathon && (
          <div className="absolute right-3 top-3 rounded-full bg-pink-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Hackathon
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          {item.category || item.type || "Event"}
        </p>
        <h3 className="mt-1 line-clamp-2 text-base font-semibold text-gray-900 dark:text-white">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
          {item.description}
        </p>

        <div className="mt-3 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
          {item.date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{getSmartDateLabel(item.date) || item.date}</span>
            </div>
          )}
          {item.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
        </div>

        {item.recommendationReasons?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.recommendationReasons.slice(0, 2).map((reason) => (
              <span
                key={reason}
                className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
              >
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                {reason}
              </span>
            ))}
          </div>
        )}

        <Link
          to={href}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          View details
        </Link>
      </div>
    </motion.article>
  );
};

export default memo(RecommendationCard);
