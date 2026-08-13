import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

interface PreparationTask {
  id: string;
  title: string;
  description: string;
  icon: string;
  required?: boolean;
}

interface EventPreparationChecklistProps {
  eventId: string | number;
  eventName?: string;
  tasks?: PreparationTask[];
  initialCompletedTasks?: string[];
  onProgressChange?: (
    completedTaskIds: string[]
  ) => void;
}

const DEFAULT_TASKS: PreparationTask[] = [
  {
    id: "event-instructions",
    title: "Read event instructions",
    description:
      "Review the event rules, schedule, requirements, and important instructions.",
    icon: "📖",
    required: true,
  },
  {
    id: "required-documents",
    title: "Prepare required documents",
    description:
      "Make sure you have all documents or identification required for the event.",
    icon: "📄",
    required: true,
  },
  {
    id: "registration-requirements",
    title: "Complete registration requirements",
    description:
      "Check that all registration steps and required information have been completed.",
    icon: "✅",
    required: true,
  },
  {
    id: "communication-channels",
    title: "Join communication channels",
    description:
      "Join the official communication channels to receive event announcements and updates.",
    icon: "💬",
  },
  {
    id: "project-submission",
    title: "Prepare project or submission",
    description:
      "Complete and prepare any project, presentation, assignment, or submission required for the event.",
    icon: "💻",
  },
  {
    id: "event-location",
    title: "Check event location",
    description:
      "Review the venue, directions, parking information, or online joining instructions.",
    icon: "📍",
  },
];

const EventPreparationChecklist: React.FC<
  EventPreparationChecklistProps
