import {
  AlertCircle,
  Check,
  Loader2,
  RotateCcw,
  Save,
} from "lucide-react";

const DraftSavedIndicator = ({
  status = "idle",
  draftRestored = false,
  updatedAt = null,
  compact = false,
  className = "",
}) => {
  const config = getStatusConfig(
    status,
    draftRestored
  );

  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-full ${
          compact
            ? "h-6 w-6"
            : "h-8 w-8"
        } ${config.iconBackground}`}
      >
        <Icon
          size={compact ? 13 : 15}
          className={config.iconClassName}
        />
      </span>

      <div className="min-w-0">
        <p
          className={`font-semibold ${
            compact
              ? "text-[11px]"
              : "text-xs"
          } ${config.textClassName}`}
        >
          {config.label}
        </p>

        {!compact &&
          config.description && (
            <p className="mt-0.5 text-[10px] leading-4 text-slate-400">
              {config.description}
            </p>
          )}

        {!compact &&
          updatedAt &&
          status === "saved" && (
            <p className="mt-0.5 text-[10px] text-slate-400">
              {formatUpdatedTime(
                updatedAt
              )}
            </p>
          )}
      </div>
    </div>
  );
};

const getStatusConfig = (
  status,
  draftRestored
) => {
  if (status === "saving") {
    return {
      label: "Saving draft...",
      description:
        "Your registration progress is being saved.",
      icon: Loader2,
      iconClassName:
        "animate-spin text-indigo-600 dark:text-indigo-400",
      iconBackground:
        "bg-indigo-100 dark:bg-indigo-900/30",
      textClassName:
        "text-indigo-600 dark:text-indigo-400",
    };
  }

  if (status === "saved") {
    return {
      label: "Draft saved",
      description:
        "Your progress has been saved locally.",
      icon: Check,
      iconClassName:
        "text-green-600 dark:text-green-400",
      iconBackground:
        "bg-green-100 dark:bg-green-900/30",
      textClassName:
        "text-green-600 dark:text-green-400",
    };
  }

  if (status === "submitted") {
    return {
      label: "Registration submitted",
      description:
        "Your saved draft has been cleared.",
      icon: Check,
      iconClassName:
        "text-green-600 dark:text-green-400",
      iconBackground:
        "bg-green-100 dark:bg-green-900/30",
      textClassName:
        "text-green-600 dark:text-green-400",
    };
  }

  if (status === "error") {
    return {
      label: "Draft could not be saved",
      description:
        "Your browser could not save the latest changes.",
      icon: AlertCircle,
      iconClassName:
        "text-red-600 dark:text-red-400",
      iconBackground:
        "bg-red-100 dark:bg-red-900/30",
      textClassName:
        "text-red-600 dark:text-red-400",
    };
  }

  if (draftRestored) {
    return {
      label: "Draft restored",
      description:
        "Your previous registration progress has been restored.",
      icon: RotateCcw,
      iconClassName:
        "text-indigo-600 dark:text-indigo-400",
      iconBackground:
        "bg-indigo-100 dark:bg-indigo-900/30",
      textClassName:
        "text-indigo-600 dark:text-indigo-400",
    };
  }

  return {
    label: "Draft saving enabled",
    description:
      "Your registration progress will be saved automatically.",
    icon: Save,
    iconClassName:
      "text-slate-500 dark:text-slate-400",
    iconBackground:
      "bg-slate-100 dark:bg-slate-800",
    textClassName:
      "text-slate-500 dark:text-slate-400",
  };
};

const formatUpdatedTime = (
  value
) => {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return `Saved ${new Intl.DateTimeFormat(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date)}`;
};

export default DraftSavedIndicator;