import React, { useMemo } from "react";

interface TimelineStage {
  id: string;
  title: string;
  date: string;
  description?: string;
  optional?: boolean;
}

interface EventStatusTimelineProps {
  stages?: TimelineStage[];
  eventName?: string;
}

const EventStatusTimeline: React.FC<
  EventStatusTimelineProps
> = ({
  stages = [],
  eventName = "Event",
}) => {
  const now = new Date();

  /*
   * Sort stages according to their actual dates.
   */
  const sortedStages = useMemo(() => {
    return [...stages].sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );
  }, [stages]);

  /*
   * Determine stage status.
   */
  const getStageStatus = (
    date: string
  ): "completed" | "current" | "upcoming" => {
    const stageDate = new Date(date);

    if (stageDate.getTime() < now.getTime()) {
      return "completed";
    }

    const previousStage =
      sortedStages.findIndex(
        (stage) => stage.date === date
      );

    const previous =
      sortedStages[previousStage - 1];

    if (
      previous &&
      new Date(previous.date).getTime() <
        now.getTime()
    ) {
      return "current";
    }

    return "upcoming";
  };

  /*
   * Format date.
   */
  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
   * Format time.
   */
  const formatTime = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  /*
   * Get stage icon.
   */
  const getStageIcon = (title: string) => {
    const value = title.toLowerCase();

    if (value.includes("registration")) {
      return "📝";
    }

    if (value.includes("submission")) {
      return "📤";
    }

    if (value.includes("deadline")) {
      return "⏰";
    }

    if (value.includes("judging")) {
      return "⚖️";
    }

    if (value.includes("start")) {
      return "🚀";
    }

    if (value.includes("end")) {
      return "🏁";
    }

    if (value.includes("completed")) {
      return "✓";
    }

    return "📅";
  };

  /*
   * Empty state.
   */
  if (sortedStages.length === 0) {
    return (
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl dark:bg-gray-800">
            📅
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Event Timeline
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Timeline information is not available for
              this event yet.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const completedCount = sortedStages.filter(
    (stage) =>
      getStageStatus(stage.date) === "completed"
  ).length;

  const progress =
    sortedStages.length > 0
      ? Math.round(
          (completedCount /
            sortedStages.length) *
            100
        )
      : 0;

  return (
    <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
            🗓️
          </div>

          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Event Progress
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              Event Status Timeline
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Important stages for {eventName}.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Progress
          </p>

          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            {progress}%
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-8">
        <div className="space-y-0">
          {sortedStages.map(
            (stage, index) => {
              const status = getStageStatus(
                stage.date
              );

              const isLast =
                index ===
                sortedStages.length - 1;

              return (
                <div
                  key={stage.id}
                  className="relative flex gap-4"
                >
                  {/* Timeline line */}
                  {!isLast && (
                    <div
                      className={`absolute left-5 top-12 h-[calc(100%-12px)] w-0.5 ${
                        status === "completed"
                          ? "bg-green-500"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}

                  {/* Timeline icon */}
                  <div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                      status === "completed"
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : status === "current"
                        ? "bg-blue-100 text-blue-700 ring-4 ring-blue-50 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-950"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {status === "completed"
                      ? "✓"
                      : getStageIcon(stage.title)}
                  </div>

                  {/* Content */}
                  <div
                    className={`mb-6 flex-1 rounded-xl border p-4 ${
                      status === "current"
                        ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
                        : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`font-semibold ${
                              status === "current"
                                ? "text-blue-900 dark:text-blue-200"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {stage.title}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              status ===
                              "completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                                : status ===
                                  "current"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {status ===
                            "completed"
                              ? "Completed"
                              : status ===
                                "current"
                              ? "Current"
                              : "Upcoming"}
                          </span>
                        </div>

                        {stage.description && (
                          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                            {stage.description}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {formatDate(
                            stage.date
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {formatTime(
                            stage.date
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 pt-5 dark:border-gray-700">
        <div className="flex flex-wrap gap-5 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-gray-500 dark:text-gray-400">
              Completed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-gray-500 dark:text-gray-400">
              Current
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span className="text-gray-500 dark:text-gray-400">
              Upcoming
            </span>
          </div>
        </div>
      </div>

      {/* Information notice */}
      <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <span className="text-lg">ℹ️</span>

          <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
            Timeline stages are based on the dates provided
            for this event. Stages without timeline data are
            not displayed.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EventStatusTimeline;