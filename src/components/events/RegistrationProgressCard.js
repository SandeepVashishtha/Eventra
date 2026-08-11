import {
  Users,
  UserCheck,
  UserX,
  Percent,
} from "lucide-react";
import {
  calculateRegistrationPercentage,
  calculateRemainingSeats,
} from "../../utils/registrationStatsUtils";

const RegistrationProgressCard = ({
  capacity = 0,
  registered = 0,
}) => {
  const percentage = calculateRegistrationPercentage(
    registered,
    capacity
  );

  const remainingSeats = calculateRemainingSeats(
    registered,
    capacity
  );

  const progressColor =
    percentage >= 90
      ? "bg-red-500"
      : percentage >= 70
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md p-6">

      {/* Header */}

      <div className="flex items-center justify-between mb-6">

        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            Registration Progress
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Current event capacity overview
          </p>
        </div>

        <Percent
          size={26}
          className="text-indigo-600"
        />

      </div>

      {/* Progress Bar */}

      <div className="mb-6">

        <div className="flex justify-between text-sm mb-2">

          <span className="font-medium text-slate-600 dark:text-slate-300">
            {registered} / {capacity} Seats Filled
          </span>

          <span className="font-semibold text-indigo-600">
            {percentage}%
          </span>

        </div>

        <div className="w-full h-4 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">

          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

      </div>

      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4 text-center">

          <Users
            size={24}
            className="mx-auto text-indigo-600 mb-2"
          />

          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
            {registered}
          </h4>

          <p className="text-sm text-slate-500">
            Registered
          </p>

        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4 text-center">

          <UserCheck
            size={24}
            className="mx-auto text-green-600 mb-2"
          />

          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
            {remainingSeats}
          </h4>

          <p className="text-sm text-slate-500">
            Remaining
          </p>

        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4 text-center">

          <UserX
            size={24}
            className="mx-auto text-red-600 mb-2"
          />

          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
            {Math.max(capacity - remainingSeats, 0)}
          </h4>

          <p className="text-sm text-slate-500">
            Occupied
          </p>

        </div>

      </div>

      {/* Capacity Status */}

      <div className="mt-6 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-4">

        <p className="text-sm text-slate-700 dark:text-slate-300">

          {percentage >= 100 && (
            <span className="font-semibold text-red-600">
              Event is fully booked.
            </span>
          )}

          {percentage >= 70 && percentage < 100 && (
            <span className="font-semibold text-yellow-600">
              Event is filling up quickly.
            </span>
          )}

          {percentage < 70 && (
            <span className="font-semibold text-green-600">
              Registrations are open with plenty of seats available.
            </span>
          )}

        </p>

      </div>

    </div>
  );
};

export default RegistrationProgressCard;