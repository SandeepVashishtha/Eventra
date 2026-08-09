import {
  Users,
  UserPlus,
  UserCheck,
  BarChart3,
} from "lucide-react";
import RegistrationProgressCard from "./RegistrationProgressCard";
import {
  getDashboardSummary,
  getPeakRegistrationDay,
  getAverageRegistrationsPerDay,
} from "../../utils/registrationStatsUtils";

const RegistrationStatsDashboard = ({
  capacity = 0,
  registrations = [],
  waitlist = [],
  participants = [],
}) => {
  const summary = getDashboardSummary({
    capacity,
    registrations,
    waitlist,
    participants,
  });

  const peakDay = getPeakRegistrationDay(registrations);
  const averagePerDay =
    getAverageRegistrationsPerDay(registrations);

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg p-6">

      {/* Header */}

      <div className="flex items-center gap-3 mb-8">
        <BarChart3
          size={28}
          className="text-indigo-600"
        />

        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Registration Statistics
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Live overview of registrations and event capacity.
          </p>
        </div>
      </div>

      {/* Summary Cards */}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Registrations"
          value={summary.totalRegistrations}
          icon={<Users size={22} />}
          color="bg-indigo-500"
        />

        <StatCard
          title="Remaining Seats"
          value={summary.remainingSeats}
          icon={<UserCheck size={22} />}
          color="bg-green-500"
        />

        <StatCard
          title="Waitlisted Users"
          value={summary.waitlistedUsers}
          icon={<UserPlus size={22} />}
          color="bg-orange-500"
        />

        <StatCard
          title="Occupancy"
          value={`${summary.occupancyRate}%`}
          icon={<BarChart3 size={22} />}
          color="bg-pink-500"
        />

      </div>

      {/* Registration Progress */}

      <div className="mt-8">
        <RegistrationProgressCard
          capacity={capacity}
          registered={summary.totalRegistrations}
        />
      </div>

      {/* Analytics */}

      <div className="grid gap-6 lg:grid-cols-2 mt-8">

        {/* Peak Day */}

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5">

          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
            Peak Registration Day
          </h3>

          {peakDay ? (
            <>
              <p className="text-lg font-bold text-indigo-600">
                {peakDay.date}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                {peakDay.count} registrations
              </p>
            </>
          ) : (
            <p className="text-slate-500">
              No registration data available.
            </p>
          )}

        </div>

        {/* Average */}

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5">

          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
            Average Registrations / Day
          </h3>

          <p className="text-3xl font-bold text-emerald-600">
            {averagePerDay}
          </p>

        </div>

      </div>

      {/* Category Distribution */}

      <div className="mt-8 rounded-xl border border-slate-200 dark:border-slate-700 p-5">

        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
          Category Distribution
        </h3>

        {Object.keys(summary.categoryDistribution).length === 0 ? (
          <p className="text-slate-500">
            No participant categories available.
          </p>
        ) : (
          <div className="space-y-4">

            {Object.entries(summary.categoryDistribution).map(
              ([category, count]) => (
                <div key={category}>

                  <div className="flex justify-between mb-1 text-sm">

                    <span>{category}</span>

                    <span>{count}</span>

                  </div>

                  <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700">

                    <div
                      className="h-3 rounded-full bg-indigo-600"
                      style={{
                        width: `${
                          (count /
                            summary.totalRegistrations) *
                          100
                        }%`,
                      }}
                    />

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </section>
  );
};

const StatCard = ({
  title,
  value,
  icon,
  color,
}) => (
  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-5">

    <div className="flex items-center justify-between">

      <div>

        <p className="text-sm text-slate-500">
          {title}
        </p>

        <h3 className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">
          {value}
        </h3>

      </div>

      <div
        className={`w-12 h-12 rounded-full ${color} text-white flex items-center justify-center`}
      >
        {icon}
      </div>

    </div>

  </div>
);

export default RegistrationStatsDashboard;