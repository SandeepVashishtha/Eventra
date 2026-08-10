import {
  ExternalLink,
  Filter,
  Search,
  SlidersHorizontal,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const EventAttendeeNetworkingDirectory = ({
  participants = [],
  title = "Attendee Networking Directory",
  currentUserId,
  className = "",
}) => {
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] =
    useState("all");
  const [interestFilter, setInterestFilter] =
    useState("all");
  const [showFilters, setShowFilters] =
    useState(false);

  const visibleParticipants = useMemo(() => {
    if (!Array.isArray(participants)) {
      return [];
    }

    return participants.filter(
      (participant) =>
        participant?.networkingOptIn !== false &&
        participant?.directoryVisible !== false
    );
  }, [participants]);

  const skills = useMemo(
    () =>
      getUniqueValues(
        visibleParticipants,
        "skills"
      ),
    [visibleParticipants]
  );

  const interests = useMemo(
    () =>
      getUniqueValues(
        visibleParticipants,
        "interests"
      ),
    [visibleParticipants]
  );

  const filteredParticipants =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return visibleParticipants.filter(
        (participant) => {
          const name =
            getName(participant).toLowerCase();

          const bio =
            getBio(participant).toLowerCase();

          const participantSkills =
            getArray(
              participant.skills
            ).map((item) =>
              String(item).toLowerCase()
            );

          const participantInterests =
            getArray(
              participant.interests
            ).map((item) =>
              String(item).toLowerCase()
            );

          const team = String(
            participant.team ||
              ""
          ).toLowerCase();

          const matchesSearch =
            !query ||
            name.includes(query) ||
            bio.includes(query) ||
            team.includes(query) ||
            participantSkills.some(
              (skill) =>
                skill.includes(query)
            ) ||
            participantInterests.some(
              (interest) =>
                interest.includes(query)
            );

          const matchesSkill =
            skillFilter === "all" ||
            participantSkills.includes(
              skillFilter.toLowerCase()
            );

          const matchesInterest =
            interestFilter === "all" ||
            participantInterests.includes(
              interestFilter.toLowerCase()
            );

          return (
            matchesSearch &&
            matchesSkill &&
            matchesInterest
          );
        }
      );
    }, [
      visibleParticipants,
      search,
      skillFilter,
      interestFilter,
    ]);

  const hasActiveFilters =
    search.trim() !== "" ||
    skillFilter !== "all" ||
    interestFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setSkillFilter("all");
    setInterestFilter("all");
  };

  return (
    <section
      aria-labelledby="attendee-networking-title"
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Users
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Event Networking
            </p>

            <h2
              id="attendee-networking-title"
              className="mt-1 text-xl font-bold text-slate-900 dark:text-white"
            >
              {title}
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Discover attendees with similar skills and
              interests before or during the event.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
            {visibleParticipants.length}{" "}
            {visibleParticipants.length === 1
              ? "participant"
              : "participants"}
          </span>

          <button
            type="button"
            onClick={() =>
              setShowFilters(
                (current) => !current
              )
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-expanded={showFilters}
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by name, skill, interest, team, or bio..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/20"
            aria-label="Search attendees"
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter
                size={14}
                className="text-indigo-500"
              />

              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Filter attendees
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[10px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <FilterSelect
              label="Skill"
              value={skillFilter}
              options={skills}
              onChange={setSkillFilter}
            />

            <FilterSelect
              label="Interest"
              value={interestFilter}
              options={interests}
              onChange={setInterestFilter}
            />
          </div>
        </div>
      )}

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            Active:
          </span>

          {search && (
            <FilterBadge
              label={`Search: ${search}`}
              onRemove={() =>
                setSearch("")
              }
            />
          )}

          {skillFilter !== "all" && (
            <FilterBadge
              label={`Skill: ${skillFilter}`}
              onRemove={() =>
                setSkillFilter(
                  "all"
                )
              }
            />
          )}

          {interestFilter !== "all" && (
            <FilterBadge
              label={`Interest: ${interestFilter}`}
              onRemove={() =>
                setInterestFilter(
                  "all"
                )
              }
            />
          )}
        </div>
      )}

      {/* Directory */}
      <div className="mt-6">
        {filteredParticipants.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onClear={clearFilters}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredParticipants.map(
              (participant, index) => (
                <ParticipantCard
                  key={
                    participant.id ||
                    participant.userId ||
                    participant.email ||
                    index
                  }
                  participant={
                    participant
                  }
                  isCurrentUser={
                    currentUserId != null &&
                    String(
                      participant.id ||
                        participant.userId
                    ) ===
                      String(
                        currentUserId
                      )
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
};

/* ----------------------------------
   Participant card
----------------------------------- */

const ParticipantCard = ({
  participant,
  isCurrentUser,
}) => {
  const name =
    getName(participant);

  const bio =
    getBio(participant);

  const skills =
    getArray(
      participant.skills
    );

  const interests =
    getArray(
      participant.interests
    );

  const team =
    participant.team ||
    participant.teamName ||
    "";

  const profileLinks =
    getProfileLinks(
      participant
    );

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800">
      {/* Profile header */}
      <div className="flex items-start gap-3">
        <Avatar
          name={name}
          image={
            participant.avatar ||
            participant.avatarUrl ||
            participant.profileImage
          }
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-800 dark:text-white">
                {name}
                {isCurrentUser && (
                  <span className="ml-2 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[8px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                    You
                  </span>
                )}
              </h3>

              {team && (
                <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400">
                  {team}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <p className="mt-4 line-clamp-3 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
          {bio}
        </p>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <TagSection
          label="Skills"
          items={skills}
          type="skill"
        />
      )}

      {/* Interests */}
      {interests.length > 0 && (
        <TagSection
          label="Interests"
          items={interests}
          type="interest"
        />
      )}

      {/* Social links */}
      {profileLinks.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {profileLinks.map(
            (link, index) => (
              <a
                key={
                  link.url ||
                  index
                }
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[9px] font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
              >
                {link.label}
                <ExternalLink
                  size={10}
                />
              </a>
            )
          )}
        </div>
      )}
    </article>
  );
};

/* ----------------------------------
   Avatar
----------------------------------- */

const Avatar = ({
  name,
  image,
}) => {
  if (image) {
    return (
      <img
        src={image}
        alt={`${name} profile`}
        className="h-11 w-11 shrink-0 rounded-xl object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
      {getInitials(name)}
    </div>
  );
};

/* ----------------------------------
   Tag section
----------------------------------- */

const TagSection = ({
  label,
  items,
  type,
}) => {
  const visibleItems =
    items.slice(0, 5);

  const remaining =
    Math.max(
      0,
      items.length -
        visibleItems.length
    );

  return (
    <div className="mt-4">
      <p className="mb-2 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {visibleItems.map(
          (item, index) => (
            <span
              key={`${type}-${item}-${index}`}
              className={`rounded-full px-2 py-1 text-[9px] font-semibold ${
                type === "skill"
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
              }`}
            >
              {item}
            </span>
          )
        )}

        {remaining > 0 && (
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            +{remaining}
          </span>
        )}
      </div>
    </div>
  );
};

