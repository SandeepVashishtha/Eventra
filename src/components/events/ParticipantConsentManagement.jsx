import {
  CheckCircle2,
  Clock3,
  Info,
  Lock,
  Save,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_CONSENT_OPTIONS = [
  {
    id: "photography",
    title: "Photography Consent",
    description:
      "Allow event organizers to use photographs containing the participant.",
    required: false,
  },
  {
    id: "recording",
    title: "Video Recording Consent",
    description:
      "Allow the participant to appear in event session recordings.",
    required: false,
  },
  {
    id: "promotional",
    title: "Promotional Content Consent",
    description:
      "Allow approved event photographs or recordings to be used in promotional content.",
    required: false,
  },
  {
    id: "communication",
    title: "Communication Consent",
    description:
      "Allow organizers to send event-related communications and updates.",
    required: true,
  },
];

const DEFAULT_PARTICIPANTS = [
  {
    id: "participant-1",
    name: "Rahul Sharma",
    email: "rahul@example.com",
    consents: {
      photography: {
        status: "accepted",
        timestamp: "2026-08-10T10:30:00",
      },
      recording: {
        status: "accepted",
        timestamp: "2026-08-10T10:31:00",
      },
      promotional: {
        status: "declined",
        timestamp: "2026-08-10T10:32:00",
      },
      communication: {
        status: "accepted",
        timestamp: "2026-08-10T10:33:00",
      },
    },
  },
  {
    id: "participant-2",
    name: "Priya Patel",
    email: "priya@example.com",
    consents: {
      photography: {
        status: "accepted",
        timestamp: "2026-08-11T09:15:00",
      },
      recording: {
        status: "pending",
        timestamp: null,
      },
      promotional: {
        status: "pending",
        timestamp: null,
      },
      communication: {
        status: "accepted",
        timestamp: "2026-08-11T09:16:00",
      },
    },
  },
];

const formatDate = (value) => {
  if (!value) return "Not recorded";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ParticipantConsentManagement = ({
  participants = DEFAULT_PARTICIPANTS,
  initialConsentOptions = DEFAULT_CONSENT_OPTIONS,
  isOrganizer = false,
  onSaveConsent,
  onSaveConsentOptions,
}) => {
  const [consentOptions, setConsentOptions] =
    useState(initialConsentOptions);

  const [participantList, setParticipantList] =
    useState(participants);

  const [selectedParticipantId, setSelectedParticipantId] =
    useState(
      participants[0]?.id || null
    );

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [showSettings, setShowSettings] =
    useState(false);

  const selectedParticipant =
    participantList.find(
      (participant) =>
        participant.id ===
        selectedParticipantId
    );

  const filteredParticipants = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return participantList.filter(
      (participant) => {
        const matchesSearch =
          !query ||
          participant.name
            ?.toLowerCase()
            .includes(query) ||
          participant.email
            ?.toLowerCase()
            .includes(query);

        if (!matchesSearch) {
          return false;
        }

        if (statusFilter === "all") {
          return true;
        }

        const statuses =
          consentOptions.map(
            (option) =>
              participant.consents?.[
                option.id
              ]?.status || "pending"
          );

        if (statusFilter === "accepted") {
          return statuses.every(
            (status) =>
              status === "accepted"
          );
        }

        if (statusFilter === "declined") {
          return statuses.some(
            (status) =>
              status === "declined"
          );
        }

        if (statusFilter === "pending") {
          return statuses.some(
            (status) =>
              status === "pending"
          );
        }

        return true;
      }
    );
  }, [
    participantList,
    search,
    statusFilter,
    consentOptions,
  ]);

  const statistics = useMemo(() => {
    let accepted = 0;
    let declined = 0;
    let pending = 0;

    participantList.forEach(
      (participant) => {
        consentOptions.forEach(
          (option) => {
            const status =
              participant.consents?.[
                option.id
              ]?.status || "pending";

            if (status === "accepted") {
              accepted += 1;
            }

            if (status === "declined") {
              declined += 1;
            }

            if (status === "pending") {
              pending += 1;
            }
          }
        );
      }
    );

    return {
      accepted,
      declined,
      pending,
    };
  }, [
    participantList,
    consentOptions,
  ]);

  const updateParticipantConsent = async (
    participantId,
    consentId,
    status
  ) => {
    const timestamp =
      new Date().toISOString();

    let updatedParticipant;

    setParticipantList((current) =>
      current.map((participant) => {
        if (
          participant.id !==
          participantId
        ) {
          return participant;
        }

        updatedParticipant = {
          ...participant,
          consents: {
            ...participant.consents,
            [consentId]: {
              status,
              timestamp,
            },
          },
        };

        return updatedParticipant;
      })
    );

    if (updatedParticipant) {
      await onSaveConsent?.(
        updatedParticipant,
        consentId,
        status
      );
    }
  };

  const saveConsentSettings = async () => {
    setSaving(true);

    try {
      await onSaveConsentOptions?.(
        consentOptions
      );

      setShowSettings(false);
    } finally {
      setSaving(false);
    }
  };

  const updateConsentOption = (
    optionId,
    key,
    value
  ) => {
    setConsentOptions((current) =>
      current.map((option) =>
        option.id === optionId
          ? {
              ...option,
              [key]: value,
            }
          : option
      )
    );
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <ShieldCheck size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Participant Permissions
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Consent Management
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Collect, review, and manage participant consent
              for event-specific activities.
            </p>
          </div>
        </div>

        {isOrganizer && (
          <button
            type="button"
            onClick={() =>
              setShowSettings(
                (value) => !value
              )
            }
            className="rounded-xl bg-indigo-600 px-4 py-3 text-[8px] font-bold text-white hover:bg-indigo-700"
          >
            {showSettings
              ? "Close Settings"
              : "Consent Settings"}
          </button>
        )}
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Participants"
          value={participantList.length}
          icon={Users}
        />

        <StatCard
          label="Accepted"
          value={statistics.accepted}
          icon={CheckCircle2}
          type="success"
        />

        <StatCard
          label="Declined"
          value={statistics.declined}
          icon={XCircle}
          type="danger"
        />

        <StatCard
          label="Pending"
          value={statistics.pending}
          icon={Clock3}
          type="warning"
        />
      </div>

      {/* Consent Settings */}
      {showSettings &&
        isOrganizer && (
          <ConsentSettings
            options={consentOptions}
            onUpdate={
              updateConsentOption
            }
            onSave={
              saveConsentSettings
            }
            saving={saving}
          />
        )}

      {/* Main Content */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* Participant List */}
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Participants
            </h3>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search participants..."
              className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[8px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[8px] outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="all">
                All Participants
              </option>

              <option value="accepted">
                All Consents Accepted
              </option>

              <option value="pending">
                Has Pending Consent
              </option>

              <option value="declined">
                Has Declined Consent
              </option>
            </select>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {filteredParticipants.length ===
            0 ? (
              <EmptyParticipants />
            ) : (
              filteredParticipants.map(
                (participant) => (
                  <ParticipantListItem
                    key={participant.id}
                    participant={
                      participant
                    }
                    options={
                      consentOptions
                    }
                    selected={
                      participant.id ===
                      selectedParticipantId
                    }
                    onClick={() =>
                      setSelectedParticipantId(
                        participant.id
                      )
                    }
                  />
                )
              )
            )}
          </div>
        </div>

        {/* Consent Details */}
        <div>
          {selectedParticipant ? (
            <ParticipantConsentDetails
              participant={
                selectedParticipant
              }
              options={
                consentOptions
              }
              isOrganizer={
                isOrganizer
              }
              onUpdate={
                updateParticipantConsent
              }
            />
          ) : (
            <EmptySelection />
          )}
        </div>
      </div>
    </section>
  );
};

/* --------------------------------
   Participant List Item
--------------------------------- */

const ParticipantListItem = ({
  participant,
  options,
  selected,
  onClick,
}) => {
  const statuses = options.map(
    (option) =>
      participant.consents?.[
        option.id
      ]?.status || "pending"
  );

  const hasDeclined =
    statuses.includes("declined");

  const hasPending =
    statuses.includes("pending");

  const allAccepted =
    statuses.length > 0 &&
    statuses.every(
      (status) =>
        status === "accepted"
    );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full border-b border-slate-100 p-4 text-left last:border-0 dark:border-slate-800 ${
        selected
          ? "bg-indigo-50 dark:bg-indigo-900/10"
          : "hover:bg-slate-50 dark:hover:bg-slate-950"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-black text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          {participant.name
            ?.split(" ")
            .map(
              (name) =>
                name[0]
            )
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[8px] font-bold text-slate-800 dark:text-white">
            {participant.name}
          </p>

          <p className="mt-1 truncate text-[6px] text-slate-400">
            {participant.email}
          </p>
        </div>

        <ConsentIndicator
          allAccepted={
            allAccepted
          }
          hasDeclined={
            hasDeclined
          }
          hasPending={hasPending}
        />
      </div>
    </button>
  );
};

/* --------------------------------
   Participant Details
--------------------------------- */

const ParticipantConsentDetails = ({
  participant,
  options,
  isOrganizer,
  onUpdate,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      {/* Participant Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            {participant.name
              ?.split(" ")
              .map(
                (name) =>
                  name[0]
              )
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {participant.name}
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              {participant.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-950">
          <Lock
            size={12}
            className="text-slate-400"
          />

          <span className="text-[6px] font-semibold text-slate-500 dark:text-slate-400">
            Consent records are timestamped
          </span>
        </div>
      </div>

      {/* Consent Cards */}
      <div className="mt-6 space-y-3">
        {options.map((option) => {
          const consent =
            participant.consents?.[
              option.id
            ] || {
              status: "pending",
              timestamp: null,
            };

          return (
            <ConsentCard
              key={option.id}
              option={option}
              consent={consent}
              isOrganizer={
                isOrganizer
              }
              participantId={
                participant.id
              }
              onUpdate={
                onUpdate
              }
            />
          );
        })}
      </div>

      {/* Privacy Notice */}
      <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
        <Info
          size={14}
          className="mt-0.5 shrink-0 text-indigo-500"
        />

        <p className="text-[7px] leading-4 text-slate-500 dark:text-slate-400">
          Consent status and timestamps are retained as
          part of the event consent record. Participants
          can review their current choices.
        </p>
      </div>
    </div>
  );
};

/* --------------------------------
   Consent Card
--------------------------------- */

const ConsentCard = ({
  option,
  consent,
  isOrganizer,
  participantId,
  onUpdate,
}) => {
  const accepted =
    consent.status === "accepted";

  const declined =
    consent.status === "declined";

  return (
    <div
      className={`rounded-2xl border p-4 ${
        accepted
          ? "border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10"
          : declined
          ? "border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10"
          : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ConsentStatusIcon
            status={
              consent.status
            }
          />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
                {option.title}
              </h4>

              {option.required && (
                <span className="rounded-full bg-indigo-50 px-2 py-1 text-[5px] font-bold uppercase text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                  Required
                </span>
              )}
            </div>

            <p className="mt-1 max-w-xl text-[7px] leading-4 text-slate-500 dark:text-slate-400">
              {option.description}
            </p>

            <p className="mt-2 text-[6px] text-slate-400">
              {consent.timestamp
                ? `Updated ${formatDate(
                    consent.timestamp
                  )}`
                : "No consent response recorded"}
            </p>
          </div>
        </div>

        {isOrganizer ? (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() =>
                onUpdate(
                  participantId,
                  option.id,
                  "accepted"
                )
              }
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[7px] font-bold ${
                accepted
                  ? "bg-green-600 text-white"
                  : "bg-white text-green-600 ring-1 ring-inset ring-green-200 hover:bg-green-50 dark:bg-slate-900 dark:ring-green-900/40"
              }`}
            >
              <CheckCircle2 size={11} />
              Accept
            </button>

            <button
              type="button"
              onClick={() =>
                onUpdate(
                  participantId,
                  option.id,
                  "declined"
                )
              }
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[7px] font-bold ${
                declined
                  ? "bg-red-600 text-white"
                  : "bg-white text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-50 dark:bg-slate-900 dark:ring-red-900/40"
              }`}
            >
              <XCircle size={11} />
              Decline
            </button>
          </div>
        ) : (
          <StatusBadge
            status={consent.status}
          />
        )}
      </div>
    </div>
  );
};

/* --------------------------------
   Consent Settings
--------------------------------- */

const ConsentSettings = ({
  options,
  onUpdate,
  onSave,
  saving,
}) => {
  return (
    <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-indigo-600 dark:bg-slate-900 dark:text-indigo-400">
          <ShieldCheck size={16} />
        </div>

        <div>
          <h3 className="text-[9px] font-bold text-indigo-700 dark:text-indigo-400">
            Consent Options
          </h3>

          <p className="mt-1 text-[7px] text-indigo-700/70 dark:text-indigo-400/70">
            Configure the consent categories collected for this event.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <div
            key={option.id}
            className="rounded-xl bg-white p-4 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
                  {option.title}
                </p>

                <p className="mt-1 text-[6px] leading-3 text-slate-400">
                  {option.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  onUpdate(
                    option.id,
                    "required",
                    !option.required
                  )
                }
                className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[6px] font-bold ${
                  option.required
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                }`}
              >
                {option.required
                  ? "Required"
                  : "Optional"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        <Save size={12} />

        {saving
          ? "Saving..."
          : "Save Consent Settings"}
      </button>
    </div>
  );
};

/* --------------------------------
   Status Badge
--------------------------------- */

const StatusBadge = ({
  status,
}) => {
  const config = {
    accepted: {
      label: "Accepted",
      classes:
        "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
    },
    declined: {
      label: "Declined",
      classes:
        "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
    },
    pending: {
      label: "Pending",
      classes:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
    },
  };

  const current =
    config[status] ||
    config.pending;

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[6px] font-bold ${current.classes}`}
    >
      {current.label}
    </span>
  );
};

/* --------------------------------
   Consent Status Icon
--------------------------------- */

const ConsentStatusIcon = ({
  status,
}) => {
  if (status === "accepted") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
        <CheckCircle2 size={17} />
      </div>
    );
  }

  if (status === "declined") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        <XCircle size={17} />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
      <Clock3 size={17} />
    </div>
  );
};

/* --------------------------------
   Consent Indicator
--------------------------------- */

const ConsentIndicator = ({
  allAccepted,
  hasDeclined,
  hasPending,
}) => {
  if (allAccepted) {
    return (
      <CheckCircle2
        size={15}
        className="text-green-500"
      />
    );
  }

  if (hasDeclined) {
    return (
      <XCircle
        size={15}
        className="text-red-500"
      />
    );
  }

  if (hasPending) {
    return (
      <Clock3
        size={15}
        className="text-amber-500"
      />
    );
  }

  return null;
};

/* --------------------------------
   Stat Card
--------------------------------- */

const StatCard = ({
  label,
  value,
  icon: Icon,
  type = "neutral",
}) => {
  const styles = {
    neutral:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300",
    success:
      "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
    danger:
      "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
    warning:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${styles[type]}`}
      >
        <Icon size={14} />
      </div>

      <p className="mt-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   Empty Participants
--------------------------------- */

const EmptyParticipants = () => {
  return (
    <div className="p-8 text-center">
      <Users
        size={25}
        className="mx-auto text-slate-400"
      />

      <p className="mt-2 text-[8px] font-bold text-slate-600 dark:text-slate-300">
        No participants found
      </p>

      <p className="mt-1 text-[6px] text-slate-400">
        Try changing your search or filter.
      </p>
    </div>
  );
};

/* --------------------------------
   Empty Selection
--------------------------------- */

const EmptySelection = () => {
  return (
    <div className="flex min-h-96 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="text-center">
        <ShieldCheck
          size={32}
          className="mx-auto text-slate-400"
        />

        <p className="mt-3 text-[9px] font-bold text-slate-600 dark:text-slate-300">
          Select a participant
        </p>

        <p className="mt-1 text-[7px] text-slate-400">
          Choose a participant to view their consent records.
        </p>
      </div>
    </div>
  );
};

export default ParticipantConsentManagement;