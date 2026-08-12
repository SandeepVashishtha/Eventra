import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Edit3,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const STATUS_OPTIONS = [
  "Pending",
  "In Progress",
  "Completed",
];

const EventOrganizerTaskAssignment = ({
  initialTasks = [],
  collaborators = [],
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  className = "",
}) => {
  const [tasks, setTasks] =
    useState(initialTasks);

  const [showForm, setShowForm] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState(null);

  const [filter, setFilter] =
    useState("All");

  const [form, setForm] =
    useState({
      title: "",
      description: "",
      assigneeId: "",
      dueDate: "",
      priority: "Medium",
      status: "Pending",
    });

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const filteredTasks = useMemo(() => {
    if (filter === "All") {
      return tasks;
    }

    return tasks.filter(
      (task) => task.status === filter
    );
  }, [tasks, filter]);

  const statistics = useMemo(() => {
    const total = tasks.length;

    const completed = tasks.filter(
      (task) =>
        task.status === "Completed"
    ).length;

    const inProgress = tasks.filter(
      (task) =>
        task.status === "In Progress"
    ).length;

    const pending = tasks.filter(
      (task) =>
        task.status === "Pending"
    ).length;

    return {
      total,
      completed,
      inProgress,
      pending,
    };
  }, [tasks]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      assigneeId: "",
      dueDate: "",
      priority: "Medium",
      status: "Pending",
    });

    setEditingTask(null);
    setShowForm(false);
    setError("");
  };

  const openCreateForm = () => {
    setEditingTask(null);

    setForm({
      title: "",
      description: "",
      assigneeId: "",
      dueDate: "",
      priority: "Medium",
      status: "Pending",
    });

    setError("");
    setMessage("");
    setShowForm(true);
  };

  const openEditForm = (task) => {
    setEditingTask(task);

    setForm({
      title: task.title || "",
      description: task.description || "",
      assigneeId:
        task.assigneeId || "",
      dueDate: task.dueDate || "",
      priority:
        task.priority || "Medium",
      status:
        task.status || "Pending",
    });

    setError("");
    setMessage("");
    setShowForm(true);
  };

  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!form.title.trim()) {
      setError(
        "Task title is required."
      );
      return;
    }

    if (!form.assigneeId) {
      setError(
        "Please assign the task to a collaborator."
      );
      return;
    }

    if (!form.dueDate) {
      setError(
        "Please select a deadline."
      );
      return;
    }

    const assignee =
      collaborators.find(
        (user) =>
          String(user.id) ===
          String(form.assigneeId)
      );

    const taskData = {
      ...(editingTask || {}),
      id:
        editingTask?.id ||
        `task-${Date.now()}`,
      title: form.title.trim(),
      description:
        form.description.trim(),
      assigneeId:
        form.assigneeId,
      assigneeName:
        assignee?.name ||
        "Unknown collaborator",
      dueDate: form.dueDate,
      priority: form.priority,
      status: form.status,
      updatedAt:
        new Date().toISOString(),
      createdAt:
        editingTask?.createdAt ||
        new Date().toISOString(),
    };

    try {
      if (editingTask) {
        setTasks((current) =>
          current.map((task) =>
            task.id === editingTask.id
              ? taskData
              : task
          )
        );

        await onUpdateTask?.(
          taskData
        );

        setMessage(
          "Task updated successfully."
        );
      } else {
        setTasks((current) => [
          ...current,
          taskData,
        ]);

        await onCreateTask?.(
          taskData
        );

        setMessage(
          "Task created successfully."
        );
      }

      resetForm();
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save task."
      );
    }
  };

  const handleStatusChange = async (
    task,
    status
  ) => {
    const updatedTask = {
      ...task,
      status,
      updatedAt:
        new Date().toISOString(),
    };

    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? updatedTask
          : item
      )
    );

    try {
      await onUpdateTask?.(
        updatedTask
      );

      setMessage(
        "Task status updated."
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to update task status."
      );
    }
  };

  const handleDelete = async (
    task
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${task.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setTasks((current) =>
        current.filter(
          (item) =>
            item.id !== task.id
        )
      );

      await onDeleteTask?.(task);

      setMessage(
        "Task deleted successfully."
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to delete task."
      );
    }
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Workspace
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Event Task Assignment
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Assign preparation tasks to collaborators
              and track their progress.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[8px] font-bold text-white hover:bg-indigo-700"
        >
          <Plus size={14} />
          Create Task
        </button>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total"
          value={statistics.total}
        />

        <StatCard
          label="Pending"
          value={statistics.pending}
        />

        <StatCard
          label="In Progress"
          value={statistics.inProgress}
        />

        <StatCard
          label="Completed"
          value={statistics.completed}
        />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          "All",
          ...STATUS_OPTIONS,
        ].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() =>
              setFilter(option)
            }
            className={`rounded-xl px-4 py-2.5 text-[7px] font-bold ${
              filter === option
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-500 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Task Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-indigo-700 dark:text-indigo-400">
                {editingTask
                  ? "Edit Task"
                  : "Create Task"}
              </p>

              <p className="mt-1 text-[7px] text-indigo-700/60 dark:text-indigo-400/60">
                Define the responsibility, deadline and
                priority.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-400 hover:bg-white dark:hover:bg-slate-900"
            >
              <X size={15} />
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FormField
              label="Task Title"
              required
            >
              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  updateField(
                    "title",
                    event.target.value
                  )
                }
                placeholder="Prepare certificates"
                className={inputClass}
              />
            </FormField>

            <FormField
              label="Assign To"
              required
            >
              <select
                value={form.assigneeId}
                onChange={(event) =>
                  updateField(
                    "assigneeId",
                    event.target.value
                  )
                }
                className={inputClass}
              >
                <option value="">
                  Select collaborator
                </option>

                {collaborators.map(
                  (collaborator) => (
                    <option
                      key={collaborator.id}
                      value={collaborator.id}
                    >
                      {collaborator.name}
                    </option>
                  )
                )}
              </select>
            </FormField>

            <FormField label="Deadline" required>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) =>
                  updateField(
                    "dueDate",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="Priority">
              <select
                value={form.priority}
                onChange={(event) =>
                  updateField(
                    "priority",
                    event.target.value
                  )
                }
                className={inputClass}
              >
                {PRIORITIES.map(
                  (priority) => (
                    <option
                      key={priority}
                      value={priority}
                    >
                      {priority}
                    </option>
                  )
                )}
              </select>
            </FormField>

            <FormField label="Status">
              <select
                value={form.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target.value
                  )
                }
                className={inputClass}
              >
                {STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Description">
                <textarea
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  rows={3}
                  placeholder="Describe what needs to be completed..."
                  className={inputClass}
                />
              </FormField>
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-[8px] font-semibold text-red-600 dark:bg-red-900/10 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[8px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700"
            >
              {editingTask
                ? "Update Task"
                : "Create Task"}
            </button>
          </div>
        </form>
      )}

      {/* Tasks */}
      <div className="mt-6 space-y-3">
        {filteredTasks.length === 0 ? (
          <EmptyTasks
            onCreate={openCreateForm}
          />
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onStatusChange={
                handleStatusChange
              }
            />
          ))
        )}
      </div>

      {message && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-[8px] font-semibold text-green-600 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400">
          <CheckCircle2 size={14} />
          {message}
        </div>
      )}
    </section>
  );
};

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const isCompleted =
    task.status === "Completed";

  const isOverdue =
    !isCompleted &&
    task.dueDate &&
    new Date(task.dueDate) <
      new Date(
        new Date().setHours(
          0,
          0,
          0,
          0
        )
      );

  return (
    <article
      className={`rounded-2xl border bg-white p-4 dark:bg-slate-900 ${
        isOverdue
          ? "border-red-200 dark:border-red-900/30"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div
            className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              isCompleted
                ? "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400"
                : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400"
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 size={17} />
            ) : (
              <Circle size={17} />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`text-sm font-bold ${
                  isCompleted
                    ? "text-slate-400 line-through"
                    : "text-slate-800 dark:text-white"
                }`}
              >
                {task.title}
              </h3>

              <PriorityBadge
                priority={
                  task.priority
                }
              />

              <StatusBadge
                status={
                  task.status
                }
              />
            </div>

            {task.description && (
              <p className="mt-2 text-[8px] leading-4 text-slate-400">
                {task.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1 text-[7px] font-semibold text-slate-500 dark:text-slate-400">
                <User size={11} />
                {task.assigneeName ||
                  "Unassigned"}
              </span>

              <span
                className={`inline-flex items-center gap-1 text-[7px] font-semibold ${
                  isOverdue
                    ? "text-red-600 dark:text-red-400"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <Calendar size={11} />
                {isOverdue
                  ? "Overdue: "
                  : "Due: "}
                {formatDate(
                  task.dueDate
                )}
              </span>

              <span className="inline-flex items-center gap-1 text-[7px] font-semibold text-slate-500 dark:text-slate-400">
                <Clock size={11} />
                {formatRelativeTime(
                  task.updatedAt ||
                    task.createdAt
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <select
            value={
              task.status ||
              "Pending"
            }
            onChange={(event) =>
              onStatusChange(
                task,
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[7px] font-bold text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            {STATUS_OPTIONS.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Edit task"
          >
            <Edit3 size={13} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(task)}
            className="rounded-xl border border-red-200 p-2 text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10"
            aria-label="Delete task"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </article>
  );
};

const StatCard = ({
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-xl font-bold text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

const FormField = ({
  label,
  required,
  children,
}) => (
  <div>
    <label className="text-[8px] font-bold text-slate-600 dark:text-slate-300">
      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <div className="mt-2">
      {children}
    </div>
  </div>
);

const PriorityBadge = ({
  priority,
}) => {
  const styles = {
    Low: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    Medium:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400",
    High:
      "bg-orange-50 text-orange-600 dark:bg-orange-900/10 dark:text-orange-400",
    Urgent:
      "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-[6px] font-bold ${
        styles[priority] ||
        styles.Medium
      }`}
    >
      {priority || "Medium"}
    </span>
  );
};

const StatusBadge = ({
  status,
}) => {
  const styles = {
    Pending:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
    "In Progress":
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400",
    Completed:
      "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-[6px] font-bold ${
        styles[status] ||
        styles.Pending
      }`}
    >
      {status || "Pending"}
    </span>
  );
};

const EmptyTasks = ({
  onCreate,
}) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
    <CheckCircle2
      size={24}
      className="mx-auto text-slate-400"
    />

    <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-200">
      No tasks found
    </p>

    <p className="mt-1 text-[7px] text-slate-400">
      Create tasks and assign responsibilities to your
      event collaborators.
    </p>

    <button
      type="button"
      onClick={onCreate}
      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[8px] font-bold text-white"
    >
      <Plus size={13} />
      Create First Task
    </button>
  </div>
);

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

const formatDate = (value) => {
  if (!value) {
    return "No deadline";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

const formatRelativeTime = (
  value
) => {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const difference =
    Date.now() - date.getTime();

  const minutes = Math.floor(
    difference / 60000
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  return `${days}d ago`;
};

export default EventOrganizerTaskAssignment;