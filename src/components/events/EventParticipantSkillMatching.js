import {
  Award,
  Check,
  ChevronDown,
  Code2,
  Heart,
  Mail,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_PARTICIPANTS = [
  {
    id: "P001",
    name: "Aarav Sharma",
    role: "Frontend Developer",
    experience: "Intermediate",
    skills: ["React", "JavaScript", "CSS", "UI/UX"],
    interests: ["AI", "Web Development"],
    preferredRole: "Frontend Developer",
    bio: "Frontend developer interested in building AI-powered web applications.",
    availability: "Available",
  },
  {
    id: "P002",
    name: "Priya Patel",
    role: "AI/ML Developer",
    experience: "Advanced",
    skills: ["Python", "Machine Learning", "TensorFlow", "Data Science"],
    interests: ["AI", "Machine Learning"],
    preferredRole: "AI/ML Developer",
    bio: "AI enthusiast focused on machine learning and intelligent applications.",
    availability: "Available",
  },
  {
    id: "P003",
    name: "Rahul Mehta",
    role: "Backend Developer",
    experience: "Intermediate",
    skills: ["Node.js", "Express", "MongoDB", "REST API"],
    interests: ["Backend", "Cloud"],
    preferredRole: "Backend Developer",
    bio: "Backend developer who enjoys building scalable APIs and services.",
    availability: "Available",
  },
  {
    id: "P004",
    name: "Neha Shah",
    role: "UI/UX Designer",
    experience: "Advanced",
    skills: ["Figma", "UI Design", "UX Research", "Prototyping"],
    interests: ["Design", "Web Development"],
    preferredRole: "UI/UX Designer",
    bio: "Product designer passionate about creating accessible digital experiences.",
    availability: "Available",
  },
  {
    id: "P005",
    name: "Karan Joshi",
    role: "Data Scientist",
    experience: "Intermediate",
    skills: ["Python", "Pandas", "SQL", "Machine Learning"],
    interests: ["Data Science", "AI"],
    preferredRole: "Data Scientist",
    bio: "Data scientist interested in analytics, predictive modeling, and AI.",
    availability: "Available",
  },
  {
    id: "P006",
    name: "Meera Desai",
    role: "Mobile Developer",
    experience: "Beginner",
    skills: ["Flutter", "Dart", "Firebase"],
    interests: ["Mobile Apps", "IoT"],
    preferredRole: "Mobile Developer",
    bio: "Mobile developer looking for collaborative hackathon projects.",
    availability: "Available",
  },
];

const SKILL_OPTIONS = [
  "React",
  "JavaScript",
  "Python",
  "Machine Learning",
  "TensorFlow",
  "Node.js",
  "MongoDB",
  "Figma",
  "UI Design",
  "SQL",
  "Flutter",
  "Firebase",
];

const INTEREST_OPTIONS = [
  "AI",
  "Machine Learning",
  "Web Development",
  "Backend",
  "Cloud",
  "Design",
  "Data Science",
  "Mobile Apps",
  "IoT",
];

const ROLE_OPTIONS = [
  "Frontend Developer",
  "Backend Developer",
  "AI/ML Developer",
  "Data Scientist",
  "UI/UX Designer",
  "Mobile Developer",
];

const EXPERIENCE_OPTIONS = [
  "Any",
  "Beginner",
  "Intermediate",
  "Advanced",
];

const EventParticipantSkillMatching = ({
  participants = DEFAULT_PARTICIPANTS,
  currentParticipant,
  onInvite,
  onMessage,
  className = "",
}) => {
  const currentUser =
    currentParticipant || {
      id: "current-user",
      name: "You",
      role: "AI/ML Developer",
      experience: "Intermediate",
      skills: [
        "Python",
        "Machine Learning",
        "React",
      ],
      interests: [
        "AI",
        "Web Development",
      ],
      preferredRole:
        "AI/ML Developer",
    };

  const [search, setSearch] =
    useState("");

  const [selectedSkill, setSelectedSkill] =
    useState("All Skills");

  const [selectedInterest, setSelectedInterest] =
    useState("All Interests");

  const [selectedExperience, setSelectedExperience] =
    useState("Any");

  const [selectedRole, setSelectedRole] =
    useState("All Roles");

  const [showOnlyAvailable, setShowOnlyAvailable] =
    useState(true);

  const [invitedIds, setInvitedIds] =
    useState([]);

  const [messageId, setMessageId] =
    useState(null);

  const [selectedParticipant, setSelectedParticipant] =
    useState(null);

  const [sortBy, setSortBy] =
    useState("match");

  const matchingParticipants =
    useMemo(() => {
      const currentSkills =
        normalizeArray(
          currentUser.skills
        );

      const currentInterests =
        normalizeArray(
          currentUser.interests
        );

      const filtered =
        participants
          .filter(
            (participant) =>
              participant.id !==
              currentUser.id
          )
          .filter(
            (participant) => {
              const matchesSearch =
                !search.trim() ||
                participant.name
                  .toLowerCase()
                  .includes(
                    search
                      .trim()
                      .toLowerCase()
                  ) ||
                participant.role
                  .toLowerCase()
                  .includes(
                    search
                      .trim()
                      .toLowerCase()
                  ) ||
                participant.skills.some(
                  (skill) =>
                    skill
                      .toLowerCase()
                      .includes(
                        search
                          .trim()
                          .toLowerCase()
                      )
                );

              const matchesSkill =
                selectedSkill ===
                  "All Skills" ||
                participant.skills.includes(
                  selectedSkill
                );

              const matchesInterest =
                selectedInterest ===
                  "All Interests" ||
                participant.interests.includes(
                  selectedInterest
                );

              const matchesExperience =
                selectedExperience ===
                  "Any" ||
                participant.experience ===
                  selectedExperience;

              const matchesRole =
                selectedRole ===
                  "All Roles" ||
                participant.role ===
                  selectedRole;

              const matchesAvailability =
                !showOnlyAvailable ||
                participant.availability ===
                  "Available";

              return (
                matchesSearch &&
                matchesSkill &&
                matchesInterest &&
                matchesExperience &&
                matchesRole &&
                matchesAvailability
              );
            }
          )
          .map((participant) => {
            const result =
              calculateMatch(
                currentSkills,
                currentInterests,
                currentUser.preferredRole,
                participant
              );

            return {
              ...participant,
              ...result,
            };
          });

      return [...filtered].sort(
        (a, b) => {
          if (sortBy === "experience") {
            return (
              experienceWeight(
                b.experience
              ) -
              experienceWeight(
                a.experience
              )
            );
          }

          if (sortBy === "skills") {
            return (
              b.sharedSkills.length -
              a.sharedSkills.length
            );
          }

          return (
            b.matchScore -
            a.matchScore
          );
        }
      );
    }, [
      participants,
      currentUser,
      search,
      selectedSkill,
      selectedInterest,
      selectedExperience,
      selectedRole,
      showOnlyAvailable,
      sortBy,
    ]);

  const handleInvite = (
    participant
  ) => {
    if (
      invitedIds.includes(
        participant.id
      )
    ) {
      return;
    }

    setInvitedIds(
      (current) => [
        ...current,
        participant.id,
      ]
    );

    onInvite?.({
      participant,
      matchScore:
        participant.matchScore,
      sharedSkills:
        participant.sharedSkills,
      sharedInterests:
        participant.sharedInterests,
    });
  };

  const handleMessage = (
    participant
  ) => {
    setMessageId(
      participant.id
    );

    onMessage?.(participant);
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Sparkles
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Team Formation
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Participant Skill Matching
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Discover potential teammates based on complementary
              skills, interests, experience, and preferred roles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-[9px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Users size={11} />
            {matchingParticipants.length} matches
          </span>
        </div>
      </div>

      {/* Current profile */}
      <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
              Your Matching Profile
            </p>

            <h3 className="mt-1 text-sm font-bold text-indigo-800 dark:text-indigo-200">
              {currentUser.name}
            </h3>

            <p className="mt-1 text-[9px] text-indigo-600 dark:text-indigo-400">
              {currentUser.role} ·{" "}
              {currentUser.experience}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {currentUser.skills
              .slice(0, 5)
              .map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-white px-2 py-1 text-[8px] font-semibold text-indigo-600 dark:bg-slate-900 dark:text-indigo-400"
                >
                  {skill}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-slate-400">
          Search Participants
        </label>

        <div className="relative">
          <Search
            size={15}
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
            placeholder="Search by name, role, or skill..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Users
            size={14}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <h3 className="text-xs font-bold text-slate-800 dark:text-white">
            Matching Filters
          </h3>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField
            label="Technical Skill"
            value={selectedSkill}
            onChange={
              setSelectedSkill
            }
            options={[
              "All Skills",
              ...SKILL_OPTIONS,
            ]}
          />

          <SelectField
            label="Project Interest"
            value={selectedInterest}
            onChange={
              setSelectedInterest
            }
            options={[
              "All Interests",
              ...INTEREST_OPTIONS,
            ]}
          />

          <SelectField
            label="Experience"
            value={selectedExperience}
            onChange={
              setSelectedExperience
            }
            options={
              EXPERIENCE_OPTIONS
            }
          />

          <SelectField
            label="Preferred Role"
            value={selectedRole}
            onChange={
              setSelectedRole
            }
            options={[
              "All Roles",
              ...ROLE_OPTIONS,
            ]}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={
                showOnlyAvailable
              }
              onChange={(event) =>
                setShowOnlyAvailable(
                  event.target.checked
                )
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />

            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
              Show only participants available for team formation
            </span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Sort by
            </span>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value
                  )
                }
                className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-[9px] font-semibold text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              >
                <option value="match">
                  Best Match
                </option>

                <option value="skills">
                  Shared Skills
                </option>

                <option value="experience">
                  Experience
                </option>
              </select>

              <ChevronDown
                size={11}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Matching explanation */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
        <Sparkles
          size={15}
          className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400"
        />

        <div>
          <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
            How matching works
          </p>

          <p className="mt-1 text-[9px] leading-4 text-blue-600 dark:text-blue-400">
            Matches consider complementary technical skills, shared
            project interests, experience level, and preferred
            team roles. Higher scores indicate stronger potential
            compatibility.
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Suggested Teammates
            </h3>

            <p className="mt-1 text-[10px] text-slate-400">
              Potential teammates ranked by compatibility.
            </p>
          </div>
        </div>

        {matchingParticipants.length ===
        0 ? (
          <EmptyState
            onReset={() => {
              setSearch("");
              setSelectedSkill(
                "All Skills"
              );
              setSelectedInterest(
                "All Interests"
              );
              setSelectedExperience(
                "Any"
              );
              setSelectedRole(
                "All Roles"
              );
            }}
          />
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {matchingParticipants.map(
              (participant) => (
                <ParticipantMatchCard
                  key={
                    participant.id
                  }
                  participant={
                    participant
                  }
                  invited={invitedIds.includes(
                    participant.id
                  )}
                  messageSent={
                    messageId ===
                    participant.id
                  }
                  onInvite={() =>
                    handleInvite(
                      participant
                    )
                  }
                  onMessage={() =>
                    handleMessage(
                      participant
                    )
                  }
                  onView={() =>
                    setSelectedParticipant(
                      participant
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Profile modal */}
      {selectedParticipant && (
        <ParticipantModal
          participant={
            selectedParticipant
          }
          invited={invitedIds.includes(
            selectedParticipant.id
          )}
          onInvite={() =>
            handleInvite(
              selectedParticipant
            )
          }
          onClose={() =>
            setSelectedParticipant(
              null
            )
          }
        />
      )}
    </section>
  );
};

/* ----------------------------------
   Match calculation
----------------------------------- */

const calculateMatch = (
  currentSkills,
  currentInterests,
  currentRole,
  participant
) => {
  const participantSkills =
    normalizeArray(
      participant.skills
    );

  const participantInterests =
    normalizeArray(
      participant.interests
    );

  const sharedSkills =
    participantSkills.filter(
      (skill) =>
        currentSkills.includes(
          skill
        )
    );

  const sharedInterests =
    participantInterests.filter(
      (interest) =>
        currentInterests.includes(
          interest
        )
    );

  const complementarySkills =
    participantSkills.filter(
      (skill) =>
        !currentSkills.includes(
          skill
        )
    );

  const complementaryRole =
    participant.preferredRole !==
      currentRole;

  let score = 35;

  score +=
    sharedSkills.length * 8;

  score +=
    sharedInterests.length * 6;

  score +=
    Math.min(
      complementarySkills.length *
        3,
      15
    );

  if (complementaryRole) {
    score += 8;
  }

  if (
    participant.experience ===
    "Advanced"
  ) {
    score += 5;
  }

  score = Math.min(
    Math.round(score),
    99
  );

  const reasons = [];

  if (
    sharedSkills.length
  ) {
    reasons.push(
      `${sharedSkills.length} shared skill${
        sharedSkills.length ===
        1
          ? ""
          : "s"
      }`
    );
  }

  if (
    sharedInterests.length
  ) {
    reasons.push(
      `${sharedInterests.length} shared interest${
        sharedInterests.length ===
        1
          ? ""
          : "s"
      }`
    );
  }

  if (complementaryRole) {
    reasons.push(
      "Complementary role"
    );
  }

  if (
    complementarySkills.length
  ) {
    reasons.push(
      "Adds new skills"
    );
  }

  return {
    matchScore: score,
    sharedSkills,
    sharedInterests,
    complementarySkills,
    matchReasons: reasons,
  };
};

/* ----------------------------------
   Participant card
----------------------------------- */

const ParticipantMatchCard = ({
  participant,
  invited,
  messageSent,
  onInvite,
  onMessage,
  onView,
}) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          {getInitials(
            participant.name
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              {participant.name}
            </h4>

            <span className="rounded-full bg-green-50 px-2 py-1 text-[7px] font-bold uppercase text-green-600 dark:bg-green-900/20 dark:text-green-400">
              {participant.availability}
            </span>
          </div>

          <p className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">
            {participant.role} ·{" "}
            {participant.experience}
          </p>
        </div>

        <MatchScore
          score={
            participant.matchScore
          }
        />
      </div>

      {/* Match reasons */}
      <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
        <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
          Why this is a good match
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {participant.matchReasons
            .slice(0, 4)
            .map((reason) => (
              <span
                key={reason}
                className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[8px] font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300"
              >
                <Check
                  size={9}
                  className="text-green-500"
                />
                {reason}
              </span>
            ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mt-4">
        <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wide text-slate-400">
          <Code2 size={10} />
          Technical Skills
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {participant.skills.map(
            (skill) => {
              const shared =
                participant.sharedSkills.includes(
                  skill
                );

              return (
                <span
                  key={skill}
                  className={`rounded-full px-2 py-1 text-[8px] font-semibold ${
                    shared
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {skill}
                </span>
              );
            }
          )}
        </div>
      </div>

      {/* Interests */}
      <div className="mt-4">
        <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wide text-slate-400">
          <Heart size={10} />
          Project Interests
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {participant.interests.map(
            (interest) => (
              <span
                key={interest}
                className="rounded-full bg-pink-50 px-2 py-1 text-[8px] font-semibold text-pink-600 dark:bg-pink-900/20 dark:text-pink-400"
              >
                {interest}
              </span>
            )
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <button
          type="button"
          onClick={onView}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-[9px] font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          View Profile
        </button>

        <button
          type="button"
          onClick={onMessage}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 px-3 py-2.5 text-[9px] font-bold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
        >
          <MessageSquare size={11} />

          {messageSent
            ? "Message Sent"
            : "Message"}
        </button>

        <button
          type="button"
          onClick={onInvite}
          disabled={invited}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[9px] font-bold text-white ${
            invited
              ? "cursor-not-allowed bg-green-600"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {invited ? (
            <>
              <Check size={11} />
              Invited
            </>
          ) : (
            <>
              <Send size={11} />
              Invite
            </>
          )}
        </button>
      </div>
    </article>
  );
};

/* ----------------------------------
   Match score
----------------------------------- */

const MatchScore = ({
  score,
}) => {
  return (
    <div className="relative h-12 w-12 shrink-0">
      <svg
        className="h-12 w-12 -rotate-90"
        viewBox="0 0 36 36"
      >
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-slate-100 dark:text-slate-800"
        />

        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${score} 100`}
          className="text-indigo-600 dark:text-indigo-400"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-bold text-slate-800 dark:text-white">
          {score}%
        </span>

        <span className="text-[6px] font-bold uppercase text-slate-400">
          Match
        </span>
      </div>
    </div>
  );
};

/* ----------------------------------
   Participant modal
----------------------------------- */

const ParticipantModal = ({
  participant,
  invited,
  onInvite,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              {getInitials(
                participant.name
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {participant.name}
              </h3>

              <p className="mt-1 text-[9px] text-slate-400">
                {participant.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wide text-indigo-500">
                  Compatibility
                </p>

                <p className="mt-1 text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  {participant.matchScore}%
                </p>
              </div>

              <Sparkles
                size={25}
                className="text-indigo-500"
              />
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              About
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
              {participant.bio}
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ProfileSection
              title="Skills"
              icon={<Code2 size={12} />}
            >
              <div className="flex flex-wrap gap-1.5">
                {participant.skills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-indigo-50 px-2 py-1 text-[8px] font-semibold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </ProfileSection>

            <ProfileSection
              title="Interests"
              icon={<Heart size={12} />}
            >
              <div className="flex flex-wrap gap-1.5">
                {participant.interests.map(
                  (interest) => (
                    <span
                      key={interest}
                      className="rounded-full bg-pink-50 px-2 py-1 text-[8px] font-semibold text-pink-600 dark:bg-pink-900/20 dark:text-pink-400"
                    >
                      {interest}
                    </span>
                  )
                )}
              </div>
            </ProfileSection>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem
                label="Experience"
                value={
                  participant.experience
                }
              />

              <InfoItem
                label="Preferred Role"
                value={
                  participant.preferredRole
                }
              />

              <InfoItem
                label="Availability"
                value={
                  participant.availability
                }
              />

              <InfoItem
                label="Shared Skills"
                value={`${participant.sharedSkills.length}`}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-t border-slate-200 p-4 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-[10px] font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>

          <button
            type="button"
            disabled={invited}
            onClick={onInvite}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[10px] font-bold text-white ${
              invited
                ? "bg-green-600"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {invited ? (
              <>
                <Check size={13} />
                Invitation Sent
              </>
            ) : (
              <>
                <Send size={13} />
                Send Team Invitation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------
   Profile section
----------------------------------- */

const ProfileSection = ({
  title,
  icon,
  children,
}) => {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {icon}
        {title}
      </p>

      <div className="mt-2">
        {children}
      </div>
    </div>
  );
};

/* ----------------------------------
   Info item
----------------------------------- */

const InfoItem = ({
  label,
  value,
}) => {
  return (
    <div>
      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-[10px] font-semibold text-slate-700 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
};

/* ----------------------------------
   Select
----------------------------------- */

const SelectField = ({
  label,
  value,
  onChange,
  options,
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-8 text-[10px] font-medium text-slate-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
        >
          {options.map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            )
          )}
        </select>

        <ChevronDown
          size={12}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyState = ({
  onReset,
}) => {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Users size={19} />
      </div>

      <h3 className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
        No matching teammates found
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-[9px] leading-4 text-slate-400">
        Try changing your filters or search terms to discover
        more participants.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-4 rounded-lg bg-indigo-600 px-3 py-2 text-[9px] font-bold text-white hover:bg-indigo-700"
      >
        Reset Matching Filters
      </button>
    </div>
  );
};

/* ----------------------------------
   Helpers
----------------------------------- */

const normalizeArray = (
  values = []
) =>
  values.map((value) =>
    String(value)
      .trim()
      .toLowerCase()
  );

const experienceWeight = (
  experience
) => {
  const weights = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
  };

  return (
    weights[experience] || 0
  );
};

const getInitials = (
  name = ""
) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]
          ?.toUpperCase() || ""
    )
    .join("");
};

export default EventParticipantSkillMatching;