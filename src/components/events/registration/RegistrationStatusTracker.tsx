import React from "react";

export type RegistrationStatus =
  | "submitted"
  | "confirmed"
  | "pending"
  | "waitlisted"
  | "cancelled";

interface RegistrationStatusTrackerProps {
  status: RegistrationStatus | string;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
  className?: string;
}

interface StatusStep {
  key: RegistrationStatus;
  label: string;
  description: string;
}

const STATUS_STEPS: StatusStep[] = [
  {
    key: "submitted",
    label: "Registration Submitted",
    description:
      "Your registration has been submitted successfully.",
  },
  {
    key: "pending",
    label: "Registration Pending",
    description:
      "Your registration is waiting for confirmation.",
  },
  {
    key: "confirmed",
    label: "Registration Confirmed",
    description:
      "Your registration has been confirmed.",
  },
];

const WAITLISTED_STEP: StatusStep = {
  key: "waitlisted",
  label: "Registration Waitlisted",
  description:
    "You are currently on the event waitlist.",
};

const CANCELLED_STEP: StatusStep = {
  key: "cancelled",
  label: "Registration Cancelled",
  description:
    "Your registration for this event has been cancelled.",
};

const normalizeStatus = (
  status: string
): RegistrationStatus => {
  const normalized = status
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");

  switch (normalized) {
    case "submitted":
    case "registration_submitted":
      return "submitted";

    case "confirmed":
    case "registration_confirmed":
      return "confirmed";

    case "pending":
    case "registration_pending":
      return "pending";

    case "waitlisted":
    case "waitlist":
    case "registration_waitlisted":
      return "waitlisted";

    case "cancelled":
    case "canceled":
    case "registration_cancelled":
    case "registration_canceled":
      return "cancelled";

    default:
      return "pending";
  }
};

const getStatusIndex = (
  status: RegistrationStatus
) => {
  return STATUS_STEPS.findIndex(
    (step) => step.key === status
  );
};

const getStatusStyles = (
  status: RegistrationStatus
) => {
  switch (status) {
    case "confirmed":
      return {
        container:
          "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30",
        icon:
          "bg-green-600 text-white",
        text:
          "text-green-700 dark:text-green-300",
        badge:
          "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
      };

    case "pending":
      return {
        container:
          "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
        icon:
          "bg-amber-500 text-white",
        text:
          "text-amber-700 dark:text-amber-300",
        badge:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
      };

    case "waitlisted":
      return {
        container:
          "border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/30",
        icon:
          "bg-purple-600 text-white",
        text:
          "text-purple-700 dark:text-purple-300",
        badge:
          "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
      };

    case "cancelled":
      return {
        container:
          "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30",
        icon:
          "bg-red-600 text-white",
        text:
          "text-red-700 dark:text-red-300",
        badge:
          "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
      };

    case "submitted":
    default:
      return {
        container:
          "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30",
        icon:
          "bg-blue-600 text-white",
        text:
          "text-blue-700 dark:text-blue-300",
        badge:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
      };
  }
};

const getStatusLabel = (
  status: RegistrationStatus
) => {
  switch (status) {
    case "submitted":
      return "Registration Submitted";

    case "confirmed":
      return "Registration Confirmed";

    case "pending":
      return "Registration Pending";

    case "waitlisted":
      return "Registration Waitlisted";

    case "cancelled":
      return "Registration Cancelled";

    default:
      return "Registration Pending";
  }
};

const getStatusDescription = (
  status: RegistrationStatus
) => {
  switch (status) {
    case "submitted":
      return "Your registration has been submitted and is being processed.";

    case "confirmed":
      return "Your place at this event has been confirmed.";

    case "pending":
      return "Your registration is waiting for confirmation from the organizer.";

    case "waitlisted":
      return "The event is currently full and your registration is on the waitlist.";

    case "cancelled":
      return "Your registration is no longer active for this event.";

    default:
      return "Your registration is being processed.";
  }
};

const RegistrationStatusTracker: React.FC<
  RegistrationStatusTrackerProps
