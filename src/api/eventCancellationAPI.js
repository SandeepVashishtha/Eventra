import { apiUtils } from "../config/api";

/**
 * Event cancellation API with notification support
 */
export const eventCancellationAPI = {
  /**
   * Cancel an event and trigger notifications to registered attendees
   * @param {number} eventId - Event ID to cancel
   * @param {Object} options - Cancellation options
   * @param {string} options.reason - Reason for cancellation (required)
   * @param {string} options.refundDetails - Details about refund process
   * @param {boolean} options.notifyAttendees - Send notifications (default: true)
   * @returns {Promise} Response with cancellation details
   */
  cancelEvent: async (eventId, options = {}) => {
    if (!eventId) {
      throw new Error("Event ID is required");
    }

    if (!options.reason || !options.reason.trim()) {
      throw new Error("Cancellation reason is required");
    }

    const payload = {
      status: "CANCELLED",
      cancelledAt: new Date().toISOString(),
      reason: options.reason.trim(),
      refundDetails: options.refundDetails || null,
      notifyAttendees: options.notifyAttendees !== false,
    };

    return apiUtils.put(`/api/events/${eventId}/cancel`, payload);
  },

  /**
   * Get cancellation details for an event
   */
  getCancellationDetails: async (eventId) => {
    return apiUtils.get(`/api/events/${eventId}/cancellation-details`);
  },

  /**
   * Resend cancellation notification to specific attendee
   */
  resendCancellationNotification: async (eventId, attendeeEmail) => {
    return apiUtils.post(`/api/events/${eventId}/resend-cancellation-notice`, {
      attendeeEmail,
    });
  },

  /**
   * Get list of attendees who have been notified
   */
  getNotifiedAttendees: async (eventId) => {
    return apiUtils.get(`/api/events/${eventId}/notified-attendees`);
  },
};
