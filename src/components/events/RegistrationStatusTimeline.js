import {
  Award,
  Check,
  ClipboardCheck,
  Clock,
  UserCheck,
} from "lucide-react";

const STATUS_CONFIG = {
  Registered: {
    icon: ClipboardCheck,
    description: "Registration submitted successfully.",
  },
  Confirmed: {
    icon: Check,
    description: "Registration has been confirmed.",
  },
  "Checked In": {
    icon: UserCheck,
    description: "You have been checked in at the event.",
  },
  Attended: {
    icon: Clock,
    description: "Your event attendance has been recorded.",
  },
  "Certificate Issued": {
    icon: Award,
    description: "Your event certificate has been issued.",
  },
};

const DEFAULT_STATUSES = [
  "Registered",
  "Confirmed",
  "Checked In",
  "Attended",
  "Certificate Issued",
];

const RegistrationStatusTimeline = ({
  history = [],
}) => {
  const completedStatuses = new Set(
    history.map((item) => item.status)
  );

  const currentIndex = DEFAULT_STATUSES.reduce(
    (index, status, statusIndex) => {
      return completedStatuses.has(status)
        ? statusIndex
        : index;
    },
    -1
  );

  return (
    <div className="relative">
      {DEFAULT_STATUSES.map(
        (status, index) => {
          const config =
            STATUS_CONFIG[status];

          const Icon = config.icon;

          const historyItem = history.find(
            (item) => item.status === status
          );

          const isCompleted =
            index <= currentIndex;

          const isCurrent =
            index === currentIndex;

          const isLast =
            index ===
            DEFAULT_STATUSES.length - 1;

          return (
            <div
              key={status}
              className="relative flex gap-4"
            >
              {/* Connector */}
              {!isLast && (
                <div
                  className={`absolute left-5 top-10 h-[calc(100%-1rem)] w-0.5 ${
                    index < currentIndex
                      ? "bg-green-500"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              )}

              {/* Icon */}
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                  isCompleted
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-500"
                } ${
                  isCurrent
                    ? "ring-4 ring-green-100 dark:ring-green-900/30"
                    : ""
                }`}
              >
                <Icon size={18} />
              </div>

              {/* Content */}
              <div
                className={`min-w-0 flex-1 ${
                  isLast ? "pb-0" : "pb-8"
                }`}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3
                    className={`font-semibold ${
                      isCompleted
                        ? "text-slate-800 dark:text-white"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {status}
                  </h3>

                  {historyItem?.timestamp && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatTimestamp(
                        historyItem.timestamp
                      )}
                    </span>
                  )}
                </div>

                <p
                  className={`mt-1 text-sm ${
                    isCompleted
                      ? "text-slate-500 dark:text-slate-400"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {historyItem?.description ||
                    config.description}
                </p>

                {isCurrent && (
                  <span className="mt-2 inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    Current Status
                  </span>
                )}
              </div>
            </div>
          );
        }
      )}
    </div>
  );
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default RegistrationStatusTimeline;