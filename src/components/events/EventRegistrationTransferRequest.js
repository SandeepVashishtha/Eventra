import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  History,
  Mail,
  Send,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const INITIAL_TRANSFER_REQUESTS = [
  {
    id: "transfer-1",
    recipientName: "Rahul Mehta",
    recipientEmail: "rahul@example.com",
    reason: "Unable to attend due to a schedule conflict.",
    status: "pending",
    requestedAt: "2026-08-10T10:30:00",
  },
];

const INITIAL_HISTORY = [
  {
    id: "history-1",
    fromName: "Aarav Sharma",
    toName: "Priya Patel",
    toEmail: "priya@example.com",
    status: "approved",
    date: "2026-08-05T14:30:00",
  },
];

const EventRegistrationTransferRequest = ({
  eventName = "Event",
  registrationId = "REG-001",
  currentParticipant = {
    name: "Current Participant",
    email: "participant@example.com",
  },
  eligible = true,
  initialRequests = INITIAL_TRANSFER_REQUESTS,
  initialHistory = INITIAL_HISTORY,
  onSubmitTransfer,
  onApprove,
  onReject,
  onCancel,
  className = "",
}) => {
  const [recipientName, setRecipientName] =
    useState("");

  const [recipientEmail, setRecipientEmail] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [requests, setRequests] =
    useState(initialRequests);

  const [history, setHistory] =
    useState(initialHistory);

  const [message, setMessage] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("request");

  const pendingRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === "pending"
      ),
    [requests]
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanName =
      recipientName.trim();

    const cleanEmail =
      recipientEmail
        .trim()
        .toLowerCase();

    const cleanReason =
      reason.trim();

    if (!eligible) {
      setMessage(
        "This registration is not eligible for transfer."
      );
      return;
    }

    if (!cleanName) {
      setMessage(
        "Please enter the recipient's name."
      );
      return;
    }

    if (!cleanEmail) {
      setMessage(
        "Please enter the recipient's email."
      );
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setMessage(
        "Please enter a valid recipient email address."
      );
      return;
    }

    if (
      cleanEmail ===
      currentParticipant.email.toLowerCase()
    ) {
      setMessage(
        "The recipient must be different from the current participant."
      );
      return;
    }

    if (!cleanReason) {
      setMessage(
        "Please provide a reason for the transfer."
      );
      return;
    }

    const alreadyPending =
      pendingRequests.some(
        (request) =>
          request.recipientEmail ===
          cleanEmail
      );

    if (alreadyPending) {
      setMessage(
        "A transfer request for this recipient is already pending."
      );
      return;
    }

    const transfer = {
      id: createId(),
      recipientName: cleanName,
      recipientEmail: cleanEmail,
      reason: cleanReason,
      status: "pending",
      requestedAt:
        new Date().toISOString(),
    };

    setRequests((current) => [
      ...current,
      transfer,
    ]);

    onSubmitTransfer?.(transfer);

    setRecipientName("");
    setRecipientEmail("");
    setReason("");

    setMessage(
      "Transfer request submitted successfully."
    );

    setActiveTab("requests");
  };

  const handleApprove = (request) => {
    const confirmed = window.confirm(
      `Approve the registration transfer to ${request.recipientName}?`
    );

    if (!confirmed) {
      return;
    }

    setRequests((current) =>
      current.map((item) =>
        item.id === request.id
          ? {
              ...item,
              status: "approved",
              processedAt:
                new Date().toISOString(),
            }
          : item
      )
    );

    const historyEntry = {
      id: createId(),
      fromName:
        currentParticipant.name,
      toName: request.recipientName,
      toEmail: request.recipientEmail,
      status: "approved",
      date: new Date().toISOString(),
    };

    setHistory((current) => [
      historyEntry,
      ...current,
    ]);

    onApprove?.(request);

    setMessage(
      `Registration transferred to ${request.recipientName}.`
    );
  };

  const handleReject = (request) => {
    const confirmed = window.confirm(
      `Reject the transfer request from ${request.recipientName}?`
    );

    if (!confirmed) {
      return;
    }

    setRequests((current) =>
      current.map((item) =>
        item.id === request.id
          ? {
              ...item,
              status: "rejected",
              processedAt:
                new Date().toISOString(),
            }
          : item
      )
    );

    const historyEntry = {
      id: createId(),
      fromName:
        currentParticipant.name,
      toName: request.recipientName,
      toEmail: request.recipientEmail,
      status: "rejected",
      date: new Date().toISOString(),
    };

    setHistory((current) => [
      historyEntry,
      ...current,
    ]);

    onReject?.(request);

    setMessage(
      `Transfer request for ${request.recipientName} was rejected.`
    );
  };

  const handleCancel = (request) => {
    const confirmed = window.confirm(
      "Cancel this transfer request?"
    );

    if (!confirmed) {
      return;
    }

    setRequests((current) =>
      current.map((item) =>
        item.id === request.id
          ? {
              ...item,
              status: "cancelled",
              processedAt:
                new Date().toISOString(),
            }
          : item
      )
    );

    onCancel?.(request);

    setMessage(
      "Transfer request cancelled."
    );
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <UserPlus
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Registration Management
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Transfer
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Request to transfer your registration to another
              eligible participant.
            </p>
          </div>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-bold ${
            eligible
              ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {eligible ? (
            <CheckCircle2 size={11} />
          ) : (
            <AlertCircle size={11} />
          )}

          {eligible
            ? "Transfer Eligible"
            : "Transfer Unavailable"}
        </span>
      </div>

      {/* Registration information */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <InfoCard
          label="Current Participant"
          value={currentParticipant.name}
          description={
            currentParticipant.email
          }
          icon={<Users size={16} />}
        />

        <InfoCard
          label="Registration ID"
          value={registrationId}
          description={eventName}
          icon={<FileText size={16} />}
        />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
        <TabButton
          active={activeTab === "request"}
          onClick={() =>
            setActiveTab("request")
          }
          icon={<Send size={13} />}
        >
          Request Transfer
        </TabButton>

        <TabButton
          active={activeTab === "requests"}
          onClick={() =>
            setActiveTab("requests")
          }
          icon={<Clock3 size={13} />}
        >
          Requests
          {pendingRequests.length >
            0 && (
            <span className="ml-1 rounded-full bg-amber-100 px-1.5 text-[8px] text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              {pendingRequests.length}
            </span>
          )}
        </TabButton>

        <TabButton
          active={activeTab === "history"}
          onClick={() =>
            setActiveTab("history")
          }
          icon={<History size={13} />}
        >
          History
        </TabButton>
      </div>

      {/* Request form */}
      {activeTab === "request" && (
        <form
          onSubmit={handleSubmit}
          className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <UserPlus size={16} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Transfer Registration
              </h3>

              <p className="mt-1 text-[10px] leading-4 text-slate-400">
                Enter the details of the person who should receive
                your registration.
              </p>
            </div>
          </div>

          {!eligible && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[10px] text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400">
              <AlertCircle
                size={14}
                className="mt-0.5 shrink-0"
              />

              <span>
                This registration is currently not eligible for
                transfer.
              </span>
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FormField
              label="Recipient Name"
              icon={<Users size={14} />}
            >
              <input
                type="text"
                value={recipientName}
                onChange={(event) =>
                  setRecipientName(
                    event.target.value
                  )
                }
                disabled={!eligible}
                placeholder="Enter recipient name"
                className="form-input"
              />
            </FormField>

            <FormField
              label="Recipient Email"
              icon={<Mail size={14} />}
            >
              <input
                type="email"
                value={recipientEmail}
                onChange={(event) =>
                  setRecipientEmail(
                    event.target.value
                  )
                }
                disabled={!eligible}
                placeholder="recipient@example.com"
                className="form-input"
              />
            </FormField>
          </div>

          <FormField
            label="Transfer Reason"
            icon={<FileText size={14} />}
            className="mt-4"
          >
            <textarea
              value={reason}
              onChange={(event) =>
                setReason(
                  event.target.value
                )
              }
              disabled={!eligible}
              rows={4}
              placeholder="Explain why you need to transfer your registration..."
              className="form-input resize-none"
            />
          </FormField>

          <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3 dark:border-amber-900/30 dark:bg-amber-900/10">
            <div className="flex items-start gap-2">
              <ShieldCheck
                size={14}
                className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
              />

              <p className="text-[9px] leading-4 text-amber-700 dark:text-amber-400">
                The recipient must meet the event's eligibility
                requirements. The transfer becomes active only
                after approval.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!eligible}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={14} />
            Submit Transfer Request
          </button>
        </form>
      )}

      {/* Requests */}
      {activeTab === "requests" && (
        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Transfer Requests
              </h3>

              <p className="mt-1 text-[10px] text-slate-400">
                Review and manage registration transfer requests.
              </p>
            </div>

            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              {pendingRequests.length} pending
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {requests.length === 0 ? (
              <EmptyState
                icon={<UserPlus size={20} />}
                title="No transfer requests"
                description="Transfer requests will appear here."
              />
            ) : (
              requests.map((request) => (
                <TransferRequestCard
                  key={request.id}
                  request={request}
                  onApprove={() =>
                    handleApprove(request)
                  }
                  onReject={() =>
                    handleReject(request)
                  }
                  onCancel={() =>
                    handleCancel(request)
                  }
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* History */}
      {activeTab === "history" && (
        <div className="mt-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Transfer History
            </h3>

            <p className="mt-1 text-[10px] text-slate-400">
              Previous registration transfer activity.
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {history.length === 0 ? (
              <EmptyState
                icon={<History size={20} />}
                title="No transfer history"
                description="Completed transfer activity will appear here."
              />
            ) : (
              history.map((entry) => (
                <HistoryCard
                  key={entry.id}
                  entry={entry}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-3 text-[10px] font-semibold text-green-700 dark:border-green-900/40 dark:bg-green-900/10 dark:text-green-400">
          {message}
        </div>
      )}

      {/* Important note */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={16}
            className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Transfer Policy
            </h3>

            <p className="mt-1 text-[9px] leading-4 text-slate-400">
              Your original registration remains active while the
              transfer is pending. After organizer approval, the
              registration is transferred to the new participant.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ----------------------------------
   Info card
----------------------------------- */

const InfoCard = ({
  label,
  value,
  description,
  icon,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          {icon}
        </div>

        <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>
      </div>

      <p className="mt-3 truncate text-sm font-bold text-slate-800 dark:text-white">
        {value}
      </p>

      <p className="mt-1 truncate text-[9px] text-slate-400">
        {description}
      </p>
    </div>
  );
};

/* ----------------------------------
   Form field
----------------------------------- */

const FormField = ({
  label,
  icon,
  children,
  className = "",
}) => {
  return (
    <div className={className}>
      <label className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </label>

      {children}
    </div>
  );
};

/* ----------------------------------
   Transfer request card
----------------------------------- */

const TransferRequestCard = ({
  request,
  onApprove,
  onReject,
  onCancel,
}) => {
  const pending =
    request.status === "pending";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar
          name={request.recipientName}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white">
              {request.recipientName}
            </h4>

            <StatusBadge
              status={request.status}
            />
          </div>

          <p className="mt-1 flex items-center gap-1 text-[9px] text-slate-400">
            <Mail size={10} />
            {request.recipientEmail}
          </p>

          <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Transfer Reason
            </p>

            <p className="mt-1 text-[10px] leading-4 text-slate-600 dark:text-slate-300">
              {request.reason}
            </p>
          </div>

          <p className="mt-2 text-[8px] text-slate-400">
            Requested{" "}
            {formatDate(
              request.requestedAt
            )}
          </p>
        </div>

        {pending && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onApprove}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-[9px] font-bold text-white hover:bg-green-700"
            >
              <Check size={12} />
              Approve
            </button>

            <button
              type="button"
              onClick={onReject}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-[9px] font-semibold text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
            >
              <X size={12} />
              Reject
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[9px] font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Trash2 size={12} />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ----------------------------------
   History card
----------------------------------- */

const HistoryCard = ({
  entry,
}) => {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <History size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold text-slate-800 dark:text-white">
            {entry.fromName}
          </p>

          <span className="text-slate-400">
            →
          </span>

          <p className="text-xs font-bold text-slate-800 dark:text-white">
            {entry.toName}
          </p>

          <StatusBadge
            status={entry.status}
          />
        </div>

        <p className="mt-1 text-[9px] text-slate-400">
          {entry.toEmail}
        </p>

        <p className="mt-2 text-[8px] text-slate-400">
          {formatDate(entry.date)}
        </p>
      </div>
    </div>
  );
};

/* ----------------------------------
   Avatar
----------------------------------- */

const Avatar = ({
  name,
}) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
      {initials || "U"}
    </div>
  );
};

/* ----------------------------------
   Status badge
----------------------------------- */

const StatusBadge = ({
  status,
}) => {
  const config = {
    pending: {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    },
    approved: {
      label: "Approved",
      className:
        "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    },
    rejected: {
      label: "Rejected",
      className:
        "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    },
    cancelled: {
      label: "Cancelled",
      className:
        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    },
  };

  const item =
    config[status] ||
    config.pending;

  return (
    <span
      className={`rounded-full px-2 py-1 text-[8px] font-bold uppercase tracking-wide ${item.className}`}
    >
      {item.label}
    </span>
  );
};

/* ----------------------------------
   Tabs
----------------------------------- */

const TabButton = ({
  active,
  onClick,
  icon,
  children,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-[9px] font-bold transition ${
        active
          ? "bg-indigo-600 text-white"
          : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      }`}
    >
      {icon}
      {children}
    </button>
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyState = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        {icon}
      </div>

      <h3 className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
        {title}
      </h3>

      <p className="mt-1 text-[9px] text-slate-400">
        {description}
      </p>
    </div>
  );
};

/* ----------------------------------
   Helpers
----------------------------------- */

const isValidEmail = (
  email
) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
};

const formatDate = (
  value
) => {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

const createId = () => {
  if (
    typeof crypto !==
      "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `transfer-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

export default EventRegistrationTransferRequest;