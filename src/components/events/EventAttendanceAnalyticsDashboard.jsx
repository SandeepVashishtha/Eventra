import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  TrendingUp,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

const DEFAULT_DATA = {
  registeredParticipants: 900,
  checkedInParticipants: 720,
  checkInsByTime: [
    { time: "9 AM", count: 85 },
    { time: "10 AM", count: 180 },
    { time: "11 AM", count: 160 },
    { time: "12 PM", count: 120 },
    { time: "1 PM", count: 95 },
    { time: "2 PM", count: 50 },
    { time: "3 PM", count: 30 },
  ],
  sessionAttendance: [
    { name: "Opening Keynote", registered: 700, attended: 640 },
    { name: "AI Workshop", registered: 520, attended: 470 },
    { name: "Web Development", registered: 480, attended: 390 },
    { name: "Data Science", registered: 450, attended: 360 },
    { name: "Closing Session", registered: 600, attended: 520 },
  ],
  attendanceTrend: [
    { label: "Day 1", attendance: 78 },
    { label: "Day 2", attendance: 84 },
    { label: "Day 3", attendance: 80 },
    { label: "Day 4", attendance: 88 },
    { label: "Day 5", attendance: 91 },
  ],
};

const EventAttendanceAnalyticsDashboard = ({
  data = DEFAULT_DATA,
}) => {
  const registered = data.registeredParticipants || 0;
  const checkedIn = data.checkedInParticipants || 0;

  const attendancePercentage =
    registered > 0 ? (checkedIn / registered) * 100 : 0;

  const noShowPercentage =
    registered > 0
      ? ((registered - checkedIn) / registered) * 100
      : 0;

  const totalSessionRegistered = data.sessionAttendance.reduce(
    (sum, session) => sum + session.registered,
    0
  );

  const totalSessionAttended = data.sessionAttendance.reduce(
    (sum, session) => sum + session.attended,
    0
  );

  const averageSessionAttendance =
    totalSessionRegistered > 0
      ? (totalSessionAttended / totalSessionRegistered) * 100
      : 0;

  const peakCheckIn = data.checkInsByTime.reduce(
    (max, current) =>
      current.count > max.count ? current : max,
    { time: "-", count: 0 }
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <BarChart3 size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Attendance Analytics Dashboard
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Analyze participant attendance, check-in activity,
              session participation, and attendance trends.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Attendance
          </p>

          <p className="mt-1 text-lg font-black text-indigo-600 dark:text-indigo-400">
            {attendancePercentage.toFixed(1)}%
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
          icon={CheckCircle2}
          label="Attendance"
          value={`${attendancePercentage.toFixed(1)}%`}
        />

        <SummaryCard
          icon={UserX}
          label="No Show"
          value={`${noShowPercentage.toFixed(1)}%`}
        />
      </div>

      {/* Attendance Progress */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Overall Attendance
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              {checkedIn.toLocaleString()} of{" "}
              {registered.toLocaleString()} registered participants
              checked in.
            </p>
          </div>

          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">
            {attendancePercentage.toFixed(1)}%
          </span>
        </div>

        <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${Math.min(attendancePercentage, 100)}%`,
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-[6px] font-bold text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-600" />
            Checked In
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700" />
            No Show
          </span>
        </div>
      </div>

      {/* Check-ins by Time */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Clock3
              size={16}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <div>
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                Check-ins by Time
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Track when participants arrived at the event.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-indigo-50 px-3 py-2 dark:bg-indigo-900/20">
            <p className="text-[5px] font-bold uppercase text-indigo-500">
              Peak Check-in
            </p>

            <p className="mt-1 text-[8px] font-black text-indigo-700 dark:text-indigo-400">
              {peakCheckIn.time} · {peakCheckIn.count}
            </p>
          </div>
        </div>

        <div className="mt-6 flex h-52 items-end gap-2 overflow-x-auto">
          {data.checkInsByTime.map((item) => {
            const maxCount = Math.max(
              ...data.checkInsByTime.map((entry) => entry.count),
              1
            );

            const height = (item.count / maxCount) * 100;

            return (
              <div
                key={item.time}
                className="flex min-w-[42px] flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-[6px] font-bold text-slate-500 dark:text-slate-400">
                  {item.count}
                </span>

                <div className="flex h-36 w-full items-end rounded-lg bg-slate-100 dark:bg-slate-800">
                  <div
                    className="w-full rounded-lg bg-indigo-600 transition-all duration-500"
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>

                <span className="text-[6px] font-bold text-slate-400">
                  {item.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session Attendance */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <CalendarDays
              size={16}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <div>
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                Session-wise Attendance
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Identify sessions with strong or low participation.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.sessionAttendance.map((session) => {
            const percentage =
              session.registered > 0
                ? (session.attended / session.registered) * 100
                : 0;

            return (
              <div key={session.name} className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h4 className="truncate text-[8px] font-bold text-slate-800 dark:text-white">
                      {session.name}
                    </h4>

                    <p className="mt-1 text-[6px] text-slate-400">
                      {session.attended} attended /{" "}
                      {session.registered} registered
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-2.5 py-1 text-[5px] font-bold ${
                      percentage >= 80
                        ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        : percentage >= 60
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                          : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {percentage.toFixed(1)}% Attendance
                  </span>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-bold text-slate-500 dark:text-slate-400">
              Average Session Attendance
            </span>

            <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400">
              {averageSessionAttendance.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Attendance Trend */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <TrendingUp
            size={16}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Attendance Trend
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Monitor how attendance changes across event days.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {data.attendanceTrend.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[7px] font-bold text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>

                <span className="text-[7px] font-black text-indigo-600 dark:text-indigo-400">
                  {item.attendance}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{
                    width: `${Math.min(item.attendance, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
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
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
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

export default EventAttendanceAnalyticsDashboard;