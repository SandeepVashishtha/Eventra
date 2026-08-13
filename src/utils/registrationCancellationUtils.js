import { apiUtils, API_ENDPOINTS } from '../config/api';

export const CANCELLATION_STATUS = "Cancelled";

/**
 * Check whether a registration can be cancelled.
 */
export const canCancelRegistration = (
  registration
) => {
  if (!registration) {
    return false;
  }

  const status = String(
    registration.status || "Registered"
  )
    .trim()
    .toLowerCase();

  const nonCancellableStatuses = [
    "cancelled",
    "canceled",
    "attended",
    "certificate issued",
  ];

  return !nonCancellableStatuses.includes(status);
};

/**
 * Cancel a registration.
 *
 * The utility updates the registration status and
 * records the cancellation timestamp.
 */
export const cancelRegistration = async (
  registration
) => {
  if (!registration) {
    return {
      success: false,
      message: "Registration not found.",
      registration: null,
      seatReleased: false,
      waitlistEligible: false,
    };
  }

  if (!canCancelRegistration(registration)) {
    return {
      success: false,
      message:
        "This registration cannot be cancelled.",
      registration,
      seatReleased: false,
      waitlistEligible: false,
    };
  }

  const eventId =
    registration.eventId ||
    registration.event?.id ||
    registration.eventID;

  if (!eventId) {
    return {
      success: false,
      message: "Event id is required to cancel this registration.",
      registration,
      seatReleased: false,
      waitlistEligible: false,
    };
  }

  try {
    const response = await apiUtils.delete(
      API_ENDPOINTS.EVENTS.CANCEL_REGISTRATION(eventId)
    );
    if (!response.ok) {
      return {
        success: false,
        message: "Unable to cancel registration on the server.",
        registration,
        seatReleased: false,
        waitlistEligible: false,
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error?.message ||
        "Unable to cancel registration on the server.",
      registration,
      seatReleased: false,
      waitlistEligible: false,
    };
  }

  const cancelledAt =
    new Date().toISOString();

  const updatedRegistration = {
    ...registration,
    status: CANCELLATION_STATUS,
    cancellationStatus: CANCELLATION_STATUS,
    cancelledAt,
    seatReleased: true,
    waitlistEligible: true,
  };

  return {
    success: true,
    message:
      "Registration cancelled successfully.",
    registration: updatedRegistration,
    seatReleased: true,
    waitlistEligible: true,
    cancelledAt,
  };
};

/**
 * Check whether a registration has been cancelled.
 */
export const isRegistrationCancelled = (
  registration
) => {
  if (!registration) {
    return false;
  }

  const status = String(
    registration.status || ""
  )
    .trim()
    .toLowerCase();

  return (
    status === "cancelled" ||
    status === "canceled"
  );
};

/**
 * Get the cancellation timestamp.
 */
export const getCancellationTimestamp = (
  registration
) => {
  return (
    registration?.cancelledAt ||
    registration?.cancellationTimestamp ||
    null
  );
};

/**
 * Format the cancellation timestamp.
 */
export const formatCancellationTimestamp = (
  timestamp
) => {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return String(timestamp);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Calculate the updated available seats after
 * a registration is cancelled.
 */
export const calculateReleasedSeats = (
  registeredParticipants,
  capacity
) => {
  const registered = Number(
    registeredParticipants
  );

  const totalCapacity = Number(capacity);

  if (
    Number.isNaN(registered) ||
    Number.isNaN(totalCapacity)
  ) {
    return null;
  }

  return Math.max(
    0,
    totalCapacity - Math.max(0, registered - 1)
  );
};

/**
 * Determine whether a released seat can be
 * offered to a waitlisted participant.
 */
export const shouldPromoteWaitlist = (
  registration,
  waitlistedCount = 0
) => {
  if (
    !registration ||
    !isRegistrationCancelled(registration)
  ) {
    return false;
  }

  return Number(waitlistedCount) > 0;
};