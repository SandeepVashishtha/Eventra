import React from "react";

interface ParticipationStreakProps {
  currentStreak: number;
  longestStreak: number;
  completedEvents: number;
}

const ParticipationStreak: React.FC<
  ParticipationStreakProps
> = ({
  currentStreak,
  longestStreak,
  completedEvents,
}) => {
  return (
    <section className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-2xl dark:bg-orange-950">
          🔥
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
            Participation
          </p>

          <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            Event Participation Streak
          </h2>

          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Keep participating in events to maintain
            your streak and track your progress.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-orange-50 p-4 dark:bg-orange-950/30">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Current Streak
          </p>

          <p className="mt-1 text-3xl font-bold text-orange-600 dark:text-orange-400">
            {currentStreak}
          </p>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            consecutive events
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Longest Streak
          </p>

          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            {longestStreak}
          </p>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            personal best
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Completed Events
          </p>

          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            {completedEvents}
          </p>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            total participation
          </p>
        </div>
      </div>

      {currentStreak > 0 && (
        <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔥</span>

            <div>
              <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                You're on a {currentStreak}-event streak!
              </p>

              <p className="mt-1 text-xs text-orange-700 dark:text-orange-400">
                Keep participating to beat your personal
                best of {longestStreak}.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ParticipationStreak;