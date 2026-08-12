import {
  Award,
  CheckCircle2,
  CircleUserRound,
  Clock,
  Info,
  Users,
} from "lucide-react";

const EventParticipantAttendancePercentage = ({
  totalSessions = 0,
  sessionsAttended = 0,
  certificateThreshold = 75,
  participantName = "Participant",
  showParticipantName = true,
  className = "",
}) => {
  const safeTotalSessions = Math.max(
    0,
    Number(totalSessions) || 0
  );

  const safeSessionsAttended = Math.min(
    Math.max(
      0,
      Number(sessionsAttended) || 0
    ),
    safeTotalSessions
  );

  const attendancePercentage =
    safeTotalSessions === 0
      ? 0
      : Math.round(
          (safeSessionsAttended /
            safeTotalSessions) *
            100
        );

  const threshold = Math.min(
    100,
    Math.max(
      0,
      Number(certificateThreshold) || 0
    )
  );

  const isEligible =
    safeTotalSessions > 0 &&
    attendancePercentage >= threshold;

  const remainingSessions = Math.max(
    0,
    safeTotalSessions -
      safeSessionsAttended
  );

  const progressStyle = {
    width: `${attendancePercentage}%`,
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Clock
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Attendance Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Participant Attendance
            </h2>

            {showParticipantName && (
              <div className="mt-2 flex items-center gap-1.5 text-[8px] text-slate-400">
                <CircleUserRound
                  size={12}
                />
                {participantName}
              </div>
            )}
          </div>
        </div>

        {/* Eligibility badge */}
        <div
          className={`inline-flex items-center gap-2 self-start rounded-xl px-4 py-3 ${
            isEligible
              ? "bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400"
              : "bg-amber-50 text-amber-700 dark:bg-amber-900/10 dark:text-amber-400"
          }`}
        >
          {isEligible ? (
            <Award size={16} />
          ) : (
            <Info size={16} />
          )}

          <div>
            <p className="text-[7px] font-bold uppercase tracking-wide opacity-70">
              Certificate
            </p>

            <p className="mt-1 text-[9px] font-bold">
              {isEligible
                ? "Eligible"
                : "Not Eligible"}
            </p>
          </div>
        </div>
      </div>

      {/* Main percentage */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center self-center sm:self-auto">
            <svg
              viewBox="0 0 120 120"
              className="h-32 w-32 -rotate-90"
            >
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="9"
                className="text-slate-100 dark:text-slate-800"
              />

              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray="314"
                strokeDashoffset={
                  314 -
                  (314 *
                    attendancePercentage) /
                    100
                }
                className={
                  isEligible
                    ? "text-green-500"
                    : "text-indigo-500"
                }
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {attendancePercentage}%
              </span>

              <span className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                Attendance
              </span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                  Attendance Progress
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
                  {safeSessionsAttended} of{" "}
                  {safeTotalSessions} sessions
                </p>
              </div>

              <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                {attendancePercentage}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isEligible
                    ? "bg-green-500"
                    : "bg-indigo-500"
                }`}
                style={progressStyle}
              />
            </div>

            <div className="mt-3 flex justify-between text-[7px] text-slate-400">
              <span>0%</span>

              <span>
                Certificate threshold:{" "}
                <strong>
                  {threshold}%
                </strong>
              </span>

              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Users size={15} />}
          label="Total Sessions"
          value={safeTotalSessions}
        />

        <StatCard
          icon={
            <CheckCircle2 size={15} />
          }
          label="Sessions Attended"
          value={safeSessionsAttended}
        />

        <StatCard
          icon={<Clock size={15} />}
          label="Sessions Remaining"
          value={remainingSessions}
        />

        <StatCard
          icon={<Award size={15} />}
          label="Required"
          value={`${threshold}%`}
        />
      </div>

      {/* Eligibility details */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              isEligible
                ? "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400"
            }`}
          >
            {isEligible ? (
              <Award size={16} />
            ) : (
              <Info size={16} />
            )}
          </div>

          <div className="flex-1">
            <p className="text-[9px] font-bold text-slate-800 dark:text-white">
              Certificate Eligibility
            </p>

            {safeTotalSessions === 0 ? (
              <p className="mt-1 text-[8px] leading-4 text-slate-400">
                Attendance eligibility cannot be determined
                because there are no sessions.
              </p>
            ) : isEligible ? (
              <p className="mt-1 text-[8px] leading-4 text-green-600 dark:text-green-400">
                The participant has reached the minimum{" "}
                {threshold}% attendance requirement.
              </p>
            ) : (
              <p className="mt-1 text-[8px] leading-4 text-amber-600 dark:text-amber-400">
                The participant needs{" "}
                {Math.max(
                  0,
                  threshold -
                    attendancePercentage
                )}
                % more attendance to reach the certificate
                requirement.
              </p>
            )}
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-[7px] font-bold ${
              isEligible
                ? "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400"
            }`}
          >
            {isEligible
              ? "Eligible"
              : "Pending"}
          </span>
        </div>
      </div>
    </section>
  );
};

const StatCard = ({
  icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center justify-between gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        {icon}
      </div>

      <span className="text-lg font-bold text-slate-800 dark:text-white">
        {value}
      </span>
    </div>

    <p className="mt-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>
  </div>
);

export default EventParticipantAttendancePercentage;