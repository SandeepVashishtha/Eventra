import {
  Check,
  Filter,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_TRACKS = [
  "AI/ML",
  "Web Development",
  "Data Science",
  "Cybersecurity",
  "IoT",
  "Business",
  "Design",
];

const DEFAULT_SESSIONS = [
  {
    id: 1,
    title: "Introduction to Generative AI",
    speaker: "Alex Johnson",
    track: "AI/ML",
    time: "09:00 AM - 10:00 AM",
    venue: "Hall A",
  },
  {
    id: 2,
    title: "Modern React Development",
    speaker: "Sarah Williams",
    track: "Web Development",
    time: "10:15 AM - 11:15 AM",
    venue: "Hall B",
  },
  {
    id: 3,
    title: "Data Analytics with Python",
    speaker: "David Smith",
    track: "Data Science",
    time: "11:30 AM - 12:30 PM",
    venue: "Hall A",
  },
  {
    id: 4,
    title: "Cybersecurity Threat Detection",
    speaker: "Emily Brown",
    track: "Cybersecurity",
    time: "01:30 PM - 02:30 PM",
    venue: "Hall C",
  },
  {
    id: 5,
    title: "Building IoT Solutions",
    speaker: "Michael Lee",
    track: "IoT",
    time: "02:45 PM - 03:45 PM",
    venue: "Lab 1",
  },
  {
    id: 6,
    title: "Startup Strategy and Growth",
    speaker: "Robert Davis",
    track: "Business",
    time: "04:00 PM - 05:00 PM",
    venue: "Hall D",
  },
  {
    id: 7,
    title: "Design Thinking Workshop",
    speaker: "Sophia Wilson",
    track: "Design",
    time: "05:15 PM - 06:15 PM",
    venue: "Design Studio",
  },
];

const EventSessionTrackFiltering = ({
  tracks = DEFAULT_TRACKS,
  sessions = DEFAULT_SESSIONS,
}) => {
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const toggleTrack = (track) => {
    setSelectedTracks((current) =>
      current.includes(track)
        ? current.filter((item) => item !== track)
        : [...current, track]
    );
  };

  const clearFilters = () => {
    setSelectedTracks([]);
    setSearchQuery("");
  };

  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sessions.filter((session) => {
      const matchesTrack =
        selectedTracks.length === 0 ||
        selectedTracks.includes(session.track);

      const matchesSearch =
        !query ||
        session.title.toLowerCase().includes(query) ||
        session.speaker.toLowerCase().includes(query) ||
        session.track.toLowerCase().includes(query);

      return matchesTrack && matchesSearch;
    });
  }, [sessions, selectedTracks, searchQuery]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Filter size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Event Schedule
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Session Track Filtering
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Filter sessions by one or multiple event tracks to
              quickly find the sessions relevant to you.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[7px] font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-indigo-400"
        >
          <Filter size={13} />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Search */}
      {showFilters && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <label className="mb-2 block text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Search Sessions
          </label>

          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search by session, speaker, or track..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-indigo-900/30"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Track Buttons */}
          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
                  Filter by Track
                </p>

                <p className="mt-1 text-[7px] text-slate-400">
                  Select multiple tracks
                </p>
              </div>

              {selectedTracks.length > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-[6px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <RotateCcw size={10} />
                  Clear Filters
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {tracks.map((track) => {
                const selected =
                  selectedTracks.includes(track);

                return (
                  <button
                    key={track}
                    type="button"
                    onClick={() => toggleTrack(track)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[7px] font-bold transition ${
                      selected
                        ? "border-indigo-500 bg-indigo-600 text-white shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                    }`}
                  >
                    {selected && <Check size={12} />}
                    {track}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Tracks */}
          {selectedTracks.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <span className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
                Selected:
              </span>

              {selectedTracks.map((track) => (
                <button
                  key={track}
                  type="button"
                  onClick={() => toggleTrack(track)}
                  className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                >
                  {track}
                  <X size={9} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Result Summary */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Available Sessions
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Showing {filteredSessions.length} of{" "}
            {sessions.length} sessions
          </p>
        </div>

        {selectedTracks.length > 0 && (
          <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {selectedTracks.length} track
            {selectedTracks.length !== 1 ? "s" : ""} selected
          </span>
        )}
      </div>

      {/* Session List */}
      <div className="mt-4 grid gap-3">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
            />
          ))
        ) : (
          <EmptyState onClear={clearFilters} />
        )}
      </div>
    </section>
  );
};

/* --------------------------------
   Session Card
--------------------------------- */

const SessionCard = ({ session }) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          {session.track
            .split(/[\s/]+/)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
              {session.title}
            </h4>

            <span className="rounded-full bg-indigo-50 px-2 py-1 text-[5px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              {session.track}
            </span>
          </div>

          <p className="mt-1 text-[7px] text-slate-500 dark:text-slate-400">
            Speaker: {session.speaker}
          </p>

          <div className="mt-3 flex flex-wrap gap-3 text-[6px] text-slate-400">
            <span>{session.time}</span>
            <span>•</span>
            <span>{session.venue}</span>
          </div>
        </div>

        <button
          type="button"
          className="rounded-xl border border-slate-200 px-3 py-2 text-[6px] font-bold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
        >
          View Session
        </button>
      </div>
    </article>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = ({ onClear }) => {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center dark:border-slate-700">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Search size={20} />
      </div>

      <h4 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
        No sessions found
      </h4>

      <p className="mt-1 max-w-sm text-[7px] leading-4 text-slate-400">
        Try selecting different tracks or changing your search
        query.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[7px] font-bold text-white hover:bg-indigo-700"
      >
        <RotateCcw size={12} />
        Clear Filters
      </button>
    </div>
  );
};

export default EventSessionTrackFiltering;