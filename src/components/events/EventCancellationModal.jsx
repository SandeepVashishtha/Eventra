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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-event-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isCancelling}
          className="absolute top-4 right-4 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close cancellation dialog"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex-shrink-0 rounded-full bg-red-100 p-2 dark:bg-red-900/30">
            <AlertTriangle className="text-red-600 dark:text-red-400" size={22} />
          </div>
          <div>
            <h2 id="cancel-event-title" className="text-lg font-bold text-gray-900 dark:text-white">
              Cancel Event
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{event?.title}</p>
          </div>
        </div>

        <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">
          This action will cancel the event, notify all registered attendees, and process refunds
          according to the selected policy. This cannot be undone.
        </p>

        {/* Cancellation reason */}
        <div className="mb-4">
          <label
            htmlFor="cancel-reason"
            className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300"
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
            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-red-500 focus:outline-none disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Refund policy */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            Refund Policy <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-2">
            {Object.entries(REFUND_POLICY_LABELS).map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="refund-policy"
                  value={value}
                  checked={refundPolicy === value}
                  onChange={() => setRefundPolicy(value)}
                  disabled={isCancelling}
                  className="accent-red-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Partial refund percentage — only shown when PARTIAL selected */}
        {refundPolicy === REFUND_POLICIES.PARTIAL && (
          <div className="mb-4">
            <label
              htmlFor="refund-percent"
              className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300"
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
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{cancellationError}</p>
        )}

        {/* Actions */}
        <div className="mt-2 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isCancelling}
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Keep Event
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCancelling || !reason.trim()}
            className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCancelling ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
