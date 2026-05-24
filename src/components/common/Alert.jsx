import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import { useState } from "react";

const ALERT_CONFIG = {
  success: {
    icon: CheckCircle,
    container: "border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/40",
    icon: "text-green-500 dark:text-green-400",
    title: "text-green-800 dark:text-green-200",
    message: "text-green-700 dark:text-green-300",
  },
  error: {
    icon: AlertCircle,
    container: "border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/40",
    iconColor: "text-red-500 dark:text-red-400",
    title: "text-red-800 dark:text-red-200",
    message: "text-red-700 dark:text-red-300",
  },
  info: {
    icon: Info,
    container: "border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/40",
    iconColor: "text-blue-500 dark:text-blue-400",
    title: "text-blue-800 dark:text-blue-200",
    message: "text-blue-700 dark:text-blue-300",
  },
  warning: {
    icon: AlertTriangle,
    container: "border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/40",
    iconColor: "text-yellow-500 dark:text-yellow-400",
    title: "text-yellow-800 dark:text-yellow-200",
    message: "text-yellow-700 dark:text-yellow-300",
  },
};

const Alert = ({
  variant = "info",
  title,
  message,
  dismissible = false,
  className = "",
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (!message || dismissed) return null;

  const config = ALERT_CONFIG[variant] ?? ALERT_CONFIG.info;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-4 rounded-lg border p-4 ${config.container} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0">
        <Icon className={`h-5 w-5 ${config.iconColor}`} />
      </div>
      <div className="flex-1">
        {title && (
          <strong className={`block font-medium ${config.title}`}>
            {title}
          </strong>
        )}
        <p className={`text-sm ${title ? "mt-1" : ""} ${config.message}`}>
          {message}
        </p>
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss alert"
          className={`flex-shrink-0 ${config.iconColor} hover:opacity-70 transition-opacity`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;