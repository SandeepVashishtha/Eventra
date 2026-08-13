import React, { useEffect, useMemo, useState } from "react";

interface RegistrationDeadlineIndicatorProps {
  registrationDeadline: string | Date;
  className?: string;
}

interface TimeRemaining {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const getTimeRemaining = (
  deadline: string | Date
): TimeRemaining => {
  const deadlineTime =
    new Date(deadline).getTime();

  const total = Math.max(
    0,
    deadlineTime - Date.now()
  );

  return {
    total,
    days: Math.floor(total / DAY),
    hours: Math.floor(
      (total % DAY) / HOUR
    ),
    minutes: Math.floor(
      (total % HOUR) / MINUTE
    ),
    seconds: Math.floor(
      (total % MINUTE) / SECOND
    ),
  };
};

const RegistrationDeadlineIndicator: React.FC<
  RegistrationDeadlineIndicatorProps
> = ({
  registrationDeadline,
  className = "",
}) => {
  const [timeRemaining, setTimeRemaining] =
    useState<TimeRemaining>(() =>
      getTimeRemaining(
        registrationDeadline
      )
    );

  useEffect(() => {
    const updateCountdown = () => {
      setTimeRemaining(
        getTimeRemaining(
          registrationDeadline
        )
      );
    };

    updateCountdown();

    const interval = window.setInterval(
      updateCountdown,
      SECOND
    );

    return () =>
      window.clearInterval(interval);
  }, [registrationDeadline]);

  const deadlineDate = useMemo(
    () => new Date(registrationDeadline),
    [registrationDeadline]
  );

  const isValidDate =
    !Number.isNaN(
      deadlineDate.getTime()
    );

  if (!isValidDate) {
    return null;
  }

  const isClosed =
    timeRemaining.total <= 0;

  const isUrgent =
    !isClosed &&
    timeRemaining.total <=
      DAY;

  const isApproaching =
    !isClosed &&
    timeRemaining.total <=
      DAY * 3;

  const formattedDeadline =
    deadlineDate.toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );

  if (isClosed) {
    return (
      <div
        className={`rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-lg dark:bg-red-900">
            🔒
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold text-red-700 dark:text-red-300">
              Registration Closed
            </p>

            <p className="mt-1 text-xs leading-5 text-red-600 dark:text-red-400">
              Registration ended on{" "}
              {formattedDeadline}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border p-4 ${
        isUrgent
          ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40"
          : isApproaching
          ? "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30"
          : "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30"
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${
            isUrgent
              ? "bg-red-100 dark:bg-red-900"
              : isApproaching
              ? "bg-yellow-100 dark:bg-yellow-900"
              : "bg-blue-100 dark:bg-blue-900"
          }`}
        >
          ⏳
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p
              className={`text-sm font-bold ${
                isUrgent
                  ? "text-red-700 dark:text-red-300"
                  : isApproaching
                  ? "text-yellow-700 dark:text-yellow-300"
                  : "text-blue-700 dark:text-blue-300"
              }`}
            >
              Registration Deadline
            </p>

            <span
              className={`text-xs font-medium ${
                isUrgent
                  ? "text-red-600 dark:text-red-400"
                  : isApproaching
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}
            >
              {formattedDeadline}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            <TimeBox
              value={timeRemaining.days}
              label="Days"
              urgent={isUrgent}
            />

            <TimeBox
              value={timeRemaining.hours}
              label="Hours"
              urgent={isUrgent}
            />

            <TimeBox
              value={timeRemaining.minutes}
              label="Minutes"
              urgent={isUrgent}
            />

            <TimeBox
              value={timeRemaining.seconds}
              label="Seconds"
              urgent={isUrgent}
            />
          </div>

          {isUrgent && (
            <p className="mt-3 text-xs font-semibold text-red-600 dark:text-red-400">
              ⚠️ Registration closes soon. Complete
              your registration before the deadline.
            </p>
          )}

          {!isUrgent &&
            isApproaching && (
              <p className="mt-3 text-xs font-medium text-yellow-700 dark:text-yellow-400">
                Registration deadline is approaching.
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

interface TimeBoxProps {
  value: number;
  label: string;
  urgent?: boolean;
}

const TimeBox: React.FC<TimeBoxProps> = ({
  value,
  label,
  urgent = false,
}) => {
  return (
    <div
      className={`rounded-lg p-2 text-center ${
        urgent
          ? "bg-white/80 dark:bg-red-950/60"
          : "bg-white/80 dark:bg-gray-900/60"
      }`}
    >
      <p
        className={`text-lg font-bold sm:text-xl ${
          urgent
            ? "text-red-700 dark:text-red-300"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {String(value).padStart(2, "0")}
      </p>

      <p
        className={`text-[10px] font-medium uppercase tracking-wide ${
          urgent
            ? "text-red-500 dark:text-red-400"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {label}
      </p>
    </div>
  );
};

export default RegistrationDeadlineIndicator;