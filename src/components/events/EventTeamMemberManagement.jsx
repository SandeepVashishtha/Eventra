import {
  Check,
  Clock3,
  MailPlus,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_TEAM = {
  name: "Code Warriors",
  maxMembers: 4,
  members: [
    {
      id: 1,
      name: "Aarav Patel",
      email: "aarav@example.com",
      role: "Leader",
    },
    {
      id: 2,
      name: "Priya Shah",
      email: "priya@example.com",
      role: "Member",
    },
  ],
  pendingInvitations: [
    {
      id: 3,
      name: "Rahul Mehta",
      email: "rahul@example.com",
    },
  ],
  pendingRequests: [
    {
      id: 4,
      name: "Neha Joshi",
      email: "neha@example.com",
    },
  ],
};

const EventTeamMemberManagement = ({
  initialTeam = DEFAULT_TEAM,
}) => {
  const [team, setTeam] = useState(initialTeam);
  const [inviteEmail, setInviteEmail] = useState("");
  const [message, setMessage] = useState("");

  const remainingSlots =
    team.maxMembers - team.members.length;

  const isFull = remainingSlots <= 0;

  const canInvite =
    !isFull &&
    inviteEmail.trim() &&
    !team.members.some(
      (member) =>
        member.email.toLowerCase() ===
        inviteEmail.trim().toLowerCase()
    ) &&
    !team.pendingInvitations.some(
      (invite) =>
        invite.email.toLowerCase() ===
        inviteEmail.trim().toLowerCase()
    );

  const sortedMembers = useMemo(
    () => [...team.members],
    [team.members]
  );

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleInvite = (event) => {
    event.preventDefault();

    if (!canInvite) {
      return;
    }

    const newInvitation = {
      id: Date.now(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail.trim(),
    };

    setTeam((current) => ({
      ...current,
      pendingInvitations: [
        ...current.pendingInvitations,
        newInvitation,
      ],
    }));

    setInviteEmail("");
    showMessage("Invitation sent successfully.");
  };

  const removeMember = (memberId) => {
    const member = team.members.find(
      (item) => item.id === memberId
    );

    if (!member || member.role === "Leader") {
      return;
    }

    setTeam((current) => ({
      ...current,
      members: current.members.filter(
        (item) => item.id !== memberId
      ),
    }));

    showMessage(`${member.name} was removed from the team.`);
  };

  const cancelInvitation = (invitationId) => {
    setTeam((current) => ({
      ...current,
      pendingInvitations:
        current.pendingInvitations.filter(
          (invite) => invite.id !== invitationId
        ),
    }));

    showMessage("Invitation cancelled.");
  };

  const acceptRequest = (request) => {
    if (isFull) {
      showMessage(
        "Team size limit reached. Remove a member first."
      );
      return;
    }

    setTeam((current) => ({
      ...current,
      members: [
        ...current.members,
        {
          id: request.id,
          name: request.name,
          email: request.email,
          role: "Member",
        },
      ],
      pendingRequests:
        current.pendingRequests.filter(
          (item) => item.id !== request.id
        ),
    }));

    showMessage(`${request.name} joined the team.`);
  };

  const rejectRequest = (requestId) => {
    setTeam((current) => ({
      ...current,
      pendingRequests:
        current.pendingRequests.filter(
          (item) => item.id !== requestId
        ),
    }));

    showMessage("Join request rejected.");
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Users size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Team Management
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {team.name}
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Manage members, invitations, requests and team roles.
            </p>
          </div>
        </div>

        {/* Capacity */}
        <div
          className={`rounded-full px-3 py-1.5 text-[6px] font-bold ${
            isFull
              ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
              : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
          }`}
        >
          {team.members.length} / {team.maxMembers} Members
        </div>
      </div>

      {/* Alert */}
      {message && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[7px] font-semibold text-green-700 dark:border-green-900/40 dark:bg-green-900/10 dark:text-green-400">
          {message}
        </div>
      )}

      {/* Capacity */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[7px] font-bold text-slate-700 dark:text-slate-300">
              Team Capacity
            </p>

            <p className="mt-1 text-[6px] text-slate-400">
              {isFull
                ? "Team size limit reached."
                : `${remainingSlots} slot${
                    remainingSlots === 1 ? "" : "s"
                  } remaining`}
            </p>
          </div>

          <Users
            size={18}
            className={
              isFull
                ? "text-red-500"
                : "text-indigo-500"
            }
          />
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all ${
              isFull
                ? "bg-red-500"
                : "bg-indigo-500"
            }`}
            style={{
              width: `${Math.min(
                (team.members.length /
                  team.maxMembers) *
                  100,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Invite */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <UserPlus
            size={16}
            className="text-indigo-500"
          />

          <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
            Invite Member
          </h3>
        </div>

        <form
          onSubmit={handleInvite}
          className="mt-4 flex flex-col gap-2 sm:flex-row"
        >
          <input
            type="email"
            value={inviteEmail}
            onChange={(event) =>
              setInviteEmail(event.target.value)
            }
            disabled={isFull}
            placeholder="member@example.com"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-[7px] outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          <button
            type="submit"
            disabled={!canInvite}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[7px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
          >
            <MailPlus size={13} />
            Send Invite
          </button>
        </form>

        {isFull && (
          <p className="mt-2 text-[6px] font-semibold text-red-500">
            Team size limit reached.
          </p>
        )}
      </div>

      {/* Members */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Team Members
            </h3>

            <p className="mt-1 text-[6px] text-slate-400">
              Manage current team members and roles.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {sortedMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onRemove={removeMember}
            />
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <Clock3
            size={15}
            className="text-amber-500"
          />

          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Pending Invitations
          </h3>
        </div>

        {team.pendingInvitations.length === 0 ? (
          <EmptyState text="No pending invitations." />
        ) : (
          <div className="space-y-2">
            {team.pendingInvitations.map((invite) => (
              <div
                key={invite.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <p className="text-[8px] font-bold text-slate-700 dark:text-slate-200">
                    {invite.name}
                  </p>

                  <p className="mt-1 text-[6px] text-slate-400">
                    {invite.email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    cancelInvitation(invite.id)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-[6px] font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                >
                  <X size={12} />
                  Cancel Invite
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Join Requests */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <UserPlus
            size={15}
            className="text-indigo-500"
          />

          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Join Requests
          </h3>
        </div>

        {team.pendingRequests.length === 0 ? (
          <EmptyState text="No pending join requests." />
        ) : (
          <div className="space-y-2">
            {team.pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <p className="text-[8px] font-bold text-slate-700 dark:text-slate-200">
                    {request.name}
                  </p>

                  <p className="mt-1 text-[6px] text-slate-400">
                    {request.email}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      acceptRequest(request)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-[6px] font-bold text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
                  >
                    <Check size={12} />
                    Accept
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      rejectRequest(request.id)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-[6px] font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                  >
                    <X size={12} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const MemberCard = ({ member, onRemove }) => {
  const isLeader = member.role === "Leader";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-[8px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          {member.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[8px] font-bold text-slate-700 dark:text-slate-200">
              {member.name}
            </p>

            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[5px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              {isLeader && <Shield size={9} />}
              {member.role}
            </span>
          </div>

          <p className="mt-1 text-[6px] text-slate-400">
            {member.email}
          </p>
        </div>
      </div>

      {!isLeader && (
        <button
          type="button"
          onClick={() => onRemove(member.id)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-[6px] font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
        >
          <Trash2 size={12} />
          Remove
        </button>
      )}
    </div>
  );
};

const EmptyState = ({ text }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
    <Users
      size={20}
      className="mx-auto text-slate-300 dark:text-slate-600"
    />

    <p className="mt-2 text-[7px] text-slate-400">
      {text}
    </p>
  </div>
);

export default EventTeamMemberManagement;