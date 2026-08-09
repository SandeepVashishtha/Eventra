import { useMemo, useState } from "react";
import {
  Check,
  Plus,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import TeamMemberCard from "./TeamMemberCard";
import {
  createTeam,
  getTeamRoles,
  searchParticipantsBySkills,
  addTeamMember,
  removeTeamMember,
  createTeamRequest,
  updateTeamRequestStatus,
  validateTeam,
} from "../../utils/teamFormationUtils";

const TeamFormation = ({
  participants = [],
  currentUser = null,
  initialTeam = null,
  maxTeamSize = 4,
  onTeamChange,
  onRequestChange,
}) => {
  const [team, setTeam] = useState(
    initialTeam || null
  );

  const [teamName, setTeamName] =
    useState(
      initialTeam?.name || ""
    );

  const [requiredRoles, setRequiredRoles] =
    useState(
      initialTeam?.requiredRoles || []
    );

  const [roleInput, setRoleInput] =
    useState("");

  const [skillSearch, setSkillSearch] =
    useState("");

  const [requests, setRequests] =
    useState(
      initialTeam?.requests || []
    );

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const roles = useMemo(
    () => getTeamRoles(team),
    [team]
  );

  const members =
    team?.members || [];

  const filteredParticipants =
    useMemo(() => {
      return searchParticipantsBySkills(
        participants,
        skillSearch
      ).filter(
        (participant) =>
          !members.some(
            (member) =>
              member.id ===
              participant.id
          )
      );
    }, [
      participants,
      skillSearch,
      members,
    ]);

  const handleCreateTeam = () => {
    setError("");
    setSuccess("");

    if (!teamName.trim()) {
      setError(
        "Please enter a team name."
      );
      return;
    }

    const newTeam = createTeam({
      name: teamName.trim(),
      requiredRoles,
      createdBy:
        currentUser?.id || null,
      maxTeamSize,
    });

    setTeam(newTeam);
    onTeamChange?.(newTeam);

    setSuccess(
      "Team created successfully."
    );
  };

  const handleAddRole = () => {
    const role = roleInput.trim();

    if (!role) {
      return;
    }

    const alreadyExists =
      requiredRoles.some(
        (item) =>
          item.toLowerCase() ===
          role.toLowerCase()
      );

    if (alreadyExists) {
      setRoleInput("");
      return;
    }

    setRequiredRoles([
      ...requiredRoles,
      role,
    ]);

    setRoleInput("");
  };

  const handleRemoveRole = (role) => {
    setRequiredRoles(
      requiredRoles.filter(
        (item) => item !== role
      )
    );
  };

  const handleInvite = (
    participant
  ) => {
    if (!team) {
      setError(
        "Create a team before inviting participants."
      );
      return;
    }

    if (
      members.length >= maxTeamSize
    ) {
      setError(
        "The team has reached its maximum size."
      );
      return;
    }

    const alreadyRequested =
      requests.some(
        (request) =>
          request.participantId ===
            participant.id &&
          request.status ===
            "pending"
      );

    if (alreadyRequested) {
      return;
    }

    const request =
      createTeamRequest({
        teamId: team.id,
        participantId:
          participant.id,
        participantName:
          participant.name,
        role:
          participant.role ||
          "",
        invitedBy:
          currentUser?.id || null,
      });

    const updatedRequests = [
      ...requests,
      request,
    ];

    setRequests(
      updatedRequests
    );

    onRequestChange?.(
      updatedRequests
    );

    setSuccess(
      `Invitation sent to ${
        participant.name ||
        "participant"
      }.`
    );
  };

  const handleRequestStatus = (
    request,
    status
  ) => {
    const updatedRequests =
      requests.map((item) =>
        item.id === request.id
          ? updateTeamRequestStatus(
              item,
              status
            )
          : item
      );

    setRequests(
      updatedRequests
    );

    onRequestChange?.(
      updatedRequests
    );

    if (
      status === "accepted"
    ) {
      const participant =
        participants.find(
          (item) =>
            item.id ===
            request.participantId
        );

      if (participant) {
        handleAddMember(
          participant,
          request.role
        );
      }
    }
  };

  const handleAddMember = (
    participant,
    role = ""
  ) => {
    if (!team) {
      return;
    }

    if (
      members.length >= maxTeamSize
    ) {
      setError(
        "The team has reached its maximum size."
      );
      return;
    }

    if (
      members.some(
        (member) =>
          member.id ===
          participant.id
      )
    ) {
      return;
    }

    const updatedTeam =
      addTeamMember(
        team,
        {
          ...participant,
          role:
            role ||
            participant.role ||
            "",
        }
      );

    setTeam(updatedTeam);
    onTeamChange?.(
      updatedTeam
    );

    setSuccess(
      `${
        participant.name ||
        "Participant"
      } joined the team.`
    );
  };

  const handleRemoveMember = (
    memberId
  ) => {
    if (!team) {
      return;
    }

    const updatedTeam =
      removeTeamMember(
        team,
        memberId
      );

    setTeam(updatedTeam);
    onTeamChange?.(
      updatedTeam
    );
  };

  const handleValidateTeam = () => {
    if (!team) {
      setError(
        "Create a team first."
      );
      return;
    }

    const result =
      validateTeam(team);

    if (!result.valid) {
      setError(
        result.errors.join(" ")
      );
      setSuccess("");
      return;
    }

    setError("");
    setSuccess(
      "Team is ready for participation."
    );
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <Users
            size={23}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Team Formation
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create a team, define required roles,
            and find participants with matching
            skills.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
          {success}
        </div>
      )}

      {/* Team creation */}
      {!team && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Create Your Team
          </h3>

          <div className="mt-5">
            <label
              htmlFor="team-name"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Team Name
            </label>

            <input
              id="team-name"
              value={teamName}
              onChange={(event) =>
                setTeamName(
                  event.target.value
                )
              }
              placeholder="Enter team name"
              className={inputClass}
            />
          </div>

          <RoleEditor
            roles={requiredRoles}
            roleInput={roleInput}
            setRoleInput={setRoleInput}
            onAddRole={handleAddRole}
            onRemoveRole={
              handleRemoveRole
            }
          />

          <button
            type="button"
            onClick={handleCreateTeam}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus size={17} />
            Create Team
          </button>
        </div>
      )}

      {/* Existing team */}
      {team && (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                  Hackathon Team
                </span>

                <h3 className="mt-1 text-xl font-bold text-slate-800 dark:text-white">
                  {team.name}
                </h3>
              </div>

              <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {members.length} /{" "}
                {maxTeamSize} members
              </div>
            </div>

            <RoleEditor
              roles={requiredRoles}
              roleInput={roleInput}
              setRoleInput={setRoleInput}
              onAddRole={handleAddRole}
              onRemoveRole={
                handleRemoveRole
              }
            />

            <button
              type="button"
              onClick={handleValidateTeam}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Check size={16} />
              Validate Team
            </button>
          </div>

          {/* Members */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Team Members
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Current members of your team.
              </p>
            </div>

            {members.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {members.map(
                  (member) => (
                    <TeamMemberCard
                      key={member.id}
                      member={member}
                      isTeamMember
                      onRemove={() =>
                        handleRemoveMember(
                          member.id
                        )
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyState text="No team members yet." />
            )}
          </div>

          {/* Participant search */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Find Teammates
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Search participants by their skills.
              </p>
            </div>

            <div className="relative mt-5">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={skillSearch}
                onChange={(event) =>
                  setSkillSearch(
                    event.target.value
                  )
                }
                placeholder="Search skills, e.g. React, Python, UI/UX"
                className={`${inputClass} pl-10`}
              />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {filteredParticipants.map(
                (participant) => (
                  <TeamMemberCard
                    key={
                      participant.id
                    }
                    member={
                      participant
                    }
                    actionLabel="Invite"
                    actionIcon={Send}
                    onAction={() =>
                      handleInvite(
                        participant
                      )
                    }
                  />
                )
              ))}
            </div>

            {filteredParticipants.length ===
              0 && (
              <EmptyState
                text={
                  skillSearch
                    ? "No participants found with matching skills."
                    : "No available participants found."
                }
              />
            )}
          </div>

          {/* Requests */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Team Requests
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage invitations and team requests.
              </p>
            </div>

            {requests.length > 0 ? (
              <div className="space-y-3">
                {requests.map(
                  (request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      onAccept={() =>
                        handleRequestStatus(
                          request,
                          "accepted"
                        )
                      }
                      onReject={() =>
                        handleRequestStatus(
                          request,
                          "rejected"
                        )
                      }
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyState text="No team requests yet." />
            )}
          </div>
        </>
      )}
    </section>
  );
};

const RoleEditor = ({
  roles,
  roleInput,
  setRoleInput,
  onAddRole,
  onRemoveRole,
}) => (
  <div className="mt-6">
    <label
      htmlFor="required-role"
      className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
    >
      Required Roles
    </label>

    <div className="flex gap-2">
      <input
        id="required-role"
        value={roleInput}
        onChange={(event) =>
          setRoleInput(
            event.target.value
          )
        }
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onAddRole();
          }
        }}
        placeholder="e.g. Frontend Developer"
        className={inputClass}
      />

      <button
        type="button"
        onClick={onAddRole}
        className="shrink-0 rounded-xl border border-slate-200 px-4 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Add required role"
      >
        <Plus size={18} />
      </button>
    </div>

    {roles.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-2">
        {roles.map((role) => (
          <span
            key={role}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
          >
            {role}

            <button
              type="button"
              onClick={() =>
                onRemoveRole(role)
              }
              aria-label={`Remove ${role}`}
              className="rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900"
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>
    )}
  </div>
);

const RequestCard = ({
  request,
  onAccept,
  onReject,
}) => {
  const status =
    String(
      request.status || "pending"
    ).toLowerCase();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h4 className="font-semibold text-slate-800 dark:text-white">
          {request.participantName ||
            "Participant"}
        </h4>

        {request.role && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Requested role:{" "}
            {request.role}
          </p>
        )}

        <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {status}
        </span>
      </div>

      {status === "pending" && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAccept}
            className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            <Check size={15} />
            Accept
          </button>

          <button
            type="button"
            onClick={onReject}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <X size={15} />
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

const EmptyState = ({
  text,
}) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
    <Users
      size={32}
      className="mx-auto text-slate-400"
    />

    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
      {text}
    </p>
  </div>
);

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

export default TeamFormation;