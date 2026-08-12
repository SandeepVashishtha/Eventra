import {
  Award,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  MessageSquare,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const ParticipantActivitySummary = ({
  participants = [],
  selectedParticipantId,
  onParticipantSelect,
  className = "",
}) => {
  const [search, setSearch] = useState("");

  const filteredParticipants = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return participants;
    }

    return participants.filter((participant) => {
      return (
        participant.name?.toLowerCase().includes(query) ||
        participant.email?.toLowerCase().includes(query) ||
        participant.registrationId
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [participants, search]);

  const selectedParticipant =
    participants.find(
      (participant) =>
        participant.id === selectedParticipantId
    ) || filteredParticipants[0];

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <UserCheck size={20} />
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Participant Management
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Participant Activity Summary
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            View registration, attendance, submissions, feedback,
            and certificate eligibility in one place.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search participant by name, email, or registration ID..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* Participant List */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-800 dark:text-white">
                Participants
              </p>

              <p className="mt-1 text-[7px] text-slate-400">
                Select a participant to view activity.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[7px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              {filteredParticipants.length}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {filteredParticipants.map((participant) => {
              const active =
                selectedParticipant?.id === participant.id;

              return (
                <button
                  key={participant.id}
                  type="button"
                  onClick={() =>
                    onParticipantSelect?.(participant)
                  }
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/10"
                      : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[8px] font-black text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {getInitials(
                        participant.name
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[8px] font-bold text-slate-800 dark:text-white">
                        {participant.name ||
                          "Unknown Participant"}
                      </p>

                      <p className="mt-1 truncate text-[7px] text-slate-400">
                        {participant.email || "No email"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredParticipants.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-700">
                <p className="text-[8px] font-semibold text-slate-500">
                  No participants found.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Activity Details */}
        {selectedParticipant ? (
          <ParticipantDetails
            participant={selectedParticipant}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
};

/* --------------------------------
   Participant Details
--------------------------------- */

const ParticipantDetails = ({
  participant,
}) => {
  const registrationStatus =
    participant.registrationStatus || "pending";

  const attendance =
    participant.attendance ?? 0;

  const totalSessions =
    participant.totalSessions ?? 0;

  const sessionsAttended =
    participant.sessionsAttended ?? 0;

  const submissions =
    participant.submissions ?? 0;

  const feedbackSubmitted =
    participant.feedbackSubmitted ?? false;

  const certificateEligible =
    participant.certificateEligible ?? false;

  return (
    <div className="space-y-5">
      {/* Profile Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-sm font-black text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              {getInitials(
                participant.name
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {participant.name ||
                  "Unknown Participant"}
              </h3>

              <p className="mt-1 text-[8px] text-slate-400">
                {participant.email || "No email provided"}
              </p>

              {participant.registrationId && (
                <p className="mt-1 text-[7px] font-semibold text-slate-500 dark:text-slate-400">
                  Registration ID:{" "}
                  {participant.registrationId}
                </p>
              )}
            </div>
          </div>

          <StatusBadge
            status={registrationStatus}
          />
        </div>
      </div>

      {/* Activity Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ActivityCard
          icon={<UserCheck size={17} />}
          title="Registration"
          value={formatStatus(
            registrationStatus
          )}
          type={getStatusType(
            registrationStatus
          )}
        />

        <ActivityCard
          icon={<CalendarCheck size={17} />}
          title="Attendance"
          value={`${attendance}%`}
          type={
            attendance >= 75
              ? "success"
              : attendance >= 50
              ? "warning"
              : "danger"
          }
          progress={attendance}
        />

        <ActivityCard
          icon={<ClipboardCheck size={17} />}
          title="Sessions Attended"
          value={`${sessionsAttended}/${totalSessions}`}
          type={
            totalSessions > 0 &&
            sessionsAttended === totalSessions
              ? "success"
              : "warning"
          }
          progress={
            totalSessions
              ? Math.round(
                  (sessionsAttended /
                    totalSessions) *
                    100
                )
              : 0
          }
        />

        <ActivityCard
          icon={<FileText size={17} />}
          title="Submissions"
          value={submissions}
          type={
            submissions > 0
              ? "success"
              : "warning"
          }
        />

        <ActivityCard
          icon={<MessageSquare size={17} />}
          title="Feedback"
          value={
            feedbackSubmitted
              ? "Submitted"
              : "Not Submitted"
          }
          type={
            feedbackSubmitted
              ? "success"
              : "warning"
          }
        />

        <ActivityCard
          icon={<Award size={17} />}
          title="Certificate"
          value={
            certificateEligible
              ? "Eligible"
              : "Not Eligible"
          }
          type={
            certificateEligible
              ? "success"
              : "danger"
          }
        />
      </div>

      {/* Attendance Detail */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-800 dark:text-white">
              Attendance Overview
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              Sessions attended compared with total event sessions.
            </p>
          </div>

          <span className="text-lg font-black text-slate-800 dark:text-white">
            {attendance}%
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full ${getProgressColor(
              attendance
            )}`}
            style={{
              width: `${Math.min(
                Math.max(attendance, 0),
                100
              )}%`,
            }}
          />
        </div>

        <div className="mt-3 flex justify-between text-[7px] text-slate-400">
          <span>
            {sessionsAttended} sessions attended
          </span>

          <span>
            {totalSessions} total sessions
          </span>
        </div>
      </div>

      {/* Certificate Eligibility */}
      <CertificateStatus
        eligible={certificateEligible}
      />

      {/* Activity Timeline */}
      <ActivityTimeline
        participant={participant}
      />
    </div>
  );
};

/* --------------------------------
   Activity Card
--------------------------------- */

const ActivityCard = ({
  icon,
  title,
  value,
  type,
  progress,
}) => {
  const styles = getTypeStyles(type);

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
          {typeLabel(type)}
        </span>
      </div>

      <p className="mt-4 text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
        {value}
      </p>

      {progress !== undefined && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full ${styles.bar}`}
            style={{
              width: `${Math.min(
                Math.max(progress, 0),
                100
              )}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};

/* --------------------------------
   Certificate Status
--------------------------------- */

const CertificateStatus = ({
  eligible,
}) => {
  if (eligible) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
        <CheckCircle2
          size={19}
          className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
        />

        <div>
          <p className="text-[9px] font-bold text-green-700 dark:text-green-400">
            Certificate Eligible
          </p>

          <p className="mt-1 text-[7px] leading-4 text-green-700/70 dark:text-green-400/70">
            This participant currently meets the requirements
            for an attendance-based certificate.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/30 dark:bg-amber-900/10">
      <XCircle
        size={19}
        className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
      />

      <div>
        <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400">
          Certificate Not Eligible
        </p>

        <p className="mt-1 text-[7px] leading-4 text-amber-700/70 dark:text-amber-400/70">
          The participant has not currently met all certificate
          eligibility requirements.
        </p>
      </div>
    </div>
  );
};

/* --------------------------------
   Activity Timeline
--------------------------------- */

const ActivityTimeline = ({
  participant,
}) => {
  const activities =
    participant.activity || [];

  if (activities.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-[9px] font-bold text-slate-800 dark:text-white">
        Recent Activity
      </p>

      <div className="mt-4 space-y-4">
        {activities.map(
          (activity, index) => (
            <div
              key={
                activity.id ||
                `${activity.type}-${index}`
              }
              className="flex gap-3"
            >
              <div className="relative">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                  <CheckCircle2 size={13} />
                </div>

                {index !==
                  activities.length - 1 && (
                  <div className="absolute left-1/2 top-7 h-full w-px -translate-x-1/2 bg-slate-200 dark:bg-slate-700" />
                )}
              </div>

              <div>
                <p className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
                  {activity.title ||
                    activity.type}
                </p>

                {activity.description && (
                  <p className="mt-1 text-[7px] text-slate-400">
                    {activity.description}
                  </p>
                )}

                {activity.date && (
                  <p className="mt-1 text-[6px] text-slate-400">
                    {formatDate(
                      activity.date
                    )}
                  </p>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

/* --------------------------------
   Status Badge
--------------------------------- */

const StatusBadge = ({
  status,
}) => {
  const type =
    getStatusType(status);

  const styles =
    getTypeStyles(type);

  return (
    <span
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[7px] font-bold ${styles.badge}`}
    >
      {formatStatus(status)}
    </span>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = () => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center dark:border-slate-700 dark:bg-slate-900">
      <UserCheck
        size={28}
        className="text-slate-400"
      />

      <p className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-300">
        Select a participant
      </p>

      <p className="mt-1 max-w-xs text-[8px] leading-4 text-slate-400">
        Select a participant from the list to view their complete
        event activity.
      </p>
    </div>
  );
};

/* --------------------------------
   Helpers
--------------------------------- */

const getInitials = (name = "") => {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) =>
        word[0]?.toUpperCase()
      )
      .join("") || "P"
  );
};

const formatDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatStatus = (status) => {
  if (!status) return "Pending";

  return status
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

const getStatusType = (status) => {
  if (
    ["approved", "confirmed", "completed"].includes(
      status
    )
  ) {
    return "success";
  }

  if (
    ["pending", "waitlisted"].includes(
      status
    )
  ) {
    return "warning";
  }

  if (
    ["rejected", "cancelled", "failed"].includes(
      status
    )
  ) {
    return "danger";
  }

  return "neutral";
};

const typeLabel = (type) => {
  if (type === "success") return "Good";
  if (type === "warning") return "Attention";
  if (type === "danger") return "Critical";

  return "Info";
};

const getTypeStyles = (type) => {
  if (type === "success") {
    return {
      bg: "bg-green-50 dark:bg-green-900/10",
      text: "text-green-600 dark:text-green-400",
      badge:
        "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
      bar: "bg-green-500",
    };
  }

  if (type === "warning") {
    return {
      bg: "bg-amber-50 dark:bg-amber-900/10",
      text: "text-amber-600 dark:text-amber-400",
      badge:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
      bar: "bg-amber-500",
    };
  }

  if (type === "danger") {
    return {
      bg: "bg-red-50 dark:bg-red-900/10",
      text: "text-red-600 dark:text-red-400",
      badge:
        "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
      bar: "bg-red-500",
    };
  }

  return {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-500 dark:text-slate-400",
    badge:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    bar: "bg-slate-500",
  };
};

const getProgressColor = (attendance) => {
  if (attendance >= 75) {
    return "bg-green-500";
  }

  if (attendance >= 50) {
    return "bg-amber-500";
  }

  return "bg-red-500";
};

export default ParticipantActivitySummary;