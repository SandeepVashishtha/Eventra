import {
  Award,
  CalendarCheck2,
  Code2,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";

const DEFAULT_ICON_MAP = {
  eventsRegistered: CalendarCheck2,
  eventsAttended: CalendarCheck2,
  hackathonsJoined: Code2,
  workshopsAttended: GraduationCap,
  certificatesEarned: Award,
  teamsJoined: Users,
};

const ParticipationStatCard = ({
  id,
  label,
  description = "",
  value = 0,
  icon: Icon,
  progress = null,
  target = null,
  className = "",
  onClick,
}) => {
  const StatIcon =
    Icon ||
    DEFAULT_ICON_MAP[id] ||
    TrendingUp;

  const numericValue =
    Number.isFinite(Number(value))
      ? Number(value)
      : 0;

  const hasProgress =
    progress !== null &&
    progress !== undefined &&
    Number.isFinite(Number(progress));

  const safeProgress = hasProgress
    ? Math.min(
        100,
        Math.max(
          0,
          Number(progress)
        )
      )
    : null;

  const isClickable =
    typeof onClick === "function";

  const content = (
    <>
      {/* Top section */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <StatIcon
            size={19}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        {hasProgress && (
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {Math.round(safeProgress)}%
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mt-5">
        <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
          {numericValue.toLocaleString()}
        </p>

        <h3 className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </h3>

        {description && (
          <p className="mt-1.5 text-xs leading-5 text-slate-400">
            {description}
          </p>
        )}
      </div>

      {/* Progress */}
      {hasProgress && (
        <div className="mt-4">
          <div
            className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={safeProgress}
            aria-label={`${label} progress`}
          >
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{
                width: `${safeProgress}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Optional target */}
      {target !== null &&
        target !== undefined && (
          <p className="mt-3 text-[11px] text-slate-400">
            Target:{" "}
            <span className="font-semibold text-slate-500 dark:text-slate-300">
              {Number(target).toLocaleString()}
            </span>
          </p>
        )}
    </>
  );

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800 dark:focus:ring-offset-slate-900 ${className}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {content}
    </div>
  );
};

export default ParticipationStatCard;