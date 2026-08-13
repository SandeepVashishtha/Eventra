import { AlertTriangle, CheckCircle2, Clock3, History } from "lucide-react";
import { useState } from "react";

const SubmissionEditWindow = ({
  config = {
    editingEnabled: true,
    maxEdits: 3,
    finalDeadline: "August 20, 2026 at 11:59 PM",
  },
  submission = {
    version: 1,
    editCount: 0,
    deadlinePassed: false,
  },
  onEdit,
}) => {
  const [showWarning, setShowWarning] = useState(false);

  const editsRemaining = Math.max(
    config.maxEdits - submission.editCount,
    0
  );

  const canEdit =
    config.editingEnabled &&
    !submission.deadlinePassed &&
    editsRemaining > 0;

  const handleEdit = () => {
    if (!canEdit) return;
    setShowWarning(true);
  };

  const confirmEdit = () => {
    setShowWarning(false);

    onEdit?.({
      previousVersion: submission.version,
      nextVersion: submission.version + 1,
    });
  };

  return (
    <section className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Clock3 size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Submission Edit Window
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            You can update your submission before the final deadline,
            subject to the organizer's edit rules.
          </p>
        </div>
      </div>

      {/* Configuration */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <InfoCard
          label="Editing"
          value={config.editingEnabled ? "Enabled" : "Disabled"}
          icon={<CheckCircle2 size={16} />}
          valueClass={
            config.editingEnabled
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }
        />

        <InfoCard
          label="Edits Remaining"
          value={`${editsRemaining} / ${config.maxEdits}`}
          icon={<History size={16} />}
        />

        <InfoCard
          label="Current Version"
          value={`Version ${submission.version}`}
          icon={<History size={16} />}
        />

        <InfoCard
          label="Final Deadline"
          value={config.finalDeadline}
          icon={<Clock3 size={16} />}
        />
      </div>

      {/* Status */}
      <div
        className={`mt-6 rounded-2xl border p-4 ${
          canEdit
            ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10"
            : "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10"
        }`}
      >
        <div className="flex items-start gap-3">
          {canEdit ? (
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
            />
          ) : (
            <AlertTriangle
              size={19}
              className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
            />
          )}

          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {canEdit
                ? "Your submission can be edited"
                : "Submission editing is unavailable"}
            </p>

            <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              {getStatusMessage({
                config,
                submission,
                editsRemaining,
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Button */}
      <button
        type="button"
        disabled={!canEdit}
        onClick={handleEdit}
        className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
      >
        {canEdit ? "Edit Submission" : "Editing Unavailable"}
      </button>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-950">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              <AlertTriangle size={22} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
              Replace Existing Submission?
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Your current submission will be replaced by the new
              version. The previous version will remain available in
              the submission history.
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">
                  Current version
                </span>

                <strong className="text-slate-800 dark:text-slate-200">
                  v{submission.version}
                </strong>
              </div>

              <div className="mt-2 flex justify-between text-xs">
                <span className="text-slate-500">
                  New version
                </span>

                <strong className="text-indigo-600 dark:text-indigo-400">
                  v{submission.version + 1}
                </strong>
              </div>

              <div className="mt-2 flex justify-between text-xs">
                <span className="text-slate-500">
                  Edits remaining
                </span>

                <strong className="text-slate-800 dark:text-slate-200">
                  {editsRemaining}
                </strong>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowWarning(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmEdit}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const InfoCard = ({
  label,
  value,
  icon,
  valueClass = "",
}) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center gap-2 text-slate-400">
      {icon}

      <span className="text-[10px] font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>

    <p
      className={`mt-2 text-xs font-bold text-slate-800 dark:text-slate-200 ${valueClass}`}
    >
      {value}
    </p>
  </div>
);

const getStatusMessage = ({
  config,
  submission,
  editsRemaining,
}) => {
  if (!config.editingEnabled) {
    return "The organizer has disabled submission editing.";
  }

  if (submission.deadlinePassed) {
    return "The final submission deadline has passed.";
  }

  if (editsRemaining === 0) {
    return "You have reached the maximum number of allowed edits.";
  }

  return `You have ${editsRemaining} edit${
    editsRemaining === 1 ? "" : "s"
  } remaining before the final deadline.`;
};

export default SubmissionEditWindow;