> = ({
  eventId,
  eventName = "Event",
  tasks = DEFAULT_TASKS,
  initialCompletedTasks = [],
  onProgressChange,
}) => {
  const storageKey = `eventra-preparation-checklist-${eventId}`;

  const [completedTasks, setCompletedTasks] =
    useState<string[]>(initialCompletedTasks);

  const [showCompleted, setShowCompleted] =
    useState(true);

  const [showDetails, setShowDetails] =
    useState<string | null>(null);

  const [resetMessage, setResetMessage] =
    useState("");

  /*
   * Load saved checklist progress.
   */
  useEffect(() => {
    try {
      const savedProgress =
        localStorage.getItem(storageKey);

      if (savedProgress) {
        const parsed =
          JSON.parse(savedProgress);

        if (Array.isArray(parsed)) {
          setCompletedTasks(parsed);
        }
      }
    } catch {
      /*
       * Ignore invalid local storage data
       * and continue with the initial state.
       */
    }
  }, [storageKey]);

  /*
   * Save progress whenever the completed task
   * list changes.
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(completedTasks)
      );
    } catch {
      /*
       * Ignore storage errors so the checklist
       * continues to work in memory.
       */
    }

    onProgressChange?.(completedTasks);
  }, [
    completedTasks,
    storageKey,
    onProgressChange,
  ]);

  const completedCount = useMemo(
    () =>
      tasks.filter((task) =>
        completedTasks.includes(task.id)
      ).length,
    [tasks, completedTasks]
  );

  const totalCount = tasks.length;

  const progressPercentage =
    totalCount === 0
      ? 0
      : Math.round(
          (completedCount / totalCount) * 100
        );

  const requiredTasks = tasks.filter(
    (task) => task.required
  );

  const completedRequiredCount =
    requiredTasks.filter((task) =>
      completedTasks.includes(task.id)
    ).length;

  const allCompleted =
    totalCount > 0 &&
    completedCount === totalCount;

  const allRequiredCompleted =
    requiredTasks.length === 0 ||
    completedRequiredCount ===
      requiredTasks.length;

  const toggleTask = (taskId: string) => {
    setCompletedTasks((previous) => {
      if (previous.includes(taskId)) {
        return previous.filter(
          (id) => id !== taskId
        );
      }

      return [...previous, taskId];
    });
  };

  const resetChecklist = () => {
    setCompletedTasks([]);
    setResetMessage(
      "Checklist progress has been reset."
    );

    window.setTimeout(() => {
      setResetMessage("");
    }, 2500);
  };

  const remainingTasks = tasks.filter(
    (task) => !completedTasks.includes(task.id)
  );

  const completedTaskList = tasks.filter(
    (task) => completedTasks.includes(task.id)
  );

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 dark:border-gray-700 dark:from-blue-950/40 dark:via-gray-900 dark:to-purple-950/40 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
              📋
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Participant Checklist
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                Prepare for {eventName}
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Complete these preparation steps before
                attending your event.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetChecklist}
            className="self-start rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Reset
          </button>
        </div>

        {/* Progress */}
        <div className="mt-6 rounded-2xl border border-white/80 bg-white/80 p-4 dark:border-gray-700/80 dark:bg-gray-900/70">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Preparation progress
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {completedCount} of {totalCount} tasks
                completed
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {progressPercentage}%
              </span>
            </div>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>

          {allCompleted && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 dark:bg-green-950">
              <span className="text-lg">
                🎉
              </span>

              <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                You're fully prepared for this event!
              </p>
            </div>
          )}
        </div>

        {resetMessage && (
          <div className="mt-3 rounded-xl bg-blue-100 px-4 py-3 text-sm font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {resetMessage}
          </div>
        )}
      </div>

      {/* Required status */}
      {requiredTasks.length > 0 && (
        <div className="border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
          <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg dark:bg-orange-900">
              !
            </div>

            <div>
              <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300">
                Required preparation
              </h3>

              <p className="mt-1 text-sm leading-6 text-orange-700 dark:text-orange-400">
                {completedRequiredCount} of{" "}
                {requiredTasks.length} required tasks
                completed.
              </p>

              {!allRequiredCompleted && (
                <p className="mt-1 text-xs text-orange-600 dark:text-orange-500">
                  Complete the required tasks before
                  attending the event.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remaining tasks */}
      <div className="p-5 sm:p-6">
        {remainingTasks.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  To do
                </h3>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {remainingTasks.length} task
                  {remainingTasks.length !== 1
                    ? "s"
                    : ""}{" "}
                  remaining
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {remainingTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-800"
                >
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        toggleTask(task.id)
                      }
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-gray-300 bg-white transition hover:border-blue-500 dark:border-gray-600 dark:bg-gray-800"
                      aria-label={`Mark ${task.title} as completed`}
                    />

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl dark:bg-gray-800">
                      {task.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          {task.title}
                        </h4>

                        {task.required && (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-600 dark:bg-red-950 dark:text-red-300">
                            Required
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        {task.description}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setShowDetails(
                            showDetails ===
                              task.id
                              ? null
                              : task.id
                          )
                        }
                        className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        {showDetails === task.id
                          ? "Hide details"
                          : "More details"}
                      </button>

                      {showDetails ===
                        task.id && (
                        <div className="mt-3 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          Make sure this task is
                          completed before the event
                          starts. You can return to this
                          checklist at any time to update
                          your progress.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed tasks */}
        {completedTaskList.length > 0 && (
          <div
            className={
              remainingTasks.length > 0
                ? "mt-8"
                : ""
            }
          >
            <button
              type="button"
              onClick={() =>
                setShowCompleted(
                  (previous) => !previous
                )
              }
              className="flex w-full items-center justify-between border-b border-gray-200 pb-3 text-left dark:border-gray-700"
            >
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Completed
                </h3>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {completedTaskList.length} task
                  {completedTaskList.length !== 1
                    ? "s"
                    : ""}{" "}
                  completed
                </p>
              </div>

              <span className="text-gray-400">
                {showCompleted
                  ? "⌃"
                  : "⌄"}
              </span>
            </button>

            {showCompleted && (
              <div className="mt-3 space-y-3">
                {completedTaskList.map(
                  (task) => (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-green-200 bg-green-50/70 p-4 dark:border-green-900 dark:bg-green-950/30"
                    >
                      <div className="flex items-start gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            toggleTask(
                              task.id
                            )
                          }
                          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-green-500 bg-green-500 text-sm font-bold text-white"
                          aria-label={`Mark ${task.title} as incomplete`}
                        >
                          ✓
                        </button>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl dark:bg-gray-900">
                          {task.icon}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-green-800 line-through dark:text-green-300">
                              {task.title}
                            </h4>

                            {task.required && (
                              <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700 dark:bg-green-900 dark:text-green-300">
                                Required
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                            Completed
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl dark:bg-gray-700">
              📋
            </div>

            <h3 className="mt-4 text-base font-bold text-gray-900 dark:text-white">
              No preparation tasks
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              There are currently no preparation tasks
              available for this event.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <span className="text-lg">
            💡
          </span>

          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Your progress is saved automatically
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
              You can leave this page and return later.
              Your checklist is associated with this
              event and your completed tasks will remain
              available.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventPreparationChecklist;