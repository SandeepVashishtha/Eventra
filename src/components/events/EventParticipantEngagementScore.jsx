import {
  CheckCircle2,
  FileText,
  MessageSquare,
  Star,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_DATA = {
  sessionAttendance: 82,
  resourceAccess: 70,
  submissionCompletion: 90,
  feedbackParticipation: 65,
  eventInteractions: 78,
};

const EventParticipantEngagementScore = ({
  engagementData = DEFAULT_DATA,
}) => {
  const analytics = useMemo(() => {
    const values = [
      Number(engagementData.sessionAttendance || 0),
      Number(engagementData.resourceAccess || 0),
      Number(engagementData.submissionCompletion || 0),
      Number(engagementData.feedbackParticipation || 0),
      Number(engagementData.eventInteractions || 0),
    ];

    const score = Math.round(
      values.reduce((sum, value) => sum + value, 0) /
        values.length
    );

    let level = "Low";
    let description =
      "Participant engagement could be improved.";

    if (score >= 80) {
      level = "High";
      description =
        "Participant is actively engaging with the event.";
    } else if (score >= 60) {
      level = "Moderate";
      description =
        "Participant shows consistent event engagement.";
    }

    return {
      score: Math.min(Math.max(score, 0), 100),
      level,
      description,
    };
  }, [engagementData]);

  const activities = [
    {
      label: "Session Attendance",
      value: Number(
        engagementData.sessionAttendance || 0
      ),
      icon: UserCheck,
    },
    {
      label: "Resource Access",
      value: Number(
        engagementData.resourceAccess || 0
      ),
      icon: FileText,
    },
    {
      label: "Submission Completion",
      value: Number(
        engagementData.submissionCompletion || 0
      ),
      icon: CheckCircle2,
    },
    {
      label: "Feedback Participation",
      value: Number(
        engagementData.feedbackParticipation || 0
      ),
      icon: MessageSquare,
    },
    {
      label: "Event Interactions",
      value: Number(
        engagementData.eventInteractions || 0
      ),
      icon: Users,
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <TrendingUp size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Participant Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Engagement Score
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              An aggregated view of participant interaction
              across attendance, resources, submissions,
              feedback, and event activities.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-center dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <p className="text-[6px] font-bold uppercase tracking-wide text-indigo-500">
            Engagement Level
          </p>

          <p className="mt-1 text-lg font-black text-indigo-700 dark:text-indigo-300">
            {analytics.level}
          </p>
        </div>
      </div>

      {/* Main Score */}
      <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Star
                size={16}
                className="text-indigo-600 dark:text-indigo-400"
              />

              <p className="text-[7px] font-bold uppercase tracking-wide text-indigo-500">
                Overall Engagement
              </p>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-black text-indigo-700 dark:text-indigo-300">
                {analytics.score}
              </span>

              <span className="text-sm font-bold text-indigo-400">
                / 100
              </span>
            </div>

            <p className="mt-2 max-w-md text-[7px] leading-4 text-indigo-600 dark:text-indigo-400">
              {analytics.description}
            </p>
          </div>

          <div
            className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#6366f1 ${analytics.score}%, #e2e8f0 ${analytics.score}% 100%)`,
            }}
          >
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
              <span className="text-3xl font-black text-slate-800 dark:text-white">
                {analytics.score}%
              </span>

              <span className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
                Score
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={UserCheck}
          label="Attendance"
          value={`${engagementData.sessionAttendance}%`}
        />

        <MetricCard
          icon={FileText}
          label="Resources"
          value={`${engagementData.resourceAccess}%`}
        />

        <MetricCard
          icon={CheckCircle2}
          label="Submissions"
          value={`${engagementData.submissionCompletion}%`}
        />

        <MetricCard
          icon={MessageSquare}
          label="Feedback"
          value={`${engagementData.feedbackParticipation}%`}
        />
      </div>

      {/* Activity Breakdown */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div>
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Engagement Breakdown
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Aggregated activity indicators contributing to the
            overall engagement score.
          </p>
        </div>

        <div className="mt-5 space-y-5">
          {activities.map((activity) => {
            const Icon = activity.icon;

            return (
              <div key={activity.label}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                      <Icon size={14} />
                    </div>

                    <span className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
                      {activity.label}
                    </span>
                  </div>

                  <span className="text-[8px] font-black text-slate-700 dark:text-slate-300">
                    {activity.value}%
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        Math.max(activity.value, 0),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Engagement Status */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatusCard
          title="Low Engagement"
          range="0–59"
          description="Limited interaction with the event."
          active={analytics.score < 60}
        />

        <StatusCard
          title="Moderate Engagement"
          range="60–79"
          description="Consistent but improvable participation."
          active={
            analytics.score >= 60 && analytics.score < 80
          }
        />

        <StatusCard
          title="High Engagement"
          range="80–100"
          description="Strong and consistent event participation."
          active={analytics.score >= 80}
        />
      </div>

      {/* Insight */}
      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white p-2 text-green-600 dark:bg-slate-900 dark:text-green-400">
            <TrendingUp size={15} />
          </div>

          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-green-500">
              Engagement Insight
            </p>

            <h3 className="mt-1 text-[9px] font-bold text-green-800 dark:text-green-300">
              {analytics.level} participant engagement
            </h3>

            <p className="mt-2 text-[7px] leading-4 text-green-700 dark:text-green-400">
              {analytics.description} The score combines
              multiple event activities into a single summary
              without exposing unnecessary individual activity
              details.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-[6px] leading-4 text-slate-400">
          Engagement is represented as an aggregated score.
          Individual activity details should only be displayed
          where appropriate and according to the application's
          privacy and access controls.
        </p>
      </div>
    </section>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <Icon size={15} />
      </div>

      <div>
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </div>
);

const StatusCard = ({
  title,
  range,
  description,
  active,
}) => (
  <div
    className={`rounded-2xl border p-5 ${
      active
        ? "border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20"
        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
    }`}
  >
    <div className="flex items-center justify-between">
      <h3
        className={`text-[9px] font-bold ${
          active
            ? "text-indigo-700 dark:text-indigo-300"
            : "text-slate-700 dark:text-slate-300"
        }`}
      >
        {title}
      </h3>

      {active && (
        <CheckCircle2
          size={14}
          className="text-indigo-600 dark:text-indigo-400"
        />
      )}
    </div>

    <p className="mt-2 text-[7px] font-black text-slate-500 dark:text-slate-400">
      Score: {range}
    </p>

    <p className="mt-2 text-[6px] leading-4 text-slate-400">
      {description}
    </p>
  </div>
);

export default EventParticipantEngagementScore;