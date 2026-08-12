import {
  Edit3,
  Filter,
  FolderPlus,
  MoveRight,
  Search,
  Trash2,
  UserMinus,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_PARTICIPANTS = [
  {
    id: "P001",
    name: "Participant 1",
    email: "participant1@example.com",
    group: "Team Alpha",
  },
  {
    id: "P002",
    name: "Participant 2",
    email: "participant2@example.com",
    group: "Team Beta",
  },
  {
    id: "P003",
    name: "Participant 3",
    email: "participant3@example.com",
    group: "Team Alpha",
  },
  {
    id: "P004",
    name: "Participant 4",
    email: "participant4@example.com",
    group: "Unassigned",
  },
  {
    id: "P005",
    name: "Participant 5",
    email: "participant5@example.com",
    group: "Team Gamma",
  },
];

const DEFAULT_GROUPS = [
  {
    id: "group-alpha",
    name: "Team Alpha",
  },
  {
    id: "group-beta",
    name: "Team Beta",
  },
  {
    id: "group-gamma",
    name: "Team Gamma",
  },
];

const EventParticipantGroupManagement = ({
  eventId = "event-14404",
  eventTitle = "AI & ML Hackathon",
  initialParticipants = DEFAULT_PARTICIPANTS,
  initialGroups = DEFAULT_GROUPS,
  onGroupsChange,
  onParticipantsChange,
  className = "",
}) => {
  const [groups, setGroups] =
    useState(initialGroups);

  const [participants, setParticipants] =
    useState(initialParticipants);

  const [selectedGroup, setSelectedGroup] =
    useState("All");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [newGroupName, setNewGroupName] =
    useState("");

  const [editingGroupId, setEditingGroupId] =
    useState(null);

  const [editingGroupName, setEditingGroupName] =
    useState("");

  const [selectedParticipants, setSelectedParticipants] =
    useState([]);

  const [moveTarget, setMoveTarget] =
    useState("");

  const [notice, setNotice] =
    useState("");

  const filteredParticipants = useMemo(() => {
    const query = searchTerm
      .trim()
      .toLowerCase();

    return participants.filter((participant) => {
      const matchesGroup =
        selectedGroup === "All" ||
        participant.group === selectedGroup;

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
        matchesGroup &&
        matchesSearch
      );
    });
  }, [
    participants,
    selectedGroup,
    searchTerm,
  ]);

  const getGroupCount = (groupName) => {
    return participants.filter(
      (participant) =>
        participant.group === groupName
    ).length;
  };

  const updateParticipants = async (
    updatedParticipants
  ) => {
    setParticipants(
      updatedParticipants
    );

    await onParticipantsChange?.(
      updatedParticipants
    );
  };

  const updateGroups = async (
    updatedGroups
  ) => {
    setGroups(updatedGroups);

    await onGroupsChange?.(
      updatedGroups
    );
  };

  const createGroup = async () => {
    const name =
      newGroupName.trim();

    if (!name) {
      setNotice(
        "Please enter a group name."
      );
      return;
    }

    const exists = groups.some(
      (group) =>
        group.name.toLowerCase() ===
        name.toLowerCase()
    );

    if (exists) {
      setNotice(
        "A group with this name already exists."
      );
      return;
    }

    const newGroup = {
      id: `group-${Date.now()}`,
      name,
    };

    await updateGroups([
      ...groups,
      newGroup,
    ]);

    setNewGroupName("");

    setNotice(
      `Group "${name}" created successfully.`
    );
  };

  const startRename = (group) => {
    setEditingGroupId(group.id);
    setEditingGroupName(
      group.name
    );
  };

  const saveRename = async (groupId) => {
    const name =
      editingGroupName.trim();

    if (!name) {
      setNotice(
        "Group name cannot be empty."
      );
      return;
    }

    const duplicate = groups.some(
      (group) =>
        group.id !== groupId &&
        group.name.toLowerCase() ===
          name.toLowerCase()
    );

    if (duplicate) {
      setNotice(
        "Another group already has this name."
      );
      return;
    }

    const oldGroup = groups.find(
      (group) =>
        group.id === groupId
    );

    const updatedGroups =
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              name,
            }
          : group
      );

    const updatedParticipants =
      participants.map(
        (participant) =>
          participant.group ===
          oldGroup?.name
            ? {
                ...participant,
                group: name,
              }
            : participant
      );

    await updateGroups(
      updatedGroups
    );

    await updateParticipants(
      updatedParticipants
    );

    setEditingGroupId(null);
    setEditingGroupName("");

    if (
      selectedGroup ===
      oldGroup?.name
    ) {
      setSelectedGroup(name);
    }

    setNotice(
      "Group renamed successfully."
    );
  };

  const deleteGroup = async (
    groupId
  ) => {
    const group = groups.find(
      (item) =>
        item.id === groupId
    );

    if (!group) return;

    const updatedGroups =
      groups.filter(
        (item) =>
          item.id !== groupId
      );

    const updatedParticipants =
      participants.map(
        (participant) =>
          participant.group ===
          group.name
            ? {
                ...participant,
                group: "Unassigned",
              }
            : participant
      );

    await updateGroups(
      updatedGroups
    );

    await updateParticipants(
      updatedParticipants
    );

    if (
      selectedGroup ===
      group.name
    ) {
      setSelectedGroup("All");
    }

    setNotice(
      `"${group.name}" deleted. Participants were moved to Unassigned.`
    );
  };

  const toggleParticipant = (
    participantId
  ) => {
    setSelectedParticipants(
      (current) =>
        current.includes(
          participantId
        )
          ? current.filter(
              (id) =>
                id !== participantId
            )
          : [
              ...current,
              participantId,
            ]
    );
  };

  const toggleAllVisible = () => {
    const visibleIds =
      filteredParticipants.map(
        (participant) =>
          participant.id
      );

    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) =>
        selectedParticipants.includes(
          id
        )
      );

    if (allSelected) {
      setSelectedParticipants(
        (current) =>
          current.filter(
            (id) =>
              !visibleIds.includes(id)
          )
      );
    } else {
      setSelectedParticipants(
        (current) => [
          ...new Set([
            ...current,
            ...visibleIds,
          ]),
        ]
      );
    }
  };

  const moveParticipants = async () => {
    if (!moveTarget) {
      setNotice(
        "Select a destination group."
      );
      return;
    }

    if (
      selectedParticipants.length ===
      0
    ) {
      setNotice(
        "Select at least one participant."
      );
      return;
    }

    const updatedParticipants =
      participants.map(
        (participant) =>
          selectedParticipants.includes(
            participant.id
          )
            ? {
                ...participant,
                group: moveTarget,
              }
            : participant
      );

    await updateParticipants(
      updatedParticipants
    );

    setSelectedParticipants([]);
    setMoveTarget("");

    setNotice(
      `${selectedParticipants.length} participant${
        selectedParticipants.length ===
        1
          ? ""
          : "s"
      } moved to ${moveTarget}.`
    );
  };

  const removeParticipants = async () => {
    if (
      selectedParticipants.length ===
      0
    ) {
      setNotice(
        "Select at least one participant."
      );
      return;
    }

    const updatedParticipants =
      participants.map(
        (participant) =>
          selectedParticipants.includes(
            participant.id
          )
            ? {
                ...participant,
                group: "Unassigned",
              }
            : participant
      );

    await updateParticipants(
      updatedParticipants
    );

    setSelectedParticipants([]);

    setNotice(
      "Selected participants were removed from their groups."
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
              Participant Group Management
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Create groups, assign participants, move
              participants between groups, and filter the
              event directory.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <Users
            size={14}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <span className="text-[8px] font-bold text-indigo-700 dark:text-indigo-300">
            {participants.length} Participants
          </span>
        </div>
      </div>

      {/* Notice */}
      {notice && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <Users
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
          icon={<Users size={15} />}
          label="Participants"
          value={participants.length}
        />

        <SummaryCard
          icon={<FolderPlus size={15} />}
          label="Groups"
          value={groups.length}
        />

        <SummaryCard
          icon={<Users size={15} />}
          label="Assigned"
          value={
            participants.filter(
              (participant) =>
                participant.group !==
                "Unassigned"
            ).length
          }
        />

        <SummaryCard
          icon={<UserMinus size={15} />}
          label="Unassigned"
          value={getGroupCount(
            "Unassigned"
          )}
        />
      </div>

      {/* Create group */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <FolderPlus
            size={15}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <h3 className="text-xs font-bold text-slate-800 dark:text-white">
            Create Participant Group
          </h3>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={newGroupName}
            onChange={(event) =>
              setNewGroupName(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                createGroup();
              }
            }}
            placeholder="Example: Morning Batch"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />

          <button
            type="button"
            onClick={createGroup}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700"
          >
            <FolderPlus size={13} />
            Create Group
          </button>
        </div>
      </div>

      {/* Group cards */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Participant Groups
            </h3>

            <p className="mt-1 text-[8px] text-slate-400">
              Manage batches, teams, tracks, or other
              participant segments.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <GroupCard
            name="Unassigned"
            count={getGroupCount(
              "Unassigned"
            )}
            active={
              selectedGroup ===
              "Unassigned"
            }
            onSelect={() =>
              setSelectedGroup(
                "Unassigned"
              )
            }
            isSystem
          />

          {groups.map((group) => (
            <GroupCard
              key={group.id}
              name={group.name}
              count={getGroupCount(
                group.name
              )}
              active={
                selectedGroup ===
                group.name
              }
              editing={
                editingGroupId ===
                group.id
              }
              editingName={
                editingGroupName
              }
              onEditingNameChange={
                setEditingGroupName
              }
              onSelect={() =>
                setSelectedGroup(
                  group.name
                )
              }
              onRename={() =>
                startRename(group)
              }
              onSaveRename={() =>
                saveRename(group.id)
              }
              onCancelRename={() => {
                setEditingGroupId(null);
                setEditingGroupName(
                  ""
                );
              }}
              onDelete={() =>
                deleteGroup(group.id)
              }
            />
          ))}
        </div>
      </div>

      {/* Participant directory */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Participant Directory
            </h3>

            <p className="mt-1 text-[8px] text-slate-400">
              {filteredParticipants.length} participant
              {filteredParticipants.length ===
              1
                ? ""
                : "s"} currently displayed.
            </p>
          </div>

          <div className="relative w-full lg:w-72">
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
              placeholder="Search participants..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        {/* Filter */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400">
            <Filter size={12} />
            Filter:
          </div>

          <button
            type="button"
            onClick={() =>
              setSelectedGroup("All")
            }
            className={`rounded-xl px-3 py-2 text-[8px] font-bold ${
              selectedGroup === "All"
                ? "bg-indigo-600 text-white"
                : "border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"
            }`}
          >
            All
          </button>

          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() =>
                setSelectedGroup(
                  group.name
                )
              }
              className={`rounded-xl px-3 py-2 text-[8px] font-bold ${
                selectedGroup ===
                group.name
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"
              }`}
            >
              {group.name}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {selectedParticipants.length >
          0 && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-900/30 dark:bg-indigo-900/10 sm:flex-row sm:items-center">
            <span className="text-[8px] font-bold text-indigo-700 dark:text-indigo-300">
              {selectedParticipants.length} selected
            </span>

            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-end">
              <select
                value={moveTarget}
                onChange={(event) =>
                  setMoveTarget(
                    event.target.value
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[8px] outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="">
                  Move to group...
                </option>

                <option value="Unassigned">
                  Unassigned
                </option>

                {groups.map((group) => (
                  <option
                    key={group.id}
                    value={group.name}
                  >
                    {group.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={
                  moveParticipants
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-[8px] font-bold text-white hover:bg-indigo-700"
              >
                <MoveRight size={12} />
                Move
              </button>

              <button
                type="button"
                onClick={
                  removeParticipants
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-[8px] font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400"
              >
                <UserMinus size={12} />
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-100 text-left dark:border-slate-800">
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={
                      filteredParticipants.length >
                        0 &&
                      filteredParticipants.every(
                        (participant) =>
                          selectedParticipants.includes(
                            participant.id
                          )
                      )
                    }
                    onChange={
                      toggleAllVisible
                    }
                    className="h-3.5 w-3.5 accent-indigo-600"
                  />
                </th>

                <th className="px-3 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                  Participant
                </th>

                <th className="px-3 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                  Email
                </th>

                <th className="px-3 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                  Group
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredParticipants.map(
                (participant) => (
                  <tr
                    key={participant.id}
                    className="border-b border-slate-50 dark:border-slate-800/70"
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(
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

                    <td className="px-3 py-3">
                      <p className="text-[8px] font-bold text-slate-700 dark:text-slate-200">
                        {participant.name}
                      </p>

                      <p className="mt-1 text-[7px] text-slate-400">
                        {participant.id}
                      </p>
                    </td>

                    <td className="px-3 py-3 text-[8px] text-slate-500 dark:text-slate-400">
                      {participant.email}
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1.5 text-[7px] font-bold ${
                          participant.group ===
                          "Unassigned"
                            ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                        }`}
                      >
                        {participant.group}
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
          <div className="py-10 text-center">
            <Users
              size={25}
              className="mx-auto text-slate-300 dark:text-slate-700"
            />

            <p className="mt-3 text-xs font-bold text-slate-500">
              No participants found
            </p>

            <p className="mt-1 text-[8px] text-slate-400">
              Try changing the group filter or search term.
            </p>
          </div>
        )}
      </div>

      {/* Backend integration */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <Users
            size={15}
            className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
              Backend integration
            </p>

            <p className="mt-1 text-[8px] leading-4 text-slate-400">
              Connect{" "}
              <code className="mx-1 rounded bg-slate-100 px-1 dark:bg-slate-800">
                onGroupsChange
              </code>{" "}
              and{" "}
              <code className="mx-1 rounded bg-slate-100 px-1 dark:bg-slate-800">
                onParticipantsChange
              </code>{" "}
              to your API for persistent group and participant
              assignments.
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

const GroupCard = ({
  name,
  count,
  active,
  isSystem = false,
  editing = false,
  editingName = "",
  onEditingNameChange,
  onSelect,
  onRename,
  onSaveRename,
  onCancelRename,
  onDelete,
}) => (
  <div
    className={`rounded-2xl border p-4 transition ${
      active
        ? "border-indigo-400 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/10"
        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
    }`}
  >
    {editing ? (
      <div className="flex gap-2">
        <input
          autoFocus
          value={editingName}
          onChange={(event) =>
            onEditingNameChange(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSaveRename();
            }

            if (event.key === "Escape") {
              onCancelRename();
            }
          }}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />

        <button
          type="button"
          onClick={onSaveRename}
          className="rounded-lg bg-green-600 px-2.5 text-white"
        >
          ✓
        </button>

        <button
          type="button"
          onClick={onCancelRename}
          className="rounded-lg bg-slate-100 px-2.5 text-slate-500 dark:bg-slate-800"
        >
          <X size={12} />
        </button>
      </div>
    ) : (
      <>
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onSelect}
            className="flex min-w-0 flex-1 items-start gap-3 text-left"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                active
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              <Users size={15} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[9px] font-bold text-slate-700 dark:text-slate-200">
                {name}
              </p>

              <p className="mt-1 text-[7px] text-slate-400">
                {count} participant
                {count === 1
                  ? ""
                  : "s"}
              </p>
            </div>
          </button>

          {!isSystem && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={onRename}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                title="Rename group"
              >
                <Edit3 size={12} />
              </button>

              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/10"
                title="Delete group"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onSelect}
          className={`mt-4 w-full rounded-xl px-3 py-2 text-[7px] font-bold ${
            active
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          }`}
        >
          {active
            ? "Currently Selected"
            : "View Participants"}
        </button>
      </>
    )}
  </div>
);

export default EventParticipantGroupManagement;