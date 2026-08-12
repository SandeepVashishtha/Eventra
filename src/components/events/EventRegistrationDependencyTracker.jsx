import {
  AlertCircle,
  ArrowDown,
  CheckCircle2,
  Circle,
  Lock,
  Unlock,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_STEPS = [
  {
    id: "registration",
    title: "Registration",
    description: "Complete your event registration.",
    status: "completed",
  },
  {
    id: "eligibility",
    title: "Eligibility Verification",
    description: "Verify that you meet the event requirements.",
    status: "completed",
  },
  {
    id: "team",
    title: "Team Formation",
    description: "Join or create a team for the event.",
    status: "current",
    dependsOn: "eligibility",
  },
  {
    id: "submission",
    title: "Submission",
    description: "Submit your project before the deadline.",
    status: "locked",
    dependsOn: "team",
  },
];

const STATUS_CONFIG = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    iconClass:
      "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    badgeClass:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  },
  current: {
    label: "Current",
    icon: Circle,
    iconClass:
      "bg-indigo-100 text-indigo-600 ring-4 ring-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 dark:ring-indigo-900/10",
    badgeClass:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
  },
  locked: {
    label: "Locked",
    icon: Lock,
    iconClass:
      "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
    badgeClass:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
  blocked: {
    label: "Blocked",
    icon: AlertCircle,
    iconClass:
      "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    badgeClass:
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  },
};

const EventRegistrationDependencyTracker = ({
  steps = DEFAULT_STEPS,
  eventName = "AI Hackathon 2026",
}) => {
  const normalizedSteps = useMemo(() => {
    return steps.map((step, index) => {
      const dependency = step.dependsOn
        ? steps.find((item) => item.id === step.dependsOn)
        : null;

      const dependencyCompleted =
        !dependency || dependency.status === "completed";

      let status = step.status;

      if (
        dependency &&
        !dependencyCompleted &&
        step.status !== "completed"
      ) {
        status = "locked";
      }

      if (
        status === "locked" &&
        dependencyCompleted &&
        step.status !== "completed"
      ) {
        status = "current";
      }

      return {
        ...step,
        status,
        index,
        dependency,
      };
    });
  }, [steps]);

  const completedCount = normalizedSteps.filter(
    (step) => step.status === "completed"
  ).length;

  const progress =
    normalizedSteps.length > 0
      ? Math.round(
          (completedCount / normalizedSteps.length) * 100
        )
      : 0;

  const blockedStep = normalizedSteps.find(
    (step) =>
      step.status === "locked" ||
      step.status === "blocked"
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Registration Workflow
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Dependency Tracker
          </h2>

          <p className="mt-1 max-w-xl text-xs text-slate-500 dark:text-slate-400">
            See which registration steps are completed and
            which steps must be completed first.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Progress
          </p>

          <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {progress}%
          </p>
        </div>
      </div>

      {/* Event Info */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          Event
        </p>

        <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
          {eventName}
        </h3>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-2 text-[6px] text-slate-400">
          {completedCount} of {normalizedSteps.length} steps
          completed
        </p>
      </div>

      {/* Dependency Warning */}
      {blockedStep && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
          <Lock
            size={17}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />

          <div>
            <h4 className="text-[8px] font-bold text-amber-700 dark:text-amber-400">
              Complete the previous step first
            </h4>

            <p className="mt-1 text-[7px] leading-4 text-amber-600 dark:text-amber-500">
              <strong>{blockedStep.title}</strong> is currently
              unavailable because a prerequisite has not been
              completed.
            </p>
          </div>
        </div>
      )}

      {/* Dependency Flow */}
      <div className="mt-7">
        <div className="mb-5">
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Registration Dependencies
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Complete each prerequisite before moving to the next
            step.
          </p>
        </div>

        <div className="space-y-3">
          {normalizedSteps.map((step, index) => {
            const config =
              STATUS_CONFIG[step.status] ||
              STATUS_CONFIG.locked;

            const Icon = config.icon;

            const dependencyName = step.dependency?.title;

            return (
              <div key={step.id}>
                <div
                  className={`rounded-2xl border p-4 transition ${
                    step.status === "completed"
                      ? "border-green-200 bg-green-50/40 dark:border-green-900/30 dark:bg-green-900/10"
                      : step.status === "current"
                      ? "border-indigo-200 bg-indigo-50/40 dark:border-indigo-900/30 dark:bg-indigo-900/10"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.iconClass}`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
                          {index + 1}. {step.title}
                        </h4>

                        <span
                          className={`rounded-full px-2 py-1 text-[5px] font-bold ${config.badgeClass}`}
                        >
                          {config.label}
                        </span>
                      </div>

                      <p className="mt-2 text-[7px] leading-4 text-slate-500 dark:text-slate-400">
                        {step.description}
                      </p>

                      {dependencyName && (
                        <div className="mt-3 flex items-center gap-2">
                          {step.status === "completed" ? (
                            <Unlock
                              size={10}
                              className="text-green-600 dark:text-green-400"
                            />
                          ) : (
                            <Lock
                              size={10}
                              className="text-slate-400"
                            />
                          )}

                          <span className="text-[6px] text-slate-400">
                            Depends on:{" "}
                            <strong className="text-slate-500 dark:text-slate-300">
                              {dependencyName}
                            </strong>
                          </span>
                        </div>
                      )}

                      {step.status === "locked" && (
                        <div className="mt-3 rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                          <p className="text-[6px] font-semibold text-slate-500 dark:text-slate-400">
                            Complete{" "}
                            <strong>
                              {dependencyName || "the previous step"}
                            </strong>{" "}
                            before starting this step.
                          </p>
                        </div>
                      )}

                      {step.status === "current" && (
                        <div className="mt-3 flex items-center gap-2 rounded-xl bg-indigo-100/70 p-3 dark:bg-indigo-900/20">
                          <Circle
                            size={9}
                            className="fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400"
                          />

                          <span className="text-[6px] font-bold text-indigo-600 dark:text-indigo-400">
                            You can work on this step now.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connector */}
                {index < normalizedSteps.length - 1 && (
                  <div className="flex h-7 items-center justify-center">
                    <ArrowDown
                      size={16}
                      className="text-slate-300 dark:text-slate-600"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Workflow Summary */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          Workflow
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {normalizedSteps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center gap-2"
            >
              <span
                className={`rounded-lg px-2.5 py-1.5 text-[6px] font-bold ${
                  step.status === "completed"
                    ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                    : step.status === "current"
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                }`}
              >
                {step.title}
              </span>

              {index < normalizedSteps.length - 1 && (
                <span className="text-slate-300 dark:text-slate-600">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventRegistrationDependencyTracker;