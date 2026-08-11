import { Users, AlertTriangle, CheckCircle } from "lucide-react";
import {
  getCapacitySummary,
} from "../../utils/eventCapacityUtils";
import CapacityStatusBadge from "./CapacityStatusBadge";

const EventCapacityIndicator = ({
  capacity = 0,
  registered = 0,
  almostFullThreshold = 90,
}) => {
  const summary = getCapacitySummary(
    capacity,
    registered,
    almostFullThreshold
  );

  const progressWidth = Math.min(
    summary.registrationPercentage,
    100
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Users
              size={22}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">
              Event Capacity
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Registration availability
            </p>
          </div>
        </div>

        <CapacityStatusBadge
          capacity={capacity}
          registered={registered}
          threshold={almostFullThreshold}
        />
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Capacity
          </p>

          <p className="mt-1 text-xl font-bold text-slate-800 dark:text-white">
            {summary.capacity}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registered
          </p>

          <p className="mt-1 text-xl font-bold text-slate-800 dark:text-white">
            {summary.registered}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Remaining
          </p>

          <p
            className={`mt-1 text-xl font-bold ${
              summary.isFull
                ? "text-red-600"
                : summary.isAlmostFull
                  ? "text-orange-600"
                  : "text-green-600"
            }`}
          >
            {summary.remainingSeats}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Registration Progress
          </span>

          <span className="text-sm font-bold text-slate-800 dark:text-white">
            {summary.registrationPercentage}%
          </span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              summary.isFull
                ? "bg-red-500"
                : summary.isAlmostFull
                  ? "bg-orange-500"
                  : "bg-green-500"
            }`}
            style={{
              width: `${progressWidth}%`,
            }}
          />
        </div>
      </div>

      {/* Status message */}
      <div className="mt-5">
        {summary.isFull ? (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-900/20 dark:text-red-300">
            <AlertTriangle size={18} />
            <span>
              This event is full. No registration slots are available.
            </span>
          </div>
        ) : summary.isAlmostFull ? (
          <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
            <AlertTriangle size={18} />
            <span>
              Almost full — only {summary.remainingSeats}{" "}
              {summary.remainingSeats === 1
                ? "seat"
                : "seats"}{" "}
              remaining.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-300">
            <CheckCircle size={18} />
            <span>
              {summary.remainingSeats}{" "}
              {summary.remainingSeats === 1
                ? "seat"
                : "seats"}{" "}
              available.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCapacityIndicator;