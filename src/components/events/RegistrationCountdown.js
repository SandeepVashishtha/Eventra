import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import {
  getTimeRemaining,
  isRegistrationClosed,
  formatCountdown,
} from "../../utils/countdownUtils";

const RegistrationCountdown = ({ deadline }) => {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    getTimeRemaining(deadline)
  );

  useEffect(() => {
    if (!deadline) return undefined;

    const updateCountdown = () => {
      setTimeRemaining(getTimeRemaining(deadline));
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm text-slate-500">
        <Clock size={18} />
        <span>Registration deadline unavailable</span>
      </div>
    );
  }

  const closed =
    timeRemaining.total <= 0 ||
    isRegistrationClosed(deadline);

  if (closed) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-100 dark:bg-red-900/30 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">
        <Clock size={18} />
        <span>Registration Closed</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <Clock
          size={18}
          className="text-indigo-600 dark:text-indigo-400"
        />

        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Registration closes in
        </span>
      </div>

      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
        {formatCountdown(timeRemaining)}
      </div>

      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {timeRemaining.days} day
        {timeRemaining.days !== 1 ? "s" : ""},{" "}
        {timeRemaining.hours} hour
        {timeRemaining.hours !== 1 ? "s" : ""},{" "}
        {timeRemaining.minutes} minute
        {timeRemaining.minutes !== 1 ? "s" : ""} remaining
      </div>
    </div>
  );
};

export default RegistrationCountdown;