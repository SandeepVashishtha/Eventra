import { Award, Lock } from "lucide-react";

const BadgeCard = ({
  badge,
  onUnlock,
}) => {
  if (!badge) return null;

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-lg p-5 ${
        badge.earned
          ? "bg-gradient-to-br from-yellow-50 to-white border-yellow-300 dark:from-yellow-900/20 dark:to-slate-900 dark:border-yellow-600"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-90"
      }`}
    >
      {/* Badge Icon */}
      <div className="flex justify-center">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
            badge.earned
              ? "bg-yellow-100 dark:bg-yellow-900/40"
              : "bg-gray-100 dark:bg-slate-800"
          }`}
        >
          {badge.icon}
        </div>
      </div>

      {/* Badge Name */}
      <h3 className="mt-4 text-center text-lg font-bold text-slate-800 dark:text-white">
        {badge.title}
      </h3>

      {/* Badge Description */}
      <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
        {badge.description}
      </p>

      {/* Earned Date */}
      {badge.earned && badge.earnedAt && (
        <p className="mt-3 text-center text-xs text-green-600 dark:text-green-400">
          Earned on{" "}
          {new Date(badge.earnedAt).toLocaleDateString()}
        </p>
      )}

      {/* Status */}
      <div className="mt-5 flex justify-center">
        {badge.earned ? (
          <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-sm font-medium">
            <Award size={16} />
            Earned
          </span>
        ) : (
          <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300 text-sm font-medium">
            <Lock size={16} />
            Locked
          </span>
        )}
      </div>

      {/* Unlock Button (Optional) */}
      {!badge.earned && onUnlock && (
        <button
          onClick={() => onUnlock(badge.id)}
          className="mt-5 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 font-medium transition"
        >
          Unlock Badge
        </button>
      )}
    </div>
  );
};

export default BadgeCard;