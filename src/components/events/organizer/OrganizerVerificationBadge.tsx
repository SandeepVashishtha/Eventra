import React, {
  useMemo,
  useState,
} from "react";

/**
 * Verification status supported by the badge.
 */
export type OrganizerVerificationStatus =
  | "verified"
  | "unverified"
  | "pending"
  | "rejected";

/**
 * Supported badge sizes.
 */
export type OrganizerVerificationBadgeSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl";

/**
 * Supported badge visual variants.
 */
export type OrganizerVerificationBadgeVariant =
  | "default"
  | "compact"
  | "outline"
  | "minimal"
  | "card";

/**
 * Props accepted by the organizer verification badge.
 */
export interface OrganizerVerificationBadgeProps {
  /**
   * Whether the organizer is verified.
   *
   * This should normally come from the existing
   * organizer/user data.
   */
  verified?: boolean;

  /**
   * More detailed verification status.
   */
  status?: OrganizerVerificationStatus;

  /**
   * Text shown next to the verification icon.
   */
  label?: string;

  /**
   * Controls badge size.
   */
  size?: OrganizerVerificationBadgeSize;

  /**
   * Controls visual presentation.
   */
  variant?: OrganizerVerificationBadgeVariant;

  /**
   * Whether the text label should be visible.
   */
  showLabel?: boolean;

  /**
   * Whether the tooltip should be displayed.
   */
  showTooltip?: boolean;

  /**
   * Optional verification date.
   */
  verifiedAt?: string | Date | null;

  /**
   * Optional organizer name.
   */
  organizerName?: string;

  /**
   * Additional Tailwind classes.
   */
  className?: string;

  /**
   * Optional click handler.
   *
   * This can be used by the parent application
   * if it wants to open verification information.
   */
  onClick?: () => void;

  /**
   * Whether the badge should be interactive.
   */
  interactive?: boolean;

  /**
   * Whether additional verification information
   * should be displayed when the badge is clicked.
   */
  showDetails?: boolean;

  /**
   * Whether to show verification status details.
   */
  showStatusText?: boolean;

  /**
   * Optional test identifier.
   */
  testId?: string;
}

/**
 * Internal configuration for each supported size.
 */
interface SizeConfiguration {
  wrapper: string;
  icon: string;
  iconText: string;
  label: string;
  spacing: string;
}

/**
 * Internal configuration for each status.
 */
interface StatusConfiguration {
  label: string;
  description: string;
  badgeClasses: string;
  iconClasses: string;
  icon: string;
}

/**
 * Size configuration.
 *
 * Keeping these styles in one place makes the component
 * easier to maintain and allows the same badge to be used
 * on cards, profiles, dashboards, and event details.
 */
const SIZE_CONFIG: Record<
  OrganizerVerificationBadgeSize,
  SizeConfiguration
> = {
  xs: {
    wrapper:
      "gap-1 px-1.5 py-0.5 text-[9px]",
    icon:
      "h-3 w-3",
    iconText:
      "text-[7px]",
    label:
      "text-[9px]",
    spacing:
      "gap-1",
  },

  sm: {
    wrapper:
      "gap-1 px-2 py-1 text-[10px]",
    icon:
      "h-3.5 w-3.5",
    iconText:
      "text-[8px]",
    label:
      "text-[10px]",
    spacing:
      "gap-1",
  },

  md: {
    wrapper:
      "gap-1.5 px-2.5 py-1.5 text-xs",
    icon:
      "h-4 w-4",
    iconText:
      "text-[9px]",
    label:
      "text-xs",
    spacing:
      "gap-1.5",
  },

  lg: {
    wrapper:
      "gap-2 px-3 py-2 text-sm",
    icon:
      "h-5 w-5",
    iconText:
      "text-[10px]",
    label:
      "text-sm",
    spacing:
      "gap-2",
  },

  xl: {
    wrapper:
      "gap-2.5 px-4 py-2.5 text-base",
    icon:
      "h-6 w-6",
    iconText:
      "text-xs",
    label:
      "text-base",
    spacing:
      "gap-2.5",
  },
};

/**
 * Status configuration.
 *
 * The verified status is the primary status used by the
 * feature. The additional states allow the component to
 * gracefully represent data returned by an existing
 * verification workflow if one exists.
 */
const STATUS_CONFIG: Record<
  OrganizerVerificationStatus,
  StatusConfiguration
> = {
  verified: {
    label:
      "Verified Organizer",
    description:
      "This organizer has been verified by Eventra administrators.",
    badgeClasses:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
    iconClasses:
      "bg-blue-600 text-white dark:bg-blue-500",
    icon:
      "✓",
  },

  unverified: {
    label:
      "Unverified Organizer",
    description:
      "This organizer has not been verified.",
    badgeClasses:
      "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400",
    iconClasses:
      "bg-gray-400 text-white dark:bg-gray-600",
    icon:
      "•",
  },

  pending: {
    label:
      "Verification Pending",
    description:
      "This organizer's verification request is pending review.",
    badgeClasses:
      "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300",
    iconClasses:
      "bg-yellow-500 text-white dark:bg-yellow-500",
    icon:
      "!",
  },

  rejected: {
    label:
      "Verification Not Approved",
    description:
      "This organizer has not been approved for verification.",
    badgeClasses:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300",
    iconClasses:
      "bg-red-500 text-white dark:bg-red-500",
    icon:
      "×",
  },
};

