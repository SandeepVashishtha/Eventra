import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import RegistrationStatusBadge from "./RegistrationStatusBadge";
import {
  getRemainingTime,
  isDeadlinePassed,
  formatRemainingTime,
} from "../../utils/registrationDeadlineUtils";

const EventRegistrationCountdown = ({
  deadline,
  onExpired,
}) => {
  const [remainingTime, setRemainingTime] = useState(() =>
    getRemainingTime(deadline)
  );

  useEffect(() => {
    if (!deadline) return undefined;

    const updateCountdown = () => {
      const time = getRemainingTime(deadline);

      setRemainingTime(time);

      if (time.total <= 0) {
        onExpired?.();
      }
    };

    updateCountdown();

    const interval = setInterval(
      updateCountdown,
      1000
    );

    return () => clearInterval(interval);
  }, [deadline, onExpired]);

  if (!deadline) {
    return (
      <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        Registration deadline unavailable.
      </div>
    );
  }

  const closed =
    remainingTime.total <= 0 ||
    isDeadlinePassed(deadline);

  return (
    <div
      className={`rounded-xl border p-4 ${
        closed
          ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
          : "border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              closed
                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
            }`}
          >
            <Clock size={20} />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Registration Deadline
            </p>

            <p
              className={`mt-1 text-xl font-bold ${
                closed
                  ? "text-red-600 dark:text-red-400"
                  : "text-indigo-600 dark:text-indigo-400"
              }`}
            >
              {closed
                ? "Registration Closed"
                : formatRemainingTime(
                    remainingTime
                  )}
            </p>
          </div>
        </div>

        <RegistrationStatusBadge
          deadline={deadline}
        />
      </div>

      {!closed && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          <TimeUnit
            value={remainingTime.days}
            label="Days"
          />

          <TimeUnit
            value={remainingTime.hours}
            label="Hours"
          />

          <TimeUnit
            value={remainingTime.minutes}
            label="Minutes"
          />

          <TimeUnit
            value={remainingTime.seconds}
            label="Seconds"
          />
        </div>
      )}
    </div>
  );
};

const TimeUnit = ({ value, label }) => (
  <div className="rounded-lg bg-white p-3 text-center shadow-sm dark:bg-slate-800">
    <div className="text-lg font-bold text-slate-800 dark:text-white">
      {String(value).padStart(2, "0")}
    </div>

    <div className="text-xs text-slate-500 dark:text-slate-400">
      {label}
    </div>
  </div>
);

export default EventRegistrationCountdown;