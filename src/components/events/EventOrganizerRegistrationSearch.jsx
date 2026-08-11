import {
  Search,
  UserRound,
  Mail,
  Hash,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const EventOrganizerRegistrationSearch = ({
  registrations = [],
  onParticipantClick,
  className = "",
}) => {
  const [query, setQuery] = useState("");

  const filteredRegistrations = useMemo(() => {
    const searchTerm = query
      .trim()
      .toLowerCase();

    if (!searchTerm) {
      return registrations;
    }

    return registrations.filter(
      (participant) => {
        const name =
          participant.name ||
          participant.participantName ||
          "";

        const email =
          participant.email || "";

        const registrationId =
          participant.registrationId ||
          participant.id ||
          "";

        const teamName =
          participant.teamName ||
          participant.team?.name ||
          "";

        return [
          name,
          email,
          registrationId,
          teamName,
        ].some((value) =>
          String(value)
            .toLowerCase()
            .includes(searchTerm)
        );
      }
    );
  }, [registrations, query]);

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Organizer
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Registration Search
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Quickly find participants by name, email,
            registration ID, or team.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
            Results
          </p>

          <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
            {filteredRegistrations.length}
            <span className="ml-1 text-[8px] font-normal text-slate-400">
              / {registrations.length}
            </span>
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search by name, email, registration ID, or team..."
            aria-label="Search registrations"
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-11 pr-12 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-900/30"
          />

          {query && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Search hints */}
        <div className="mt-3 flex flex-wrap gap-2">
          <SearchHint
            icon={<UserRound size={11} />}
            label="Name"
          />

          <SearchHint
            icon={<Mail size={11} />}
            label="Email"
          />

          <SearchHint
            icon={<Hash size={11} />}
            label="Registration ID"
          />

          <SearchHint
            icon={<Users size={11} />}
            label="Team"
          />
        </div>
      </div>

      {/* Results */}
      <div className="mt-6">
        {filteredRegistrations.length >
        0 ? (
          <div className="space-y-3">
            {filteredRegistrations.map(
              (participant, index) => (
                <ParticipantResult
                  key={
                    participant.id ||
                    participant.registrationId ||
                    index
                  }
                  participant={participant}
                  query={query}
                  onClick={() =>
                    onParticipantClick?.(
                      participant
                    )
                  }
                />
              )
            )}
          </div>
        ) : (
          <EmptySearchState
            query={query}
            onClear={clearSearch}
          />
        )}
      </div>
    </section>
  );
};

const ParticipantResult = ({
  participant,
  query,
  onClick,
}) => {
  const name =
    participant.name ||
    participant.participantName ||
    "Unknown Participant";

  const email =
    participant.email ||
    "No email available";

  const registrationId =
    participant.registrationId ||
    participant.id ||
    "N/A";

  const teamName =
    participant.teamName ||
    participant.team?.name ||
    "Individual";

  const status =
    participant.status ||
    participant.registrationStatus ||
    "Registered";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-900/50 sm:flex-row sm:items-center"
    >
      {/* Avatar */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <UserRound size={18} />
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <h3 className="truncate text-[10px] font-bold text-slate-800 dark:text-white">
            {highlightMatch(
              name,
              query
            )}
          </h3>

          <span className="w-fit rounded-full bg-green-50 px-2.5 py-1 text-[7px] font-bold text-green-600 dark:bg-green-900/10 dark:text-green-400">
            {status}
          </span>
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <Detail
            icon={<Mail size={11} />}
            value={email}
            query={query}
          />

          <Detail
            icon={<Hash size={11} />}
            value={registrationId}
            query={query}
          />

          <Detail
            icon={<Users size={11} />}
            value={teamName}
            query={query}
          />
        </div>
      </div>
    </button>
  );
};

const Detail = ({
  icon,
  value,
  query,
}) => (
  <div className="flex min-w-0 items-center gap-1.5 text-slate-400">
    {icon}

    <span className="truncate text-[7px]">
      {highlightMatch(
        String(value),
        query
      )}
    </span>
  </div>
);

const SearchHint = ({
  icon,
  label,
}) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[7px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-900">
    {icon}
    {label}
  </span>
);

const EmptySearchState = ({
  query,
  onClear,
}) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
      <Search size={20} />
    </div>

    <h3 className="mt-4 text-[10px] font-bold text-slate-700 dark:text-slate-200">
      No participants found
    </h3>

    <p className="mx-auto mt-1 max-w-sm text-[8px] leading-4 text-slate-400">
      {query
        ? `No registrations match "${query}". Try searching by participant name, email, registration ID, or team name.`
        : "There are currently no registrations available."}
    </p>

    {query && (
      <button
        type="button"
        onClick={onClear}
        className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-[8px] font-bold text-white hover:bg-indigo-700"
      >
        Clear Search
      </button>
    )}
  </div>
);

const highlightMatch = (
  text,
  query
) => {
  if (!query?.trim()) {
    return text;
  }

  const searchTerm =
    query.trim();

  const regex = new RegExp(
    `(${escapeRegExp(searchTerm)})`,
    "gi"
  );

  const parts =
    String(text).split(regex);

  return parts.map(
    (part, index) => {
      const matches =
        part.toLowerCase() ===
        searchTerm.toLowerCase();

      return matches ? (
        <mark
          key={index}
          className="rounded bg-indigo-100 px-0.5 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
        >
          {part}
        </mark>
      ) : (
        part
      );
    }
  );
};

const escapeRegExp = (
  value
) =>
  value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

export default EventOrganizerRegistrationSearch;