> = ({
  status,
  eventName,
  eventDate,
  eventLocation,
  className = "",
}) => {
  const currentStatus =
    normalizeStatus(status);

  const styles =
    getStatusStyles(
      currentStatus
    );

  const isTerminal =
    currentStatus ===
      "cancelled" ||
    currentStatus ===
      "confirmed";

  const steps =
    currentStatus === "waitlisted"
      ? [
          ...STATUS_STEPS.slice(
            0,
            2
          ),
          WAITLISTED_STEP,
        ]
      : currentStatus ===
          "cancelled"
        ? [
            ...STATUS_STEPS.slice(
              0,
              2
            ),
            CANCELLED_STEP,
          ]
        : STATUS_STEPS;

  const currentIndex =
    steps.findIndex(
      (step) =>
        step.key ===
        currentStatus
    );

  return (
    <section
      aria-label="Registration status"
      className={`
        w-full
        rounded-2xl
        border
        p-5
        shadow-sm
        ${styles.container}
        ${className}
      `}
    >
      {/* Header */}
      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-wider
              text-gray-500
              dark:text-gray-400
            "
          >
            Registration Status
          </p>

          <h2
            className={`
              mt-1
              text-xl
              font-bold
              ${styles.text}
            `}
          >
            {getStatusLabel(
              currentStatus
            )}
          </h2>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-gray-600
              dark:text-gray-300
            "
          >
            {getStatusDescription(
              currentStatus
            )}
          </p>
        </div>

        <span
          className={`
            inline-flex
            w-fit
            items-center
            rounded-full
            px-3
            py-1.5
            text-xs
            font-bold
            ${styles.badge}
          `}
        >
          {getStatusLabel(
            currentStatus
          )}
        </span>
      </div>

      {/* Event information */}
      {(eventName ||
        eventDate ||
        eventLocation) && (
        <div
          className="
            mt-5
            grid
            gap-3
            sm:grid-cols-3
          "
        >
          {eventName && (
            <div
              className="
                rounded-xl
                bg-white/70
                p-3
                dark:bg-gray-900/40
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  text-gray-500
                  dark:text-gray-400
                "
              >
                Event
              </p>

              <p
                className="
                  mt-1
                  line-clamp-2
                  text-sm
                  font-semibold
                  text-gray-800
                  dark:text-gray-200
                "
              >
                {eventName}
              </p>
            </div>
          )}

          {eventDate && (
            <div
              className="
                rounded-xl
                bg-white/70
                p-3
                dark:bg-gray-900/40
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  text-gray-500
                  dark:text-gray-400
                "
              >
                Event Date
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-semibold
                  text-gray-800
                  dark:text-gray-200
                "
              >
                {eventDate}
              </p>
            </div>
          )}

          {eventLocation && (
            <div
              className="
                rounded-xl
                bg-white/70
                p-3
                dark:bg-gray-900/40
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  text-gray-500
                  dark:text-gray-400
                "
              >
                Location
              </p>

              <p
                className="
                  mt-1
                  line-clamp-2
                  text-sm
                  font-semibold
                  text-gray-800
                  dark:text-gray-200
                "
              >
                {eventLocation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Status timeline */}
      <div className="mt-7">
        <div
          className="
            flex
            flex-col
          "
        >
          {steps.map(
            (step, index) => {
              const isCurrent =
                step.key ===
                currentStatus;

              const isCompleted =
                currentIndex >
                index;

              const isLast =
                index ===
                steps.length - 1;

              return (
                <div
                  key={step.key}
                  className="
                    flex
                    min-h-[76px]
                    gap-4
                  "
                >
                  {/* Timeline */}
                  <div
                    className="
                      flex
                      w-8
                      shrink-0
                      flex-col
                      items-center
                    "
                  >
                    <div
                      className={`
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        text-xs
                        font-bold
                        ${
                          isCurrent
                            ? styles.icon
                            : isCompleted
                              ? "bg-gray-700 text-white dark:bg-gray-300 dark:text-gray-900"
                              : "border-2 border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-900"
                        }
                      `}
                    >
                      {isCompleted
                        ? "✓"
                        : index + 1}
                    </div>

                    {!isLast && (
                      <div
                        className={`
                          mt-1
                          h-full
                          w-0.5
                          ${
                            isCompleted
                              ? "bg-gray-500 dark:bg-gray-400"
                              : "bg-gray-200 dark:bg-gray-700"
                          }
                        `}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div
                    className="
                      min-w-0
                      pb-6
                    "
                  >
                    <p
                      className={`
                        text-sm
                        font-bold
                        ${
                          isCurrent
                            ? styles.text
                            : isCompleted
                              ? "text-gray-800 dark:text-gray-200"
                              : "text-gray-400 dark:text-gray-500"
                        }
                      `}
                    >
                      {step.label}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-gray-500
                        dark:text-gray-400
                      "
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Current state message */}
      <div
        className="
          mt-2
          rounded-xl
          bg-white/70
          p-4
          dark:bg-gray-900/40
        "
      >
        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <span
            className="
              mt-0.5
              text-lg
            "
            aria-hidden="true"
          >
            {currentStatus ===
            "confirmed"
              ? "✓"
              : currentStatus ===
                  "cancelled"
                ? "!"
                : currentStatus ===
                    "waitlisted"
                  ? "⏳"
                  : "ℹ️"}
          </span>

          <div>
            <p
              className="
                text-sm
                font-semibold
                text-gray-800
                dark:text-gray-200
              "
            >
              Current status
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-gray-600
                dark:text-gray-400
              "
            >
              {getStatusDescription(
                currentStatus
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Terminal status note */}
      {isTerminal && (
        <p
          className="
            mt-4
            text-center
            text-xs
            text-gray-500
            dark:text-gray-400
          "
        >
          {currentStatus ===
          "confirmed"
            ? "Keep this registration information available when attending the event."
            : "Contact the organizer if you believe this status is incorrect."}
        </p>
      )}
    </section>
  );
};

export default RegistrationStatusTracker;