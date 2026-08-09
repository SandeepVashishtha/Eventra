import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import CancellationConfirmation from "./CancellationConfirmation";
import {
  canCancelRegistration,
  cancelRegistration,
} from "../../utils/registrationCancellationUtils";

const RegistrationCancellation = ({
  registration,
  onCancellation,
}) => {
  const [showConfirmation, setShowConfirmation] =
    useState(false);
  const [updatedRegistration, setUpdatedRegistration] =
    useState(registration);
  const [message, setMessage] = useState("");

  if (!updatedRegistration) {
    return null;
  }

  const status =
    updatedRegistration.status || "Registered";

  const isCancelled =
    status.toLowerCase() === "cancelled";

  const cancellationAllowed =
    canCancelRegistration(updatedRegistration);

  const handleCancelClick = () => {
    setMessage("");

    if (!cancellationAllowed) {
      setMessage(
        "This registration cannot be cancelled."
      );
      return;
    }

    setShowConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleConfirmCancellation = () => {
    const result =
      cancelRegistration(updatedRegistration);

    if (!result?.success) {
      setMessage(
        result?.message ||
          "Unable to cancel registration."
      );
      setShowConfirmation(false);
      return;
    }

    setUpdatedRegistration(
      result.registration
    );

    setMessage(
      "Registration cancelled successfully."
    );

    setShowConfirmation(false);

    onCancellation?.(
      result.registration,
      result
    );
  };

  return (
    <>
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isCancelled
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-indigo-100 dark:bg-indigo-900/30"
            }`}
          >
            {isCancelled ? (
              <XCircle
                size={24}
                className="text-red-600 dark:text-red-400"
              />
            ) : (
              <AlertTriangle
                size={24}
                className="text-indigo-600 dark:text-indigo-400"
              />
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Registration Cancellation
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your registration for this event.
            </p>
          </div>
        </div>

        {/* Event details */}
        <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Event
          </p>

          <h3 className="mt-1 font-semibold text-slate-800 dark:text-white">
            {updatedRegistration.eventName ||
              updatedRegistration.event?.name ||
              "Event"}
          </h3>

          {updatedRegistration.registrationId && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Registration ID:{" "}
              <span className="font-medium">
                {updatedRegistration.registrationId}
              </span>
            </p>
          )}
        </div>

        {/* Current status */}
        <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registration Status
            </p>

            <p
              className={`mt-1 text-sm font-semibold ${
                isCancelled
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              {status}
            </p>
          </div>

          {isCancelled && (
            <CheckCircle
              size={21}
              className="text-red-600 dark:text-red-400"
            />
          )}
        </div>

        {/* Cancellation information */}
        {isCancelled &&
          updatedRegistration.cancelledAt && (
            <div className="mt-4 rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-xs font-medium text-red-600 dark:text-red-400">
                Cancellation Timestamp
              </p>

              <p className="mt-1 text-sm font-semibold text-red-700 dark:text-red-300">
                {formatTimestamp(
                  updatedRegistration.cancelledAt
                )}
              </p>
            </div>
          )}

        {/* Message */}
        {message && (
          <div
            className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium ${
              isCancelled
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
            }`}
            role="status"
            aria-live="polite"
          >
            {message}
          </div>
        )}

        {/* Cancel action */}
        {!isCancelled && (
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={!cancellationAllowed}
            className="mt-6 w-full rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel Registration
          </button>
        )}

        {isCancelled && (
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Your registration slot has been released.
          </div>
        )}

        {!cancellationAllowed &&
          !isCancelled && (
            <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
              This registration is no longer eligible for
              cancellation.
            </p>
          )}
      </section>

      {/* Confirmation dialog */}
      {showConfirmation && (
        <CancellationConfirmation
          registration={updatedRegistration}
          onConfirm={handleConfirmCancellation}
          onCancel={handleCloseConfirmation}
        />
      )}
    </>
  );
};

const formatTimestamp = (timestamp) => {
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

export default RegistrationCancellation;