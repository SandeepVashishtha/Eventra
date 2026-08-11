import {
  Check,
  Circle,
  ClipboardCheck,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_TASKS = [
  {
    id: "venue",
    title: "Finalize venue",
    completed: false,
    custom: false,
  },
  {
    id: "publish-event",
    title: "Publish event",
    completed: false,
    custom: false,
  },
  {
    id: "review-registrations",
    title: "Review registrations",
    completed: false,
    custom: false,
  },
  {
    id: "announcements",
    title: "Send announcements",
    completed: false,
    custom: false,
  },
  {
    id: "certificates",
    title: "Prepare certificates",
    completed: false,
    custom: false,
  },
  {
    id: "speakers",
    title: "Confirm speakers",
    completed: false,
    custom: false,
  },
  {
    id: "resources",
    title: "Upload event resources",
    completed: false,
    custom: false,
  },
  {
    id: "close-registration",
    title: "Close registrations",
    completed: false,
    custom: false,
  },
];

const STORAGE_KEY =
  "eventra-organizer-checklist";

const EventOrganizerChecklist = ({
  eventId = "default-event",
  initialTasks = DEFAULT_TASKS,
  storageKey = STORAGE_KEY,
  onChange,
  className = "",
}) => {
  const getStorageKey = () =>
    `${storageKey}-${eventId}`;

  const [tasks, setTasks] = useState(() => {
    const stored = loadTasks(
      getStorageKey()
    );

    if (stored.length > 0) {
      return stored;
    }

    return initialTasks.map(normalizeTask);
  });

  const [newTask, setNewTask] =
    useState("");

  const [showAddTask, setShowAddTask] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    saveTasks(
      getStorageKey(),
      tasks
    );

    onChange?.(tasks);
  }, [tasks]);

  const completedCount = useMemo(
    () =>
      tasks.filter(
        (task) => task.completed
      ).length,
    [tasks]
  );

  const totalCount = tasks.length;

  const completionPercentage =
    totalCount === 0
      ? 0
      : Math.round(
          (completedCount /
            totalCount) *
            100
        );

  const readinessStatus =
    getReadinessStatus(
      completionPercentage
    );

  const toggleTask = (taskId) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed:
                !task.completed,
            }
          : task
      )
    );

    setMessage("");
  };

  const addTask = () => {
    const title =
      newTask.trim();

    if (!title) {
      setMessage(
        "Please enter a checklist item."
      );
      return;
    }

    const task = {
      id: createId(),
      title,
      completed: false,
      custom: true,
    };

    setTasks((current) => [
      ...current,
      task,
    ]);

    setNewTask("");
    setShowAddTask(false);
    setMessage(
      "Custom checklist item added."
    );
  };

  const deleteTask = (taskId) => {
    setTasks((current) =>
      current.filter(
        (task) =>
          task.id !== taskId
      )
    );

    setMessage(
      "Checklist item removed."
    );
  };

  const resetChecklist = () => {
    const confirmed =
      window.confirm(
        "Reset the organizer checklist?"
      );

    if (!confirmed) {
      return;
    }

    setTasks(
      initialTasks.map(
        normalizeTask
      )
    );

    setMessage(
      "Checklist has been reset."
    );
  };

  const completeAllTasks = () => {
    setTasks((current) =>
      current.map((task) => ({
        ...task,
        completed: true,
      }))
    );

    setMessage(
      "All checklist items marked as complete."
    );
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <ClipboardCheck
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Workspace
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Event Organizer Checklist
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Track important event preparation tasks and
              monitor overall event readiness.
            </p>
          </div>
        </div>

        <ReadinessBadge
          status={readinessStatus}
        />
      </div>

      {/* Progress */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Event Readiness
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {completionPercentage}%
            </p>
          </div>

          <p className="text-[10px] font-semibold text-slate-400">
            {completedCount} of{" "}
            {totalCount} completed
          </p>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${completionPercentage}%`,
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[9px] text-slate-400">
            {completionPercentage === 100
              ? "Everything is ready!"
              : "Complete the checklist to prepare your event."}
          </p>

          {completionPercentage <
            100 && (
            <button
              type="button"
              onClick={completeAllTasks}
              className="text-[9px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Mark all complete
            </button>
          )}
        </div>
      </div>

      {/* Checklist */}
      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Preparation Tasks
            </h3>

            <p className="mt-1 text-[10px] text-slate-400">
              Complete each task as your event preparation
              progresses.
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[9px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {totalCount} tasks
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {tasks.length === 0 ? (
            <EmptyChecklist
              onAdd={() =>
                setShowAddTask(true)
              }
            />
          ) : (
            tasks.map((task) => (
              <ChecklistItem
                key={task.id}
                task={task}
                onToggle={() =>
                  toggleTask(
                    task.id
                  )
                }
                onDelete={
                  task.custom
                    ? () =>
                        deleteTask(
                          task.id
                        )
                    : undefined
                }
              />
            ))
          )}
        </div>
      </div>

      {/* Add task */}
      {showAddTask ? (
        <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-900/10">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
            Custom Checklist Item
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={newTask}
              maxLength={120}
              autoFocus
              onChange={(event) =>
                setNewTask(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  addTask();
                }

                if (
                  event.key ===
                  "Escape"
                ) {
                  setShowAddTask(
                    false
                  );
                  setNewTask("");
                }
              }}
              placeholder="e.g. Test registration QR code"
              className="flex-1 rounded-xl border border-indigo-200 bg-white px-3 py-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-indigo-800 dark:bg-slate-950 dark:text-slate-200"
            />

            <button
              type="button"
              onClick={addTask}
              className="rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700"
            >
              Add
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAddTask(
                  false
                );
                setNewTask("");
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>

          <p className="mt-2 text-[8px] text-slate-400">
            Press Enter to add the task.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            setShowAddTask(true)
          }
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-[10px] font-bold text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/10 dark:hover:text-indigo-400"
        >
          <Plus size={14} />
          Add Custom Task
        </button>
      )}

      {/* Message */}
      {message && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-[10px] font-semibold text-green-700 dark:border-green-900/40 dark:bg-green-900/10 dark:text-green-400">
          {message}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <p className="text-[9px] text-slate-400">
            Checklist progress is saved automatically.
          </p>

          {completionPercentage ===
            100 && (
            <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-green-600 dark:text-green-400">
              <Check size={12} />
              Event preparation complete
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={resetChecklist}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <RotateCcw size={13} />
          Reset Checklist
        </button>
      </div>
    </section>
  );
};

/* ----------------------------------
   Checklist item
----------------------------------- */

const ChecklistItem = ({
  task,
  onToggle,
  onDelete,
}) => {
  return (
    <div
      className={`group flex items-center gap-3 rounded-2xl border p-3 transition ${
        task.completed
          ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10"
          : "border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-label={
          task.completed
            ? `Mark ${task.title} incomplete`
            : `Mark ${task.title} complete`
        }
        aria-pressed={
          task.completed
        }
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
          task.completed
            ? "bg-green-600 text-white"
            : "bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
        }`}
      >
        {task.completed ? (
          <Check size={15} />
        ) : (
          <Circle size={15} />
        )}
      </button>

      <button
        type="button"
        onClick={onToggle}
        className="min-w-0 flex-1 text-left"
      >
        <p
          className={`text-xs font-bold ${
            task.completed
              ? "text-green-700 line-through dark:text-green-400"
              : "text-slate-700 dark:text-slate-200"
          }`}
        >
          {task.title}
        </p>

        {task.custom && (
          <span className="mt-1 inline-block text-[8px] font-bold uppercase tracking-wide text-indigo-500">
            Custom task
          </span>
        )}
      </button>

      {task.completed && (
        <span className="hidden rounded-full bg-green-100 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-green-600 sm:inline-flex dark:bg-green-900/30 dark:text-green-400">
          Complete
        </span>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${task.title}`}
          className="rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
};