/**
 * Determines the effective status.
 *
 * When the parent only provides `verified`, the component
 * converts it into the appropriate status.
 */
const getEffectiveStatus = (
  verified: boolean,
  status?: OrganizerVerificationStatus
): OrganizerVerificationStatus => {
  if (status) {
    return status;
  }

  return verified
    ? "verified"
    : "unverified";
};

/**
 * Formats a verification date in a user-friendly way.
 */
const formatVerificationDate = (
  date: string | Date | null | undefined
): string | null => {
  if (!date) {
    return null;
  }

  const parsedDate =
    date instanceof Date
      ? date
      : new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return null;
  }

  return parsedDate.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
};

/**
 * Main OrganizerVerificationBadge component.
 *
 * This component is intentionally presentation-focused.
 *
 * It does not grant verification privileges and does not
 * modify verification status.
 */
const OrganizerVerificationBadge: React.FC<
  OrganizerVerificationBadgeProps
> = ({
  verified = false,
  status,
  label,
  size = "md",
  variant = "default",
  showLabel = true,
  showTooltip = true,
  verifiedAt = null,
  organizerName,
  className = "",
  onClick,
  interactive = false,
  showDetails = false,
  showStatusText = false,
  testId = "organizer-verification-badge",
}) => {
  /**
   * Track whether the details panel is open.
   */
  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false);

  /**
   * Calculate the actual status only when the relevant
   * values change.
   */
  const effectiveStatus =
    useMemo(
      () =>
        getEffectiveStatus(
          verified,
          status
        ),
      [verified, status]
    );

  /**
   * Obtain configuration for the current status.
   */
  const statusConfig =
    STATUS_CONFIG[
      effectiveStatus
    ];

  /**
   * Obtain configuration for the requested size.
   */
  const sizeConfig =
    SIZE_CONFIG[size];

  /**
   * Format verification date once.
   */
  const formattedDate =
    useMemo(
      () =>
        formatVerificationDate(
          verifiedAt
        ),
      [verifiedAt]
    );

  /**
   * The badge should not display unverified status
   * unless the caller explicitly asks for status text
   * or a non-default status.
   *
   * For normal usage:
   *
   * verified=false
   *
   * returns nothing.
   */
  if (
    effectiveStatus ===
      "unverified" &&
    !showStatusText
  ) {
    return null;
  }

  /**
   * Handle badge activation.
   */
  const handleClick = () => {
    if (!interactive) {
      return;
    }

    if (showDetails) {
      setDetailsOpen(
        (current) => !current
      );
    }

    onClick?.();
  };

  /**
   * Keyboard interaction for accessible clickable badges.
   */
  const handleKeyDown = (
    event: React.KeyboardEvent<
      HTMLSpanElement
    >
  ) => {
    if (!interactive) {
      return;
    }

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      handleClick();
    }
  };

  /**
   * Common classes used by the badge.
   */
  const baseClasses = `
    inline-flex
    items-center
    rounded-full
    border
    font-semibold
    transition
    duration-200
    ease-in-out
    ${sizeConfig.wrapper}
    ${statusConfig.badgeClasses}
  `;

  /**
   * Interactive styling.
   */
  const interactiveClasses =
    interactive
      ? `
        cursor-pointer
        hover:shadow-sm
        hover:-translate-y-0.5
        focus:outline-none
        focus:ring-2
        focus:ring-blue-400
        focus:ring-offset-2
        dark:focus:ring-offset-gray-900
      `
      : "";

  /**
   * Variant-specific classes.
   */
  const variantClasses =
    variant === "outline"
      ? `
        bg-transparent
        dark:bg-transparent
      `
      : variant === "minimal"
      ? `
        border-transparent
        bg-transparent
        px-0
        dark:bg-transparent
      `
      : "";

  /**
   * Compact variant hides excessive padding.
   */
  const compactClasses =
    variant === "compact"
      ? `
        border-transparent
        bg-transparent
        px-1
        py-0.5
        dark:bg-transparent
      `
      : "";

  /**
   * Card variant adds a slightly larger visual surface.
   */
  const cardClasses =
    variant === "card"
      ? `
        rounded-xl
        px-3
        py-2
        shadow-sm
      `
      : "";

  /**
   * Build final className.
   */
  const finalClassName = `
    ${baseClasses}
    ${interactiveClasses}
    ${variantClasses}
    ${compactClasses}
    ${cardClasses}
    ${className}
  `;

  /**
   * Tooltip text.
   */
  const tooltipText =
    effectiveStatus ===
    "verified"
      ? statusConfig.description
      : statusConfig.description;

  /**
   * Whether this badge should behave as a button.
   */
  const accessibilityProps =
    interactive
      ? {
          role: "button",
          tabIndex: 0,
          "aria-expanded":
            showDetails
              ? detailsOpen
              : undefined,
        }
      : {
          role: "status",
        };

  return (
    <span
      className="relative inline-flex"
      data-testid={testId}
    >
      {/* 
        Main badge.
      */}
      <span
        className={finalClassName}
        title={
          showTooltip
            ? tooltipText
            : undefined
        }
        aria-label={
          statusConfig.label
        }
        onClick={
          interactive
            ? handleClick
            : undefined
        }
        onKeyDown={
          interactive
            ? handleKeyDown
            : undefined
        }
        {...accessibilityProps}
      >
        {/* 
          Verification icon.
        */}
        <span
          className={`
            flex
            shrink-0
            items-center
            justify-center
            rounded-full
            font-bold
            ${sizeConfig.icon}
            ${sizeConfig.iconText}
            ${statusConfig.iconClasses}
          `}
          aria-hidden="true"
        >
          {statusConfig.icon}
        </span>

        {/* 
          Optional text label.
        */}
        {showLabel && (
          <span
            className={`
              whitespace-nowrap
              ${sizeConfig.label}
            `}
          >
            {label ??
              statusConfig.label}
          </span>
        )}
      </span>

      {/* 
        Optional details popover.
      */}
      {showDetails &&
        detailsOpen && (
          <div
            className="
              absolute
              left-0
              top-full
              z-50
              mt-2
              w-72
              rounded-xl
              border
              border-gray-200
              bg-white
              p-4
              shadow-xl
              dark:border-gray-700
              dark:bg-gray-900
            "
          >
            <div className="flex items-start gap-3">
              <span
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-100
                  font-bold
                  text-blue-700
                  dark:bg-blue-950
                  dark:text-blue-300
                "
              >
                ✓
              </span>

              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {label ??
                    statusConfig.label}
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  {statusConfig.description}
                </p>

                {organizerName && (
                  <p className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                    Organizer:{" "}
                    {organizerName}
                  </p>
                )}

                {formattedDate && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Verified on{" "}
                    {formattedDate}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
    </span>
  );
};

/**
 * VerifiedOrganizerBadge
 *
 * Convenience wrapper for the most common use case.
 */
export const VerifiedOrganizerBadge: React.FC<
  Omit<
    OrganizerVerificationBadgeProps,
    "verified" | "status"
  >
> = (props) => {
  return (
    <OrganizerVerificationBadge
      {...props}
      verified={true}
      status="verified"
    />
  );
};

/**
 * CompactVerifiedOrganizerBadge
 *
 * Useful for event cards where horizontal space
 * is limited.
 */
export const CompactVerifiedOrganizerBadge: React.FC<
  Omit<
    OrganizerVerificationBadgeProps,
    "verified" | "status" | "size"
  >
> = (props) => {
  return (
    <OrganizerVerificationBadge
      {...props}
      verified={true}
      status="verified"
      size="sm"
      variant="compact"
      showLabel={false}
    />
  );
};

/**
 * VerifiedOrganizerBadgeWithLabel
 *
 * Explicitly displays the verification label.
 */
export const VerifiedOrganizerBadgeWithLabel: React.FC<
  Omit<
    OrganizerVerificationBadgeProps,
    "verified" | "status"
  >
> = (props) => {
  return (
    <OrganizerVerificationBadge
      {...props}
      verified={true}
      status="verified"
      showLabel={true}
    />
  );
};

/**
 * VerifiedOrganizerBadgeLarge
 *
 * Larger version intended for organizer profiles.
 */
export const VerifiedOrganizerBadgeLarge: React.FC<
  Omit<
    OrganizerVerificationBadgeProps,
    "verified" | "status" | "size"
  >
> = (props) => {
  return (
    <OrganizerVerificationBadge
      {...props}
      verified={true}
      status="verified"
      size="lg"
    />
  );
};

/**
 * VerifiedOrganizerBadgeWithDetails
 *
 * Interactive version that can display additional
 * verification information.
 */
export const VerifiedOrganizerBadgeWithDetails: React.FC<
  Omit<
    OrganizerVerificationBadgeProps,
    "verified" | "status" | "showDetails"
  >
> = (props) => {
  return (
    <OrganizerVerificationBadge
      {...props}
      verified={true}
      status="verified"
      showDetails={true}
      interactive={true}
    />
  );
};

/**
 * OrganizerVerificationStatusBadge
 *
 * Displays a non-default verification status when the
 * parent application explicitly needs to represent it.
 */
export const OrganizerVerificationStatusBadge: React.FC<
  Omit<
    OrganizerVerificationBadgeProps,
    "verified"
  > & {
    status: OrganizerVerificationStatus;
  }
> = ({
  status,
  ...props
}) => {
  return (
    <OrganizerVerificationBadge
      {...props}
      status={status}
      verified={
        status === "verified"
      }
      showStatusText={true}
    />
  );
};

/**
 * Default export.
 */
export default OrganizerVerificationBadge;