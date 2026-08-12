import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";

const HEALTH_STATUS = {
  HEALTHY: "Healthy",
  ATTENTION: "Needs Attention",
  CRITICAL: "Critical",
};

const EventHealthIndicator = ({
  metrics,
  className = "",
}) => {
  const health = useMemo(
    () => calculateEventHealth(metrics),
    [metrics]
  );

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${health.iconBg} ${health.iconText}`}
          >
            {health.status ===
              HEALTH_STATUS.HEALTHY && (
              <CheckCircle2 size={21} />
            )}

            {health.status ===
              HEALTH_STATUS.ATTENTION && (
              <AlertTriangle size={21} />
            )}

            {health.status ===
              HEALTH_STATUS.CRITICAL && (
              <XCircle size={21} />
            )}
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Event Overview
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Event Health
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Overall status based on key event metrics.
            </p>
          </div>
        </div>

        <HealthBadge
          status={health.status}
        />
      </div>

      {/* Health Score */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
              Health Score
            </p>

            <p className="mt-1 text-4xl font-black text-slate-900 dark:text-white">
              {health.score}
              <span className="text-lg text-slate-400">
                /100
              </span>
            </p>
          </div>

          <HealthBadge
            status={health.status}
          />
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${health.barColor}`}
            style={{
              width: `${health.score}%`,
            }}
          />
        </div>

        <p className="mt-3 text-[8px] leading-4 text-slate-500 dark:text-slate-400">
          {health.summary}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          icon={<Users size={17} />}
          title="Registration Progress"
          value={`${metrics.registrations || 0}/${metrics.capacity || 0}`}
          percentage={
            metrics.capacity
              ? calculatePercentage(
                  metrics.registrations,
                  metrics.capacity
                )
              : 0
          }
          status={getMetricStatus(
            "registration",
            metrics
          )}
        />

        <MetricCard
          icon={<Users size={17} />}
          title="Capacity Utilization"
          value={`${metrics.capacityUtilization || 0}%`}
          percentage={
            metrics.capacityUtilization || 0
          }
          status={getMetricStatus(
            "capacity",
            metrics
          )}
        />

        <MetricCard
          icon={<CheckCircle2 size={17} />}
          title="Attendance"
          value={`${metrics.attendance || 0}%`}
          percentage={
            metrics.attendance || 0
          }
          status={getMetricStatus(
            "attendance",
            metrics
          )}
        />

        <MetricCard
          icon={<Clock size={17} />}
          title="Pending Tasks"
          value={`${metrics.pendingTasks || 0}`}
          percentage={null}
          status={getMetricStatus(
            "tasks",
            metrics
          )}
        />

        <MetricCard
          icon={<MessageSquare size={17} />}
          title="Participant Feedback"
          value={`${metrics.feedback || 0}%`}
          percentage={
            metrics.feedback || 0
          }
          status={getMetricStatus(
            "feedback",
            metrics
          )}
        />

        <MetricCard
          icon={<Clock size={17} />}
          title="Upcoming Deadlines"
          value={`${metrics.upcomingDeadlines || 0}`}
          percentage={null}
          status={getMetricStatus(
            "deadlines",
            metrics
          )}
        />
      </div>

      {/* Attention Breakdown */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold text-slate-800 dark:text-white">
              Health Breakdown
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              Areas that require organizer attention.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-[7px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {health.issues.length} issue
            {health.issues.length !== 1
              ? "s"
              : ""}
          </span>
        </div>

        {health.issues.length === 0 ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
            <CheckCircle2
              size={17}
              className="text-green-600 dark:text-green-400"
            />

            <div>
              <p className="text-[8px] font-bold text-green-700 dark:text-green-400">
                Everything looks good
              </p>

              <p className="mt-1 text-[7px] text-green-700/70 dark:text-green-400/70">
                No immediate event-management issues were
                detected.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {health.issues.map(
              (issue, index) => (
                <IssueRow
                  key={`${issue.title}-${index}`}
                  issue={issue}
                />
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
};

/* -----------------------------
   Health Calculation
------------------------------ */

const calculateEventHealth = (
  metrics
) => {
  const scores = [];

  const issues = [];

  /*
   * Registration progress
   */
  const registrationPercentage =
    metrics.capacity > 0
      ? calculatePercentage(
          metrics.registrations,
          metrics.capacity
        )
      : 0;

  let registrationScore = 100;

  if (
    registrationPercentage < 25
  ) {
    registrationScore = 55;

    issues.push({
      title:
        "Low registration progress",
      description:
        "Registration numbers are significantly below event capacity.",
      severity: "attention",
    });
  } else if (
    registrationPercentage < 50
  ) {
    registrationScore = 75;

    issues.push({
      title:
        "Registration needs attention",
      description:
        "Consider increasing event promotion to improve registrations.",
      severity: "attention",
    });
  }

  scores.push(registrationScore);

  /*
   * Capacity
   */
  const capacity =
    metrics.capacityUtilization || 0;

  let capacityScore = 100;

  if (capacity >= 100) {
    capacityScore = 65;

    issues.push({
      title:
        "Event capacity reached",
      description:
        "Registration capacity has been reached.",
      severity: "critical",
    });
  } else if (capacity >= 90) {
    capacityScore = 80;

    issues.push({
      title:
        "Capacity is nearly full",
      description:
        "Consider preparing for increased participant volume.",
      severity: "attention",
    });
  }

  scores.push(capacityScore);

  /*
   * Attendance
   */
  const attendance =
    metrics.attendance || 0;

  let attendanceScore = 100;

  if (
    metrics.eventStarted &&
    attendance < 50
  ) {
    attendanceScore = 55;

    issues.push({
      title:
        "Low attendance",
      description:
        "Attendance is significantly below registered participation.",
      severity: "critical",
    });
  } else if (
    metrics.eventStarted &&
    attendance < 75
  ) {
    attendanceScore = 75;

    issues.push({
      title:
        "Attendance needs attention",
      description:
        "Attendance is lower than expected.",
      severity: "attention",
    });
  }

  scores.push(attendanceScore);

  /*
   * Pending tasks
   */
  const pendingTasks =
    metrics.pendingTasks || 0;

  let taskScore = 100;

  if (pendingTasks >= 10) {
    taskScore = 50;

    issues.push({
      title:
        "Many tasks are pending",
      description:
        `${pendingTasks} event-management tasks are still incomplete.`,
      severity: "critical",
    });
  } else if (pendingTasks >= 5) {
    taskScore = 75;

    issues.push({
      title:
        "Several tasks are pending",
      description:
        `${pendingTasks} tasks still need attention.`,
      severity: "attention",
    });
  }

  scores.push(taskScore);

  /*
   * Feedback
   */
  const feedback =
    metrics.feedback || 0;

  let feedbackScore = 100;

  if (
    metrics.feedbackTarget &&
    feedback <
      metrics.feedbackTarget
  ) {
    feedbackScore = 75;

    issues.push({
      title:
        "Participant feedback is low",
      description:
        "Feedback collection is below the configured target.",
      severity: "attention",
    });
  }

  scores.push(feedbackScore);

  /*
   * Deadlines
   */
  const deadlines =
    metrics.upcomingDeadlines || 0;

  let deadlineScore = 100;

  if (deadlines >= 5) {
    deadlineScore = 55;

    issues.push({
      title:
        "Multiple deadlines approaching",
      description:
        `${deadlines} upcoming deadlines require organizer attention.`,
      severity: "critical",
    });
  } else if (deadlines >= 3) {
    deadlineScore = 75;

    issues.push({
      title:
        "Upcoming deadlines",
      description:
        `${deadlines} deadlines are approaching.`,
      severity: "attention",
    });
  }

  scores.push(deadlineScore);

  /*
   * Final score
   */
  const score = Math.round(
    scores.reduce(
      (total, value) =>
        total + value,
      0
    ) / scores.length
  );

  let status =
    HEALTH_STATUS.HEALTHY;

  if (
    issues.some(
      (issue) =>
        issue.severity === "critical"
    ) ||
    score < 50
  ) {
    status =
      HEALTH_STATUS.CRITICAL;
  } else if (
    issues.length > 0 ||
    score < 80
  ) {
    status =
      HEALTH_STATUS.ATTENTION;
  }

  return {
    score,
    status,
    issues,
    summary:
      status ===
      HEALTH_STATUS.HEALTHY
        ? "Your event is progressing normally across the monitored areas."
        : status ===
          HEALTH_STATUS.ATTENTION
        ? "Some event areas require attention to keep the event on track."
        : "Critical event issues require immediate organizer attention.",
    ...getHealthStyles(status),
  };
};

/* -----------------------------
   Metric Status
------------------------------ */

const getMetricStatus = (
  type,
  metrics
) => {
  switch (type) {
    case "registration": {
      const percentage =
        metrics.capacity > 0
          ? calculatePercentage(
              metrics.registrations,
              metrics.capacity
            )
          : 0;

      if (percentage < 25) {
        return "critical";
      }

      if (percentage < 50) {
        return "attention";
      }

      return "healthy";
    }

    case "capacity": {
      const value =
        metrics.capacityUtilization ||
        0;

      if (value >= 100) {
        return "critical";
      }

      if (value >= 90) {
        return "attention";
      }

      return "healthy";
    }

    case "attendance": {
      const value =
        metrics.attendance || 0;

      if (
        metrics.eventStarted &&
        value < 50
      ) {
        return "critical";
      }

      if (
        metrics.eventStarted &&
        value < 75
      ) {
        return "attention";
      }

      return "healthy";
    }

    case "tasks": {
      const value =
        metrics.pendingTasks || 0;

      if (value >= 10) {
        return "critical";
      }

      if (value >= 5) {
        return "attention";
      }

      return "healthy";
    }

    case "feedback": {
      if (
        metrics.feedbackTarget &&
        (metrics.feedback || 0) <
          metrics.feedbackTarget
      ) {
        return "attention";
      }

      return "healthy";
    }

    case "deadlines": {
      const value =
        metrics.upcomingDeadlines ||
        0;

      if (value >= 5) {
        return "critical";
      }

      if (value >= 3) {
        return "attention";
      }

      return "healthy";
    }

    default:
      return "healthy";
  }
};

/* -----------------------------
   Components
------------------------------ */

const MetricCard = ({
  icon,
  title,
  value,
  percentage,
  status,
}) => {
  const styles =
    getMetricStyles(status);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles.bg} ${styles.text}`}
        >
          {icon}
        </div>

        <span
          className={`rounded-full px-2 py-1 text-[6px] font-bold ${styles.badge}`}
        >
          {statusLabel(status)}
        </span>
      </div>

      <p className="mt-4 text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
        {value}
      </p>

      {percentage !== null && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full ${styles.bar}`}
            style={{
              width: `${Math.min(
                Math.max(
                  percentage,
                  0
                ),
                100
              )}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};

const HealthBadge = ({
  status,
}) => {
  const styles =
    getHealthStyles(status);

  return (
    <span
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[7px] font-bold ${styles.badge}`}
    >
      {status}
    </span>
  );
};

const IssueRow = ({
  issue,
}) => {
  const critical =
    issue.severity ===
    "critical";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-3 ${
        critical
          ? "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10"
          : "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10"
      }`}
    >
      {critical ? (
        <XCircle
          size={15}
          className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
        />
      ) : (
        <AlertTriangle
          size={15}
          className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
        />
      )}

      <div>
        <p
          className={`text-[8px] font-bold ${
            critical
              ? "text-red-700 dark:text-red-400"
              : "text-amber-700 dark:text-amber-400"
          }`}
        >
          {issue.title}
        </p>

        <p className="mt-1 text-[7px] leading-4 text-slate-500 dark:text-slate-400">
          {issue.description}
        </p>
      </div>
    </div>
  );
};

/* -----------------------------
   Helpers
------------------------------ */

const calculatePercentage = (
  value,
  total
) => {
  if (!total) return 0;

  return Math.round(
    (value / total) * 100
  );
};

const statusLabel = (
  status
) => {
  if (status === "healthy") {
    return "Healthy";
  }

  if (status === "attention") {
    return "Attention";
  }

  return "Critical";
};

const getHealthStyles = (
  status
) => {
  if (
    status ===
    HEALTH_STATUS.HEALTHY
  ) {
    return {
      iconBg:
        "bg-green-50 dark:bg-green-900/10",
      iconText:
        "text-green-600 dark:text-green-400",
      badge:
        "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
      barColor:
        "bg-green-500",
    };
  }

  if (
    status ===
    HEALTH_STATUS.ATTENTION
  ) {
    return {
      iconBg:
        "bg-amber-50 dark:bg-amber-900/10",
      iconText:
        "text-amber-600 dark:text-amber-400",
      badge:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
      barColor:
        "bg-amber-500",
    };
  }

  return {
    iconBg:
      "bg-red-50 dark:bg-red-900/10",
    iconText:
      "text-red-600 dark:text-red-400",
    badge:
      "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
    barColor:
      "bg-red-500",
  };
};

const getMetricStyles = (
  status
) => {
  if (status === "healthy") {
    return {
      bg:
        "bg-green-50 dark:bg-green-900/10",
      text:
        "text-green-600 dark:text-green-400",
      badge:
        "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
      bar:
        "bg-green-500",
    };
  }

  if (status === "attention") {
    return {
      bg:
        "bg-amber-50 dark:bg-amber-900/10",
      text:
        "text-amber-600 dark:text-amber-400",
      badge:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
      bar:
        "bg-amber-500",
    };
  }

  return {
    bg:
      "bg-red-50 dark:bg-red-900/10",
    text:
      "text-red-600 dark:text-red-400",
    badge:
      "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
    bar:
      "bg-red-500",
  };
};

export default EventHealthIndicator;