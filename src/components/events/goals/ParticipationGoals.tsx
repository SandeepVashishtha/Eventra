import React, { useMemo, useState } from "react";

interface ParticipationGoal {
  id: string;
  target: number;
  period: "month" | "quarter" | "year";
  completedEvents: number;
  createdAt: string;
}

interface ParticipationGoalsProps {
  initialGoal?: ParticipationGoal | null;
  participatedEvents?: number;
  onCreateGoal?: (
    goal: Omit<
      ParticipationGoal,
      "id" | "completedEvents" | "createdAt"
    >
  ) => void | Promise<void>;
  onUpdateGoal?: (
    goal: ParticipationGoal
  ) => void | Promise<void>;
  onDeleteGoal?: (
    goalId: string
  ) => void | Promise<void>;
}

const PERIODS = [
  {
    value: "month" as const,
    label: "This Month",
    description: "Events participated in this month",
  },
  {
    value: "quarter" as const,
    label: "This Quarter",
    description: "Events participated in this quarter",
  },
  {
    value: "year" as const,
    label: "This Year",
    description: "Events participated in this year",
  },
];

const ParticipationGoals: React.FC<
  ParticipationGoalsProps
> = ({
  initialGoal = null,
  participatedEvents = 0,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
}) => {
  const [goal, setGoal] =
    useState<ParticipationGoal | null>(
      initialGoal
    );

  const [target, setTarget] =
    useState(
      initialGoal?.target ?? 5
    );

  const [period, setPeriod] =
    useState<
      "month" | "quarter" | "year"
    >(
      initialGoal?.period ?? "month"
    );

  const [editing, setEditing] =
    useState(false);

  const [showForm, setShowForm] =
    useState(!initialGoal);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  /*
   * Progress comes from eligible event
   * participation supplied by the parent.
   *
   * It can later be replaced with data
   * returned by Eventra's existing API.
   */
  const progress =
    goal?.completedEvents ??
    participatedEvents;

  const percentage = useMemo(() => {
    if (!goal || goal.target <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (progress / goal.target) *
          100
      )
    );
  }, [goal, progress]);

  const completed =
    !!goal &&
    progress >= goal.target;

  const remaining =
    goal && progress < goal.target
      ? goal.target - progress
      : 0;

  const validateTarget = () => {
    if (
      !Number.isInteger(target) ||
      target < 1
    ) {
      setError(
        "Please enter a target of at least 1 event."
      );
      return false;
    }

    if (target > 1000) {
      setError(
        "The target cannot be greater than 1000 events."
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!validateTarget()) {
      return;
    }

    setSaving(true);

    try {
      if (goal) {
        const updatedGoal: ParticipationGoal =
          {
            ...goal,
            target,
            period,
          };

        await onUpdateGoal?.(
          updatedGoal
        );

        setGoal(updatedGoal);
        setEditing(false);

        setSuccess(
          "Participation goal updated successfully."
        );
      } else {
        const newGoal: ParticipationGoal =
          {
            id: `goal-${Date.now()}`,
            target,
            period,
            completedEvents:
              participatedEvents,
            createdAt:
              new Date().toISOString(),
          };

        await onCreateGoal?.({
          target,
          period,
        });

        setGoal(newGoal);
        setShowForm(false);

        setSuccess(
          "Participation goal created successfully."
        );
      }
    } catch {
      setError(
        "The goal could not be saved. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!goal) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to remove your participation goal?"
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await onDeleteGoal?.(
        goal.id
      );

      setGoal(null);
      setShowForm(true);
      setEditing(false);
      setTarget(5);
      setPeriod("month");

      setSuccess(
        "Participation goal removed."
      );
    } catch {
      setError(
        "The goal could not be removed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (goal) {
      setTarget(goal.target);
      setPeriod(goal.period);
    }

    setEditing(false);
    setError("");
  };

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 dark:border-gray-700 dark:from-blue-950/40 dark:via-gray-900 dark:to-purple-950/40 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
            🎯
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Personal Progress
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              Participation Goal
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Set a personal event participation target
              and track your progress.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Messages */}
        {error && (
          <div
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
            role="status"
          >
            ✓ {success}
          </div>
        )}

        {/* Existing goal */}
        {goal &&
          !editing &&
          !showForm && (
            <div>
              {/* Completed state */}
              {completed && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/40">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg dark:bg-green-900">
                    ✓
                  </div>

                  <div>
                    <p className="text-sm font-bold text-green-800 dark:text-green-300">
                      Goal completed!
                    </p>

                    <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                      You reached your participation
                      target for this period.
                    </p>
                  </div>
                </div>
              )}

              {/* Goal card */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {PERIODS.find(
                        (item) =>
                          item.value ===
                          goal.period
                      )?.label}
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                      Attend{" "}
                      {goal.target}{" "}
                      events
                    </h3>
                  </div>

                  <div
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      completed
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    }`}
                  >
                    {completed
                      ? "Completed"
                      : `${percentage}% complete`}
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">
                      Progress
                    </span>

                    <span className="font-bold text-gray-900 dark:text-white">
                      {progress} /{" "}
                      {goal.target}
                    </span>
                  </div>

                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        completed
                          ? "bg-green-500"
                          : "bg-blue-600"
                      }`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  {!completed && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {remaining}{" "}
                      {remaining === 1
                        ? "more event"
                        : "more events"}{" "}
                      to complete your goal.
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(true);
                      setShowForm(true);
                      setError("");
                      setSuccess("");
                    }}
                    className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-white dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Edit Goal
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Remove Goal
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Goal form */}
        {showForm && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {editing
                  ? "Edit Participation Goal"
                  : "Create Participation Goal"}
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                Choose how many events you want to
                participate in during the selected period.
              </p>
            </div>

            {/* Target */}
            <div>
              <label
                htmlFor="participation-target"
                className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
              >
                Target number of events
              </label>

              <input
                id="participation-target"
                type="number"
                min={1}
                max={1000}
                value={target}
                onChange={(event) => {
                  setTarget(
                    Number(event.target.value)
                  );
                  setError("");
                }}
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-950"
              />
            </div>

            {/* Period */}
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Goal period
              </legend>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {PERIODS.map(
                  (item) => {
                    const selected =
                      period ===
                      item.value;

                    return (
                      <label
                        key={item.value}
                        className={`cursor-pointer rounded-xl border p-4 transition ${
                          selected
                            ? "border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40"
                            : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="goal-period"
                            value={item.value}
                            checked={selected}
                            onChange={() =>
                              setPeriod(
                                item.value
                              )
                            }
                            className="mt-1 h-4 w-4 accent-blue-600"
                          />

                          <span>
                            <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {
                                item.label
                              }
                            </span>

                            <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">
                              {
                                item.description
                              }
                            </span>
                          </span>
                        </div>
                      </label>
                    );
                  }
                )}
              </div>
            </fieldset>

            {/* Current progress */}
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                  Current participation
                </span>

                <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {participatedEvents}
                </span>
              </div>

              <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-400">
                Eligible participation will update your
                progress automatically when connected to
                the event participation data.
              </p>
            </div>

            {/* Form actions */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {editing && (
                <button
                  type="button"
                  onClick={
                    handleCancelEdit
                  }
                  disabled={saving}
                  className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editing
                  ? "Save Changes"
                  : "Create Goal"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <span className="text-lg">
            📊
          </span>

          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Your goal is personal
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
              Participation goals are associated with
              your account and are not visible to other
              users.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParticipationGoals;