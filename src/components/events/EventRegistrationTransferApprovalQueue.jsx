import {
  CheckCircle2,
  Clock3,
  Filter,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_REQUESTS = [
  {
    id: 1,
    originalParticipant: "Rahul Sharma",
    recipient: "Aarav Patel",
    event: "AI Hackathon 2026",
    requestDate: "Aug 12, 2026",
    eligibility: "Eligible",
    reason: "Original participant is unavailable.",
    status: "pending",
  },
  {
    id: 2,
    originalParticipant: "Priya Shah",
    recipient: "Neha Patel",
    event: "Tech Innovation Summit",
    requestDate: "Aug 11, 2026",
    eligibility: "Eligible",
    reason: "Transfer requested due to schedule conflict.",
    status: "pending",
  },
  {
    id: 3,
    originalParticipant: "Karan Mehta",
    recipient: "Riya Joshi",
    event: "Web Development Workshop",
    requestDate: "Aug 10, 2026",
    eligibility: "Needs Review",
    reason: "Recipient eligibility requires verification.",
    status: "pending",
  },
  {
    id: 4,
    originalParticipant: "Dev Patel",
    recipient: "Yash Shah",
    event: "Cloud Computing Bootcamp",
    requestDate: "Aug 9, 2026",
    eligibility: "Eligible",
    reason: "Participant requested registration transfer.",
    status: "pending",
  },
];

const EventRegistrationTransferApprovalQueue = ({
  requests = DEFAULT_REQUESTS,
  onRequestUpdate,
}) => {
  const [requestList, setRequestList] =
    useState(requests);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const pendingCount = requestList.filter(
    (request) => request.status === "pending"
  ).length;

  const approvedCount = requestList.filter(
    (request) => request.status === "approved"
  ).length;

  const rejectedCount = requestList.filter(
    (request) => request.status === "rejected"
  ).length;

  const filteredRequests = useMemo(() => {
    return requestList.filter((request) => {
      const matchesSearch =
        request.originalParticipant
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        request.recipient
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        request.event
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        request.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [requestList, search, filter]);

  const updateRequest = (id, status) => {
    setRequestList((current) =>
      current.map((request) =>
        request.id === id
          ? {
              ...request,
              status,
            }
          : request
      )
    );

    const updatedRequest = requestList.find(
      (request) => request.id === id
    );

    if (onRequestUpdate && updatedRequest) {
      onRequestUpdate({
        ...updatedRequest,
        status,
      });
    }

    setSelectedRequest(null);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <UserRound size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Management
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Transfer Requests
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Review participant registration transfer requests and
              verify recipient eligibility before approving them.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <Clock3
            size={14}
            className="text-amber-500"
          />

          <span className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
            {pendingCount} pending requests
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={Clock3}
          label="Pending"
          value={pendingCount}
          type="pending"
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Approved"
          value={approvedCount}
          type="approved"
        />

        <SummaryCard
          icon={XCircle}
          label="Rejected"
          value={rejectedCount}
          type="rejected"
        />
      </div>

      {/* Search and Filters */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search participant, recipient, or event..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-[7px] text-slate-700 outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter
              size={13}
              className="text-slate-400"
            />

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-[7px] font-bold text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Request Queue */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Approval Queue
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Review each transfer request before taking action.
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {filteredRequests.length} requests
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {filteredRequests.map((request) => (
            <TransferRequestCard
              key={request.id}
              request={request}
              onView={() =>
                setSelectedRequest(request)
              }
              onApprove={() =>
                updateRequest(
                  request.id,
                  "approved"
                )
              }
              onReject={() =>
                updateRequest(
                  request.id,
                  "rejected"
                )
              }
            />
          ))}

          {filteredRequests.length === 0 && (
            <EmptyState />
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <TransferDetailsModal
          request={selectedRequest}
          onClose={() =>
            setSelectedRequest(null)
          }
          onApprove={() =>
            updateRequest(
              selectedRequest.id,
              "approved"
            )
          }
          onReject={() =>
            updateRequest(
              selectedRequest.id,
              "rejected"
            )
          }
        />
      )}
    </section>
  );
};

/* --------------------------------
   Summary Card
--------------------------------- */

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  type,
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles[type]}`}
        >
          <Icon size={15} />
        </div>

        <div>
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Request Card
--------------------------------- */

const TransferRequestCard = ({
  request,
  onView,
  onApprove,
  onReject,
}) => {
  const isPending =
    request.status === "pending";

  const eligibilityGood =
    request.eligibility === "Eligible";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-950">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        {/* Participants */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Transfer
            </span>

            <StatusBadge
              status={request.status}
            />
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Participant
              label="Original Participant"
              name={request.originalParticipant}
            />

            <span className="hidden text-slate-300 sm:block">
              →
            </span>

            <Participant
              label="Proposed Recipient"
              name={request.recipient}
            />
          </div>
        </div>

        {/* Event */}
        <div className="min-w-[180px]">
          <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
            Event
          </p>

          <p className="mt-1 text-[7px] font-bold text-slate-700 dark:text-slate-200">
            {request.event}
          </p>

          <p className="mt-2 text-[6px] text-slate-400">
            Requested {request.requestDate}
          </p>
        </div>

        {/* Eligibility */}
        <div className="min-w-[130px]">
          <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
            Eligibility
          </p>

          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-1.5 text-[5px] font-bold ${
              eligibilityGood
                ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
            }`}
          >
            {request.eligibility}
          </span>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onView}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-[6px] font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300"
          >
            View
          </button>

          {isPending && (
            <>
              <button
                type="button"
                onClick={onReject}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2.5 text-[6px] font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
              >
                <XCircle size={10} />
                Reject
              </button>

              <button
                type="button"
                onClick={onApprove}
                disabled={!eligibilityGood}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[6px] font-bold text-white ${
                  eligibilityGood
                    ? "bg-green-600 hover:bg-green-700"
                    : "cursor-not-allowed bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <CheckCircle2 size={10} />
                Approve
              </button>
            </>
          )}
        </div>
      </div>

      {/* Reason */}
      <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
        <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
          Transfer Reason
        </p>

        <p className="mt-1 text-[7px] text-slate-600 dark:text-slate-300">
          {request.reason}
        </p>
      </div>
    </div>
  );
};

/* --------------------------------
   Participant
--------------------------------- */

const Participant = ({
  label,
  name,
}) => {
  return (
    <div>
      <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-1 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <UserRound size={12} />
        </div>

        <span className="text-[7px] font-bold text-slate-700 dark:text-slate-200">
          {name}
        </span>
      </div>
    </div>
  );
};

/* --------------------------------
   Status Badge
--------------------------------- */

const StatusBadge = ({ status }) => {
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
  };

  const current =
    config[status] || config.pending;

  return (
    <span
      className={`rounded-full px-2 py-1 text-[5px] font-bold uppercase ${current.className}`}
    >
      {current.label}
    </span>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = () => {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center dark:border-slate-700">
      <CheckCircle2
        size={28}
        className="text-green-500"
      />

      <h4 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
        No transfer requests found
      </h4>

      <p className="mt-1 text-[7px] text-slate-400">
        Try changing your search or filter.
      </p>
    </div>
  );
};

/* --------------------------------
   Details Modal
--------------------------------- */

const TransferDetailsModal = ({
  request,
  onClose,
  onApprove,
  onReject,
}) => {
  const isEligible =
    request.eligibility === "Eligible";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-700">
          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-indigo-500">
              Transfer Request
            </p>

            <h3 className="mt-1 text-sm font-black text-slate-800 dark:text-white">
              Registration Transfer Details
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 dark:bg-slate-800 dark:hover:text-white"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailField
              label="Original Participant"
              value={
                request.originalParticipant
              }
            />

            <DetailField
              label="Proposed Recipient"
              value={request.recipient}
            />

            <DetailField
              label="Event"
              value={request.event}
            />

            <DetailField
              label="Request Date"
              value={request.requestDate}
            />

            <DetailField
              label="Eligibility"
              value={request.eligibility}
            />

            <DetailField
              label="Status"
              value={request.status}
            />
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Transfer Reason
            </p>

            <p className="mt-2 text-[8px] leading-5 text-slate-600 dark:text-slate-300">
              {request.reason}
            </p>
          </div>

          {!isEligible && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
              <p className="text-[7px] font-bold text-amber-700 dark:text-amber-400">
                Eligibility verification required
              </p>

              <p className="mt-1 text-[6px] text-amber-700/70 dark:text-amber-400/70">
                This transfer should not be approved until the recipient's
                eligibility has been verified.
              </p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 p-5 sm:flex-row sm:justify-end dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-3 text-[7px] font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            Close
          </button>

          {request.status === "pending" && (
            <>
              <button
                type="button"
                onClick={onReject}
                className="rounded-xl bg-red-600 px-4 py-3 text-[7px] font-bold text-white hover:bg-red-700"
              >
                Reject Transfer
              </button>

              <button
                type="button"
                disabled={!isEligible}
                onClick={onApprove}
                className={`rounded-xl px-4 py-3 text-[7px] font-bold text-white ${
                  isEligible
                    ? "bg-green-600 hover:bg-green-700"
                    : "cursor-not-allowed bg-slate-300 dark:bg-slate-700"
                }`}
              >
                Approve Transfer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Detail Field
--------------------------------- */

const DetailField = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-[7px] font-bold capitalize text-slate-700 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
};

export default EventRegistrationTransferApprovalQueue;