import { AlertTriangle, X } from "lucide-react";

const CancellationConfirmation = ({
  registration,
  onConfirm,
  onCancel,
}) => {
  if (!registration) return null;

  const eventName =
    registration.eventName ||
    registration.event?.name ||
    "this event";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancellation-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle
                size={23}
                className="text-red-600 dark:text-red-400"
              />
            </div>

            <h2
              id="cancellation-title"
              className="text-xl font-bold text-slate-800 dark:text-white"
            >
              Cancel Registration?
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close confirmation dialog"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={19} />
          </button>
        </div>

        {/* Warning */}
        <div className="mt-6 rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm leading-6 text-red-700 dark:text-red-300">
            Are you sure you want to cancel your
            registration for{" "}
            <strong>{eventName}</strong>?
          </p>

          <p className="mt-2 text-xs leading-5 text-red-600 dark:text-red-400">
            Your registration slot will be released and
            may be offered to a participant on the
            waitlist.
          </p>
        </div>

        {/* Registration ID */}
        {registration.registrationId && (
          <div className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registration ID
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-slate-800 dark:text-white">
              {registration.registrationId}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Keep Registration
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Yes, Cancel Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationConfirmation;