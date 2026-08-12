import {
  Check,
  ChevronDown,
  Code2,
  Eye,
  EyeOff,
  Filter,
  Heart,
  Mail,
  Search,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_PARTICIPANTS = [
  {
    id: "P001",
    name: "Aarav Sharma",
    role: "Frontend Developer",
    skills: ["Programming", "UI/UX"],
    experience: "Intermediate",
    interests: ["Web Development", "AI"],
    bio: "Frontend developer interested in collaborative hackathon projects.",
    visible: true,
  },
  {
    id: "P002",
    name: "Priya Patel",
    role: "AI/ML Developer",
    skills: ["Programming", "AI/ML", "Data Science"],
    experience: "Advanced",
    interests: ["Artificial Intelligence", "Machine Learning"],
    bio: "AI/ML enthusiast working on intelligent applications.",
    visible: true,
  },
  {
    id: "P003",
    name: "Rahul Mehta",
    role: "Backend Developer",
    skills: ["Programming", "Management"],
    experience: "Intermediate",
    interests: ["Cloud", "Backend"],
    bio: "Backend developer who enjoys building scalable applications.",
    visible: true,
  },
  {
    id: "P004",
    name: "Neha Shah",
    role: "UI/UX Designer",
    skills: ["UI/UX", "Marketing"],
    experience: "Advanced",
    interests: ["Product Design", "Branding"],
    bio: "Designer focused on creating simple and accessible user experiences.",
    visible: true,
  },
  {
    id: "P005",
    name: "Karan Joshi",
    role: "Data Scientist",
    skills: ["Data Science", "AI/ML", "Programming"],
    experience: "Intermediate",
    interests: ["Analytics", "Machine Learning"],
    bio: "Data scientist interested in analytics and predictive modeling.",
    visible: true,
  },
  {
    id: "P006",
    name: "Meera Desai",
    role: "Hardware Developer",
    skills: ["Hardware", "Programming"],
    experience: "Beginner",
    interests: ["IoT", "Robotics"],
    bio: "Hardware enthusiast interested in IoT and robotics projects.",
    visible: true,
  },
  {
    id: "P007",
    name: "Rohan Shah",
    role: "Marketing Coordinator",
    skills: ["Marketing", "Management"],
    experience: "Intermediate",
    interests: ["Community", "Events"],
    bio: "Interested in event promotion, community building, and outreach.",
    visible: true,
  },
];

const SKILL_CATEGORIES = [
  "Programming",
  "AI/ML",
  "Data Science",
  "UI/UX",
  "Hardware",
  "Marketing",
  "Management",
];

const EXPERIENCE_OPTIONS = [
  "All Experience",
  "Beginner",
  "Intermediate",
  "Advanced",
];

const EventParticipantSearchBySkill = ({
  participants = DEFAULT_PARTICIPANTS,
  currentUserId,
  onMessage,
  onViewProfile,
  className = "",
}) => {
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] =
    useState("All Skills");
  const [selectedExperience, setSelectedExperience] =
    useState("All Experience");
  const [showOnlyVisible, setShowOnlyVisible] =
    useState(true);
  const [showFilters, setShowFilters] =
    useState(true);
  const [messageSent, setMessageSent] =
    useState([]);
  const [selectedParticipant, setSelectedParticipant] =
    useState(null);

  const filteredParticipants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return participants
      .filter(
        (participant) =>
          participant.id !== currentUserId
      )
      .filter(
        (participant) =>
          !showOnlyVisible ||
          participant.visible !== false
      )
      .filter((participant) => {
        if (!query) return true;

        return (
          participant.name
            .toLowerCase()
            .includes(query) ||
          participant.role
            .toLowerCase()
            .includes(query) ||
          participant.skills.some((skill) =>
            skill.toLowerCase().includes(query)
          ) ||
          participant.interests.some((interest) =>
            interest.toLowerCase().includes(query)
          )
        );
      })
      .filter(
        (participant) =>
          selectedSkill === "All Skills" ||
          participant.skills.includes(selectedSkill)
      )
      .filter(
        (participant) =>
          selectedExperience === "All Experience" ||
          participant.experience === selectedExperience
      );
  }, [
    participants,
    currentUserId,
    search,
    selectedSkill,
    selectedExperience,
    showOnlyVisible,
  ]);

  const handleMessage = (participant) => {
    setMessageSent((current) =>
      current.includes(participant.id)
        ? current
        : [...current, participant.id]
    );

    onMessage?.(participant);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedSkill("All Skills");
    setSelectedExperience("All Experience");
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Networking
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Find Participants by Skill
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Discover event attendees based on their skills, experience,
              interests, and collaboration goals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-[9px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Users size={11} />
            {filteredParticipants.length} participants
          </span>
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
              setSearch(event.target.value)
            }
            placeholder="Search by name, skill, role, or interest..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-xs text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filter header */}
      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowFilters((value) => !value)}
          className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300"
        >
          <Filter size={13} className="text-indigo-500" />
          Filters

          <ChevronDown
            size={12}
            className={`transition-transform ${
              showFilters ? "rotate-180" : ""
            }`}
          />
        </button>

        {(search ||
          selectedSkill !== "All Skills" ||
          selectedExperience !== "All Experience") && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-[9px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Skill Category
              </label>

              <div className="flex flex-wrap gap-2">
                <SkillButton
                  label="All Skills"
                  selected={
                    selectedSkill === "All Skills"
                  }
                  onClick={() =>
                    setSelectedSkill("All Skills")
                  }
                />

                {SKILL_CATEGORIES.map((skill) => (
                  <SkillButton
                    key={skill}
                    label={skill}
                    selected={
                      selectedSkill === skill
                    }
                    onClick={() =>
                      setSelectedSkill(skill)
                    }
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Experience Level
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {EXPERIENCE_OPTIONS.map(
                  (experience) => (
                    <button
                      key={experience}
                      type="button"
                      onClick={() =>
                        setSelectedExperience(
                          experience
                        )
                      }
                      className={`rounded-lg border px-2 py-2 text-[8px] font-bold transition ${
                        selectedExperience ===
                        experience
                          ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      {experience}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlyVisible}
                onChange={(event) =>
                  setShowOnlyVisible(
                    event.target.checked
                  )
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />

              <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                <Eye size={11} />
                Show only participants who opted into the directory
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Active filter summary */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
          Active:
        </span>

        {selectedSkill !== "All Skills" && (
          <FilterTag
            label={selectedSkill}
            onRemove={() =>
              setSelectedSkill("All Skills")
            }
          />
        )}

        {selectedExperience !== "All Experience" && (
          <FilterTag
            label={selectedExperience}
            onRemove={() =>
              setSelectedExperience("All Experience")
            }
          />
        )}

        {search && (
          <FilterTag
            label={`"${search}"`}
            onRemove={() => setSearch("")}
          />
        )}

        {selectedSkill === "All Skills" &&
          selectedExperience === "All Experience" &&
          !search && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              All participants
            </span>
          )}
      </div>

      {/* Results */}
      <div className="mt-6">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Participant Directory
            </h3>

            <p className="mt-1 text-[9px] text-slate-400">
              Find people with the skills you need for collaboration.
            </p>
          </div>
        </div>

        {filteredParticipants.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {filteredParticipants.map(
              (participant) => (
                <ParticipantCard
                  key={participant.id}
                  participant={participant}
                  messageSent={messageSent.includes(
                    participant.id
                  )}
                  onMessage={() =>
                    handleMessage(participant)
                  }
                  onViewProfile={() => {
                    setSelectedParticipant(
                      participant
                    );

                    onViewProfile?.(participant);
                  }}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Privacy note */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <EyeOff
          size={15}
          className="mt-0.5 shrink-0 text-slate-400"
        />

        <div>
          <p className="text-[9px] font-bold text-slate-600 dark:text-slate-300">
            Participant privacy
          </p>

          <p className="mt-1 text-[8px] leading-4 text-slate-400">
            Only participants who choose to appear in the networking directory
            are shown. Users can hide their profile at any time.
          </p>
        </div>
      </div>

      {/* Profile modal */}
      {selectedParticipant && (
        <ParticipantProfileModal
          participant={selectedParticipant}
          messageSent={messageSent.includes(
            selectedParticipant.id
          )}
          onMessage={() =>
            handleMessage(selectedParticipant)
          }
          onClose={() =>
            setSelectedParticipant(null)
          }
        />
      )}
    </section>
  );
};

/* ----------------------------------
   Participant card
----------------------------------- */

const ParticipantCard = ({
  participant,
  messageSent,
  onMessage,
  onViewProfile,
}) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          {getInitials(participant.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              {participant.name}
            </h4>

            <span className="rounded-full bg-green-50 px-2 py-1 text-[7px] font-bold uppercase text-green-600 dark:bg-green-900/20 dark:text-green-400">
              Available
            </span>
          </div>

          <p className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">
            {participant.role}
          </p>

          <p className="mt-0.5 text-[8px] text-slate-400">
            {participant.experience} experience
          </p>
        </div>
      </div>

      {/* Bio */}
      <p className="mt-4 line-clamp-2 text-[9px] leading-4 text-slate-500 dark:text-slate-400">
        {participant.bio}
      </p>

      {/* Skills */}
      <div className="mt-4">
        <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wide text-slate-400">
          <Code2 size={10} />
          Skills
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {participant.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-indigo-50 px-2 py-1 text-[8px] font-semibold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Interests */}
      {participant.interests?.length > 0 && (
        <div className="mt-3">
          <p className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wide text-slate-400">
            <Heart size={10} />
            Interests
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
      )}

      {/* Actions */}
      <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <button
          type="button"
          onClick={onViewProfile}
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-[9px] font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          View Profile
        </button>

        <button
          type="button"
          onClick={onMessage}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[9px] font-bold ${
            messageSent
              ? "bg-green-600 text-white"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {messageSent ? (
            <>
              <Check size={11} />
              Message Sent
            </>
          ) : (
            <>
              <Mail size={11} />
              Message
            </>
          )}
        </button>
      </div>
    </article>
  );
};

/* ----------------------------------
   Skill button
----------------------------------- */

const SkillButton = ({
  label,
  selected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[8px] font-bold transition ${
        selected
          ? "border-indigo-500 bg-indigo-600 text-white"
          : "border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
      }`}
    >
      {selected && (
        <Check
          size={9}
          className="mr-1 inline"
        />
      )}

      {label}
    </button>
  );
};

/* ----------------------------------
   Filter tag
----------------------------------- */

const FilterTag = ({
  label,
  onRemove,
}) => {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[8px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
      {label}

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="rounded-full hover:text-red-500"
      >
        <X size={9} />
      </button>
    </span>
  );
};

/* ----------------------------------
   Profile modal
----------------------------------- */

const ParticipantProfileModal = ({
  participant,
  messageSent,
  onMessage,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              {getInitials(participant.name)}
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
          <div className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-900/10">
            <p className="text-[8px] font-bold uppercase tracking-wide text-indigo-500">
              About Participant
            </p>

            <p className="mt-2 text-[10px] leading-5 text-indigo-700 dark:text-indigo-300">
              {participant.bio}
            </p>
          </div>

          <ProfileSection
            title="Skills"
            icon={<Code2 size={12} />}
          >
            <div className="flex flex-wrap gap-2">
              {participant.skills.map(
                (skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-indigo-50 px-3 py-1.5 text-[8px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
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
            <div className="flex flex-wrap gap-2">
              {participant.interests?.map(
                (interest) => (
                  <span
                    key={interest}
                    className="rounded-full bg-pink-50 px-3 py-1.5 text-[8px] font-bold text-pink-600 dark:bg-pink-900/20 dark:text-pink-400"
                  >
                    {interest}
                  </span>
                )
              )}
            </div>
          </ProfileSection>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoCard
              label="Experience"
              value={participant.experience}
            />

            <InfoCard
              label="Directory Status"
              value={
                participant.visible
                  ? "Visible"
                  : "Hidden"
              }
            />
          </div>
        </div>

        <div className="flex gap-2 border-t border-slate-200 p-4 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-[9px] font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onMessage}
            className={`flex-1 rounded-xl px-4 py-3 text-[9px] font-bold text-white ${
              messageSent
                ? "bg-green-600"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {messageSent
              ? "Message Sent"
              : "Contact Participant"}
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
    <div className="mt-5">
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
   Info card
----------------------------------- */

const InfoCard = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
      <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-[10px] font-bold text-slate-700 dark:text-slate-200">
        {value}
      </p>
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
        <Search size={19} />
      </div>

      <h3 className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
        No participants found
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-[9px] leading-4 text-slate-400">
        Try another skill, experience level, or search term.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-4 rounded-lg bg-indigo-600 px-3 py-2 text-[9px] font-bold text-white hover:bg-indigo-700"
      >
        Reset Filters
      </button>
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

export default EventParticipantSearchBySkill;