/* ----------------------------------
   Readiness badge
----------------------------------- */

const ReadinessBadge = ({
  status,
}) => {
  const styles = {
    ready: {
      wrapper:
        "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      label: "Ready",
    },
    almost: {
      wrapper:
        "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
      label: "Almost Ready",
    },
    progress: {
      wrapper:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
      label: "In Progress",
    },
    starting: {
      wrapper:
        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
      label: "Getting Started",
    },
  };

  const config =
    styles[status] ||
    styles.starting;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide ${config.wrapper}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyChecklist = ({
  onAdd,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <ClipboardCheck
          size={21}
          className="text-slate-400"
        />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">
        No checklist items
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-[10px] leading-4 text-slate-400">
        Add a task to start tracking your event preparation.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[10px] font-bold text-white hover:bg-indigo-700"
      >
        <Plus size={13} />
        Add Task
      </button>
    </div>
  );
};

/* ----------------------------------
   Helpers
----------------------------------- */

const normalizeTask = (
  task
) => {
  return {
    id:
      task.id ||
      createId(),
    title:
      task.title ||
      "Untitled task",
    completed:
      Boolean(
        task.completed
      ),
    custom:
      Boolean(task.custom),
  };
};

const getReadinessStatus = (
  percentage
) => {
  if (percentage >= 100) {
    return "ready";
  }

  if (percentage >= 75) {
    return "almost";
  }

  if (percentage >= 25) {
    return "progress";
  }

  return "starting";
};

const createId = () => {
  if (
    typeof crypto !==
      "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
};

const loadTasks = (
  storageKey
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const stored =
      window.localStorage.getItem(
        storageKey
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(
      normalizeTask
    );
  } catch {
    return [];
  }
};

const saveTasks = (
  storageKey,
  tasks
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(tasks)
    );
  } catch {
    // Ignore localStorage failures.
  }
};

export default EventOrganizerChecklist;