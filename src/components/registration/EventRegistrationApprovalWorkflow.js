import {
  Check,
  ChevronDown,
  Clock3,
  Mail,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const STATUS_OPTIONS = [
  "all",
  "pending",
  "approved",
  "rejected",
];

const EventRegistrationApprovalWorkflow = ({
  registrations = [],
  onApprove,
  onReject,
  onNotify,
  className = "",
}) => {
  const [items, setItems] =
    useState(
      Array.isArray(registrations)
        ? registrations
        : []
    );

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("pending");

  const [selectedRegistration, setSelectedRegistration] =
    useState(null);

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [showRejectDialog, setShowRejectDialog] =
    useState(false);

  const [processingId, setProcessingId] =
    useState(null);

  const filteredRegistrations =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return items.filter(
        (registration) => {
          const status =
            getStatus(
              registration
            );

          const participant =
            getParticipant(
              registration
            );

          const searchableText = [
            participant.name,
            participant.email,
            participant.team,
            participant.college,
            participant.company,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !query ||
            searchableText.includes(
              query
            );

          const matchesStatus =
            statusFilter === "all" ||
            status === statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      items,
      search,
      statusFilter,
    ]);

  const counts = useMemo(
    () =>
      items.reduce(
        (result, registration) => {
          const status =
            getStatus(
              registration
            );

          result[status] =
            (result[status] || 0) +
            1;

          return result;
        },
        {
          pending: 0,
          approved: 0,
          rejected: 0,
        }
      ),
    [items]
  );

  const handleApprove = async (
    registration
  ) => {
    const id =
      getRegistrationId(
        registration
      );

    setProcessingId(id);

    try {
      const result =
        await onApprove?.(
          registration
        );

      if (result === false) {
        return;
      }

      updateRegistration(
        id,
        {
          status: "approved",
          approvedAt:
            new Date().toISOString(),
        }
      );

      await onNotify?.({
        registration,
        status: "approved",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (
    registration
  ) => {
    setSelectedRegistration(
      registration
    );
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  const closeRejectDialog = () => {
    if (processingId) {
      return;
    }

    setShowRejectDialog(false);
    setSelectedRegistration(null);
    setRejectionReason("");
  };

  const handleReject = async () => {
    if (!selectedRegistration) {
      return;
    }

    const reason =
      rejectionReason.trim();

    if (!reason) {
      return;
    }

    const id =
      getRegistrationId(
        selectedRegistration
      );

    setProcessingId(id);

    try {
      const result =
        await onReject?.(
          selectedRegistration,
          reason
        );

      if (result === false) {
        return;
      }

      updateRegistration(
        id,
        {
          status: "rejected",
          rejectionReason:
            reason,
          rejectedAt:
            new Date().toISOString(),
        }
      );

      await onNotify?.({
        registration:
          selectedRegistration,
        status: "rejected",
        reason,
      });

      closeRejectDialog();
    } finally {
      setProcessingId(null);
    }
  };

  const updateRegistration = (
    id,
    updates
  ) => {
    setItems((current) =>
      current.map(
        (registration) =>
          getRegistrationId(
            registration
          ) === id
            ? {
                ...registration,
                ...updates,
              }
            : registration
      )
    );
  };

  return (
    <>
      <section
        className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
              <UserRound
                size={20}
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Organizer Dashboard
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                Registration Approval
              </h2>

              <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                Review participant registrations and
                approve or reject applications.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusCount
              label="Pending"
              count={
                counts.pending || 0
              }
              active={
                statusFilter ===
                "pending"
              }
              onClick={() =>
                setStatusFilter(
                  "pending"
                )
              }
            />

            <StatusCount
              label="Approved"
              count={
                counts.approved || 0
              }
              active={
                statusFilter ===
                "approved"
              }
              onClick={() =>
                setStatusFilter(
                  "approved"
                )
              }
            />

            <StatusCount
              label="Rejected"
              count={
                counts.rejected || 0
              }
              active={
                statusFilter ===
                "rejected"
              }
              onClick={() =>
                setStatusFilter(
                  "rejected"
                )
              }
            />
          </div>
        </div>

        {/* Search + filter */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search by name, email, team, college..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>

          <div className="relative">
            <select
              value={
                statusFilter
              }
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-3 pr-9 text-xs font-semibold capitalize text-slate-700 outline-none focus:border-indigo-400 sm:w-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              aria-label="Filter registrations by status"
            >
              {STATUS_OPTIONS.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status ===
                    "all"
                      ? "All Statuses"
                      : status}
                  </option>
                )
              )}
            </select>

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {/* Results */}
        <div className="mt-6">
          {filteredRegistrations.length ===
          0 ? (
            <EmptyState
              status={
                statusFilter
              }
              hasSearch={
                Boolean(
                  search.trim()
                )
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredRegistrations.map(
                (
                  registration,
                  index
                ) => {
                  const id =
                    getRegistrationId(
                      registration
                    );

                  const participant =
                    getParticipant(
                      registration
                    );

                  const status =
                    getStatus(
                      registration
                    );

                  const isProcessing =
                    processingId ===
                    id;

                  return (
                    <RegistrationCard
                      key={
                        id ||
                        index
                      }
                      registration={
                        registration
                      }
                      participant={
                        participant
                      }
                      status={
                        status
                      }
                      isProcessing={
                        isProcessing
                      }
                      onApprove={() =>
                        handleApprove(
                          registration
                        )
                      }
                      onReject={() =>
                        openRejectDialog(
                          registration
                        )
                      }
                    />
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>

      {/* Reject dialog */}
      {showRejectDialog &&
        selectedRegistration && (
          <RejectDialog
            registration={
              selectedRegistration
            }
            reason={
              rejectionReason
            }
            setReason={
              setRejectionReason
            }
            onCancel={
              closeRejectDialog
            }
            onConfirm={
              handleReject
            }
            processing={
              Boolean(
                processingId
              )
            }
          />
        )}
    </>
  );
};

/* ----------------------------------
   Registration card
----------------------------------- */

const RegistrationCard = ({
  registration,
  participant,
  status,
  isProcessing,
  onApprove,
  onReject,
}) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Participant */}
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Avatar
            name={
              participant.name
            }
            image={
              participant.avatar
            }
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-bold text-slate-800 dark:text-white">
                {participant.name}
              </h3>

              <StatusBadge
                status={
                  status
                }
              />
            </div>

            {participant.email && (
              <p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                <Mail size={11} />
                {participant.email}
              </p>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              {participant.team && (
                <InfoBadge
                  label={`Team: ${participant.team}`}
                />
              )}

              {participant.college && (
                <InfoBadge
                  label={
                    participant.college
                  }
                />
              )}

              {participant.category && (
                <InfoBadge
                  label={
                    participant.category
                  }
                />
              )}
            </div>
          </div>
        </div>

        {/* Submitted */}
        <div className="shrink-0">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            Submitted
          </p>

          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Clock3 size={12} />
            {formatDate(
              registration.createdAt ||
                registration.submittedAt ||
                registration.registrationDate
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-2">
          {status ===
            "pending" && (
            <>
              <button
                type="button"
                onClick={
                  onApprove
                }
                disabled={
                  isProcessing
                }
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={14} />

                {isProcessing
                  ? "Processing..."
                  : "Approve"}
              </button>

              <button
                type="button"
                onClick={
                  onReject
                }
                disabled={
                  isProcessing
                }
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400"
              >
                <X size={14} />
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Rejection reason */}
      {status ===
        "rejected" &&
        registration.rejectionReason && (
          <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 dark:border-red-900/30 dark:bg-red-900/10">
            <p className="text-[9px] font-bold uppercase tracking-wide text-red-500 dark:text-red-400">
              Rejection Reason
            </p>

            <p className="mt-1 text-xs leading-5 text-red-700 dark:text-red-300">
              {
                registration.rejectionReason
              }
            </p>
          </div>
        )}
    </article>
  );
};

/* ----------------------------------
   Reject dialog
----------------------------------- */

const RejectDialog = ({
  registration,
  reason,
  setReason,
  onCancel,
  onConfirm,
  processing,
}) => {
  const participant =
    getParticipant(
      registration
    );

  const canSubmit =
    reason.trim().length > 0 &&
    !processing;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-registration-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="reject-registration-title"
              className="text-base font-bold text-slate-800 dark:text-white"
            >
              Reject Registration
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Reject the registration submitted by{" "}
              <strong>
                {participant.name}
              </strong>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5">
          <label
            htmlFor="rejection-reason"
            className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            Rejection Reason
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <textarea
            id="rejection-reason"
            value={reason}
            onChange={(event) =>
              setReason(
                event.target.value
              )
            }
            rows={5}
            placeholder="Explain why this registration is being rejected..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-700 outline-none placeholder:text-slate-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            autoFocus
          />

          <p className="mt-1 text-[9px] text-slate-400">
            This reason can be included in the participant
            notification.
          </p>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!canSubmit}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing
              ? "Rejecting..."
              : "Reject Registration"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------
   Status count
----------------------------------- */

const StatusCount = ({
  label,
  count,
  active,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-left transition ${
        active
          ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900/40 dark:bg-indigo-900/20"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      }`}
    >
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-0.5 text-sm font-bold ${
          active
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-slate-700 dark:text-slate-200"
        }`}
      >
        {count}
      </p>
    </button>
  );
};

/* ----------------------------------
   Status badge
----------------------------------- */

const StatusBadge = ({
  status,
}) => {
  const styles = {
    pending:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    approved:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    rejected:
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${styles[status] || "bg-slate-100 text-slate-500"}`}
    >
      {status}
    </span>
  );
};

/* ----------------------------------
   Small info badge
----------------------------------- */

const InfoBadge = ({
  label,
}) => {
  return (
    <span className="max-w-[180px] truncate rounded-full bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      {label}
    </span>
  );
};

/* ----------------------------------
   Avatar
----------------------------------- */

const Avatar = ({
  name,
  image,
}) => {
  if (image) {
    return (
      <img
        src={image}
        alt={`${name} profile`}
        className="h-11 w-11 shrink-0 rounded-xl object-cover"
        loading="lazy"
      />
    );
  }

  const initials = String(
    name || "Participant"
  )
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase() ||
        ""
    )
    .join("");

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
      {initials || "P"}
    </div>
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyState = ({
  status,
  hasSearch,
}) => {
  const message =
    hasSearch
      ? "No registrations match your search."
      : status === "pending"
      ? "No pending registrations."
      : status === "approved"
      ? "No approved registrations."
      : status === "rejected"
      ? "No rejected registrations."
      : "No registrations found.";

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <UserRound
        size={28}
        className="mx-auto text-slate-400"
      />

      <h3 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
        {message}
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
        Registration requests will appear here when
        participants submit applications.
      </p>
    </div>
  );
};

/* ----------------------------------
   Data helpers
----------------------------------- */

const getRegistrationId = (
  registration = {}
) => {
  return String(
    registration.id ||
      registration.registrationId ||
      registration._id ||
      registration.userId ||
      `registration-${Math.random()}`
  );
};

const getStatus = (
  registration = {}
) => {
  const status = String(
    registration.status ||
      registration.registrationStatus ||
      "pending"
  ).toLowerCase();

  if (
    status === "approved" ||
    status === "accepted"
  ) {
    return "approved";
  }

  if (
    status === "rejected" ||
    status === "declined"
  ) {
    return "rejected";
  }

  return "pending";
};

const getParticipant = (
  registration = {}
) => {
  const participant =
    registration.participant ||
    registration.user ||
    {};

  return {
    name:
      participant.name ||
      [
        participant.firstName,
        participant.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      registration.name ||
      registration.participantName ||
      "Event Participant",

    email:
      participant.email ||
      registration.email ||
      registration.participantEmail ||
      "",

    team:
      participant.team ||
      participant.teamName ||
      registration.team ||
      registration.teamName ||
      "",

    college:
      participant.college ||
      participant.institution ||
      registration.college ||
      registration.institution ||
      "",

    company:
      participant.company ||
      registration.company ||
      "",

    category:
      participant.category ||
      registration.category ||
      "",

    avatar:
      participant.avatar ||
      participant.avatarUrl ||
      registration.avatar ||
      registration.avatarUrl ||
      "",
  };
};

const formatDate = (
  value
) => {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

export default EventRegistrationApprovalWorkflow;