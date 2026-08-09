import { Flame, Star, TrendingUp, Users } from "lucide-react";
import {
  calculatePopularityScore,
  formatPopularityNumber,
  getPopularityLevel,
  getPopularityLabel,
  getRegistrationCount,
  isTrendingEvent,
} from "../../utils/eventPopularityUtils";

const PopularityBadge = ({
  event = {},
  showRegistrations = true,
  showIcon = true,
  size = "md",
}) => {
  const registrations =
    getRegistrationCount(event);

  const score =
    calculatePopularityScore(event);

  const level =
    getPopularityLevel(score);

  const label =
    getPopularityLabel(event);

  const trending =
    isTrendingEvent(event);

  /*
   * Don't render anything when there is
   * no meaningful popularity information.
   */
  if (
    registrations === 0 &&
    score === 0
  ) {
    return null;
  }

  const sizeClasses = {
    sm: {
      container:
        "gap-1 px-2 py-1 text-[11px]",
      icon: 12,
    },
    md: {
      container:
        "gap-1.5 px-2.5 py-1.5 text-xs",
      icon: 14,
    },
    lg: {
      container:
        "gap-2 px-3 py-2 text-sm",
      icon: 16,
    },
  };

  const currentSize =
    sizeClasses[size] ||
    sizeClasses.md;

  const styles = getBadgeStyles(
    level,
    trending
  );

  const Icon = getBadgeIcon(
    level,
    trending
  );

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full font-semibold ${currentSize.container} ${styles.container}`}
      aria-label={`${label} event${
        showRegistrations &&
        registrations > 0
          ? ` with ${registrations} registrations`
          : ""
      }`}
    >
      {showIcon && (
        <Icon
          size={currentSize.icon}
          strokeWidth={2.5}
          fill={
            trending
              ? "currentColor"
              : "none"
          }
          aria-hidden="true"
        />
      )}

      <span>{label}</span>

      {showRegistrations &&
        registrations > 0 && (
          <>
            <span
              aria-hidden="true"
              className="opacity-50"
            >
              ·
            </span>

            <span>
              {formatPopularityNumber(
                registrations
              )}
            </span>
          </>
        )}
    </span>
  );
};

/**
 * Get badge colors based on popularity.
 */
const getBadgeStyles = (
  level,
  trending
) => {
  if (trending || level === "trending") {
    return {
      container:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    };
  }

  if (level === "popular") {
    return {
      container:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    };
  }

  return {
    container:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
};

/**
 * Select an appropriate icon.
 */
const getBadgeIcon = (
  level,
  trending
) => {
  if (trending || level === "trending") {
    return Flame;
  }

  if (level === "popular") {
    return Star;
  }

  if (level === "normal") {
    return TrendingUp;
  }

  return Users;
};

export default PopularityBadge;