import {
  Bell,
  CheckCircle2,
  Eye,
  Loader2,
  Mail,
  RefreshCw,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const AnnouncementReadStatus = ({
  announcement,
  recipients = [],
  onSendReminder,
  className = "",
}) => {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const total = recipients.length;

    const viewed = recipients.filter(
      (participant) => participant.viewed === true
    ).length;

    const notViewed = total - viewed;

    const viewPercentage =
      total === 0
        ? 0
        : Math.round((viewed / total) * 100);

    return {
      total,
      viewed,
      notViewed,
      viewPercentage,
    };
  }, [recipients]);

  const handleReminder = async () => {
    if (stats.notViewed === 0) {
      setMessage(
        "All participants have already viewed this announcement."
      );
      setError("");
      return;
    }

    setIsSending(true);
    setMessage("");
    setError("");

    try {
      if (onSendReminder) {
        await onSendReminder(
          recipients.filter(
            (participant) =>
              participant.viewed !== true
          )
        );
      }

      setMessage(
        `Reminder sent to ${stats.notViewed} participant${
          stats.notViewed === 1 ? "" : "s"
        }.`
      );
    } catch (err) {
      setError(
        err?.message ||
          "Failed to send reminder."
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Bell size={20} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Announcement Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Announcement Read Status
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Track which participants have viewed this
              announcement.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-indigo-50 px-4 py-3 dark:bg-indigo-900/10">
          <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
            View Rate
          </p>

          <p className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {stats.viewPercentage}%
          </p>
        </div>
      </div>

      {/* Announcement */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <Mail
            size={17}
            className="mt-0.5 shrink-0 text-indigo-500"
          />

          <div className="min-w-0">
            <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
              Announcement
            </p>

            <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
              {announcement?.title ||
                "Important Event Announcement"}
            </h3>

            {announcement?.message && (
              <p className="mt-2 text-[8px] leading-5 text-slate-500 dark:text-slate-400">
                {announcement.message}
              </p>
            )}

            {announcement?.createdAt && (
              <p className="mt-3 text-[7px] text-slate-400">
                Sent{" "}
                {formatDate(
                  announcement.createdAt
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Users size={15} />}
          label="Total Recipients"
          value={stats.total}
          className="text-indigo-600 dark:text-indigo-400"
        />

        <StatCard
          icon={<Eye size={15} />}
          label="Viewed"
          value={stats.viewed}
          className="text-green-600 dark:text-green-400"
        />

        <StatCard
          icon={<Bell size={15} />}
          label="Not Viewed"
          value={stats.notViewed}
          className="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Progress */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[8px] font-bold text-slate-800 dark:text-white">
              Announcement reach
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              {stats.viewed} of {stats.total} participants
              have viewed this announcement.
            </p>
          </div>

          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {stats.viewPercentage}%
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${stats.viewPercentage}%`,
            }}
          />
        </div>
      </div>

      {/* Participant list */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-800 dark:text-white">
              Participant Status
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              View status for each recipient.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {recipients.length === 0 ? (
            <EmptyState />
          ) : (
            recipients.map(
              (participant, index) => (
                <ParticipantRow
                  key={
                    participant.id ||
                    participant.registrationId ||
                    index
                  }
                  participant={
                    participant
                  }
                />
              )
            )
          )}
        </div>
      </div>

      {/* Reminder */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <RefreshCw
              size={16}
              className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
            />

            <div>
              <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400">
                Remind Unviewed Participants
              </p>

              <p className="mt-1 text-[7px] leading-4 text-amber-700/70 dark:text-amber-400/70">
                Send a reminder only to participants who
                have not viewed this announcement.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={
              isSending ||
              stats.notViewed === 0
            }
            onClick={handleReminder}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-[8px] font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? (
              <Loader2
                size={13}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={13} />
            )}

            {isSending
              ? "Sending..."
              : `Remind ${stats.notViewed}`}
          </button>
        </div>
      </div>

      {/* Result */}
      {message && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-green-600 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400">
          <CheckCircle2 size={14} />

          <p className="text-[8px] font-semibold">
            {message}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-[8px] font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}
    </section>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  className,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 ${className}`}
    >
      {icon}
    </div>

    <p className="mt-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

const ParticipantRow = ({
  participant,
}) => {
  const viewed =
    participant.viewed === true;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[8px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        {getInitials(
          participant.name ||
            participant.email ||
            "P"
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[8px] font-bold text-slate-800 dark:text-white">
          {participant.name ||
            "Participant"}
        </p>

        {participant.email && (
          <p className="mt-1 truncate text-[7px] text-slate-400">
            {participant.email}
          </p>
        )}
      </div>

      <div
        className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 ${
          viewed
            ? "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400"
            : "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400"
        }`}
      >
        {viewed ? (
          <CheckCircle2 size={11} />
        ) : (
          <Bell size={11} />
        )}

        <span className="text-[7px] font-bold">
          {viewed
            ? "Viewed"
            : "Not Viewed"}
        </span>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
    <Users
      size={22}
      className="mx-auto text-slate-400"
    />

    <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-200">
      No recipients found
    </p>

    <p className="mt-1 text-[7px] text-slate-400">
      Recipients will appear here once the announcement
      has been sent.
    </p>
  </div>
);

const getInitials = (
  value
) => {
  return String(value)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
};

const formatDate = (
  value
) => {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
};

export default AnnouncementReadStatus;