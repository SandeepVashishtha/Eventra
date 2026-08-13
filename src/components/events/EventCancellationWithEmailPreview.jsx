/**
 * EventCancellationWithEmailPreview.jsx
 * 
 * Enhanced event cancellation component with custom email template configuration
 * and "Send Test Email" functionality for organizers.
 * 
 * Feature: #12139 - "Send Test Email" button for custom notifications
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { AlertTriangle, X, Mail, Send, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-toastify";
import useEventCancellation, {
  REFUND_POLICIES,
  REFUND_POLICY_LABELS,
} from "hooks/useEventCancellation";
import { useAuth } from "context/AuthContext";
import FocusTrap from "components/common/FocusTrap";
import EmailTemplateConfig from "./EmailTemplateConfig";

// Restores focus to a previously-focused element, if it's still focusable.
const restoreFocusTo = (el) => el?.focus?.();

/**
 * Default cancellation email template
 */
const DEFAULT_CANCELLATION_TEMPLATE = `Dear {attendeeName},

We regret to inform you that the following event has been cancelled:

Event: {eventTitle}
Original Date: {eventDate} at {eventTime}
Location: {location}

Impact on Your Registration:
- Your registration for this event has been cancelled.
- If you paid an entry fee, you are eligible for a full refund.
- Refund deadline: {refundDeadline}

Next Steps:
1. Check your email for refund instructions
2. If you have any questions, please contact the event organizer: {organizerEmail}
3. Your registration details have been preserved for reference

We apologize for any inconvenience this may cause. We appreciate your understanding.

Best regards,
Eventra Team

This is an automated message. Please do not reply to this email.`;

/**
 * EventCancellationWithEmailPreview
 * 
 * Enhanced cancellation modal that includes:
 * - Standard cancellation form (reason, refund policy)
 * - Custom email template editor
 * - Send Test Email button
 * - Preview of how the email will look
 * 
 * @param {Object}   props
 * @param {Object}   props.event      - The event object being cancelled
 * @param {Function} props.onClose    - Called when the modal is dismissed
 * @param {Function} props.onSuccess  - Called with updated event after successful cancel
 */
const EventCancellationWithEmailPreview = ({ event, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [refundPolicy, setRefundPolicy] = useState(REFUND_POLICIES.FULL);
  const [refundPercent, setRefundPercent] = useState(50);
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [customTemplate, setCustomTemplate] = useState(DEFAULT_CANCELLATION_TEMPLATE);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // The parent unmounts this component entirely on close (rather than toggling
  // an `isOpen` prop), so useFocusTrap's built-in restore-on-deactivate effect
  // never runs. Restore focus manually via unmount cleanup instead.
  const previouslyFocusedRef = useRef(null);
  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement;
    return () => restoreFocusTo(previouslyFocusedRef.current);
  }, []);

  const { cancel, isCancelling, cancellationError } = useEventCancellation(
    event?.id,
    (updatedEvent) => {
      onSuccess?.(updatedEvent);
      onClose();
    },
    event?.ownerId
  );

  const handleSubmit = async () => {
    await cancel({ reason, refundPolicy, refundPercent });
  };

  /**
   * Handle template save
   */
  const handleTemplateSave = useCallback((savedTemplate) => {
    setCustomTemplate(savedTemplate);
    toast.success('Email template saved!');
  }, []);

  /**
   * Toggle email configuration section
   */
  const toggleEmailConfig = () => {
    setShowEmailConfig(!showEmailConfig);
  };

  /**
   * Toggle preview mode
   */
  const togglePreview = () => {
    setIsPreviewing(!isPreviewing);
  };

  /**
   * Render preview of the email
   */
  const renderPreview = () => {
    // Replace placeholders with sample data
    const previewContent = customTemplate
      .replace(/\{attendeeName\}/g, 'John Doe')
      .replace(/\{eventTitle\}/g, event?.title || 'Sample Event')
      .replace(/\{eventDate\}/g, event?.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'December 25, 2026')
      .replace(/\{eventTime\}/g, event?.eventTime || '10:00 AM')
      .replace(/\{location\}/g, event?.location || 'Conference Center')
      .replace(/\{refundDeadline\}/g, event?.refundDeadline ? new Date(event.refundDeadline).toLocaleDateString() : 'January 10, 2027')
      .replace(/\{organizerEmail\}/g, event?.organizerEmail || user?.email || 'organizer@eventra.com');

    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h4 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Email Preview
        </h4>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <pre className="text-xs whitespace-pre-wrap break-words text-slate-700 dark:text-slate-300">
            {previewContent}
          </pre>
        </div>
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          This is a preview. Actual emails will be sent to all registered attendees when you cancel the event.
        </p>
      </div>
    );
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <FocusTrap isActive onEscape={isCancelling ? undefined : onClose}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-event-title"
          className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
        >

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
              <p className="text-sm text-gray-500 dark:text-gray-200">
                {event?.title}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
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

          {/* Email Configuration Section */}
          <div className="mb-6">
            <button
              type="button"
              onClick={toggleEmailConfig}
              className="flex items-center justify-between w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 transition"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Custom Cancellation Email
                </span>
              </div>
              {showEmailConfig ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {showEmailConfig && (
              <div className="mt-3 p-4 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <EmailTemplateConfig
                  eventId={event?.id}
                  templateType="cancellation"
                  event={event}
                  defaultTemplate={DEFAULT_CANCELLATION_TEMPLATE}
                  onTemplateSave={handleTemplateSave}
                  organizerEmail={user?.email}
                />
              </div>
            )}
          </div>

          {/* Preview Section */}
          {isPreviewing && (
            <div className="mb-6">
              {renderPreview()}
            </div>
          )}

          {/* Error message */}
          {cancellationError && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              {cancellationError}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-6">
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
      </FocusTrap>
    </div>
  );
};

export default EventCancellationWithEmailPreview;
