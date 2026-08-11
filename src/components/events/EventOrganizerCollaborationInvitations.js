import {
  Check,
  ChevronDown,
  Mail,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const ROLES = [
  "Co-organizer",
  "Volunteer Coordinator",
  "Content Manager",
  "Participant Manager",
];

const INITIAL_COLLABORATORS = [
  {
    id: "collab-1",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    role: "Co-organizer",
    status: "active",
  },
  {
    id: "collab-2",
    name: "Priya Patel",
    email: "priya@example.com",
    role: "Content Manager",
    status: "active",
  },
];

const INITIAL_INVITATIONS = [
  {
    id: "invite-1",
    name: "Rahul Mehta",
    email: "rahul@example.com",
    role: "Volunteer Coordinator",
    status: "pending",
  },
];

const EventOrganizerCollaborationInvitations = ({
  initialCollaborators = INITIAL_COLLABORATORS,
  initialInvitations = INITIAL_INVITATIONS,
  onInvite,
  onAccept,
  onReject,
  onRemove,
  onRoleChange,
  className = "",
}) => {
  const [collaborators, setCollaborators] =
    useState(initialCollaborators);

  const [invitations, setInvitations] =
    useState(initialInvitations);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] =
    useState(ROLES[0]);

  const [search, setSearch] =
    useState("");

  const [message, setMessage] =
    useState("");

  const activeCollaborators =
    useMemo(
      () =>
        collaborators.filter(
          (person) =>
            person.status === "active"
        ),
      [collaborators]
    );

  const filteredCollaborators =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return activeCollaborators;
      }

      return activeCollaborators.filter(
        (person) =>
          person.name
            .toLowerCase()
            .includes(query) ||
          person.email
            .toLowerCase()
            .includes(query) ||
          person.role
            .toLowerCase()
            .includes(query)
      );
    }, [
      search,
      activeCollaborators,
    ]);

  const pendingInvitations =
    invitations.filter(
      (invite) =>
        invite.status === "pending"
    );

  const handleInvite = (event) => {
    event.preventDefault();

    const cleanName = name.trim();
    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setMessage(
        "Please enter the collaborator name and email."
      );
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setMessage(
        "Please enter a valid email address."
      );
      return;
    }

    const alreadyExists =
      collaborators.some(
        (person) =>
          person.email.toLowerCase() ===
          cleanEmail
      );

    const alreadyInvited =
      invitations.some(
        (invite) =>
          invite.email.toLowerCase() ===
          cleanEmail &&
          invite.status === "pending"
      );

    if (alreadyExists) {
      setMessage(
        "This user is already an active collaborator."
      );
      return;
    }

    if (alreadyInvited) {
      setMessage(
        "An invitation is already pending for this user."
      );
      return;
    }

    const invitation = {
      id: createId(),
      name: cleanName,
      email: cleanEmail,
      role,
      status: "pending",
    };

    setInvitations((current) => [
      ...current,
      invitation,
    ]);

    onInvite?.(invitation);

    setName("");
    setEmail("");
    setRole(ROLES[0]);
    setMessage(
      `Invitation sent to ${cleanEmail}.`
    );
  };

  const handleAccept = (invitation) => {
    const collaborator = {
      id: createId(),
      name: invitation.name,
      email: invitation.email,
      role: invitation.role,
      status: "active",
    };

    setCollaborators((current) => [
      ...current,
      collaborator,
    ]);

    setInvitations((current) =>
      current.filter(
        (item) =>
          item.id !== invitation.id
      )
    );

    onAccept?.(invitation);

    setMessage(
      `${invitation.name} is now an active collaborator.`
    );
  };

  const handleReject = (invitation) => {
    setInvitations((current) =>
      current.map((item) =>
        item.id === invitation.id
          ? {
              ...item,
              status: "rejected",
            }
          : item
      )
    );

    onReject?.(invitation);

    setMessage(
      `Invitation for ${invitation.name} was rejected.`
    );
  };

  const handleRemove = (collaborator) => {
    const confirmed =
      window.confirm(
        `Remove ${collaborator.name} from this event?`
      );

    if (!confirmed) {
      return;
    }

    setCollaborators((current) =>
      current.filter(
        (person) =>
          person.id !== collaborator.id
      )
    );

    onRemove?.(collaborator);

    setMessage(
      `${collaborator.name} was removed.`
    );
  };

  const handleRoleChange = (
    collaborator,
    newRole
  ) => {
    setCollaborators((current) =>
      current.map((person) =>
        person.id === collaborator.id
          ? {
              ...person,
              role: newRole,
            }
          : person
      )
    );

    onRoleChange?.(
      collaborator,
      newRole
    );

    setMessage(
      `${collaborator.name}'s role was updated.`
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
            <Users
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Event Management
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Organizer Collaboration
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Invite organizers and volunteers to help manage
              this event.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatBadge
            label="Active"
            value={
              activeCollaborators.length
            }
          />

          <StatBadge
            label="Pending"
            value={
              pendingInvitations.length
            }
          />
        </div>
      </div>

      {/* Invite form */}
      <form
        onSubmit={handleInvite}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-center gap-2">
          <UserPlus
            size={16}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Invite Collaborator
          </h3>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Collaborator name"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Email
            </label>

            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="user@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Role
            </label>

            <RoleSelect
              value={role}
              onChange={setRole}
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700 sm:w-auto"
        >
          <UserPlus size={14} />
          Send Invitation
        </button>
      </form>

      {/* Message */}
      {message && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-[10px] font-semibold text-green-700 dark:border-green-900/40 dark:bg-green-900/10 dark:text-green-400">
          {message}
        </div>
      )}

      {/* Pending invitations */}
      {pendingInvitations.length >
        0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Pending Invitations
              </h3>

              <p className="mt-1 text-[10px] text-slate-400">
                Invitations waiting for a response.
              </p>
            </div>

            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              {pendingInvitations.length} pending
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {pendingInvitations.map(
              (invitation) => (
                <PendingInvitation
                  key={invitation.id}
                  invitation={invitation}
                  onAccept={() =>
                    handleAccept(
                      invitation
                    )
                  }
                  onReject={() =>
                    handleReject(
                      invitation
                    )
                  }
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Active collaborators */}
      <div className="mt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Active Collaborators
            </h3>

            <p className="mt-1 text-[10px] text-slate-400">
              People currently helping manage this event.
            </p>
          </div>

          {activeCollaborators.length >
            0 && (
            <div className="relative sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search collaborators..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[10px] text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>
          )}
        </div>

        <div className="mt-3 space-y-2">
          {filteredCollaborators.length ===
          0 ? (
            <EmptyCollaborators />
          ) : (
            filteredCollaborators.map(
              (collaborator) => (
                <CollaboratorRow
                  key={collaborator.id}
                  collaborator={
                    collaborator
                  }
                  onRoleChange={(
                    newRole
                  ) =>
                    handleRoleChange(
                      collaborator,
                      newRole
                    )
                  }
                  onRemove={() =>
                    handleRemove(
                      collaborator
                    )
                  }
                />
              )
            )
          )}
        </div>
      </div>

      {/* Role information */}
      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={17}
            className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
              Collaboration Roles
            </h3>

            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {ROLES.map((item) => (
                <div
                  key={item}
                  className="rounded-lg bg-white/70 px-3 py-2 dark:bg-slate-900/50"
                >
                  <p className="text-[9px] font-semibold text-slate-700 dark:text-slate-200">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ----------------------------------
   Pending invitation
----------------------------------- */

const PendingInvitation = ({
  invitation,
  onAccept,
  onReject,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-white p-3 dark:border-amber-900/30 dark:bg-slate-900 sm:flex-row sm:items-center">
      <Avatar
        name={invitation.name}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-800 dark:text-white">
          {invitation.name}
        </p>

        <p className="truncate text-[9px] text-slate-400">
          {invitation.email}
        </p>

        <span className="mt-1 inline-block rounded-full bg-amber-50 px-2 py-1 text-[8px] font-bold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
          {invitation.role}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-[9px] font-bold text-white hover:bg-green-700 sm:flex-none"
        >
          <Check size={12} />
          Accept
        </button>

        <button
          type="button"
          onClick={onReject}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-[9px] font-semibold text-red-500 hover:bg-red-50 sm:flex-none dark:border-red-900/30 dark:hover:bg-red-900/20"
        >
          <X size={12} />
          Reject
        </button>
      </div>
    </div>
  );
};

/* ----------------------------------
   Collaborator row
----------------------------------- */

const CollaboratorRow = ({
  collaborator,
  onRoleChange,
  onRemove,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center">
      <Avatar
        name={collaborator.name}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-800 dark:text-white">
          {collaborator.name}
        </p>

        <p className="truncate text-[9px] text-slate-400">
          {collaborator.email}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <RoleSelect
          value={collaborator.role}
          onChange={onRoleChange}
        />

        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1.5 text-[8px] font-bold text-green-600 dark:bg-green-900/20 dark:text-green-400">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Active
        </span>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${collaborator.name}`}
          className="rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

/* ----------------------------------
   Role select
----------------------------------- */

const RoleSelect = ({
  value,
  onChange,
}) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-[10px] font-semibold text-slate-600 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
      >
        {ROLES.map((item) => (
          <option
            key={item}
            value={item}
          >
            {item}
          </option>
        ))}
      </select>

      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
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
   Stat badge
----------------------------------- */

const StatBadge = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm font-bold text-slate-800 dark:text-white">
        {value}
      </p>

      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyCollaborators = () => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
        <Users
          size={18}
          className="text-slate-400"
        />
      </div>

      <h3 className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
        No collaborators found
      </h3>

      <p className="mt-1 text-[9px] text-slate-400">
        Invite someone to help manage this event.
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

const createId = () => {
  if (
    typeof crypto !==
      "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `collab-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

export default EventOrganizerCollaborationInvitations;