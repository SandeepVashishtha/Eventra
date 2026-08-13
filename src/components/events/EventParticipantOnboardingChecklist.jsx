import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  Users,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_TASKS = [
  {
    id: "profile",
    title: "Complete Profile",
    description: "Add your required participant information.",
    icon: UserRound,
    completed: true,
  },
  {
    id: "rules",
    title: "Read Event Rules",
    description: "Review the event guidelines and requirements.",
    icon: FileText,
    completed: false,
  },
  {
    id: "team",
    title: "Join Team",
    description: "Join an existing team or create your team.",
    icon: Users,
    completed: false,
  },
  {
    id: "sessions",
    title: "Select Sessions",
    description: "Choose the sessions you want to attend.",
    icon: ClipboardCheck,
    completed: false,
  },
  {
    id: "resources",
    title: "Download Resources",
    description: "Access important event materials and resources.",
    icon: Download,
    completed: false,
  },
  {
    id: "calendar",
    title: "Add Event to Calendar",
    description: "Save the event schedule to your calendar.",
    icon: CalendarDays,
    completed: false,
  },
];

const EventParticipantOnboardingChecklist = ({
  tasks = DEFAULT_TASKS,
  participantName = "Participant",
  onTaskComplete,
  onTaskAction,
}) => {
  const [taskState, setTaskState] = useState(tasks);

  const completedCount = useMemo(
    () => taskState.filter((task) => task.completed).length,
    [taskState]
  );

  const progress =
    taskState.length > 0
      ? Math.round((completedCount / taskState.length) * 100)
      : 0;

  const toggleTask = (taskId) => {
    setTaskState((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;

        const updated = {
          ...task,
          completed: !task.completed,
        };

        if (updated.completed && onTaskComplete) {
          onTaskComplete(updated);
        }

        return updated;
      })
    );
  };

  const handleAction = (task) => {
    if (onTaskAction) {
      onTaskAction(task);
    } else {
      toggleTask(task.id);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <ClipboardCheck size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Participant Onboarding
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Welcome, {participantName}!
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Complete these tasks to get ready for your event.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Progress
          </p>

          <p className="mt-1 text-lg font-black text-indigo-600 dark:text-indigo-400">
            {progress}%
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300">
              Onboarding Progress
            </h3>

            <p className="mt-1 text-[7px] text-indigo-600 dark:text-indigo-400">
              {completedCount} of {taskState.length} tasks completed
            </p>
          </div>

          <CheckCircle2
            size={18}
            className={
              progress === 100
                ? "text-green-600 dark:text-green-400"
                : "text-indigo-500"
            }
          />
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/80 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Your Onboarding Checklist
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Complete each task before the event begins.
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {taskState.map((task, index) => {
            const Icon = task.icon;

            return (
              <div
                key={task.id}
                className={`p-5 transition ${
                  task.completed
                    ? "bg-green-50/40 dark:bg-green-900/5"
                    : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Number / Status */}
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                      task.completed
                        ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                    aria-label={
                      task.completed
                        ? `Mark ${task.title} incomplete`
                        : `Mark ${task.title} complete`
                    }
                  >
                    {task.completed ? (
                      <CheckCircle2 size={17} />
                    ) : (
                      <span className="text-[8px] font-black">
                        {index + 1}
                      </span>
                    )}
                  </button>

                  {/* Icon */}
                  <div
                    className={`hidden rounded-xl p-2 sm:block ${
                      task.completed
                        ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                    }`}
                  >
                    <Icon size={15} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4
                          className={`text-[9px] font-bold ${
                            task.completed
                              ? "text-green-700 line-through dark:text-green-400"
                              : "text-slate-800 dark:text-white"
                          }`}
                        >
                          {task.title}
                        </h4>

                        <p className="mt-1 text-[7px] leading-4 text-slate-400">
                          {task.description}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-2.5 py-1 text-[6px] font-bold ${
                          task.completed
                            ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                        }`}
                      >
                        {task.completed ? "Completed" : "Pending"}
                      </span>
                    </div>

                    {!task.completed && (
                      <button
                        type="button"
                        onClick={() => handleAction(task)}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-[6px] font-bold text-white transition hover:bg-indigo-700"
                      >
                        Complete Task
                        <ChevronRight size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Message */}
      {progress === 100 && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={18}
              className="mt-0.5 text-green-600 dark:text-green-400"
            />

            <div>
              <h3 className="text-[9px] font-bold text-green-800 dark:text-green-300">
                You're all set!
              </h3>

              <p className="mt-1 text-[7px] leading-4 text-green-700 dark:text-green-400">
                All onboarding tasks are complete. You're ready
                for the event.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Remaining Tasks */}
      {progress < 100 && (
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Remaining
            </p>

            <p className="mt-1 text-[9px] font-black text-slate-700 dark:text-slate-300">
              {taskState.length - completedCount} task
              {taskState.length - completedCount === 1
                ? ""
                : "s"} left
            </p>
          </div>

          <ClipboardCheck
            size={18}
            className="text-indigo-500"
          />
        </div>
      )}
    </section>
  );
};

export default EventParticipantOnboardingChecklist;