import { SSE_STATUS } from "../../../context/RealTimeContext";

export default function LiveStatusBadge({ status }) {
  const statusConfig = {
    [SSE_STATUS.CONNECTED]: {
      label: "Live",
      color: "text-emerald-600 dark:text-emerald-400",
      dotColor: "bg-emerald-500",
      pingColor: "bg-emerald-400",
    },
    [SSE_STATUS.RECONNECTING]: {
      label: "Reconnecting\u2026",
      color: "text-amber-500 dark:text-amber-400",
      dotColor: "bg-amber-400",
      pingColor: "bg-amber-300",
    },
    [SSE_STATUS.DISCONNECTED]: {
      label: "Offline",
      color: "text-gray-400 dark:text-gray-500",
      dotColor: "bg-gray-300 dark:bg-gray-600",
      pingColor: "bg-gray-200 dark:bg-gray-700",
    },
  };

  const config = statusConfig[status] || statusConfig[SSE_STATUS.DISCONNECTED];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.color}`}>
      <span className="relative flex h-2 w-2">
        {status === SSE_STATUS.CONNECTED && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full ${config.pingColor} opacity-75`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dotColor}`} />
      </span>
      {config.label}
      <span className="sr-only">Connection status: {config.label}</span>
    </span>
  );
}
