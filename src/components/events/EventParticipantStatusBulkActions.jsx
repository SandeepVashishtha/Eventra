import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Filter,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_PARTICIPANTS = [
  {
    id: "P001",
    name: "Participant 1",
    email: "participant1@example.com",
    status: "pending",
    attended: false,
    group: "Unassigned",
  },
  {
    id: "P002",
    name: "Participant 2",
    email: "participant2@example.com",
    status: "approved",
    attended: true,
    group: "Team Alpha",
  },
  {
    id: "P003",
    name: "Participant 3",
    email: "participant3@example.com",
    status: "pending",
    attended: false,
    group: "Team Beta",
  },
  {
    id: "P004",
    name: "Participant 4",
    email: "participant4@example.com",
    status: "rejected",
    attended: false,
    group: "Unassigned",
  },
  {
    id: "P005",
    name: "Participant 5",
    email: "participant5@example.com",
    status: "approved",
    attended: false,
    group: "Team Alpha",
  },
];

const DEFAULT_GROUPS = [
  "Team Alpha",
  "Team Beta",
  "Team Gamma",
];

const EventParticipantStatusBulkActions = ({
  eventId = "event-14409",
  eventTitle = "AI & ML Hackathon",
  initialParticipants = DEFAULT_PARTICIPANTS,
  groups = DEFAULT_GROUPS,
  onBulkAction,
  className = "",
}) => {
  const [participants, setParticipants] =
    useState(initialParticipants);

  const [selectedIds, setSelectedIds] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [action, setAction] =
    useState("");

  const [targetGroup, setTargetGroup] =
    useState("");

  const [notificationMessage, setNotificationMessage] =
    useState("");

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const [notice, setNotice] =
    useState("");

  const [isProcessing, setIsProcessing] =
    useState(false);

  const filteredParticipants = useMemo(() => {
    const query = searchTerm
      .trim()
      .toLowerCase();

    return participants.filter((participant) => {
      const matchesStatus =
        statusFilter === "all" ||
        participant.status ===
          statusFilter;

      const matchesSearch =
        !query ||
        participant.name
          .toLowerCase()
          .includes(query) ||
        participant.email
          .toLowerCase()
          .includes(query) ||
        participant.id
          .toLowerCase()
          .includes(query);

      return (
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    participants,
    searchTerm,
    statusFilter,
  ]);

  const selectedParticipants =
    participants.filter((participant) =>
      selectedIds.includes(
        participant.id
      )
    );

  const toggleParticipant = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id
          )
        : [...current, id]
    );
  };

  const toggleSelectAll = () => {
    const visibleIds =
      filteredParticipants.map(
        (participant) =>
          participant.id
      );

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) =>
        selectedIds.includes(id)
      );

    if (allSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) =>
            !visibleIds.includes(id)
        )
      );
    } else {
      setSelectedIds((current) => [
        ...new Set([
          ...current,
          ...visibleIds,
        ]),
      ]);
    }
  };

  const getActionLabel = () => {
    switch (action) {
      case "approve":
        return "Approve";

      case "reject":
        return "Reject";

      case "attended":
        return "Mark as Attended";

      case "add-group":
        return "Add to Group";

      case "remove-group":
        return "Remove from Group";

      case "notify":
        return "Send Notification";

      default:
        return "Select Action";
    }
  };

  const openConfirmation = () => {
    if (selectedIds.length === 0) {
      setNotice(
        "Please select at least one participant."
      );
      return;
    }

    if (!action) {
      setNotice(
        "Please select a bulk action."
      );
      return;
    }

    if (
      action === "add-group" &&
      !targetGroup
    ) {
      setNotice(
        "Please select a group."
      );
      return;
    }

    if (
      action === "notify" &&
      !notificationMessage.trim()
    ) {
      setNotice(
        "Please enter a notification message."
      );
      return;
    }

    setShowConfirmation(true);
  };

  const executeBulkAction = async () => {
    setIsProcessing(true);

    let updatedParticipants =
      [...participants];

    switch (action) {
      case "approve":
        updatedParticipants =
          participants.map(
            (participant) =>
              selectedIds.includes(
                participant.id
              )
                ? {
                    ...participant,
                    status: "approved",
                  }
                : participant
          );
        break;

      case "reject":
        updatedParticipants =
          participants.map(
            (participant) =>
              selectedIds.includes(
                participant.id
              )
                ? {
                    ...participant,
                    status: "rejected",
                  }
                : participant
          );
        break;

      case "attended":
        updatedParticipants =
          participants.map(
            (participant) =>
              selectedIds.includes(
                participant.id
              )
                ? {
                    ...participant,
                    attended: true,
                  }
                : participant
          );
        break;

      case "add-group":
        updatedParticipants =
          participants.map(
            (participant) =>
              selectedIds.includes(
                participant.id
              )
                ? {
                    ...participant,
                    group: targetGroup,
                  }
                : participant
          );
        break;

      case "remove-group":
        updatedParticipants =
          participants.map(
            (participant) =>
              selectedIds.includes(
                participant.id
              )
                ? {
                    ...participant,
                    group: "Unassigned",
                  }
                : participant
          );
        break;

      case "notify":
        break;

      default:
        break;
    }

    setParticipants(
      updatedParticipants
    );

    const payload = {
      eventId,
      eventTitle,
      action,
      participantIds:
        selectedIds,
      participants:
        selectedParticipants,
      targetGroup:
        action === "add-group"
          ? targetGroup
          : null,
      message:
        action === "notify"
          ? notificationMessage.trim()
          : null,
    };

    await onBulkAction?.(payload);

    setSelectedIds([]);
    setAction("");
    setTargetGroup("");
    setNotificationMessage("");
    setShowConfirmation(false);
    setIsProcessing(false);

    setNotice(
      `${getActionLabel()} completed for ${selectedParticipants.length} participant${
        selectedParticipants.length ===
        1
          ? ""
          : "s"
      }.`
    );
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Users
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Controls
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Participant Bulk Actions
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Select multiple participants and update
              their status or group at once.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <p className="text-[7px] font-bold uppercase tracking-wide text-indigo-500">
            Selected
          </p>

          <p className="mt-1 text-lg font-bold text-indigo-700 dark:text-indigo-300">
            {selectedIds.length}
          </p>
        </div>
      </div>

      {/* Notice */}
      {notice && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <CheckCircle2
            size={14}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <p className="flex-1 text-[9px] font-semibold text-indigo-700 dark:text-indigo-300">
            {notice}
          </p>

          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-indigo-400 hover:text-indigo-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label="Total"
          value={participants.length}
          icon={<Users size={15} />}
        />

        <SummaryCard
          label="Pending"
          value={
            participants.filter(
              (p) =>
                p.status === "pending"
            ).length
          }
          icon={<AlertTriangle size={15} />}
        />

        <SummaryCard
          label="Approved"
          value={
            participants.filter(
              (p) =>
                p.status === "approved"
            ).length
          }
          icon={<UserCheck size={15} />}
        />

        <SummaryCard
          label="Attended"
          value={
            participants.filter(
              (p) => p.attended
            ).length
          }
          icon={<Check size={15} />}
        />
      </div>

      {/* Search and filter */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search by name, email, or registration ID..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="relative">
            <Filter
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-9 text-[8px] font-bold outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white sm:w-44"
            >
              <option value="all">
                All Statuses
              </option>
              <option value="pending">
                Pending
              </option>
              <option value="approved">
                Approved
              </option>
              <option value="rejected">
                Rejected
              </option>
            </select>

            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Bulk action toolbar */}
      <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-bold text-indigo-700 dark:text-indigo-300">
                Bulk Actions
              </p>

              <p className="mt-1 text-[8px] text-indigo-600/70 dark:text-indigo-400">
                {selectedIds.length > 0
                  ? `${selectedIds.length} participant${
                      selectedIds.length ===
                      1
                        ? ""
                        : "s"
                    } selected`
                  : "Select participants to perform an action"}
              </p>
            </div>

            <button
              type="button"
              onClick={toggleSelectAll}
              className="rounded-xl bg-white px-4 py-2 text-[8px] font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-slate-900 dark:text-indigo-400"
            >
              {filteredParticipants.length >
                0 &&
              filteredParticipants.every(
                (participant) =>
                  selectedIds.includes(
                    participant.id
                  )
              )
                ? "Deselect Visible"
                : "Select Visible"}
            </button>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {/* Action */}
            <div>
              <label className="text-[7px] font-bold uppercase tracking-wide text-indigo-500">
                Action
              </label>

              <div className="relative mt-2">
                <select
                  value={action}
                  onChange={(event) => {
                    setAction(
                      event.target.value
                    );

                    if (
                      event.target
                        .value !==
                      "add-group"
                    ) {
                      setTargetGroup("");
                    }
                  }}
                  className="w-full appearance-none rounded-xl border border-indigo-100 bg-white px-3 py-3 pr-9 text-[8px] font-bold outline-none dark:border-indigo-900/30 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">
                    Select action
                  </option>
                  <option value="approve">
                    Approve
                  </option>
                  <option value="reject">
                    Reject
                  </option>
                  <option value="attended">
                    Mark as Attended
                  </option>
                  <option value="add-group">
                    Add to Group
                  </option>
                  <option value="remove-group">
                    Remove from Group
                  </option>
                  <option value="notify">
                    Send Notification
                  </option>
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>

            {/* Group */}
            {action ===
              "add-group" && (
              <div>
                <label className="text-[7px] font-bold uppercase tracking-wide text-indigo-500">
                  Destination Group
                </label>

                <div className="relative mt-2">
                  <select
                    value={targetGroup}
                    onChange={(event) =>
                      setTargetGroup(
                        event.target
                          .value
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-indigo-100 bg-white px-3 py-3 pr-9 text-[8px] font-bold outline-none dark:border-indigo-900/30 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="">
                      Select group
                    </option>

                    {groups.map(
                      (group) => (
                        <option
                          key={group}
                          value={
                            group
                          }
                        >
                          {group}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Notification */}
            {action ===
              "notify" && (
              <div className="lg:col-span-2">
                <label className="text-[7px] font-bold uppercase tracking-wide text-indigo-500">
                  Notification Message
                </label>

                <input
                  value={
                    notificationMessage
                  }
                  onChange={(event) =>
                    setNotificationMessage(
                      event.target.value
                    )
                  }
                  placeholder="Enter notification message..."
                  className="mt-2 w-full rounded-xl border border-indigo-100 bg-white px-3 py-3 text-[8px] outline-none dark:border-indigo-900/30 dark:bg-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Apply */}
            <div className="flex items-end">
              <button
                type="button"
                disabled={
                  selectedIds.length ===
                    0 ||
                  !action
                }
                onClick={
                  openConfirmation
                }
                className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply Bulk Action
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Participant table */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 text-left dark:border-slate-800">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      filteredParticipants.length >
                        0 &&
                      filteredParticipants.every(
                        (participant) =>
                          selectedIds.includes(
                            participant.id
                          )
                      )
                    }
                    onChange={
                      toggleSelectAll
                    }
                    className="h-3.5 w-3.5 accent-indigo-600"
                  />
                </th>

                <th className="px-4 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                  Participant
                </th>

                <th className="px-4 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                  Status
                </th>

                <th className="px-4 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                  Attendance
                </th>

                <th className="px-4 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                  Group
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredParticipants.map(
                (participant) => (
                  <tr
                    key={participant.id}
                    className={`border-b border-slate-50 dark:border-slate-800/70 ${
                      selectedIds.includes(
                        participant.id
                      )
                        ? "bg-indigo-50/50 dark:bg-indigo-900/5"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(
                          participant.id
                        )}
                        onChange={() =>
                          toggleParticipant(
                            participant.id
                          )
                        }
                        className="h-3.5 w-3.5 accent-indigo-600"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-[8px] font-bold text-slate-700 dark:text-slate-200">
                        {participant.name}
                      </p>

                      <p className="mt-1 text-[7px] text-slate-400">
                        {participant.id}
                      </p>

                      <p className="mt-1 text-[7px] text-slate-400">
                        {participant.email}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge
                        status={
                          participant.status
                        }
                      />
                    </td>

                    <td className="px-4 py-4">
                      {participant.attended ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1.5 text-[7px] font-bold text-green-600 dark:bg-green-900/10 dark:text-green-400">
                          <Check size={10} />
                          Attended
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1.5 text-[7px] font-bold text-slate-400 dark:bg-slate-800">
                          Not Attended
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1.5 text-[7px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                        {participant.group ||
                          "Unassigned"}
                      </span>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {filteredParticipants.length ===
          0 && (
          <div className="py-12 text-center">
            <Users
              size={26}
              className="mx-auto text-slate-300 dark:text-slate-700"
            />

            <p className="mt-3 text-xs font-bold text-slate-500">
              No participants found
            </p>

            <p className="mt-1 text-[8px] text-slate-400">
              Try changing the search or status filter.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle
                  size={18}
                  className="text-amber-600 dark:text-amber-400"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  Confirm Bulk Action
                </h3>

                <p className="mt-1 text-[8px] leading-4 text-slate-400">
                  This action will update{" "}
                  <strong>
                    {
                      selectedIds.length
                    }{" "}
                    participant
                    {selectedIds.length ===
                    1
                      ? ""
                      : "s"}
                  </strong>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowConfirmation(
                    false
                  )
                }
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                Action
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
                {getActionLabel()}
              </p>

              {action ===
                "add-group" && (
                <p className="mt-2 text-[8px] text-slate-500">
                  Destination:{" "}
                  <strong>
                    {targetGroup}
                  </strong>
                </p>
              )}

              {action ===
                "notify" && (
                <p className="mt-2 text-[8px] leading-4 text-slate-500">
                  Message:{" "}
                  <strong>
                    {notificationMessage}
                  </strong>
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={
                  isProcessing
                }
                onClick={() =>
                  setShowConfirmation(
                    false
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  isProcessing
                }
                onClick={
                  executeBulkAction
                }
                className="rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isProcessing
                  ? "Processing..."
                  : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backend note */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <Bell
            size={15}
            className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
              Backend integration
            </p>

            <p className="mt-1 text-[8px] leading-4 text-slate-400">
              Connect the{" "}
              <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">
                onBulkAction
              </code>{" "}
              callback to your API. The callback receives the
              event ID, action, selected participant IDs,
              target group, and notification message.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const SummaryCard = ({
  icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center justify-between">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        {icon}
      </div>

      <span className="text-lg font-bold text-slate-800 dark:text-white">
        {value}
      </span>
    </div>

    <p className="mt-3 text-[8px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>
  </div>
);

const StatusBadge = ({
  status,
}) => {
  const config = {
    pending: {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
    },
    approved: {
      label: "Approved",
      className:
        "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
    },
    rejected: {
      label: "Rejected",
      className:
        "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
    },
  };

  const current =
    config[status] ||
    config.pending;

  return (
    <span
      className={`rounded-full px-2.5 py-1.5 text-[7px] font-bold ${current.className}`}
    >
      {current.label}
    </span>
  );
};

export default EventParticipantStatusBulkActions;