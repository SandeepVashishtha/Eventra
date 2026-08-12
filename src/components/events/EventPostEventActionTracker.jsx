import {
  Archive,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  MessageSquare,
  PlayCircle,
  Upload,
  Award,
  Clock3,
  ListChecks,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_TASKS = [
  {
    id: 1,
    title: "Review feedback",
    description: "Review participant feedback and identify important improvements.",
    type: "feedback",
    priority: "high",
    status: "pending",
    due: "Due today",
  },
  {
    id: 2,
    title: "Publish event summary",
    description: "Prepare and publish a summary of the completed event.",
    type: "summary",
    priority: "medium",
    status: "pending",
    due: "Due in 2 days",
  },
  {
    id: 3,
    title: "Upload recordings",
    description: "Upload session recordings and make them available to participants.",
    type: "recordings",
    priority: "medium",
    status: "in-progress",
    due: "Due in 3 days",
  },
  {
    id: 4,
    title: "Issue certificates",
    description: "Generate and distribute certificates to eligible participants.",
    type: "certificates",
    priority: "high",
    status: "pending",
    due: "Due in 3 days",
  },
  {
    id: 5,
    title: "Export attendance",
    description: "Export the final event attendance records.",
    type: "attendance",
    priority: "low",
    status: "completed",
    due: "Completed",
  },
  {
    id: 6,
    title: "Close pending registrations",
    description: "Review and close remaining registration requests.",
    type: "registrations",
    priority: "medium",
    status: "pending",
    due: "Due in 4 days",
  },
  {
    id: 7,
    title: "Archive event resources",
    description: "Archive presentations, documents, links, and other event resources.",
    type: "archive",
    priority: "low",
    status: "pending",
    due: "Due in 5 days",
  },
];

const TASK_TYPES = {
  feedback: {
    label: "Feedback",
    icon: MessageSquare,
  },
  summary: {
    label: "Summary",
    icon: FileText,
  },
  recordings: {
    label: "Recordings",
    icon: PlayCircle,
  },
  certificates: {
    label: "Certificates",
    icon: Award,
  },
  attendance: {
    label: "Attendance",
    icon: Download,
  },
  registrations: {
    label: "Registrations",
    icon: ClipboardCheck,
  },
  archive: {
    label: "Archive",
    icon: Archive,
  },
};

const PRIORITY_STYLES = {
  high: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  medium:
    "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  low: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const STATUS_STYLES = {
  pending:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  "in-progress":
    "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  completed:
    "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
};

const EventPostEventActionTracker = ({
  tasks = DEFAULT_TASKS,
  eventName = "AI Hackathon 2026",
  onTaskUpdate,
}) => {
  const [taskList, setTaskList] = useState(tasks);
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);

  const completedTasks = useMemo(
    () =>
      taskList.filter(
        (task) => task.status === "completed"
      ).length,
    [taskList]
  );

  const progress = useMemo(() => {
    if (!taskList.length) return 0;

    return Math.round(
      (completedTasks / taskList.length) * 100
    );
  }, [completedTasks, taskList.length]);

  const filteredTasks = useMemo(() => {
    if (filter === "all") return taskList;

    return taskList.filter(
      (task) => task.status === filter
    );
  }, [filter, taskList]);

  const updateTask = (task, status) => {
    setTaskList((current) =>
      current.map((item) =>
        item.id === task.id
          ? {
              ...item,
              status,
              due:
                status === "completed"
                  ? "Completed"
                  : item.due,
            }
          : item
      )
    );

    setSelectedTask(null);

    if (onTaskUpdate) {
      onTaskUpdate({
        ...task,
        status,
      });
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <ListChecks size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Event Lifecycle
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Post-Event Action Tracker
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Complete the remaining tasks required to properly close
              <span className="font-semibold">
                {" "}
                {eventName}
              </span>
              .
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <Clock3
            size={14}
            className="text-indigo-500"
          />

          <span className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
            {taskList.length - completedTasks} tasks remaining
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Event Closure Progress
            </p>

            <p className="mt-1 text-2xl font-black text-slate-800 dark:text-white">
              {progress}%
            </p>
          </div>

          <div className="text-right">
            <p className="text-[7px] font-semibold text-slate-500 dark:text-slate-400">
              {completedTasks} of {taskList.length} completed
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={ListChecks}
          label="Total Tasks"
          value={taskList.length}
        />

        <SummaryCard
          icon={Clock3}
          label="Remaining"
          value={taskList.length - completedTasks}
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Completed"
          value={completedTasks}
        />
      </div>

      {/* Filters */}
      <div className="mt-6 overflow-x-auto">
        <div className="flex min-w-max gap-2">
          <FilterButton
            active={filter === "all"}
            label={`All (${taskList.length})`}
            onClick={() => setFilter("all")}
          />

          <FilterButton
            active={filter === "pending"}
            label={`Pending (${
              taskList.filter(
                (task) => task.status === "pending"
              ).length
            })`}
            onClick={() => setFilter("pending")}
          />

          <FilterButton
            active={filter === "in-progress"}
            label={`In Progress (${
              taskList.filter(
                (task) => task.status === "in-progress"
              ).length
            })`}
            onClick={() => setFilter("in-progress")}
          />

          <FilterButton
            active={filter === "completed"}
            label={`Completed (${completedTasks})`}
            onClick={() => setFilter("completed")}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Post-Event Tasks
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Review and complete each task before closing the event.
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {filteredTasks.length} items
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onView={() => setSelectedTask(task)}
              onStart={() =>
                updateTask(task, "in-progress")
              }
              onComplete={() =>
                updateTask(task, "completed")
              }
            />
          ))}

          {!filteredTasks.length && (
            <EmptyTasks />
          )}
        </div>
      </div>

      {/* Completion Banner */}
      {progress === 100 && taskList.length > 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
          <CheckCircle2
            size={17}
            className="mt-0.5 shrink-0 text-green-500"
          />

          <div>
            <p className="text-[8px] font-bold text-green-700 dark:text-green-400">
              Event lifecycle completed
            </p>

            <p className="mt-1 text-[7px] leading-4 text-green-700/70 dark:text-green-400/70">
              All post-event tasks have been completed successfully.
            </p>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStart={() =>
            updateTask(
              selectedTask,
              "in-progress"
            )
          }
          onComplete={() =>
            updateTask(
              selectedTask,
              "completed"
            )
          }
        />
      )}
    </section>
  );
};

