import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_DATA = {
  confirmedRegistrations: 720,
  totalRegistrations: 900,
  previousAttendanceRate: 0.82,
  cancellations: 45,
  waitlist: 60,
  recentCheckIns: 0,
};

const EventOrganizerAttendanceForecast = ({
  attendanceData = DEFAULT_DATA,
}) => {
  const forecast = useMemo(() => {
    const {
      confirmedRegistrations,
      previousAttendanceRate,
      cancellations,
      waitlist,
    } = attendanceData;

    const activeRegistrations = Math.max(
      confirmedRegistrations - cancellations,
      0
    );

    const baseAttendance =
      activeRegistrations * previousAttendanceRate;

    const waitlistAdjustment =
      Math.min(
        waitlist * 0.35,
        confirmedRegistrations * 0.08
      );

    const expectedAttendance = Math.min(
      Math.round(baseAttendance + waitlistAdjustment),
      attendanceData.totalRegistrations
    );

    const attendanceRate =
      confirmedRegistrations > 0
        ? Math.round(
            (expectedAttendance /
              confirmedRegistrations) *
              100
          )
        : 0;

    const confidence =
      previousAttendanceRate >= 0.8
        ? "High"
        : previousAttendanceRate >= 0.6
        ? "Moderate"
        : "Low";

    const remainingSeats = Math.max(
      attendanceData.totalRegistrations -
        expectedAttendance,
      0
    );

    return {
      activeRegistrations,
      expectedAttendance,
      attendanceRate,
      confidence,
      remainingSeats,
    };
  }, [attendanceData]);

  const registeredPercentage =
    attendanceData.totalRegistrations > 0
      ? Math.round(
          (attendanceData.confirmedRegistrations /
            attendanceData.totalRegistrations) *
            100
        )
      : 0;

  const forecastPercentage =
    attendanceData.totalRegistrations > 0
      ? Math.round(
          (forecast.expectedAttendance /
            attendanceData.totalRegistrations) *
            100
        )
      : 0;

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <TrendingUp size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Attendance Forecast
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Estimate expected attendance using registrations,
              historical attendance, cancellations, and waitlist
              activity.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-3 text-center dark:border-green-900/30 dark:bg-green-900/10">
          <p className="text-[6px] font-bold uppercase tracking-wide text-green-500">
            Forecast Confidence
          </p>

          <p className="mt-1 text-lg font-black text-green-600 dark:text-green-400">
            {forecast.confidence}
          </p>
        </div>
      </div>

      {/* Main Forecast */}
      <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck
                size={16}
                className="text-indigo-600 dark:text-indigo-400"
              />

              <p className="text-[7px] font-bold uppercase tracking-wide text-indigo-500">
                Expected Attendance
              </p>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-black text-indigo-700 dark:text-indigo-300">
                {forecast.expectedAttendance}
              </span>

              <span className="text-sm font-bold text-indigo-400">
                / {attendanceData.totalRegistrations}
              </span>
            </div>

            <p className="mt-2 text-[7px] text-indigo-600 dark:text-indigo-400">
              Approximately {forecast.attendanceRate}% of
              confirmed registrations are expected to attend.
            </p>
          </div>

          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[10px] border-indigo-200 dark:border-indigo-900">
            <div className="text-center">
              <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">
                {forecastPercentage}%
              </p>

              <p className="text-[6px] font-bold text-indigo-400">
                Capacity
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Confirmed"
          value={attendanceData.confirmedRegistrations}
          description="registered participants"
        />

        <MetricCard
          icon={CheckCircle2}
          label="Expected"
          value={forecast.expectedAttendance}
          description="estimated attendees"
        />

        <MetricCard
          icon={TrendingUp}
          label="Attendance Rate"
          value={`${forecast.attendanceRate}%`}
          description="forecasted attendance"
        />

        <MetricCard
          icon={Clock}
          label="Remaining"
          value={forecast.remainingSeats}
          description="capacity after forecast"
        />
      </div>

      {/* Capacity Progress */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Capacity Forecast
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Current registrations compared with predicted
              attendance.
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {forecastPercentage}% predicted
          </span>
        </div>

        <div className="mt-5">
          <div className="relative h-5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{
                width: `${Math.min(
                  registeredPercentage,
                  100
                )}%`,
              }}
            />

            <div
              className="absolute top-0 h-full border-l-2 border-dashed border-green-500"
              style={{
                left: `${Math.min(
                  forecastPercentage,
                  100
                )}%`,
              }}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-5">
            <Legend
              label="Confirmed registrations"
              value={`${registeredPercentage}%`}
              className="bg-indigo-600"
            />

            <Legend
              label="Expected attendance"
              value={`${forecastPercentage}%`}
              className="bg-green-500"
            />
          </div>
        </div>
      </div>

      {/* Forecast Inputs */}
      <div className="mt-6">
        <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
          Forecast Inputs
        </h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InputCard
            label="Historical Attendance"
            value={`${Math.round(
              attendanceData.previousAttendanceRate * 100
            )}%`}
          />

          <InputCard
            label="Cancellations"
            value={attendanceData.cancellations}
          />

          <InputCard
            label="Waitlist"
            value={attendanceData.waitlist}
          />

          <InputCard
            label="Active Registrations"
            value={forecast.activeRegistrations}
          />
        </div>
      </div>

      {/* Planning Insights */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 text-green-600 dark:bg-slate-900 dark:text-green-400">
              <CheckCircle2 size={16} />
            </div>

            <div>
              <p className="text-[6px] font-bold uppercase tracking-wide text-green-500">
                Planning Recommendation
              </p>

              <h3 className="mt-1 text-[9px] font-bold text-green-800 dark:text-green-300">
                Prepare for approximately{" "}
                {forecast.expectedAttendance} attendees
              </h3>

              <p className="mt-2 text-[7px] leading-4 text-green-700 dark:text-green-400">
                Plan seating, catering, staff, and event resources
                around the forecast instead of relying only on
                registration totals.
              </p>
            </div>
          </div>
        </div>

        {forecast.remainingSeats <=
        attendanceData.totalRegistrations * 0.1 ? (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900/30 dark:bg-orange-900/10">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2 text-orange-600 dark:bg-slate-900 dark:text-orange-400">
                <AlertTriangle size={16} />
              </div>

              <div>
                <p className="text-[6px] font-bold uppercase tracking-wide text-orange-500">
                  Capacity Warning
                </p>

                <h3 className="mt-1 text-[9px] font-bold text-orange-800 dark:text-orange-300">
                  Capacity may be nearly exhausted
                </h3>

                <p className="mt-2 text-[7px] leading-4 text-orange-700 dark:text-orange-400">
                  Only {forecast.remainingSeats} capacity slots
                  remain after applying the attendance forecast.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/30 dark:bg-blue-900/10">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2 text-blue-600 dark:bg-slate-900 dark:text-blue-400">
                <Users size={16} />
              </div>

              <div>
                <p className="text-[6px] font-bold uppercase tracking-wide text-blue-500">
                  Capacity Status
                </p>

                <h3 className="mt-1 text-[9px] font-bold text-blue-800 dark:text-blue-300">
                  {forecast.remainingSeats} spaces remain
                </h3>

                <p className="mt-2 text-[7px] leading-4 text-blue-700 dark:text-blue-400">
                  Current forecast indicates sufficient capacity
                  for the expected attendance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Methodology */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-slate-100 p-2 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <TrendingUp size={15} />
          </div>

          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Forecast Method
            </h3>

            <p className="mt-2 text-[7px] leading-4 text-slate-500 dark:text-slate-400">
              The forecast starts with active registrations,
              applies the historical attendance rate, and adjusts
              the estimate using waitlist activity. Cancellations
              are excluded from the active registration count.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  description,
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

        <p className="mt-1 text-[5px] text-slate-400">
          {description}
        </p>
      </div>
    </div>
  </div>
);

const InputCard = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-2 text-lg font-black text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

const Legend = ({ label, value, className }) => (
  <div className="flex items-center gap-2">
    <span
      className={`h-2 w-2 rounded-full ${className}`}
    />

    <span className="text-[6px] text-slate-500 dark:text-slate-400">
      {label}
    </span>

    <span className="text-[6px] font-bold text-slate-700 dark:text-slate-300">
      {value}
    </span>
  </div>
);

export default EventOrganizerAttendanceForecast;