import { useEffect, useState, useMemo } from "react";
import { Clock } from "lucide-react";

const calculateTimeLeft = (deadline) => {
  const diff = new Date(deadline) - new Date();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const pad = (n) => String(n).padStart(2, "0");

// Compact version for EventCard
export const CountdownBadge = ({ date, time }) => {
  const deadline = useMemo(() => new Date(`${date} ${time}`), [date, time]);
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(deadline));
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (!timeLeft) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
        Registration Closed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
      <Clock size={11} />
      {timeLeft.days}d {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
    </span>
  );
};

// Large version for EventDetailsPage
const CountdownTimer = ({ date, time }) => {
  const deadline = useMemo(() => new Date(`${date} ${time}`), [date, time]);
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(deadline));
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (!timeLeft) {
    return (
      <div className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <span className="text-red-600 dark:text-red-400 font-bold text-lg">
          Registration Closed
        </span>
      </div>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-gray-800 border border-indigo-200 dark:border-indigo-700 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-indigo-500" />
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
          Registration Closes In
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {units.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center bg-white dark:bg-gray-900 rounded-xl py-3 px-1 shadow-sm border border-indigo-100 dark:border-indigo-800"
          >
            <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 tabular-nums">
              {pad(value)}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;