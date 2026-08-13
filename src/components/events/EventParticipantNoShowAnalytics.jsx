import {
  BarChart3,
  UserCheck,
  UserX,
  Users,
  TrendingDown,
} from "lucide-react";

const DEFAULT_DATA = {
  registeredParticipants: 500,
  checkedInParticipants: 420,

  noShowTrend: [
    { label: "Aug 1", noShows: 12 },
    { label: "Aug 2", noShows: 18 },
    { label: "Aug 3", noShows: 15 },
    { label: "Aug 4", noShows: 22 },
    { label: "Aug 5", noShows: 16 },
    { label: "Aug 6", noShows: 20 },
    { label: "Aug 7", noShows: 14 },
  ],
};

const EventParticipantNoShowAnalytics = ({
  data = DEFAULT_DATA,
}) => {
  const registered = data.registeredParticipants || 0;
  const checkedIn = data.checkedInParticipants || 0;

  const noShows = Math.max(registered - checkedIn, 0);

  const attendancePercentage =
    registered > 0 ? (checkedIn / registered) * 100 : 0;

  const noShowPercentage =
    registered > 0 ? (noShows / registered) * 100 : 0;

  const peakNoShowDay =
    [...data.noShowTrend].sort(
      (a, b) => b.noShows - a.noShows
    )[0] || { label: "-", noShows: 0 };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
            <TrendingDown size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Participant No-Show Analytics
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Compare registered participants with actual attendees
              and identify no-show patterns.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-white px-5 py-3 dark:border-orange-900/30 dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            No-Show Rate
          </p>

          <p className="mt-1 text-lg font-black text-orange-600 dark:text-orange-400">
            {noShowPercentage.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Users}
          label="Registered"
          value={registered.toLocaleString()}
        />

        <SummaryCard
          icon={UserCheck}
          label="Checked In"
          value={checkedIn.toLocaleString()}
        />

        <SummaryCard
          icon={UserX}
          label="No-Shows"
          value={noShows.toLocaleString()}
        />

        <SummaryCard
          icon={BarChart3}
          label="Attendance"
          value={`${attendancePercentage.toFixed(1)}%`}
        />
      </div>

      {/* Attendance vs No-Show */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Attendance vs No-Shows
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Distribution of registered participants based on
              actual attendance.
            </p>
          </div>

          <span className="text-[10px] font-black text-orange-600 dark:text-orange-400">
            {noShowPercentage.toFixed(1)}% No-Show
          </span>
        </div>

        <div className="mt-5 h-5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-l-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${Math.min(attendancePercentage, 100)}%`,
            }}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-900/20">
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-bold text-indigo-600 dark:text-indigo-400">
                Checked In
              </span>

              <span className="text-[8px] font-black text-indigo-700 dark:text-indigo-400">
                {attendancePercentage.toFixed(1)}%
              </span>
            </div>

            <p className="mt-2 text-lg font-black text-slate-800 dark:text-white">
              {checkedIn}
            </p>
          </div>

          <div className="rounded-xl bg-orange-50 p-4 dark:bg-orange-900/20">
            <div className="flex items-center justify-between">
              <span className="text-[7px] font-bold text-orange-600 dark:text-orange-400">
                No-Shows
              </span>

              <span className="text-[8px] font-black text-orange-700 dark:text-orange-400">
                {noShowPercentage.toFixed(1)}%
              </span>
            </div>

            <p className="mt-2 text-lg font-black text-slate-800 dark:text-white">
              {noShows}
            </p>
          </div>
        </div>
      </div>

      {/* No-Show Trend */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BarChart3
              size={16}
              className="text-orange-600 dark:text-orange-400"
            />

            <div>
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                No-Show Trend Over Time
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Monitor changes in participant no-shows.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-orange-50 px-3 py-2 dark:bg-orange-900/20">
            <p className="text-[5px] font-bold uppercase text-orange-500">
              Peak No-Shows
            </p>

            <p className="mt-1 text-[8px] font-black text-orange-600 dark:text-orange-400">
              {peakNoShowDay.label} · {peakNoShowDay.noShows}
            </p>
          </div>
        </div>

        <div className="mt-6 flex h-52 items-end gap-2 overflow-x-auto">
          {data.noShowTrend.map((item) => {
            const maxCount = Math.max(
              ...data.noShowTrend.map(
                (entry) => entry.noShows
              ),
              1
            );

            const height = (item.noShows / maxCount) * 100;

            return (
              <div
                key={item.label}
                className="flex min-w-[45px] flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-[6px] font-bold text-slate-500 dark:text-slate-400">
                  {item.noShows}
                </span>

                <div className="flex h-36 w-full items-end rounded-lg bg-slate-100 dark:bg-slate-800">
                  <div
                    className="w-full rounded-lg bg-orange-500 transition-all duration-500"
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>

                <span className="text-[6px] font-bold text-slate-400">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insight */}
      <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-5 dark:border-orange-900/30 dark:bg-orange-900/10">
        <div className="flex items-start gap-3">
          <CircleIcon />

          <div>
            <h3 className="text-[9px] font-bold text-orange-800 dark:text-orange-300">
              Attendance Insight
            </h3>

            <p className="mt-1 text-[7px] leading-relaxed text-orange-700 dark:text-orange-400">
              {noShowPercentage >= 20
                ? "The current no-show rate is relatively high. Consider using attendance reminders or confirmation notifications before future events."
                : noShowPercentage >= 10
                  ? "There is a moderate number of no-shows. Additional reminders may help improve actual attendance."
                  : "The current no-show rate is low, indicating strong conversion from registrations to actual attendance."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-orange-50 p-2 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
        <Icon size={15} />
      </div>

      <div>
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </div>
);

const CircleIcon = () => (
  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
    <TrendingDown size={13} />
  </div>
);

export default EventParticipantNoShowAnalytics;