import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Star,
  Users,
  UserX,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_REPORT = {
  eventName: "Tech Innovation Summit 2026",
  eventDate: "August 20, 2026",

  registrations: 850,
  attended: 720,
  cancellations: 42,

  sessions: [
    {
      name: "AI & Machine Learning",
      attendance: 280,
    },
    {
      name: "Web Development",
      attendance: 245,
    },
    {
      name: "Data Science",
      attendance: 210,
    },
    {
      name: "Cybersecurity",
      attendance: 185,
    },
  ],

  feedback: {
    responses: 486,
    averageRating: 4.6,
  },

  certificates: {
    eligible: 690,
    issued: 650,
  },

  submissions: {
    total: 300,
    submitted: 268,
    pending: 32,
  },
};

const EventOrganizerEventPerformanceReport = ({
  report = DEFAULT_REPORT,
  onExport,
}) => {
  const analytics = useMemo(() => {
    const registrations = report.registrations || 0;
    const attended = report.attended || 0;
    const cancellations = report.cancellations || 0;

    const attendanceRate =
      registrations > 0
        ? (attended / registrations) * 100
        : 0;

    const noShowCount = Math.max(
      registrations - cancellations - attended,
      0
    );

    const noShowRate =
      registrations > 0
        ? (noShowCount / registrations) * 100
        : 0;

    const cancellationRate =
      registrations > 0
        ? (cancellations / registrations) * 100
        : 0;

    const certificateRate =
      report.certificates?.eligible > 0
        ? (report.certificates.issued /
            report.certificates.eligible) *
          100
        : 0;

    const submissionRate =
      report.submissions?.total > 0
        ? (report.submissions.submitted /
            report.submissions.total) *
          100
        : 0;

    return {
      attendanceRate,
      noShowCount,
      noShowRate,
      cancellationRate,
      certificateRate,
      submissionRate,
    };
  }, [report]);

  const handleExport = () => {
    if (onExport) {
      onExport(report);
      return;
    }

    const reportText = `
${report.eventName}
Event Performance Report
Date: ${report.eventDate}

Registrations: ${report.registrations}
Attendance Rate: ${analytics.attendanceRate.toFixed(1)}%
No-Show Rate: ${analytics.noShowRate.toFixed(1)}%
Cancellations: ${report.cancellations}

Feedback Responses: ${report.feedback?.responses || 0}
Average Rating: ${report.feedback?.averageRating || 0}/5

Certificates Issued:
${report.certificates?.issued || 0} / ${
      report.certificates?.eligible || 0
    }

Submissions:
${report.submissions?.submitted || 0} / ${
      report.submissions?.total || 0
    }
    `.trim();

    const blob = new Blob([reportText], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report.eventName
      .replace(/\s+/g, "-")
      .toLowerCase()}-performance-report.txt`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <BarChart3 size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Post-Event Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Event Performance Report
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Comprehensive overview of registration, attendance,
              feedback, certificates, and submissions.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[7px] font-bold text-white transition hover:bg-indigo-700"
        >
          <Download size={13} />
          Export Report
        </button>
      </div>

      {/* Event Info */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <CalendarDays
            size={17}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Event
            </p>

            <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
              {report.eventName}
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              {report.eventDate}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Users size={16} />}
          label="Registrations"
          value={report.registrations}
          description="Total registered"
        />

        <MetricCard
          icon={<CheckCircle2 size={16} />}
          label="Attendance Rate"
          value={`${analytics.attendanceRate.toFixed(1)}%`}
          description={`${report.attended} attended`}
        />

        <MetricCard
          icon={<UserX size={16} />}
          label="No-Show Rate"
          value={`${analytics.noShowRate.toFixed(1)}%`}
          description={`${analytics.noShowCount} no-shows`}
        />

        <MetricCard
          icon={<XCircle size={16} />}
          label="Cancellations"
          value={report.cancellations}
          description={`${analytics.cancellationRate.toFixed(
            1
          )}% cancellation rate`}
        />
      </div>

      {/* Attendance Overview */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          title="Attendance Overview"
          description="Registration versus actual attendance."
        >
          <ProgressRow
            label="Attended"
            value={report.attended}
            total={report.registrations}
            percentage={analytics.attendanceRate}
          />

          <ProgressRow
            label="No-Shows"
            value={analytics.noShowCount}
            total={report.registrations}
            percentage={analytics.noShowRate}
          />

          <ProgressRow
            label="Cancellations"
            value={report.cancellations}
            total={report.registrations}
            percentage={analytics.cancellationRate}
          />
        </Panel>

        {/* Feedback */}
        <Panel
          title="Participant Feedback"
          description="Summary of post-event participant feedback."
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              <Star size={25} fill="currentColor" />
            </div>

            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {report.feedback?.averageRating || 0}
                <span className="text-sm font-bold text-slate-400">
                  /5
                </span>
              </p>

              <p className="text-[7px] text-slate-400">
                Average rating
              </p>

              <p className="mt-1 text-[7px] font-semibold text-slate-600 dark:text-slate-300">
                {report.feedback?.responses || 0} responses
              </p>
            </div>
          </div>
        </Panel>
      </div>

      {/* Session Attendance */}
      <Panel
        title="Session Attendance"
        description="Attendance breakdown across event sessions."
        className="mt-6"
      >
        <div className="space-y-4">
          {report.sessions?.map((session) => {
            const percentage =
              report.attended > 0
                ? (session.attendance / report.attended) * 100
                : 0;

            return (
              <div key={session.name}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="truncate text-[7px] font-bold text-slate-700 dark:text-slate-300">
                    {session.name}
                  </span>

                  <span className="shrink-0 text-[7px] font-bold text-slate-500">
                    {session.attendance}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{
                      width: `${Math.min(
                        percentage,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Certificates + Submissions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          title="Certificates"
          description="Certificate issuance progress."
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {report.certificates?.issued || 0}
              </p>

              <p className="text-[7px] text-slate-400">
                Certificates issued
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                {analytics.certificateRate.toFixed(1)}%
              </p>

              <p className="text-[6px] text-slate-400">
                Eligibility processed
              </p>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-indigo-600"
              style={{
                width: `${Math.min(
                  analytics.certificateRate,
                  100
                )}%`,
              }}
            />
          </div>

          <p className="mt-2 text-[6px] text-slate-400">
            {report.certificates?.issued || 0} of{" "}
            {report.certificates?.eligible || 0} eligible
            participants received certificates.
          </p>
        </Panel>

        <Panel
          title="Submission Statistics"
          description="Project or assignment submission status."
        >
          <div className="grid grid-cols-3 gap-3">
            <SmallMetric
              label="Total"
              value={report.submissions?.total || 0}
            />

            <SmallMetric
              label="Submitted"
              value={report.submissions?.submitted || 0}
            />

            <SmallMetric
              label="Pending"
              value={report.submissions?.pending || 0}
            />
          </div>

          <div className="mt-4">
            <div className="flex justify-between">
              <span className="text-[6px] font-bold text-slate-500">
                Completion
              </span>

              <span className="text-[6px] font-bold text-indigo-600">
                {analytics.submissionRate.toFixed(1)}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{
                  width: `${Math.min(
                    analytics.submissionRate,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </Panel>
      </div>

      {/* Final Summary */}
      <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
        <div className="flex items-start gap-3">
          <CheckCircle2
            size={16}
            className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
          />

          <div>
            <h3 className="text-[9px] font-bold text-green-800 dark:text-green-300">
              Performance Report Ready
            </h3>

            <p className="mt-1 text-[7px] leading-relaxed text-green-700 dark:text-green-400">
              Registration, attendance, cancellations, session
              participation, feedback, certificates, and submission
              statistics have been consolidated into this report.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const MetricCard = ({
  icon,
  label,
  value,
  description,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-2">
      <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        {icon}
      </div>

      <span className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>
    </div>

    <p className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
      {value}
    </p>

    <p className="mt-1 text-[6px] text-slate-400">
      {description}
    </p>
  </div>
);

const Panel = ({
  title,
  description,
  children,
  className = "",
}) => (
  <div
    className={`rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 ${className}`}
  >
    <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
      {title}
    </h3>

    <p className="mt-1 text-[7px] text-slate-400">
      {description}
    </p>

    <div className="mt-5">{children}</div>
  </div>
);

const ProgressRow = ({
  label,
  value,
  total,
  percentage,
}) => (
  <div className="mb-5 last:mb-0">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
        {label}
      </span>

      <span className="text-[7px] font-bold text-slate-500">
        {value} · {percentage.toFixed(1)}%
      </span>
    </div>

    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <div
        className="h-full rounded-full bg-indigo-600"
        style={{
          width: `${Math.min(percentage, 100)}%`,
        }}
      />
    </div>

    <p className="mt-1 text-[5px] text-slate-400">
      Out of {total} registrations
    </p>
  </div>
);

const SmallMetric = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800">
    <p className="text-lg font-black text-slate-900 dark:text-white">
      {value}
    </p>

    <p className="mt-1 text-[5px] font-bold uppercase text-slate-400">
      {label}
    </p>
  </div>
);

export default EventOrganizerEventPerformanceReport;