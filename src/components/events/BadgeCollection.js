import { useEffect, useState } from "react";
import { Award } from "lucide-react";
import BadgeCard from "./BadgeCard";
import {
  sortBadges,
  unlockBadge,
  badgeProgress,
} from "../../utils/badgeUtils";

const BadgeCollection = () => {
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState({
    earned: 0,
    total: 0,
    percentage: 0,
  });

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = () => {
    setBadges(sortBadges());
    setProgress(badgeProgress());
  };

  const handleUnlock = (badgeId) => {
    unlockBadge(badgeId);
    loadBadges();
  };

  return (
    <section className="w-full rounded-3xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-700 p-6">

      {/* Header */}

      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">
          <Award className="text-yellow-500" size={28} />

          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              Achievement Badges
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Unlock badges by participating in events.
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-indigo-600">
            {progress.earned} / {progress.total}
          </p>

          <p className="text-xs text-slate-500">
            Badges Earned
          </p>
        </div>

      </div>

      {/* Progress */}

      <div className="mb-8">

        <div className="flex justify-between text-sm mb-2">
          <span>Progress</span>
          <span>{progress.percentage}%</span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">

          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
            style={{
              width: `${progress.percentage}%`,
            }}
          />

        </div>

      </div>

      {/* Badge Grid */}

      {badges.length === 0 ? (
        <div className="text-center py-10">

          <Award
            size={48}
            className="mx-auto text-gray-400 mb-4"
          />

          <h3 className="text-lg font-semibold text-slate-700 dark:text-white">
            No Badges Available
          </h3>

          <p className="text-slate-500 mt-2">
            Start participating in events to unlock badges.
          </p>

        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {badges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              onUnlock={handleUnlock}
            />
          ))}

        </div>
      )}

    </section>
  );
};

export default BadgeCollection;