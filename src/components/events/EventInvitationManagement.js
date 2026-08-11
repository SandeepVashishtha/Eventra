import {
  Check,
  CheckCircle2,
  Clock3,
  Mail,
  RefreshCw,
  Search,
  Send,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_USERS = [
  {
    id: "USR-001",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    role: "Participant",
    group: "AI Club",
  },
  {
    id: "USR-002",
    name: "Priya Patel",
    email: "priya@example.com",
    role: "Participant",
    group: "Data Science Club",
  },
  {
    id: "USR-003",
    name: "Rahul Mehta",
    email: "rahul@example.com",
    role: "Participant",
    group: "Developers",
  },
  {
    id: "USR-004",
    name: "Neha Shah",
    email: "neha@example.com",
    role: "Participant",
    group: "Design Community",
  },
  {
    id: "USR-005",
    name: "Karan Joshi",
    email: "karan@example.com",
    role: "Participant",
    group: "AI Club",
  },
];

const DEFAULT_GROUPS = [
  {
    id: "GRP-001",
    name: "AI Club",
    members: 32,
  },
  {
    id: "GRP-002",
    name: "Data Science Club",
    members: 24,
  },
  {
    id: "GRP-003",
    name: "Developers",
    members: 48,
  },
  {
    id: "GRP-004",
    name: "Design Community",
    members: 18,
  },
];

const INITIAL_INVITATIONS = [
  {
    id: "INV-001",
    userId: "USR-001",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    status: "Pending",
    sentAt: new Date(Date.now() - 1000 * 60 * 30),
    resentAt: null,
  },
  {
    id: "INV-002",
    userId: "USR-002",
    name: "Priya Patel",
    email: "priya@example.com",
    status: "Accepted",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    resentAt: null,
  },
  {
    id: "INV-003",
    userId: "USR-003",
    name: "Rahul Mehta",
    email: "rahul@example.com",
    status: "Declined",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    resentAt: null,
  },
];

const STATUS_OPTIONS = [
  "All",
  "Pending",
  "Accepted",
  "Declined",
  "Cancelled",
];

const EventInvitationManagement = ({
  eventId = "event-001",
  eventTitle = "AI & ML Hackathon",
  users = DEFAULT_USERS,
  groups = DEFAULT_GROUPS,
  initialInvitations = INITIAL_INVITATIONS,
  onSendInvitation,
  onResendInvitation,
  onCancelInvitation,
  onInvitationResponse,
  className = "",
}) => {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] =
    useState("All Groups");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [invitations, setInvitations] =
    useState(initialInvitations);

  const [selectedUsers, setSelectedUsers] =
    useState([]);

  const [showInviteModal, setShowInviteModal] =
    useState(false);

  const [showGroupModal, setShowGroupModal] =
    useState(false);

  const [showCancelModal, setShowCancelModal] =
    useState(null);

  const [activeTab, setActiveTab] =
    useState("users");

  const [notice, setNotice] =
    useState("");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users
      .filter((user) => {
        if (!query) return true;

        return (
          user.name
            .toLowerCase()
            .includes(query) ||
          user.email
            .toLowerCase()
            .includes(query) ||
          user.group
            ?.toLowerCase()
            .includes(query)
        );
      })
      .filter(
        (user) =>
          selectedGroup === "All Groups" ||
          user.group === selectedGroup
      );
  }, [users, search, selectedGroup]);

  const filteredInvitations = useMemo(() => {
    if (statusFilter === "All") {
      return invitations;
    }

    return invitations.filter(
      (invitation) =>
        invitation.status === statusFilter
    );
  }, [invitations, statusFilter]);

  const invitationForUser = (userId) =>
    invitations.find(
      (invitation) =>
        invitation.userId === userId &&
        invitation.status !== "Cancelled"
    );

  const toggleUser = (userId) => {
    setSelectedUsers((current) =>
      current.includes(userId)
        ? current.filter(
            (id) => id !== userId
          )
        : [...current, userId]
    );
  };

  const selectAllFiltered = () => {
    const availableIds = filteredUsers
      .filter(
        (user) =>
          !invitationForUser(user.id)
      )
      .map((user) => user.id);

    setSelectedUsers((current) => {
      const allSelected = availableIds.every(
        (id) => current.includes(id)
      );

      if (allSelected) {
        return current.filter(
          (id) => !availableIds.includes(id)
        );
      }

      return Array.from(
        new Set([
          ...current,
          ...availableIds,
        ])
      );
    });
  };

  const sendInvitations = async (
    targetUsers
  ) => {
    if (!targetUsers.length) {
      setNotice(
        "Select at least one user to send an invitation."
      );
      return;
    }

    const now = new Date();

    const newInvitations =
      targetUsers
        .filter(
          (user) =>
            !invitationForUser(user.id)
        )
        .map((user) => ({
          id: `INV-${Date.now()}-${user.id}`,
          userId: user.id,
          name: user.name,
          email: user.email,
          status: "Pending",
          sentAt: now,
          resentAt: null,
        }));

    if (!newInvitations.length) {
      setNotice(
        "The selected users already have active invitations."
      );
      return;
    }

    setInvitations((current) => [
      ...newInvitations,
      ...current,
    ]);

    setSelectedUsers([]);
    setShowInviteModal(false);

    setNotice(
      `${newInvitations.length} invitation${
        newInvitations.length > 1
          ? "s"
          : ""
      } sent successfully.`
    );

    for (const invitation of newInvitations) {
      const user = targetUsers.find(
        (item) =>
          item.id === invitation.userId
      );

      if (user) {
        await onSendInvitation?.({
          eventId,
          eventTitle,
          user,
          invitation,
        });
      }
    }
  };

  const resendInvitation = async (
    invitation
  ) => {
    const resentAt = new Date();

    setInvitations((current) =>
      current.map((item) =>
        item.id === invitation.id
          ? {
              ...item,
              status: "Pending",
              resentAt,
            }
          : item
      )
    );

    setNotice(
      `Invitation resent to ${invitation.name}.`
    );

    await onResendInvitation?.({
      eventId,
      eventTitle,
      invitation,
    });
  };

  const cancelInvitation = async (
    invitation
  ) => {
    setInvitations((current) =>
      current.map((item) =>
        item.id === invitation.id
          ? {
              ...item,
              status: "Cancelled",
            }
          : item
      )
    );

    setShowCancelModal(null);

    setNotice(
      `Invitation for ${invitation.name} was cancelled.`
    );

    await onCancelInvitation?.({
      eventId,
      eventTitle,
      invitation,
    });
  };

  const respondToInvitation = async (
    invitation,
    response
  ) => {
    const nextStatus =
      response === "accept"
        ? "Accepted"
        : "Declined";

    setInvitations((current) =>
      current.map((item) =>
        item.id === invitation.id
          ? {
              ...item,
              status: nextStatus,
            }
          : item
      )
    );

    setNotice(
      `Invitation marked as ${nextStatus.toLowerCase()}.`
    );

    await onInvitationResponse?.({
      eventId,
      eventTitle,
      invitation,
      response,
    });
  };

  const pendingCount = invitations.filter(
    (item) => item.status === "Pending"
  ).length;

  const acceptedCount = invitations.filter(
    (item) => item.status === "Accepted"
  ).length;

  const declinedCount = invitations.filter(
    (item) => item.status === "Declined"
  ).length;

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Mail
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Tools
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Event Invitation Management
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Invite selected users or groups to{" "}
              <strong>{eventTitle}</strong> and track their invitation
              status.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowInviteModal(true)
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[9px] font-bold text-white hover:bg-indigo-700"
        >
          <UserPlus size={13} />
          Send Invitations
        </button>
      </div>

      {/* Notice */}
      {notice && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <p className="text-[9px] font-semibold text-indigo-700 dark:text-indigo-300">
            {notice}
          </p>

          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-indigo-400 hover:text-indigo-700"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Mail size={15} />}
          label="Total Invitations"
          value={invitations.length}
        />

        <StatCard
          icon={<Clock3 size={15} />}
          label="Pending"
          value={pendingCount}
        />

        <StatCard
          icon={<CheckCircle2 size={15} />}
          label="Accepted"
          value={acceptedCount}
        />

        <StatCard
          icon={<XCircle size={15} />}
          label="Declined"
          value={declinedCount}
        />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-xl bg-slate-200 p-1 dark:bg-slate-800">
        <TabButton
          active={activeTab === "users"}
          onClick={() => setActiveTab("users")}
        >
          Find Users
        </TabButton>

        <TabButton
          active={activeTab === "invitations"}
          onClick={() =>
            setActiveTab("invitations")
          }
        >
          Invitations
        </TabButton>
      </div>

      {/* User search */}
      {activeTab === "users" && (
        <div className="mt-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search users by name, email, or group..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>

            <select
              value={selectedGroup}
              onChange={(event) =>
                setSelectedGroup(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-[9px] font-semibold text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <option>All Groups</option>

              {groups.map((group) => (
                <option
                  key={group.id}
                  value={group.name}
                >
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[9px] text-slate-400">
              {filteredUsers.length} users found
            </p>

            <button
              type="button"
              onClick={selectAllFiltered}
              className="text-[9px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Select available users
            </button>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {filteredUsers.map((user) => {
              const existing =
                invitationForUser(user.id);

              const selected =
                selectedUsers.includes(user.id);

              return (
                <UserCard
                  key={user.id}
                  user={user}
                  selected={selected}
                  invitation={existing}
                  onToggle={() =>
                    toggleUser(user.id)
                  }
                />
              );
            })}
          </div>

          {selectedUsers.length > 0 && (
            <div className="sticky bottom-4 z-20 mt-5 flex items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-white p-3 shadow-lg dark:border-indigo-900/40 dark:bg-slate-900">
              <p className="text-[9px] font-bold text-slate-600 dark:text-slate-300">
                {selectedUsers.length} user
                {selectedUsers.length > 1
                  ? "s"
                  : ""}{" "}
                selected
              </p>

              <button
                type="button"
                onClick={() => {
                  const selected = users.filter(
                    (user) =>
                      selectedUsers.includes(
                        user.id
                      )
                  );

                  sendInvitations(selected);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[9px] font-bold text-white hover:bg-indigo-700"
              >
                <Send size={12} />
                Invite Selected
              </button>
            </div>
          )}
        </div>
      )}

      {/* Invitations */}
      {activeTab === "invitations" && (
        <div className="mt-5">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() =>
                  setStatusFilter(status)
                }
                className={`rounded-full border px-3 py-1.5 text-[8px] font-bold ${
                  statusFilter === status
                    ? "border-indigo-500 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {filteredInvitations.map(
              (invitation) => (
                <InvitationRow
                  key={invitation.id}
                  invitation={invitation}
                  onResend={() =>
                    resendInvitation(
                      invitation
                    )
                  }
                  onCancel={() =>
                    setShowCancelModal(
                      invitation
                    )
                  }
                  onAccept={() =>
                    respondToInvitation(
                      invitation,
                      "accept"
                    )
                  }
                  onDecline={() =>
                    respondToInvitation(
                      invitation,
                      "decline"
                    )
                  }
                />
              )
            )}
          </div>

          {filteredInvitations.length === 0 && (
            <EmptyState
              title="No invitations found"
              message="There are no invitations matching the selected status."
            />
          )}
        </div>
      )}

      {/* Group invitation modal */}
      {showInviteModal && (
        <InvitationModal
          users={users}
          groups={groups}
          onClose={() =>
            setShowInviteModal(false)
          }
          onSend={sendInvitations}
          onOpenGroup={() => {
            setShowInviteModal(false);
            setShowGroupModal(true);
          }}
        />
      )}

      {/* Group modal */}
      {showGroupModal && (
        <GroupInvitationModal
          groups={groups}
          users={users}
          onClose={() =>
            setShowGroupModal(false)
          }
          onSend={sendInvitations}
        />
      )}

      {/* Cancel confirmation */}
      {showCancelModal && (
        <ConfirmDialog
          title="Cancel invitation?"
          message={`The invitation sent to ${showCancelModal.name} will be cancelled.`}
          confirmLabel="Cancel Invitation"
          onCancel={() =>
            setShowCancelModal(null)
          }
          onConfirm={() =>
            cancelInvitation(
              showCancelModal
            )
          }
        />
      )}
    </section>
  );
};

/* ----------------------------------
   Stat card
----------------------------------- */

const StatCard = ({
  icon,
  label,
  value,
}) => {
  return (
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
};

/* ----------------------------------
   Tabs
----------------------------------- */

const TabButton = ({
  active,
  children,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg px-4 py-2.5 text-[9px] font-bold ${
        active
          ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
          : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
      }`}
    >
      {children}
    </button>
  );
};

/* ----------------------------------
   User card
----------------------------------- */

const UserCard = ({
  user,
  selected,
  invitation,
  onToggle,
}) => {
  const unavailable =
    Boolean(invitation);

  return (
    <article
      className={`rounded-2xl border bg-white p-4 transition dark:bg-slate-900 ${
        selected
          ? "border-indigo-400 ring-2 ring-indigo-100 dark:border-indigo-700 dark:ring-indigo-900/30"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          disabled={unavailable}
          onClick={onToggle}
          aria-label={
            selected
              ? `Deselect ${user.name}`
              : `Select ${user.name}`
          }
          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
            selected
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-slate-300 dark:border-slate-600"
          } ${
            unavailable
              ? "cursor-not-allowed opacity-40"
              : ""
          }`}
        >
          {selected && (
            <Check size={12} />
          )}
        </button>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          {getInitials(user.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white">
              {user.name}
            </h4>

            {invitation && (
              <InvitationStatus
                status={
                  invitation.status
                }
              />
            )}
          </div>

          <p className="mt-1 truncate text-[8px] text-slate-400">
            {user.email}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[7px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {user.role}
            </span>

            {user.group && (
              <span className="rounded-full bg-indigo-50 px-2 py-1 text-[7px] font-semibold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                {user.group}
              </span>
            )}
          </div>
        </div>
      </div>

      {unavailable && (
        <p className="mt-3 border-t border-slate-100 pt-3 text-[8px] text-slate-400 dark:border-slate-800">
          This user already has an active invitation.
        </p>
      )}
    </article>
  );
};

/* ----------------------------------
   Invitation row
----------------------------------- */

const InvitationRow = ({
  invitation,
  onResend,
  onCancel,
  onAccept,
  onDecline,
}) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          {getInitials(invitation.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white">
              {invitation.name}
            </h4>

            <InvitationStatus
              status={invitation.status}
            />
          </div>

          <p className="mt-1 text-[8px] text-slate-400">
            {invitation.email}
          </p>

          <p className="mt-2 text-[8px] text-slate-400">
            Sent {formatDate(invitation.sentAt)}
            {invitation.resentAt &&
              ` · Resent ${formatDate(
                invitation.resentAt
              )}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {invitation.status ===
            "Pending" && (
            <>
              <ActionButton
                icon={<RefreshCw size={11} />}
                label="Resend"
                onClick={onResend}
              />

              <ActionButton
                icon={<X size={11} />}
                label="Cancel"
                danger
                onClick={onCancel}
              />
            </>
          )}

          {invitation.status ===
            "Declined" && (
            <ActionButton
              icon={<RefreshCw size={11} />}
              label="Resend"
              onClick={onResend}
            />
          )}

          {invitation.status ===
            "Accepted" && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-[8px] font-bold text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle2 size={11} />
              Participant Accepted
            </span>
          )}
        </div>
      </div>

      {/* Optional participant response controls */}
      {invitation.status === "Pending" && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <span className="mr-auto text-[8px] text-slate-400">
            Invitation awaiting response
          </span>

          <button
            type="button"
            onClick={onAccept}
            className="rounded-lg bg-green-600 px-3 py-2 text-[8px] font-bold text-white hover:bg-green-700"
          >
            Accept
          </button>

          <button
            type="button"
            onClick={onDecline}
            className="rounded-lg border border-slate-200 px-3 py-2 text-[8px] font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Decline
          </button>
        </div>
      )}
    </article>
  );
};

/* ----------------------------------
   Invitation status
----------------------------------- */

const InvitationStatus = ({
  status,
}) => {
  const config = {
    Pending:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    Accepted:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    Declined:
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    Cancelled:
      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-[7px] font-bold ${config[status]}`}
    >
      {status}
    </span>
  );
};

/* ----------------------------------
   Action button
----------------------------------- */

const ActionButton = ({
  icon,
  label,
  onClick,
  danger = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[8px] font-bold ${
        danger
          ? "border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/10"
          : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

/* ----------------------------------
   Invitation modal
----------------------------------- */

const InvitationModal = ({
  users,
  onClose,
  onSend,
  onOpenGroup,
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] =
    useState([]);

  const results = users.filter((user) =>
    `${user.name} ${user.email} ${user.group}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const toggle = (userId) => {
    setSelected((current) =>
      current.includes(userId)
        ? current.filter(
            (id) => id !== userId
          )
        : [...current, userId]
    );
  };

  return (
    <ModalShell
      title="Send Event Invitations"
      subtitle="Select users who should receive an invitation."
      onClose={onClose}
    >
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search users..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
      </div>

      <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
        {results.map((user) => {
          const isSelected =
            selected.includes(user.id);

          return (
            <button
              key={user.id}
              type="button"
              onClick={() =>
                toggle(user.id)
              }
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${
                isSelected
                  ? "border-indigo-400 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-bold text-indigo-600">
                {getInitials(user.name)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
                  {user.name}
                </p>

                <p className="text-[7px] text-slate-400">
                  {user.email}
                </p>
              </div>

              <div
                className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-300"
                }`}
              >
                {isSelected && (
                  <Check size={11} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onOpenGroup}
          className="rounded-xl border border-slate-200 px-4 py-3 text-[9px] font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
        >
          Invite a Group
        </button>

        <button
          type="button"
          disabled={!selected.length}
          onClick={() =>
            onSend(
              users.filter((user) =>
                selected.includes(user.id)
              )
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[9px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={12} />
          Send ({selected.length})
        </button>
      </div>
    </ModalShell>
  );
};

/* ----------------------------------
   Group invitation modal
----------------------------------- */

const GroupInvitationModal = ({
  groups,
  users,
  onClose,
  onSend,
}) => {
  const [selectedGroup, setSelectedGroup] =
    useState(null);

  const groupUsers = selectedGroup
    ? users.filter(
        (user) =>
          user.group ===
          selectedGroup.name
      )
    : [];

  return (
    <ModalShell
      title="Invite a Group"
      subtitle="Send invitations to all members of a selected group."
      onClose={onClose}
    >
      <div className="space-y-2">
        {groups.map((group) => {
          const selected =
            selectedGroup?.id === group.id;

          return (
            <button
              key={group.id}
              type="button"
              onClick={() =>
                setSelectedGroup(group)
              }
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${
                selected
                  ? "border-indigo-400 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <Users size={15} />
              </div>

              <div className="flex-1">
                <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
                  {group.name}
                </p>

                <p className="mt-0.5 text-[7px] text-slate-400">
                  {group.members} members
                </p>
              </div>

              {selected && (
                <CheckCircle2
                  size={15}
                  className="text-indigo-600"
                />
              )}
            </button>
          );
        })}
      </div>

      {selectedGroup && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
          <p className="text-[8px] font-bold text-slate-500 dark:text-slate-400">
            {groupUsers.length} matching users will receive an invitation.
          </p>
        </div>
      )}

      <button
        type="button"
        disabled={
          !selectedGroup ||
          !groupUsers.length
        }
        onClick={() =>
          onSend(groupUsers)
        }
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[9px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Send size={12} />
        Invite Group
      </button>
    </ModalShell>
  );
};

/* ----------------------------------
   Modal shell
----------------------------------- */

const ModalShell = ({
  title,
  subtitle,
  children,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {title}
            </h3>

            <p className="mt-1 text-[8px] leading-4 text-slate-400">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mt-5">
          {children}
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------
   Confirm dialog
----------------------------------- */

const ConfirmDialog = ({
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-900/20">
            <XCircle size={17} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {title}
            </h3>

            <p className="mt-1 text-[9px] leading-4 text-slate-400">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-[9px] font-bold text-slate-500 dark:border-slate-700 dark:text-slate-300"
          >
            Keep
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-[9px] font-bold text-white hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyState = ({
  title,
  message,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <Mail
        size={22}
        className="mx-auto text-slate-300 dark:text-slate-600"
      />

      <h3 className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
        {title}
      </h3>

      <p className="mt-1 text-[8px] text-slate-400">
        {message}
      </p>
    </div>
  );
};

/* ----------------------------------
   Helpers
----------------------------------- */

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase() || ""
    )
    .join("");

const formatDate = (date) => {
  if (!date) return "";

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(date));
};

export default EventInvitationManagement;