// ---------------------------------------------------------------------------
// EventCancellationModal.jsx
// Fix for Issue #7920: Missing event cancellation workflow and refund processing
//
// Modal dialog shown to organizers/admins when they click "Cancel Event".
// Collects: cancellation reason, refund policy, partial refund % (if applicable).
// Delegates the actual API call to useEventCancellation().
// ---------------------------------------------------------------------------

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import useEventCancellation, {
  REFUND_POLICIES,
  REFUND_POLICY_LABELS,
} from "../../hooks/useEventCancellation";

/**
 * EventCancellationModal
 *
 * @param {Object}   props
 * @param {Object}   props.event      - The event object being cancelled
 * @param {Function} props.onClose    - Called when the modal is dismissed
 * @param {Function} props.onSuccess  - Called with updated event after successful cancel
 */
const EventCancellationModal = ({ event, onClose, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [refundPolicy, setRefundPolicy] = useState(REFUND_POLICIES.FULL);
  const [refundPercent, setRefundPercent] = useState(50);

  const { cancel, isCancelling, cancellationError } = useEventCancellation(
    event?.id,
    (updatedEvent) => {
      onSuccess?.(updatedEvent);
      onClose();
    }
  );

  const handleSubmit = async () => {
    await cancel({ reason, refundPolicy, refundPercent });
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-event-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-6">

        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isCancelling}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          aria-label="Close cancellation dialog"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-shrink-0 rounded-full bg-red-100 dark:bg-red-900/30 p-2">
            <AlertTriangle className="text-red-600 dark:text-red-400" size={22} />
          </div>
          <div>
            <h2
              id="cancel-event-title"
              className="text-lg font-bold text-gray-900 dark:text-white"
            >
              Cancel Event
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {event?.title}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
          This action will cancel the event, notify all registered attendees, and
          process refunds according to the selected policy. This cannot be undone.
        </p>

        {/* Cancellation reason */}
        <div className="mb-4">
          <label
            htmlFor="cancel-reason"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
          >
            Cancellation Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. Venue unavailable due to unforeseen circumstances..."
            disabled={isCancelling}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none disabled:opacity-50"
          />
        </div>

        {/* Refund policy */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Refund Policy <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-2">
            {Object.entries(REFUND_POLICY_LABELS).map(([value, label]) => (
              <label
                key={value}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="refund-policy"
                  value={value}
                  checked={refundPolicy === value}
                  onChange={() => setRefundPolicy(value)}
                  disabled={isCancelling}
                  className="accent-red-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Partial refund percentage — only shown when PARTIAL selected */}
        {refundPolicy === REFUND_POLICIES.PARTIAL && (
          <div className="mb-4">
            <label
              htmlFor="refund-percent"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
            >
              Refund Percentage
            </label>
            <div className="flex items-center gap-3">
              <input
                id="refund-percent"
                type="range"
                min={1}
                max={99}
                value={refundPercent}
                onChange={(e) => setRefundPercent(Number(e.target.value))}
                disabled={isCancelling}
                className="flex-1 accent-red-600"
              />
              <span className="w-12 text-center text-sm font-bold text-gray-900 dark:text-white">
                {refundPercent}%
              </span>
            </div>
          </div>
        )}

        {/* Error message */}
        {cancellationError && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            {cancellationError}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end mt-2">
          <button
            onClick={onClose}
            disabled={isCancelling}
            className="px-5 py-2 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            Keep Event
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCancelling || !reason.trim()}
            className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCancelling ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Cancelling...
              </>
            ) : (
              "Cancel Event"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCancellationModal;