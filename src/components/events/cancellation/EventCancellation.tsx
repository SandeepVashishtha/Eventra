import React, { useState } from "react";

interface EventCancellationProps {
  eventId: string | number;
  eventName: string;
  isOrganizer?: boolean;
  eventStatus?: string;
  participantCount?: number;
  onCancel?: (
    eventId: string | number,
    reason: string
  ) => Promise<void> | void;
}

const MAX_REASON_LENGTH = 500;

const EventCancellation: React.FC<
  EventCancellationProps
> = ({
  eventId,
  eventName,
  isOrganizer = false,
  eventStatus = "upcoming",
  participantCount = 0,
  onCancel,
}) => {
  const [showDialog, setShowDialog] =
    useState(false);

  const [reason, setReason] =
    useState("");

  const [isCancelling, setIsCancelling] =
    useState(false);

  const [cancelled, setCancelled] =
    useState(
      eventStatus.toLowerCase() === "cancelled"
    );

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const normalizedStatus =
    eventStatus.toLowerCase();

  const canCancel =
    isOrganizer &&
    !cancelled &&
    normalizedStatus !== "completed" &&
    normalizedStatus !== "cancelled";

  const openDialog = () => {
    setError("");
    setSuccessMessage("");
    setReason("");
    setShowDialog(true);
  };

  const closeDialog = () => {
    if (isCancelling) {
      return;
    }

    setShowDialog(false);
    setReason("");
    setError("");
  };

  const handleCancel = async () => {
    const trimmedReason =
      reason.trim();

    if (!trimmedReason) {
      setError(
        "Please provide a cancellation reason."
      );
      return;
    }

    if (
      trimmedReason.length >
      MAX_REASON_LENGTH
    ) {
      setError(
        `Cancellation reason cannot exceed ${MAX_REASON_LENGTH} characters.`
      );
      return;
    }

    setError("");
    setIsCancelling(true);

    try {
      /*
       * The parent component should connect this
       * callback to the actual backend/API request.
       */
      await onCancel?.(
        eventId,
        trimmedReason
      );

      setCancelled(true);
      setShowDialog(false);
      setReason("");

      setSuccessMessage(
        "The event has been cancelled successfully."
      );
    } catch {
      setError(
        "Unable to cancel the event. Please try again."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  /*
   * Already cancelled state.
   */
  if (cancelled) {
    return (
      <section className="w-full rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/40">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-2xl dark:bg-red-900">
            ⚠️
          </div>

          <div>
            <span className="inline-flex rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Cancelled
            </span>

            <h2 className="mt-2 text-lg font-bold text-red-900 dark:text-red-200">
              {eventName}
            </h2>

            <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-300">
              This event has been cancelled.
              Registered participants should check
              their Eventra notifications for further
              information.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /*
   * Only authorized organizers should see the
   * cancellation control.
   */
  if (!isOrganizer) {
    return null;
  }

  return (
    <>
      <section className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-2xl dark:bg-red-950">
              ⚠️
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                Organizer Controls
              </p>

              <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                Cancel Event
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Cancel this event if circumstances prevent
                it from taking place as planned.
              </p>
            </div>
          </div>
        </div>

        {/* Event information */}
        <div className="p-5 sm:p-6">
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/40">
            <div className="flex items-start gap-3">
              <span className="text-lg">
                ℹ️
              </span>

              <div>
                <h3 className="text-sm font-bold text-orange-900 dark:text-orange-300">
                  Before cancelling
                </h3>

                <p className="mt-1 text-sm leading-6 text-orange-800 dark:text-orange-400">
                  Cancelling this event will change its
                  status and prevent new registrations.
                  Registered participants should be
                  informed about the change.
                </p>

                {participantCount > 0 && (
                  <p className="mt-2 text-xs font-semibold text-orange-700 dark:text-orange-500">
                    {participantCount} registered
                    participant
                    {participantCount !== 1
                      ? "s"
                      : ""}{" "}
                    may be affected.
                  </p>
                )}
              </div>
            </div>
          </div>

          {successMessage && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
              ✓ {successMessage}
            </div>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={openDialog}
              className="mt-5 w-full rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950 sm:w-auto"
            >
              Cancel Event
            </button>
          )}
        </div>
      </section>

      {/* Confirmation dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-event-title"
          >
            {/* Dialog header */}
            <div className="border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-2xl dark:bg-red-950">
                  ⚠️
                </div>

                <div className="min-w-0 flex-1">
                  <h2
                    id="cancel-event-title"
                    className="text-lg font-bold text-gray-900 dark:text-white"
                  >
                    Cancel this event?
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    You are about to cancel:
                  </p>

                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {eventName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={isCancelling}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  aria-label="Close cancellation dialog"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Dialog body */}
            <div className="p-5 sm:p-6">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
                <p className="text-sm leading-6 text-red-800 dark:text-red-300">
                  This action will mark the event as
                  cancelled. New participants will no
                  longer be able to register.
                </p>
              </div>

              {/* Reason */}
              <div className="mt-5">
                <label
                  htmlFor="cancellation-reason"
                  className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Cancellation reason
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <textarea
                  id="cancellation-reason"
                  value={reason}
                  onChange={(event) => {
                    setReason(
                      event.target.value
                    );
                    setError("");
                  }}
                  disabled={isCancelling}
                  maxLength={
                    MAX_REASON_LENGTH
                  }
                  rows={5}
                  placeholder="Explain why this event is being cancelled..."
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white p-4 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-red-950"
                />

                <div className="mt-2 flex justify-end">
                  <span className="text-xs text-gray-400">
                    {reason.length}/
                    {MAX_REASON_LENGTH}
                  </span>
                </div>
              </div>

              {error && (
                <div
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                  role="alert"
                >
                  ⚠️ {error}
                </div>
              )}

              {/* Participant notice */}
              {participantCount > 0 && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                  <span>📢</span>

                  <p className="text-xs leading-5 text-blue-700 dark:text-blue-300">
                    Registered participants will need
                    to be informed about this
                    cancellation through the
                    application's existing notification
                    workflow.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={isCancelling}
                  className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Keep Event
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={
                    isCancelling ||
                    !reason.trim()
                  }
                  className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCancelling
                    ? "Cancelling..."
                    : "Confirm Cancellation"}
                </button>
              </div>
            </div>

            {/* Privacy / safety footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="flex items-start gap-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                <span>🔒</span>

                <span>
                  Only authorized organizers should be
                  able to perform event cancellation.
                  Authorization must also be enforced
                  by the backend.
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventCancellation;