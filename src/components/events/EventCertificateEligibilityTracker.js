import {
  Award,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Info,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_REQUIREMENTS = [
  {
    id: "registration",
    label: "Successful Registration",
    description: "Participant must have a valid approved registration.",
    weight: 20,
  },
  {
    id: "attendance",
    label: "Minimum Attendance",
    description:
      "Participant must meet the minimum required attendance percentage.",
    weight: 25,
  },
  {
    id: "sessions",
    label: "Required Sessions Attended",
    description: "Participant must attend all required sessions.",
    weight: 20,
  },
  {
    id: "submission",
    label: "Submission Completed",
    description: "Participant must complete the required event submission.",
    weight: 20,
  },
  {
    id: "participation",
    label: "Event Participation Confirmed",
    description:
      "Organizer must confirm the participant's event participation.",
    weight: 15,
  },
];

const DEFAULT_PARTICIPANTS = [
  {
    id: "REG-1001",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    registrationApproved: true,
    attendancePercentage: 92,
    requiredSessionsAttended: true,
    submissionCompleted: true,
    participationConfirmed: true,
  },
  {
    id: "REG-1002",
    name: "Priya Patel",
    email: "priya@example.com",
    registrationApproved: true,
    attendancePercentage: 78,
    requiredSessionsAttended: false,
    submissionCompleted: true,
    participationConfirmed: true,
  },
  {
    id: "REG-1003",
    name: "Rahul Joshi",
    email: "rahul@example.com",
    registrationApproved: true,
    attendancePercentage: 88,
    requiredSessionsAttended: true,
    submissionCompleted: false,
    participationConfirmed: true,
  },
  {
    id: "REG-1004",
    name: "Neha Shah",
    email: "neha@example.com",
    registrationApproved: false,
    attendancePercentage: 0,
    requiredSessionsAttended: false,
    submissionCompleted: false,
    participationConfirmed: false,
  },
];

const DEFAULT_CONFIG = {
  minimumAttendance: 75,
  requireRegistration: true,
  requireSessions: true,
  requireSubmission: true,
  requireParticipation: true,
};

const EventCertificateEligibilityTracker = ({
  eventId = "event-14261",
  eventTitle = "AI & ML Hackathon",
  participants = DEFAULT_PARTICIPANTS,
  requirements = DEFAULT_REQUIREMENTS,
  config = DEFAULT_CONFIG,
  onEligibilityChange,
  onIssueCertificate,
  className = "",
}) => {
  const [participantData, setParticipantData] = useState(participants);
  const [selectedParticipantId, setSelectedParticipantId] = useState(
    participants[0]?.id || ""
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showRequirements, setShowRequirements] = useState(false);
  const [issuedCertificates, setIssuedCertificates] = useState({});
  const [notice, setNotice] = useState("");

  const calculateEligibility = (participant) => {
    const checks = {
      registration:
        !config.requireRegistration || participant.registrationApproved,

      attendance:
        participant.attendancePercentage >= config.minimumAttendance,

      sessions:
        !config.requireSessions ||
        participant.requiredSessionsAttended,

      submission:
        !config.requireSubmission ||
        participant.submissionCompleted,

      participation:
        !config.requireParticipation ||
        participant.participationConfirmed,
    };

    const activeRequirements = requirements.filter((requirement) => {
      if (
        requirement.id === "registration" &&
        !config.requireRegistration
      ) {
        return false;
      }

      if (requirement.id === "sessions" && !config.requireSessions) {
        return false;
      }

      if (
        requirement.id === "submission" &&
        !config.requireSubmission
      ) {
        return false;
      }

      if (
        requirement.id === "participation" &&
        !config.requireParticipation
      ) {
        return false;
      }

      return true;
    });

    const totalWeight = activeRequirements.reduce(
      (total, requirement) => total + requirement.weight,
      0
    );

    const completedWeight = activeRequirements.reduce(
      (total, requirement) =>
        total + (checks[requirement.id] ? requirement.weight : 0),
      0
    );

    const percentage =
      totalWeight === 0
        ? 0
        : Math.round((completedWeight / totalWeight) * 100);

    return {
      checks,
      percentage,
      eligible: percentage === 100,
      activeRequirements,
    };
  };

  const selectedParticipant =
    participantData.find(
      (participant) => participant.id === selectedParticipantId
    ) || participantData[0];

  const selectedEligibility = selectedParticipant
    ? calculateEligibility(selectedParticipant)
    : null;

  const participantRows = useMemo(() => {
    return participantData
      .map((participant) => ({
        participant,
        eligibility: calculateEligibility(participant),
      }))
      .filter(({ participant, eligibility }) => {
        const query = search.trim().toLowerCase();

        const matchesSearch =
          !query ||
          participant.name.toLowerCase().includes(query) ||
          participant.email.toLowerCase().includes(query) ||
          participant.id.toLowerCase().includes(query);

        const matchesFilter =
          filter === "All" ||
          (filter === "Eligible" && eligibility.eligible) ||
          (filter === "Incomplete" && !eligibility.eligible);

        return matchesSearch && matchesFilter;
      });
  }, [participantData, search, filter, config, requirements]);

  const eligibleCount = participantData.filter(
    (participant) => calculateEligibility(participant).eligible
  ).length;

  const incompleteCount = participantData.length - eligibleCount;

  const averageCompletion =
    participantData.length === 0
      ? 0
      : Math.round(
          participantData.reduce(
            (total, participant) =>
              total + calculateEligibility(participant).percentage,
            0
          ) / participantData.length
        );

  const toggleRequirement = (participantId, requirementId) => {
    const fieldMap = {
      registration: "registrationApproved",
      sessions: "requiredSessionsAttended",
      submission: "submissionCompleted",
      participation: "participationConfirmed",
    };

    const field = fieldMap[requirementId];

    if (!field) return;

    setParticipantData((current) =>
      current.map((participant) =>
        participant.id === participantId
          ? {
              ...participant,
              [field]: !participant[field],
            }
          : participant
      )
    );
  };

  const updateAttendance = (participantId, percentage) => {
    setParticipantData((current) =>
      current.map((participant) =>
        participant.id === participantId
          ? {
              ...participant,
              attendancePercentage: Math.max(
                0,
                Math.min(100, Number(percentage) || 0)
              ),
            }
          : participant
      )
    );
  };

  const issueCertificate = async (participant) => {
    const eligibility = calculateEligibility(participant);

    if (!eligibility.eligible) {
      setNotice(
        "This participant is not eligible for a certificate yet."
      );
      return;
    }

    const certificate = {
      eventId,
      eventTitle,
      participantId: participant.id,
      participantName: participant.name,
      issuedAt: new Date().toISOString(),
    };

    setIssuedCertificates((current) => ({
      ...current,
      [participant.id]: certificate,
    }));

    setNotice(`Certificate issued to ${participant.name}.`);

    await onIssueCertificate?.(certificate);
  };

  const notifyEligibilityChange = async (participant) => {
    await onEligibilityChange?.({
      eventId,
      eventTitle,
      participantId: participant.id,
      participant,
      eligibility: calculateEligibility(participant),
    });
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Award
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Certificate Management
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Certificate Eligibility Tracker
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Automatically determine whether participants have completed
              the requirements needed to receive an event certificate.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowRequirements((current) => !current)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[9px] font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <ClipboardCheck size={13} />
          Certificate Requirements
        </button>
      </div>

      {/* Notification */}
      {notice && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <p className="text-[9px] font-semibold text-indigo-700 dark:text-indigo-300">
            {notice}
          </p>

          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-indigo-400"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={<Users size={15} />}
          label="Participants"
          value={participantData.length}
        />

        <SummaryCard
          icon={<CheckCircle2 size={15} />}
          label="Eligible"
          value={eligibleCount}
        />

        <SummaryCard
          icon={<XCircle size={15} />}
          label="Incomplete"
          value={incompleteCount}
        />

        <SummaryCard
          icon={<Award size={15} />}
          label="Avg. Completion"
          value={`${averageCompletion}%`}
        />
      </div>

      {/* Requirements */}
      {showRequirements && (
        <div className="mt-5 rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-900/30 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Info
              size={14}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Certificate Requirements
            </h3>
          </div>

          <div className="mt-4 space-y-3">
            {requirements.map((requirement) => (
              <div
                key={requirement.id}
                className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950"
              >
                <div>
                  <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
                    {requirement.label}
                  </p>

                  <p className="mt-1 text-[8px] leading-4 text-slate-400">
                    {requirement.description}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-1 text-[7px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                  {requirement.weight}%
                </span>
              </div>
            ))}

            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 dark:border-amber-900/30 dark:bg-amber-900/10">
              <p className="text-[8px] font-bold text-amber-700 dark:text-amber-400">
                Minimum attendance requirement
              </p>

              <p className="mt-1 text-[8px] text-amber-600 dark:text-amber-300">
                Participants need at least{" "}
                {config.minimumAttendance}% attendance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected participant */}
      {selectedParticipant && selectedEligibility && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                {getInitials(selectedParticipant.name)}
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {selectedParticipant.name}
                </p>

                <p className="mt-1 text-[8px] text-slate-400">
                  {selectedParticipant.email} ·{" "}
                  {selectedParticipant.id}
                </p>
              </div>
            </div>

            <EligibilityProgress
              percentage={selectedEligibility.percentage}
              eligible={selectedEligibility.eligible}
            />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {selectedEligibility.activeRequirements.map(
              (requirement) => {
                const completed =
                  selectedEligibility.checks[requirement.id];

                return (
                  <RequirementRow
                    key={requirement.id}
                    requirement={requirement}
                    completed={completed}
                    attendance={
                      selectedParticipant.attendancePercentage
                    }
                    minimumAttendance={
                      config.minimumAttendance
                    }
                    onToggle={() => {
                      toggleRequirement(
                        selectedParticipant.id,
                        requirement.id
                      );

                      setTimeout(
                        () =>
                          notifyEligibilityChange(
                            selectedParticipant
                          ),
                        0
                      );
                    }}
                    onAttendanceChange={(value) => {
                      updateAttendance(
                        selectedParticipant.id,
                        value
                      );
                    }}
                  />
                );
              }
            )}
          </div>

          <div className="mt-5 flex justify-end">
            {issuedCertificates[selectedParticipant.id] ? (
              <div className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-[9px] font-bold text-green-600 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle2 size={13} />
                Certificate Issued
              </div>
            ) : (
              <button
                type="button"
                disabled={!selectedEligibility.eligible}
                onClick={() =>
                  issueCertificate(selectedParticipant)
                }
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[9px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Award size={13} />
                Issue Certificate
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search and filter */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search participant..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex gap-2">
          {["All", "Eligible", "Incomplete"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-xl border px-3 py-2.5 text-[8px] font-bold ${
                filter === option
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Participant table */}
      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <TableHeader>Participant</TableHeader>
              <TableHeader>Attendance</TableHeader>
              <TableHeader>Registration</TableHeader>
              <TableHeader>Submission</TableHeader>
              <TableHeader>Completion</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Action</TableHeader>
            </tr>
          </thead>

          <tbody>
            {participantRows.map(({ participant, eligibility }) => {
              const issued = issuedCertificates[participant.id];

              return (
                <tr
                  key={participant.id}
                  className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                >
                  <td className="px-3 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedParticipantId(participant.id)
                      }
                      className="text-left"
                    >
                      <p className="text-[9px] font-bold text-slate-700 hover:text-indigo-600 dark:text-slate-200">
                        {participant.name}
                      </p>

                      <p className="mt-1 text-[7px] text-slate-400">
                        {participant.id}
                      </p>
                    </button>
                  </td>

                  <td className="px-3 py-4">
                    <AttendanceMini
                      value={participant.attendancePercentage}
                      minimum={config.minimumAttendance}
                    />
                  </td>

                  <td className="px-3 py-4">
                    <CheckStatus
                      completed={participant.registrationApproved}
                    />
                  </td>

                  <td className="px-3 py-4">
                    <CheckStatus
                      completed={participant.submissionCompleted}
                    />
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-full rounded-full bg-indigo-600"
                          style={{
                            width: `${eligibility.percentage}%`,
                          }}
                        />
                      </div>

                      <span className="text-[8px] font-bold text-slate-500">
                        {eligibility.percentage}%
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <EligibilityBadge
                      eligible={eligibility.eligible}
                    />
                  </td>

                  <td className="px-3 py-4">
                    {issued ? (
                      <span className="text-[8px] font-bold text-green-600 dark:text-green-400">
                        Issued
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={!eligibility.eligible}
                        onClick={() => issueCertificate(participant)}
                        className="rounded-lg bg-indigo-600 px-3 py-2 text-[8px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Issue
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {participantRows.length === 0 && (
          <div className="py-10 text-center">
            <Users
              size={22}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <p className="mt-2 text-[9px] text-slate-400">
              No participants found.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

const SummaryCard = ({ icon, label, value }) => (
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

const EligibilityProgress = ({ percentage, eligible }) => (
  <div className="w-full max-w-xs">
    <div className="flex items-center justify-between">
      <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
        Certificate Eligibility
      </span>

      <span
        className={`text-sm font-bold ${
          eligible
            ? "text-green-600 dark:text-green-400"
            : "text-indigo-600 dark:text-indigo-400"
        }`}
      >
        {percentage}%
      </span>
    </div>

    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
      <div
        className={`h-full rounded-full transition-all ${
          eligible ? "bg-green-500" : "bg-indigo-600"
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>

    <p
      className={`mt-2 text-[8px] font-semibold ${
        eligible
          ? "text-green-600 dark:text-green-400"
          : "text-slate-400"
      }`}
    >
      {eligible
        ? "All certificate requirements completed."
        : "Complete the remaining requirements to become eligible."}
    </p>
  </div>
);

const RequirementRow = ({
  requirement,
  completed,
  onToggle,
  attendance,
  minimumAttendance,
  onAttendanceChange,
}) => {
  const isAttendance = requirement.id === "attendance";

  return (
    <div
      className={`rounded-xl border p-3 ${
        completed
          ? "border-green-100 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
          : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            completed
              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              : "bg-slate-200 text-slate-400 dark:bg-slate-800"
          }`}
        >
          {completed ? <Check size={14} /> : <X size={14} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
                {requirement.label}
              </p>

              <p className="mt-1 text-[8px] leading-4 text-slate-400">
                {requirement.description}
              </p>
            </div>

            {!isAttendance && (
              <button
                type="button"
                onClick={onToggle}
                className={`rounded-lg px-2.5 py-1.5 text-[7px] font-bold ${
                  completed
                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {completed ? "Completed" : "Mark Complete"}
              </button>
            )}
          </div>

          {isAttendance && (
            <div className="mt-3">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={attendance}
                  onChange={(event) =>
                    onAttendanceChange(event.target.value)
                  }
                  className="flex-1"
                />

                <span className="min-w-12 text-right text-[9px] font-bold text-slate-600 dark:text-slate-300">
                  {attendance}%
                </span>
              </div>

              <p className="mt-1 text-[7px] text-slate-400">
                Required: {minimumAttendance}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AttendanceMini = ({ value, minimum }) => (
  <div className="flex items-center gap-2">
    <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
      <div
        className={`h-full rounded-full ${
          value >= minimum ? "bg-green-500" : "bg-amber-500"
        }`}
        style={{ width: `${value}%` }}
      />
    </div>

    <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">
      {value}%
    </span>
  </div>
);

const CheckStatus = ({ completed }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[7px] font-bold ${
      completed
        ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
        : "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400"
    }`}
  >
    {completed ? <CheckCircle2 size={9} /> : <XCircle size={9} />}

    {completed ? "Complete" : "Incomplete"}
  </span>
);

const EligibilityBadge = ({ eligible }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[7px] font-bold ${
      eligible
        ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
        : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
    }`}
  >
    {eligible ? <CheckCircle2 size={9} /> : <XCircle size={9} />}

    {eligible ? "Eligible" : "Incomplete"}
  </span>
);

const TableHeader = ({ children }) => (
  <th className="px-3 py-3 text-left text-[7px] font-bold uppercase tracking-wide text-slate-400">
    {children}
  </th>
);

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

export default EventCertificateEligibilityTracker;