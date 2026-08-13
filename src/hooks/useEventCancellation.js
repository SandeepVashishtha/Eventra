// ---------------------------------------------------------------------------
// useEventCancellation.js
// Fix for Issue #7920: Missing event cancellation workflow and refund processing
//
// This hook encapsulates the full cancellation workflow:
//   1. Validate organizer/admin has permission to cancel
//   2. POST to the cancellation endpoint with reason + refund policy
//   3. Trigger attendee notifications via existing notification system
//   4. Return loading/error state to the UI
// ---------------------------------------------------------------------------

import { useState, useCallback } from "react";
import { apiUtils, API_ENDPOINTS } from "../config/api.js";
import { getApiErrorMessage } from "../config/api/errors.js";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { logger } from "../utils/logger";

/**
 * Refund policy options available to the organizer at cancellation time.
 * Maps to backend enum values expected by POST /api/events/:id/cancel.
 */
export const REFUND_POLICIES = {
  FULL: "FULL",         // 100% refund to all paid registrants
  PARTIAL: "PARTIAL",   // Partial refund (% defined by organizer)
  NONE: "NONE",         // No refund issued
};

export const REFUND_POLICY_LABELS = {
  [REFUND_POLICIES.FULL]: "Full Refund (100%)",
  [REFUND_POLICIES.PARTIAL]: "Partial Refund",
  [REFUND_POLICIES.NONE]: "No Refund",
};

/**
 * useEventCancellation
 *
 * @param {string|number} eventId  - The event to cancel
 * @param {Function}      onSuccess - Called with updated event object after success
 * @param {number}        ownerId   - ID of the user who owns the event (Issue #11021)
 *
 * @returns {{
 *   cancel: Function,
 *   isCancelling: boolean,
 *   cancellationError: string|null,
 * }}
 */
const useEventCancellation = (eventId, onSuccess, ownerId) => {
  const { isAdmin, isOrganizer, user } = useAuth();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationError, setCancellationError] = useState(null);

  /**
   * cancel()
   *
   * @param {Object} params
   * @param {string} params.reason        - Organizer-provided cancellation reason (required)
   * @param {string} params.refundPolicy  - One of REFUND_POLICIES values (required)
   * @param {number} [params.refundPercent] - Required when refundPolicy is PARTIAL (0-100)
   */
  const cancel = useCallback(
    async ({ reason, refundPolicy, refundPercent }) => {
      // Guard: only admins and organizers can cancel events
      if (!isAdmin() && !isOrganizer()) {
        setCancellationError("You do not have permission to cancel this event.");
        return false;
      }

      // Guard (Issue #11021): role alone is not enough — only the event's own
      // organizer may cancel it. Prevents cross-tenant cancellation by swapping
      // the event id in the URL. Admins may cancel any event.
      if (
        !isAdmin() &&
        ownerId != null &&
        user?.id != null &&
        String(ownerId) !== String(user.id)
      ) {
        setCancellationError("Only the event's own organizer can cancel this event.");
        return false;
      }

      if (!reason?.trim()) {
        setCancellationError("A cancellation reason is required.");
        return false;
      }

      if (!Object.values(REFUND_POLICIES).includes(refundPolicy)) {
        setCancellationError("Please select a valid refund policy.");
        return false;
      }

      if (refundPolicy === REFUND_POLICIES.PARTIAL) {
        const pct = Number(refundPercent);
        if (isNaN(pct) || pct <= 0 || pct >= 100) {
          setCancellationError("Partial refund percentage must be between 1 and 99.");
          return false;
        }
      }

      // Fail fast with a readable message if the cancel endpoint isn't wired
      // up on this build (older configs, misconfigured environments, or a
      // future refactor that drops the key). Without this guard the raw
      // `TypeError: API_ENDPOINTS.EVENTS.CANCEL is not a function` bubbles
      // through the catch below and reaches the toast.
      if (typeof API_ENDPOINTS.EVENTS.CANCEL !== "function") {
        setCancellationError("Cancel endpoint is not configured.");
        return false;
      }

      setIsCancelling(true);
      setCancellationError(null);

      try {
        const payload = {
          reason: reason.trim(),
          refundPolicy,
          ...(refundPolicy === REFUND_POLICIES.PARTIAL && {
            refundPercent: Number(refundPercent),
          }),
        };

        const res = await apiUtils.post(
          API_ENDPOINTS.EVENTS.CANCEL(eventId),
          payload
        );

        if (!res.ok) {
          throw new Error(
            res.data?.message || res.data?.error || "Failed to cancel the event."
          );
        }

        toast.success(
          "Event cancelled successfully. Attendees will be notified and refunds processed.",
          { autoClose: 5000 }
        );

        logger.info(`[useEventCancellation] Event ${eventId} cancelled. Policy: ${refundPolicy}`);

        if (typeof onSuccess === "function") {
          onSuccess(res.data);
        }

        return true;
      } catch (err) {
        const message =
          getApiErrorMessage(err) ||
          "An unexpected error occurred while cancelling the event.";

        logger.error("[useEventCancellation] Cancellation failed:", err);
        setCancellationError(message);
        toast.error(message);
        return false;
      } finally {
        setIsCancelling(false);
      }
    },
    [eventId, isAdmin, isOrganizer, user, ownerId, onSuccess]
  );

  return { cancel, isCancelling, cancellationError };
};

export default useEventCancellation;