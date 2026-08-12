import {
  Bell,
  Check,
  ChevronDown,
  Filter,
  Mail,
  MessageSquare,
  Send,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_PARTICIPANTS = [
  {
    id: "P001",
    name: "Participant 1",
    team: "Team Alpha",
    registrationStatus: "Approved",
    attendanceStatus: "Present",
    category: "Student",
    submissionStatus: "Submitted",
    sessions: ["AI Workshop", "Hackathon"],
  },
  {
    id: "P002",
    name: "Participant 2",
    team: "Team Beta",
    registrationStatus: "Approved",
    attendanceStatus: "Present",
    category: "Professional",
    submissionStatus: "Pending",
    sessions: ["AI Workshop"],
  },
  {
    id: "P003",
    name: "Participant 3",
    team: "Team Alpha",
    registrationStatus: "Approved",
    attendanceStatus: "Absent",
    category: "Student",
    submissionStatus: "Pending",
    sessions: [],
  },
  {
    id: "P004",
    name: "Participant 4",
    team: "Team Gamma",
    registrationStatus: "Pending",
    attendanceStatus: "Not Checked",
    category: "Student",
    submissionStatus: "Not Started",
    sessions: ["Hackathon"],
  },
  {
    id: "P005",
    name: "Participant 5",
    team: "Team Beta",
    registrationStatus: "Approved",
    attendanceStatus: "Present",
    category: "Professional",
    submissionStatus: "Submitted",
    sessions: ["AI Workshop"],
  },
];

const FILTER_OPTIONS = [
  {
    key: "team",
    label: "Team",
  },
  {
    key: "registrationStatus",
    label: "Registration Status",
  },
  {
    key: "attendanceStatus",
    label: "Attendance Status",
  },
  {
    key: "category",
    label: "Participant Category",
  },
  {
    key: "submissionStatus",
    label: "Submission Status",
  },
  {
    key: "session",
    label: "Session Participation",
  },
];

const EventParticipantCommunicationGroups = ({
  participants = DEFAULT_PARTICIPANTS,
  eventId = "event-14298",
  eventTitle = "AI & ML Hackathon",
  onAnnouncementSend,
  onGroupCreate,
  className = "",
}) => {
  const [selectedFilters, setSelectedFilters] =
    useState({});

  const [selectedFilterType, setSelectedFilterType] =
    useState("submissionStatus");

  const [groupName, setGroupName] = useState("");

  const [announcementTitle, setAnnouncementTitle] =
    useState("");

  const [announcementMessage, setAnnouncementMessage] =
    useState("");

  const [channel, setChannel] = useState("In-App");

  const [showFilters, setShowFilters] = useState(false);

  const [savedGroups, setSavedGroups] = useState([]);

  const [notice, setNotice] = useState("");

  const [isSending, setIsSending] = useState(false);

  const uniqueValues = useMemo(() => {
    const values = {};

    FILTER_OPTIONS.forEach((filter) => {
      values[filter.key] = getUniqueValues(
        participants,
        filter.key
      );
    });

    return values;
  }, [participants]);

  const filteredParticipants = useMemo(() => {
    return participants.filter((participant) => {
      return Object.entries(selectedFilters).every(
        ([filterKey, selectedValue]) => {
          if (!selectedValue) return true;

          if (filterKey === "session") {
            return participant.sessions?.includes(
              selectedValue
            );
          }

          return (
            participant[filterKey] === selectedValue
          );
        }
      );
    });
  }, [participants, selectedFilters]);

  const recipientCount =
    filteredParticipants.length;

  const updateFilter = (key, value) => {
    setSelectedFilters((current) => ({
      ...current,
      [key]:
        current[key] === value ? "" : value,
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({});
  };

  const saveGroup = async () => {
    if (!groupName.trim()) {
      setNotice(
        "Please enter a name for the recipient group."
      );
      return;
    }

    if (recipientCount === 0) {
      setNotice(
        "The selected filters do not contain any participants."
      );
      return;
    }

    const group = {
      id: `GROUP-${Date.now()}`,
      eventId,
      name: groupName.trim(),
      filters: selectedFilters,
      recipientCount,
      createdAt: new Date().toISOString(),
    };

    setSavedGroups((current) => [
      group,
      ...current,
    ]);

    await onGroupCreate?.(group);

    setNotice(
      `"${group.name}" saved with ${recipientCount} recipient${
        recipientCount === 1 ? "" : "s"
      }.`
    );

    setGroupName("");
  };

  const loadGroup = (group) => {
    setSelectedFilters(group.filters);

    setNotice(
      `Loaded group "${group.name}".`
    );
  };

  const deleteGroup = (groupId) => {
    setSavedGroups((current) =>
      current.filter(
        (group) => group.id !== groupId
      )
    );
  };

  const sendAnnouncement = async () => {
    if (!announcementTitle.trim()) {
      setNotice(
        "Please enter an announcement title."
      );
      return;
    }

    if (!announcementMessage.trim()) {
      setNotice(
        "Please enter an announcement message."
      );
      return;
    }

    if (recipientCount === 0) {
      setNotice(
        "There are no recipients for the selected filters."
      );
      return;
    }

    setIsSending(true);

    const announcement = {
      id: `ANNOUNCEMENT-${Date.now()}`,
      eventId,
      eventTitle,
      title: announcementTitle.trim(),
      message: announcementMessage.trim(),
      channel,
      recipientCount,
      recipientIds: filteredParticipants.map(
        (participant) => participant.id
      ),
      filters: selectedFilters,
      sentAt: new Date().toISOString(),
    };

    await onAnnouncementSend?.(
      announcement
    );

    setNotice(
      `Announcement sent to ${recipientCount} participant${
        recipientCount === 1 ? "" : "s"
      }.`
    );

    setAnnouncementTitle("");
    setAnnouncementMessage("");
    setIsSending(false);
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <MessageSquare
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Communication
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Participant Communication Groups
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Create targeted recipient groups and send
              announcements only to participants who match
              your selected criteria.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/30 dark:bg-green-900/10">
          <Users
            size={14}
            className="text-green-600 dark:text-green-400"
          />

          <span className="text-[8px] font-bold text-green-700 dark:text-green-400">
            {recipientCount} Recipients
          </span>
        </div>
      </div>

      {/* Notice */}
      {notice && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <Bell
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
          label="Total Participants"
          value={participants.length}
        />

        <SummaryCard
          icon={<Filter size={15} />}
          label="Matching Recipients"
          value={recipientCount}
        />

        <SummaryCard
          icon={<Mail size={15} />}
          label="Saved Groups"
          value={savedGroups.length}
        />

        <SummaryCard
          icon={<Check size={15} />}
          label="Active Filters"
          value={
            Object.values(
              selectedFilters
            ).filter(Boolean).length
          }
        />
      </div>

      {/* Group builder */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Build Recipient Group
            </h3>

            <p className="mt-1 text-[8px] text-slate-400">
              Apply filters to define exactly who should
              receive your announcement.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowFilters(
                (current) => !current
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
          >
            <Filter size={13} />
            {showFilters
              ? "Hide Filters"
              : "Show Filters"}
          </button>
        </div>

        {showFilters && (
          <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
            {/* Filter type */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="filter-type"
                  className="text-[8px] font-bold uppercase tracking-wide text-slate-400"
                >
                  Filter By
                </label>

                <div className="relative mt-2">
                  <select
                    id="filter-type"
                    value={selectedFilterType}
                    onChange={(event) =>
                      setSelectedFilterType(
                        event.target.value
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 pr-9 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {FILTER_OPTIONS.map(
                      (option) => (
                        <option
                          key={option.key}
                          value={option.key}
                        >
                          {option.label}
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

              <div>
                <label
                  htmlFor="filter-value"
                  className="text-[8px] font-bold uppercase tracking-wide text-slate-400"
                >
                  Select Value
                </label>

                <div className="relative mt-2">
                  <select
                    id="filter-value"
                    value={
                      selectedFilters[
                        selectedFilterType
                      ] || ""
                    }
                    onChange={(event) =>
                      updateFilter(
                        selectedFilterType,
                        event.target.value
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 pr-9 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="">
                      All
                    </option>

                    {(
                      uniqueValues[
                        selectedFilterType
                      ] || []
                    ).map((value) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {value}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Quick filter buttons */}
            <div className="mt-5">
              <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                Quick Filters
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <QuickFilter
                  label="Not Submitted"
                  active={
                    selectedFilters.submissionStatus ===
                    "Pending"
                  }
                  onClick={() =>
                    updateFilter(
                      "submissionStatus",
                      "Pending"
                    )
                  }
                />

                <QuickFilter
                  label="Present"
                  active={
                    selectedFilters.attendanceStatus ===
                    "Present"
                  }
                  onClick={() =>
                    updateFilter(
                      "attendanceStatus",
                      "Present"
                    )
                  }
                />

                <QuickFilter
                  label="Absent"
                  active={
                    selectedFilters.attendanceStatus ===
                    "Absent"
                  }
                  onClick={() =>
                    updateFilter(
                      "attendanceStatus",
                      "Absent"
                    )
                  }
                />

                <QuickFilter
                  label="Approved"
                  active={
                    selectedFilters.registrationStatus ===
                    "Approved"
                  }
                  onClick={() =>
                    updateFilter(
                      "registrationStatus",
                      "Approved"
                    )
                  }
                />

                <QuickFilter
                  label="Students"
                  active={
                    selectedFilters.category ===
                    "Student"
                  }
                  onClick={() =>
                    updateFilter(
                      "category",
                      "Student"
                    )
                  }
                />
              </div>
            </div>

            {/* Active filters */}
            {Object.entries(
              selectedFilters
            ).some(([, value]) => value) && (
              <div className="mt-5 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[8px] font-bold text-slate-400">
                    Active:
                  </span>

                  {Object.entries(
                    selectedFilters
                  ).map(
                    ([key, value]) =>
                      value && (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1.5 text-[7px] font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                        >
                          {getFilterLabel(
                            key
                          )}
                          : {value}

                          <button
                            type="button"
                            onClick={() =>
                              updateFilter(
                                key,
                                value
                              )
                            }
                            className="ml-1"
                          >
                            <X size={9} />
                          </button>
                        </span>
                      )
                  )}

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[7px] font-bold text-red-500 hover:text-red-600"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}

            {/* Save group */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                value={groupName}
                onChange={(event) =>
                  setGroupName(
                    event.target.value
                  )
                }
                placeholder="Group name, e.g. Participants who have not submitted"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />

              <button
                type="button"
                onClick={saveGroup}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700"
              >
                <Users size={13} />
                Save Group
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recipient preview */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Recipient Preview
            </h3>

            <p className="mt-1 text-[8px] text-slate-400">
              {recipientCount} participant
              {recipientCount === 1
                ? ""
                : "s"} match the current filters.
            </p>
          </div>

          <div className="rounded-xl bg-indigo-50 px-3 py-2 dark:bg-indigo-900/20">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {recipientCount}
            </span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-100 text-left dark:border-slate-800">
                <th className="px-3 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                  Participant
                </th>

                <th className="px-3 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                  Team
                </th>

                <th className="px-3 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                  Registration
                </th>

                <th className="px-3 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                  Attendance
                </th>

                <th className="px-3 py-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                  Submission
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredParticipants
                .slice(0, 10)
                .map((participant) => (
                  <tr
                    key={participant.id}
                    className="border-b border-slate-50 dark:border-slate-800/70"
                  >
                    <td className="px-3 py-3">
                      <p className="text-[8px] font-bold text-slate-700 dark:text-slate-200">
                        {participant.name}
                      </p>

                      <p className="mt-1 text-[7px] text-slate-400">
                        {participant.id}
                      </p>
                    </td>

                    <td className="px-3 py-3 text-[8px] text-slate-500 dark:text-slate-400">
                      {participant.team}
                    </td>

                    <td className="px-3 py-3">
                      <StatusBadge
                        value={
                          participant.registrationStatus
                        }
                      />
                    </td>

                    <td className="px-3 py-3">
                      <StatusBadge
                        value={
                          participant.attendanceStatus
                        }
                      />
                    </td>

                    <td className="px-3 py-3">
                      <StatusBadge
                        value={
                          participant.submissionStatus
                        }
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {recipientCount > 10 && (
          <p className="mt-3 text-center text-[8px] text-slate-400">
            Showing 10 of {recipientCount} recipients.
          </p>
        )}
      </div>

      {/* Saved groups */}
      {savedGroups.length > 0 && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Users
              size={14}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Saved Recipient Groups
            </h3>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {savedGroups.map((group) => (
              <div
                key={group.id}
                className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
                      {group.name}
                    </p>

                    <p className="mt-1 text-[7px] text-slate-400">
                      {group.recipientCount} recipients
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      deleteGroup(group.id)
                    }
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X size={13} />
                  </button>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      loadGroup(group)
                    }
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-[7px] font-bold text-white hover:bg-indigo-700"
                  >
                    Use Group
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcement composer */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
            <Mail
              size={15}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Targeted Announcement
            </h3>

            <p className="mt-1 text-[8px] text-slate-400">
              Send an announcement to the currently selected
              recipient group.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <input
            value={announcementTitle}
            onChange={(event) =>
              setAnnouncementTitle(
                event.target.value
              )
            }
            placeholder="Announcement title"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />

          <textarea
            value={announcementMessage}
            onChange={(event) =>
              setAnnouncementMessage(
                event.target.value
              )
            }
            placeholder="Write your announcement..."
            rows={5}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <label
                htmlFor="announcement-channel"
                className="text-[8px] font-bold uppercase tracking-wide text-slate-400"
              >
                Notification Channel
              </label>

              <select
                id="announcement-channel"
                value={channel}
                onChange={(event) =>
                  setChannel(
                    event.target.value
                  )
                }
                className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="In-App">
                  In-App
                </option>

                <option value="Email">
                  Email
                </option>

                <option value="Both">
                  In-App + Email
                </option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[8px] text-slate-400">
                Sending to{" "}
                <strong className="text-slate-700 dark:text-slate-200">
                  {recipientCount}
                </strong>{" "}
                participant
                {recipientCount === 1
                  ? ""
                  : "s"}
              </span>

              <button
                type="button"
                disabled={isSending}
                onClick={
                  sendAnnouncement
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={13} />
                {isSending
                  ? "Sending..."
                  : "Send Announcement"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <Users
            size={15}
            className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
              Targeted communication
            </p>

            <p className="mt-1 text-[8px] leading-4 text-slate-400">
              Only participants matching the selected criteria
              are included as recipients. Connect
              <code className="mx-1 rounded bg-slate-100 px-1 dark:bg-slate-800">
                onAnnouncementSend
              </code>
              to your backend notification service.
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

const QuickFilter = ({
  label,
  active,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-xl border px-3 py-2.5 text-[8px] font-bold ${
      active
        ? "border-indigo-500 bg-indigo-600 text-white"
        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"
    }`}
  >
    {label}
  </button>
);

const StatusBadge = ({
  value,
}) => {
  const normalized =
    String(value).toLowerCase();

  let classes =
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  if (
    normalized.includes("approved") ||
    normalized.includes("submitted") ||
    normalized.includes("present")
  ) {
    classes =
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400";
  }

  if (
    normalized.includes("pending") ||
    normalized.includes("not started")
  ) {
    classes =
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400";
  }

  if (
    normalized.includes("absent") ||
    normalized.includes("rejected")
  ) {
    classes =
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400";
  }

  return (
    <span
      className={`rounded-full px-2 py-1 text-[7px] font-bold ${classes}`}
    >
      {value}
    </span>
  );
};

const getUniqueValues = (
  participants,
  filterKey
) => {
  const values = new Set();

  participants.forEach((participant) => {
    if (filterKey === "session") {
      participant.sessions?.forEach(
        (session) =>
          values.add(session)
      );
      return;
    }

    if (participant[filterKey]) {
      values.add(
        participant[filterKey]
      );
    }
  });

  return [...values].sort();
};

const getFilterLabel = (
  key
) => {
  const option = FILTER_OPTIONS.find(
    (item) => item.key === key
  );

  return option?.label || key;
};

export default EventParticipantCommunicationGroups;