/* ----------------------------------
   Filter select
----------------------------------- */

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}) => {
  return (
    <label>
      <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <option value="all">
          All {label}s
        </option>

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
    </label>
  );
};

/* ----------------------------------
   Filter badge
----------------------------------- */

const FilterBadge = ({
  label,
  onRemove,
}) => {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[9px] font-semibold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
      {label}

      <button
        type="button"
        onClick={onRemove}
        className="rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
        aria-label={`Remove ${label} filter`}
      >
        <X size={10} />
      </button>
    </span>
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyState = ({
  hasFilters,
  onClear,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
        <UserRound
          size={22}
          className="text-slate-400"
        />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">
        {hasFilters
          ? "No matching attendees"
          : "No attendees available"}
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
        {hasFilters
          ? "Try changing your search or removing one of the filters."
          : "Participants who opt into the networking directory will appear here."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

/* ----------------------------------
   Data helpers
----------------------------------- */

const getName = (
  participant = {}
) => {
  if (
    participant.name
  ) {
    return String(
      participant.name
    );
  }

  const fullName = [
    participant.firstName,
    participant.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    fullName ||
    participant.username ||
    participant.email ||
    "Event Participant"
  );
};

const getBio = (
  participant = {}
) => {
  return String(
    participant.bio ||
      participant.shortBio ||
      participant.about ||
      ""
  );
};

const getArray = (
  value
) => {
  if (
    Array.isArray(value)
  ) {
    return value
      .map((item) => {
        if (
          typeof item ===
          "object"
        ) {
          return (
            item.name ||
            item.label ||
            item.value ||
            ""
          );
        }

        return item;
      })
      .filter(Boolean)
      .map(String);
  }

  if (
    typeof value ===
      "string" &&
    value.trim()
  ) {
    return value
      .split(",")
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);
  }

  return [];
};

const getUniqueValues = (
  participants,
  property
) => {
  const values = new Map();

  participants.forEach(
    (participant) => {
      getArray(
        participant?.[
          property
        ]
      ).forEach((value) => {
        const normalized =
          String(
            value
          ).trim();

        const key =
          normalized.toLowerCase();

        if (
          normalized &&
          !values.has(key)
        ) {
          values.set(
            key,
            normalized
          );
        }
      });
    }
  );

  return Array.from(
    values.values()
  ).sort((a, b) =>
    a.localeCompare(b)
  );
};

const getInitials = (
  name
) => {
  const parts = String(
    name || "Participant"
  )
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "P";
  }

  return parts
    .slice(0, 2)
    .map(
      (part) =>
        part[0]
          ?.toUpperCase() || ""
    )
    .join("");
};

const getProfileLinks = (
  participant = {}
) => {
  const links = [];

  if (
    participant.linkedin
  ) {
    links.push({
      label: "LinkedIn",
      url: participant.linkedin,
    });
  }

  if (
    participant.github
  ) {
    links.push({
      label: "GitHub",
      url: participant.github,
    });
  }

  if (
    participant.website
  ) {
    links.push({
      label: "Website",
      url: participant.website,
    });
  }

  if (
    Array.isArray(
      participant.profileLinks
    )
  ) {
    participant.profileLinks.forEach(
      (link) => {
        if (
          link?.url
        ) {
          links.push({
            label:
              link.label ||
              "Profile",
            url: link.url,
          });
        }
      }
    );
  }

  return links;
};

export default EventAttendeeNetworkingDirectory;