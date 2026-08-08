import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getTimeRemaining,
  isRegistrationClosed,
  formatCountdown,
} from "../../utils/countdownUtils";

const CountdownBadge = ({ deadline }) => {
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
    return null;
  }

  const closed =
    timeRemaining.total <= 0 ||
    isRegistrationClosed(deadline);

  if (closed) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300">
        <Clock size={13} />
        Registration Closed
      </span>
    );
  }

  const isUrgent = timeRemaining.total <= 24 * 60 * 60 * 1000;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        isUrgent
          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
          : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
      }`}
      title="Registration deadline countdown"
    >
      <Clock size={13} />

      <span>
        {formatCountdown(timeRemaining)} left
      </span>
    </span>
  );
};

export default CountdownBadge;