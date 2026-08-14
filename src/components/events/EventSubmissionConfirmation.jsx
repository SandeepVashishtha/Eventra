import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Hash,
  Users,
} from "lucide-react";
import { useRef } from "react";

const EventSubmissionConfirmation = ({
  submission = {
    id: "SUB-2026-00124",
    teamName: "Code Warriors",
    submittedAt: "August 13, 2026 at 10:42 AM",
    status: "Submitted",
    deadlineStatus: "On Time",
    files: [
      {
        name: "project-report.pdf",
        type: "PDF",
      },
      {
        name: "source-code.zip",
        type: "ZIP",
      },
    ],
    links: [
      {
        label: "GitHub Repository",
        url: "https://github.com/example/project",
      },
    ],
  },
}) => {
  const isOnTime =
    submission.deadlineStatus.toLowerCase() === "on time";

  const detailsRef = useRef(null);

  const scrollToDetails = () => {
    detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-950">
      {/* Success Header */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
          <CheckCircle2
            size={36}
            className="text-green-600 dark:text-green-400"
          />
        </div>

        <h1 className="mt-5 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
          Submission Successful
        </h1>

        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
          Your project has been successfully recorded. Keep this
          submission ID for future reference.
        </p>
      </div>

      {/* Submission ID */}
      <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-900/10">
        <div className="flex items-center gap-3" ref={detailsRef}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400">
            <Hash size={18} />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-500">
              Submission ID
            </p>

            <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">
              {submission.id}
            </p>
          </div>
        </div>
      </div>

      {/* Submission Details */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <InfoCard
          icon={<Users size={17} />}
          label="Team"
          value={submission.teamName}
        />

        <InfoCard
          icon={<Clock3 size={17} />}
          label="Submitted"
          value={submission.submittedAt}
        />

        <InfoCard
          icon={<CheckCircle2 size={17} />}
          label="Status"
          value={submission.status}
          valueClass="text-green-600 dark:text-green-400"
        />

        <InfoCard
          icon={<Clock3 size={17} />}
          label="Deadline Status"
          value={submission.deadlineStatus}
          valueClass={
            isOnTime
              ? "text-green-600 dark:text-green-400"
              : "text-amber-600 dark:text-amber-400"
          }
        />
      </div>

      {/* Submitted Files */}
      <div className="mt-8">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Submitted Files
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Files included with this submission.
          </p>
        </div>

        <div className="space-y-2">
          {submission.files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-500 dark:bg-slate-800">
                  <FileText size={16} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {file.name}
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {file.type}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submitted Links */}
      {submission.links?.length > 0 && (
        <div className="mt-8">
          <div className="mb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Submitted Links
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Links included with your submission.
            </p>
          </div>

          <div className="space-y-2">
            {submission.links.map((link, index) => (
              <a
                key={`${link.url}-${index}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/10"
              >
                <span className="truncate text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {link.label}
                </span>

                <ExternalLink
                  size={15}
                  className="ml-3 shrink-0 text-slate-400"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* View Submission */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={scrollToDetails}
          className="flex-1 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
        >
          View Submitted Information
        </button>

        <button
          type="button"
          onClick={() =>
            window.print()
          }
          className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Print Confirmation
        </button>
      </div>

      {/* Footer */}
      <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-900">
        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          Your submission has been recorded successfully.
          Avoid submitting the same project again unless the
          organizer allows resubmissions.
        </p>
      </div>
    </section>
  );
};

const InfoCard = ({
  icon,
  label,
  value,
  valueClass = "",
}) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center gap-2 text-slate-400">
      {icon}

      <span className="text-[10px] font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>

    <p
      className={`mt-2 text-xs font-bold text-slate-800 dark:text-slate-200 ${valueClass}`}
    >
      {value}
    </p>
  </div>
);

export default EventSubmissionConfirmation;