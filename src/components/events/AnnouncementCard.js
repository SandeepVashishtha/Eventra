import { Pin, Calendar, Bell } from "lucide-react";

const AnnouncementCard = ({
  title,
  message,
  author = "Organizer",
  createdAt,
  scheduledAt,
  isPinned = false,
  isPublished = true,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-md p-5 hover:shadow-lg transition-all duration-300">

      {/* Header */}
      <div className="flex justify-between items-start">

        <div className="flex items-center gap-2">

          <Bell size={18} className="text-indigo-500" />

          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {title}
          </h3>

        </div>

        {isPinned && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs font-semibold">
            <Pin size={12} />
            Pinned
          </span>
        )}

      </div>

      {/* Message */}
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {message}
      </p>

      {/* Schedule */}
      {scheduledAt && (
        <div className="flex items-center gap-2 mt-4 text-sm text-blue-600 dark:text-blue-400">
          <Calendar size={16} />
          Scheduled: {scheduledAt}
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-4">

        <span className="text-xs text-slate-500">
          By {author}
        </span>

        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${
            isPublished
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
          }`}
        >
          {isPublished ? "Published" : "Scheduled"}
        </span>

      </div>
    </div>
  );
};

export default AnnouncementCard;