import React, { useState } from "react";

interface CancelEventRegistrationProps {
  eventId: string | number;
  eventName: string;
  eventDate?: string;
  registrationStatus?: "registered" | "cancelled";
  cancellationAllowed?: boolean;
  cancellationDeadline?: string;
  onCancel?: (eventId: string | number) => void;
}

const CancelEventRegistration: React.FC<
  CancelEventRegistrationProps
> = ({
  eventId,
  eventName,
  eventDate,
  registrationStatus = "registered",
  cancellationAllowed = true,
  cancellationDeadline,
  onCancel,
}) => {
  const [status, setStatus] = useState<
    "registered" | "cancelled"
  >(registrationStatus);

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const [isCancelling, setIsCancelling] =
    useState(false);

  /*
   * Check whether cancellation deadline has passed.
   */
  const isDeadlinePassed = () => {
    if (!cancellationDeadline) {
      return false;
    }

    const deadline = new Date(
      cancellationDeadline
    );

    if (Number.isNaN(deadline.getTime())) {
      return false;
    }

    return deadline.getTime() < Date.now();
  };

  const deadlinePassed = isDeadlinePassed();

  const canCancel =
    status === "registered" &&
    cancellationAllowed &&
    !deadlinePassed;

  /*
   * Open confirmation dialog.
   */
  const handleCancelClick = () => {
    setShowConfirmation(true);
  };

  /*
   * Close confirmation dialog.
   */
  const handleCloseConfirmation = () => {
    if (!isCancelling) {
      setShowConfirmation(false);
    }
  };

  /*
   * Confirm registration cancellation.
   */
  const handleConfirmCancellation = () => {
    setIsCancelling(true);

    /*
     * Simulate cancellation processing.
     *
     * In production, this should be replaced with the
     * existing Eventra registration API.
     */
    setTimeout(() => {
      setStatus("cancelled");
      setIsCancelling(false);
      setShowConfirmation(false);
      setShowSuccess(true);

      if (onCancel) {
        onCancel(eventId);
      }

      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);
    }, 600);
  };

  /*
   * Already cancelled state.
   */
  if (status === "cancelled") {
    return (
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl dark:bg-gray-800">
            ✓
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Registration Status
            </p>

            <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
              Registration Cancelled
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Your registration for{" "}
              <strong>{eventName}</strong> has been
              cancelled successfully.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /*
   * Cancellation is not allowed.
   */
  if (!cancellationAllowed || deadlinePassed) {
    return (
      <section className="w-full rounded-2xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-900 dark:bg-yellow-950">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-xl dark:bg-yellow-900">
            ⚠️
          </div>

          <div>
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              Registration Cancellation
            </p>

            <h2 className="mt-1 text-lg font-bold text-yellow-800 dark:text-yellow-300">
              Cancellation Unavailable
            </h2>

            <p className="mt-1 text-sm leading-6 text-yellow-700 dark:text-yellow-400">
              {deadlinePassed
                ? "The cancellation deadline for this event has passed."
                : "The organizer does not currently allow registration cancellation for this event."}
            </p>

            {eventDate && (
              <p className="mt-3 text-xs text-yellow-600 dark:text-yellow-500">
                Event date: {eventDate}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* =====================================================
          MAIN REGISTRATION CARD
      ====================================================== */}
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          {/* Event information */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
              🎫
            </div>

            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Your Registration
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                {eventName}
              </h2>

              {eventDate && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Event date: {eventDate}
                </p>
              )}

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Registered
              </div>
            </div>
          </div>

          {/* Cancel button */}
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={!canCancel}
            className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            Cancel Registration
          </button>
        </div>

        {/* Cancellation information */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-start gap-3">
            <span className="text-lg">ℹ️</span>

            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Before cancelling
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Cancelling your registration will remove you
                from the event's registered participant list.
                Make sure you no longer plan to attend before
                continuing.
              </p>

              {cancellationDeadline && (
                <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Cancellation deadline:{" "}
                  {cancellationDeadline}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Success message */}
        {showSuccess && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
            <div className="flex items-start gap-3">
              <span className="text-lg">✓</span>

              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">
                  Registration cancelled successfully
                </h3>

                <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                  Your registration has been removed from the
                  event.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          CONFIRMATION MODAL
      ====================================================== */}
      {showConfirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-registration-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            {/* Modal header */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-xl dark:bg-red-950">
                ⚠️
              </div>

              <div>
                <h2
                  id="cancel-registration-title"
                  className="text-xl font-bold text-gray-900 dark:text-white"
                >
                  Cancel Registration?
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Please confirm that you want to cancel your
                  registration.
                </p>
              </div>
            </div>

            {/* Event details */}
            <div className="mt-6 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Event
              </p>

              <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                {eventName}
              </p>

              {eventDate && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {eventDate}
                </p>
              )}
            </div>

            {/* Warning */}
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
              <p className="text-sm leading-6 text-red-700 dark:text-red-300">
                This action will cancel your registration and
                remove you from the event's participant list.
              </p>
            </div>

            {/* Modal buttons */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseConfirmation}
                disabled={isCancelling}
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Keep Registration
              </button>

              <button
                type="button"
                onClick={handleConfirmCancellation}
                disabled={isCancelling}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCancelling
                  ? "Cancelling..."
                  : "Yes, Cancel Registration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CancelEventRegistration;