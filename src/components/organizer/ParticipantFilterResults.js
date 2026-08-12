import {
  CalendarDays,
  CheckCircle2,
  Mail,
  SearchX,
  Users,
  XCircle,
} from "lucide-react";

import { useMemo } from "react";

import {
  filterParticipants,
  getParticipantDisplayName,
} from "../../utils/participantSearchUtils";

const ParticipantFilterResults = ({
  participants = [],
  filters = {},
  onParticipantClick,
  className = "",
}) => {
  const filteredParticipants =
    useMemo(() => {
      return filterParticipants(
        participants,
        filters
      );
    }, [
      participants,
      filters,
    ]);

  return (
    <section
      className={`w-full rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            Participants
          </h2>

          <p className="mt-1 text-[11px] text-slate-400">
            {filteredParticipants.length}{" "}
            {filteredParticipants.length ===
            1
              ? "participant"
              : "participants"}{" "}
            found
          </p>
        </div>

        {filters.search && (
          <div className="rounded-full bg-indigo-50 px-3 py-1.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            Search: "{filters.search}"
          </div>
        )}
      </div>

      {/* Results */}
      {filteredParticipants.length >
      0 ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredParticipants.map(
            (participant, index) => (
              <ParticipantRow
                key={
                  participant.id ||
                  participant.userId ||
                  participant.email ||
                  index
                }
                participant={
                  participant
                }
                onClick={
                  onParticipantClick
                }
              />
            )
          )}
        </div>
      ) : (
        <EmptyResults />
      )}
    </section>
  );
};

/**
 * Individual participant row.
 */
const ParticipantRow = ({
  participant,
  onClick,
}) => {
  const name =
    getParticipantDisplayName(
      participant
    );

  const email =
    participant.email ||
    participant.emailAddress ||
    "No email available";

  const team =
    participant.teamName ||
    participant.team?.name ||
    participant.team ||
    "No team";

  const category =
    participant.participantCategory ||
    participant.category ||
    "Uncategorized";

  const registrationStatus =
    normalizeStatus(
      participant.registrationStatus ||
        participant.status ||
        "unknown"
    );

  const attendanceStatus =
    normalizeStatus(
      participant.attendanceStatus ||
        participant.attendance ||
        "not-marked"
    );

  const registrationDate =
    formatDate(
      participant.registrationDate ||
        participant.registeredAt ||
        participant.createdAt
    );

  return (
    <div
      role={
        onClick
          ? "button"
          : undefined
      }
      tabIndex={
        onClick ? 0 : undefined
      }
      onClick={() =>
        onClick?.(
          participant
        )
      }
      onKeyDown={(event) => {
        if (
          onClick &&
          (event.key ===
            "Enter" ||
            event.key ===
              " ")
        ) {
          event.preventDefault();
          onClick(
            participant
          );
        }
      }}
      className={`p-4 transition ${
        onClick
          ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
          : ""
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Participant identity */}
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Avatar
            participant={
              participant
            }
            name={name}
          />

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-800 dark:text-white">
              {name}
            </h3>

            <p className="mt-1 flex items-center gap-1.5 truncate text-[11px] text-slate-400">
              <Mail
                size={12}
                className="shrink-0"
              />
              {email}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              <StatusBadge
                label={registrationStatus}
                type="registration"
              />

              <StatusBadge
                label={attendanceStatus}
                type="attendance"
              />

              <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {category}
              </span>
            </div>
          </div>
        </div>

        {/* Participant metadata */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[390px] lg:grid-cols-3">
          <InfoItem
            icon={Users}
            label="Team"
            value={team}
          />

          <InfoItem
            icon={CalendarDays}
            label="Registered"
            value={
              registrationDate ||
              "Not available"
            }
          />

          <StatusIndicator
            status={
              registrationStatus
            }
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Avatar.
 */
const Avatar = ({
  participant,
  name,
}) => {
  const image =
    participant.avatar ||
    participant.avatarUrl ||
    participant.profileImage ||
    participant.photo;

  const initials =
    getInitials(name);

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-xl object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
      {initials}
    </div>
  );
};

/**
 * Small metadata item.
 */
const InfoItem = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        <Icon size={11} />
        {label}
      </p>

      <p className="mt-1 truncate text-[11px] font-medium text-slate-700 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
};

/**
 * Registration status indicator.
 */
const StatusIndicator = ({
  status,
}) => {
  const registered =
    status === "registered";

  return (
    <div className="min-w-0">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        Registration
      </p>

      <div
        className={`mt-1 flex items-center gap-1.5 text-[11px] font-semibold ${
          registered
            ? "text-green-600 dark:text-green-400"
            : "text-amber-600 dark:text-amber-400"
        }`}
      >
        {registered ? (
          <CheckCircle2 size={13} />
        ) : (
          <XCircle size={13} />
        )}

        {formatStatus(
          status
        )}
      </div>
    </div>
  );
};

/**
 * Status badge.
 */
const StatusBadge = ({
  label,
  type,
}) => {
  const isPositive =
    type === "registration"
      ? label === "registered"
      : label === "attended";

  const isNegative =
    label ===
      "cancelled" ||
    label === "absent";

  let classes =
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  if (isPositive) {
    classes =
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400";
  }

  if (isNegative) {
    classes =
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400";
  }

  return (
    <span
      className={`rounded-full px-2 py-1 text-[9px] font-semibold ${classes}`}
    >
      {formatStatus(label)}
    </span>
  );
};

/**
 * Empty results state.
 */
const EmptyResults = () => {
  return (
    <div className="px-5 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <SearchX
          size={22}
          className="text-slate-400"
        />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">
        No participants found
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
        Try changing your search or removing
        some filters to find more participants.
      </p>
    </div>
  );
};

/**
 * Normalize status strings.
 */
const normalizeStatus = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "unknown";
  }

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
};

/**
 * Format status for display.
 */
const formatStatus = (
  value
) => {
  if (!value) {
    return "Unknown";
  }

  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

/**
 * Format registration date.
 */
const formatDate = (
  value
) => {
  if (!value) {
    return "";
  }

  const date = new Date(
    value
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
    }
  ).format(date);
};

/**
 * Generate initials.
 */
const getInitials = (
  name
) => {
  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${words[
    words.length - 1
  ][0]}`.toUpperCase();
};

export default ParticipantFilterResults;