/* --------------------------------
   Summary Card
--------------------------------- */

const SummaryCard = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Icon size={15} />
        </div>

        <div>
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Filter Button
--------------------------------- */

const FilterButton = ({
  active,
  label,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2.5 text-[6px] font-bold transition ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-white text-slate-500 ring-1 ring-inset ring-slate-200 hover:text-indigo-600 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700"
      }`}
    >
      {label}
    </button>
  );
};

/* --------------------------------
   Task Card
--------------------------------- */

const TaskCard = ({
  task,
  onView,
  onStart,
  onComplete,
}) => {
  const config =
    TASK_TYPES[task.type] ||
    TASK_TYPES.summary;

  const Icon = config.icon;

  const isCompleted =
    task.status === "completed";

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        isCompleted
          ? "border-green-200 bg-green-50/40 dark:border-green-900/30 dark:bg-green-900/10"
          : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-950"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isCompleted
              ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 size={17} />
          ) : (
            <Icon size={17} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-[8px] font-bold text-slate-800 dark:text-white">
              {task.title}
            </h4>

            <span
              className={`rounded-full px-2 py-1 text-[5px] font-bold uppercase ${
                PRIORITY_STYLES[task.priority]
              }`}
            >
              {task.priority}
            </span>

            <span
              className={`rounded-full px-2 py-1 text-[5px] font-bold uppercase ${
                STATUS_STYLES[task.status]
              }`}
            >
              {task.status.replace("-", " ")}
            </span>
          </div>

          <p className="mt-1 text-[7px] leading-4 text-slate-400">
            {task.description}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <Clock3
              size={9}
              className="text-slate-400"
            />

            <span className="text-[6px] font-semibold text-slate-500 dark:text-slate-400">
              {task.due}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-[6px] font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300"
          >
            View
            <ChevronRight size={10} />
          </button>

          {!isCompleted &&
            task.status === "pending" && (
              <button
                type="button"
                onClick={onStart}
                className="rounded-xl bg-blue-600 px-3 py-2.5 text-[6px] font-bold text-white hover:bg-blue-700"
              >
                Start
              </button>
            )}

          {!isCompleted && (
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2.5 text-[6px] font-bold text-white hover:bg-green-700"
            >
              <CheckCircle2 size={10} />
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyTasks = () => {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center dark:border-slate-700">
      <CheckCircle2
        size={27}
        className="text-green-500"
      />

      <h4 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
        No tasks found
      </h4>

      <p className="mt-1 text-[7px] text-slate-400">
        There are no tasks matching the selected filter.
      </p>
    </div>
  );
};

/* --------------------------------
   Task Details Modal
--------------------------------- */

const TaskDetailsModal = ({
  task,
  onClose,
  onStart,
  onComplete,
}) => {
  const config =
    TASK_TYPES[task.type] ||
    TASK_TYPES.summary;

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <Icon size={17} />
            </div>

            <div>
              <p className="text-[6px] font-bold uppercase tracking-wide text-indigo-500">
                {config.label}
              </p>

              <h3 className="mt-1 text-sm font-black text-slate-800 dark:text-white">
                {task.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 dark:bg-slate-800 dark:hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Task Description
            </p>

            <p className="mt-1 text-[8px] leading-5 text-slate-600 dark:text-slate-300">
              {task.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DetailField
              label="Type"
              value={config.label}
            />

            <DetailField
              label="Priority"
              value={task.priority}
            />

            <DetailField
              label="Status"
              value={task.status}
            />

            <DetailField
              label="Deadline"
              value={task.due}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 p-5 sm:flex-row sm:justify-end dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-3 text-[7px] font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            Close
          </button>

          {task.status === "pending" && (
            <button
              type="button"
              onClick={onStart}
              className="rounded-xl bg-blue-600 px-4 py-3 text-[7px] font-bold text-white hover:bg-blue-700"
            >
              Start Task
            </button>
          )}

          {task.status !== "completed" && (
            <button
              type="button"
              onClick={onComplete}
              className="rounded-xl bg-green-600 px-4 py-3 text-[7px] font-bold text-white hover:bg-green-700"
            >
              Mark Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Detail Field
--------------------------------- */

const DetailField = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-[7px] font-bold capitalize text-slate-700 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
};

export default EventPostEventActionTracker;