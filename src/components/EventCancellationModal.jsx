import React, { useState } from "react";
import toast from "react-hot-toast";
import { eventCancellationAPI } from "../api/eventCancellationAPI";

/**
 * Event Cancellation Modal Component
 * Allows organisers to cancel events with notification to attendees
 * Implements notification verification and cancellation reason
 */
export function EventCancellationModal({ eventId, eventTitle, attendeeCount, onCancel, onSuccess }) {
  const [step, setStep] = useState("confirmation"); // confirmation, reason, notifying, success
  const [reason, setReason] = useState("");
  const [refundDetails, setRefundDetails] = useState("");
  const [notifyAttendees, setNotifyAttendees] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notificationStatus, setNotificationStatus] = useState(null);

  const handleCancel = async () => {
    setErrors({});

    // Validate reason
    if (!reason.trim()) {
      setErrors({ reason: "Cancellation reason is required" });
      return;
    }

    if (reason.length < 10) {
      setErrors({ reason: "Please provide a detailed reason (at least 10 characters)" });
      return;
    }

    setStep("notifying");
    setIsLoading(true);

    try {
      const response = await eventCancellationAPI.cancelEvent(eventId, {
        reason: reason.trim(),
        refundDetails: refundDetails.trim() || null,
        notifyAttendees,
      });

      setNotificationStatus({
        success: true,
        message: `Event cancelled. ${attendeeCount} attendees notified.`,
        details: response.data,
      });

      setStep("success");
      toast.success(`Event cancelled and ${attendeeCount} attendees notified`);

      // Callback after 2 seconds
      setTimeout(() => {
        if (onSuccess) onSuccess(response.data);
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to cancel event";
      setNotificationStatus({
        success: false,
        message: errorMsg,
      });
      toast.error(errorMsg);
      setStep("reason");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Confirmation Step */}
        {step === "confirmation" && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Cancel Event?</h2>
              <p className="text-gray-600 mt-2">{eventTitle}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>{attendeeCount} registered attendees</strong> will be notified of this cancellation
                via email and in-app notification.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setStep("reason")}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                Proceed to Cancel
              </button>
              <button
                onClick={onCancel}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
              >
                Keep Event Active
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              This action cannot be undone. Attendees will be notified immediately.
            </p>
          </div>
        )}

        {/* Reason Step */}
        {step === "reason" && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cancellation Details</h2>

            <div className="space-y-4">
              {/* Cancellation Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Cancellation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (errors.reason) setErrors({});
                  }}
                  placeholder="e.g., Venue became unavailable, Speaker cancelled, Insufficient registrations..."
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.reason ? "border-red-500" : "border-gray-300"
                  }`}
                  rows="4"
                  disabled={isLoading}
                />
                {errors.reason && (
                  <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {reason.length}/500 characters
                </p>
              </div>

              {/* Refund Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Information (Optional)
                </label>
                <textarea
                  value={refundDetails}
                  onChange={(e) => setRefundDetails(e.target.value)}
                  placeholder="e.g., Full refund within 5-7 business days to original payment method..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be included in the notification email to attendees
                </p>
              </div>

              {/* Notification Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notify"
                  checked={notifyAttendees}
                  onChange={(e) => setNotifyAttendees(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                />
                <label htmlFor="notify" className="ml-3 text-sm text-gray-700">
                  Send notification to {attendeeCount} attendees
                </label>
              </div>

              {notifyAttendees && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <strong>📧 Attendees will receive:</strong>
                    <ul className="list-disc ml-5 mt-2">
                      <li>Email notification with cancellation reason</li>
                      <li>In-app notification</li>
                      <li>Refund information if provided</li>
                    </ul>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  {isLoading ? "Processing..." : "Cancel Event & Notify"}
                </button>
                <button
                  onClick={() => setStep("confirmation")}
                  disabled={isLoading}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifying Step */}
        {step === "notifying" && (
          <div className="p-6 text-center">
            <div className="animate-spin inline-block">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-red-600 rounded-full"></div>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-4">Cancelling Event...</h2>
            <p className="text-gray-600 mt-2">
              Sending notifications to {attendeeCount} attendees
            </p>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Cancelled</h2>
            <p className="text-gray-600 mb-4">
              {attendeeCount} attendees have been notified
            </p>

            {notificationStatus && notificationStatus.success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-700">
                  ✅ All notifications sent successfully
                </p>
              </div>
            )}

            <button
              onClick={onCancel}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventCancellationModal;
