import {
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Search,
  SlidersHorizontal,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_SEARCHES = [
  {
    id: 1,
    keyword: "AI Hackathon",
    category: "Hackathon",
    location: "Rajkot",
    date: "August 20, 2026",
    skills: ["AI/ML", "Python"],
    searchedAt: "10 minutes ago",
  },
  {
    id: 2,
    keyword: "Web Development",
    category: "Workshop",
    location: "Ahmedabad",
    date: "August 25, 2026",
    skills: ["React", "JavaScript"],
    searchedAt: "2 hours ago",
  },
  {
    id: 3,
    keyword: "Data Science",
    category: "Conference",
    location: "Online",
    date: "September 5, 2026",
    skills: ["Python", "Data Science"],
    searchedAt: "Yesterday",
  },
];

const EventParticipantSearchHistory = ({
  initialSearches = DEFAULT_SEARCHES,
  onApplySearch,
}) => {
  const [searches, setSearches] = useState(initialSearches);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("All");

  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        searches
          .map((search) => search.category)
          .filter(Boolean)
      ),
    ],
    [searches]
  );

  const locations = useMemo(
    () => [
      "All",
      ...new Set(
        searches
          .map((search) => search.location)
          .filter(Boolean)
      ),
    ],
    [searches]
  );

  const skills = useMemo(
    () => [
      "All",
      ...new Set(
        searches.flatMap((search) => search.skills || [])
      ),
    ],
    [searches]
  );

  const filteredSearches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return searches.filter((search) => {
      const matchesQuery =
        !normalizedQuery ||
        search.keyword
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesCategory =
        categoryFilter === "All" ||
        search.category === categoryFilter;

      const matchesLocation =
        locationFilter === "All" ||
        search.location === locationFilter;

      const matchesSkill =
        skillFilter === "All" ||
        (search.skills || []).includes(skillFilter);

      return (
        matchesQuery &&
        matchesCategory &&
        matchesLocation &&
        matchesSkill
      );
    });
  }, [
    searches,
    query,
    categoryFilter,
    locationFilter,
    skillFilter,
  ]);

  const removeSearch = (id) => {
    setSearches((current) =>
      current.filter((search) => search.id !== id)
    );
  };

  const clearAllSearches = () => {
    setSearches([]);
  };

  const clearFilters = () => {
    setQuery("");
    setCategoryFilter("All");
    setLocationFilter("All");
    setSkillFilter("All");
  };

  const applySearch = (search) => {
    if (onApplySearch) {
      onApplySearch(search);
      return;
    }

    setQuery(search.keyword);
    setCategoryFilter(search.category || "All");
    setLocationFilter(search.location || "All");
    setSkillFilter(
      search.skills?.[0] || "All"
    );
  };

  const hasFilters =
    query ||
    categoryFilter !== "All" ||
    locationFilter !== "All" ||
    skillFilter !== "All";

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Clock3 size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Event Discovery
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Search History
            </h2>

            <p className="mt-1 max-w-xl text-xs text-slate-500 dark:text-slate-400">
              Quickly revisit your recent event searches and
              reuse their filters.
            </p>
          </div>
        </div>

        {searches.length > 0 && (
          <button
            type="button"
            onClick={clearAllSearches}
            className="flex w-fit items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-[6px] font-bold text-red-600 transition hover:bg-red-50 dark:border-red-900/30 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-900/10"
          >
            <Trash2 size={12} />
            Clear History
          </button>
        )}
      </div>

      {/* Search / Filters */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={14}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
            Filter Search History
          </h3>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Keyword */}
          <div className="relative lg:col-span-1">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search keyword..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-[8px] text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            />
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[8px] text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                Category: {category}
              </option>
            ))}
          </select>

          {/* Location */}
          <select
            value={locationFilter}
            onChange={(event) =>
              setLocationFilter(event.target.value)
            }
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[8px] text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            {locations.map((location) => (
              <option key={location} value={location}>
                Location: {location}
              </option>
            ))}
          </select>

          {/* Skill */}
          <select
            value={skillFilter}
            onChange={(event) =>
              setSkillFilter(event.target.value)
            }
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[8px] text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            {skills.map((skill) => (
              <option key={skill} value={skill}>
                Skill: {skill}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 text-[6px] font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <X size={10} />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-5 flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Recent Searches
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            {filteredSearches.length} search
            {filteredSearches.length === 1 ? "" : "es"} found
          </p>
        </div>

        <div className="rounded-xl bg-indigo-50 px-3 py-2 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          {searches.length} saved
        </div>
      </div>

      {/* Search Cards */}
      <div className="mt-4 space-y-3">
        {filteredSearches.map((search) => (
          <div
            key={search.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-900"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              {/* Search details */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Search
                    size={13}
                    className="shrink-0 text-indigo-600 dark:text-indigo-400"
                  />

                  <h4 className="text-[10px] font-bold text-slate-800 dark:text-white">
                    {search.keyword}
                  </h4>

                  <span className="rounded-full bg-indigo-50 px-2 py-1 text-[5px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                    {search.category}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1.5 text-[6px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <MapPin size={10} />
                    {search.location}
                  </span>

                  <span className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1.5 text-[6px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <CalendarDays size={10} />
                    {search.date}
                  </span>
                </div>

                {/* Skills */}
                {search.skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Tag
                      size={10}
                      className="text-slate-400"
                    />

                    {search.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-slate-100 px-2 py-1 text-[5px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <p className="mt-3 flex items-center gap-1 text-[6px] text-slate-400">
                  <Clock3 size={9} />
                  Searched {search.searchedAt}
                </p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 gap-2 lg:flex-col">
                <button
                  type="button"
                  onClick={() => applySearch(search)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[6px] font-bold text-white transition hover:bg-indigo-700 lg:flex-none"
                >
                  <Check size={11} />
                  Apply Search
                </button>

                <button
                  type="button"
                  onClick={() => removeSearch(search.id)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[6px] font-bold text-slate-500 transition hover:border-red-200 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-red-900 dark:hover:text-red-400"
                >
                  <Trash2 size={11} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredSearches.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <Search size={21} />
            </div>

            <h4 className="mt-4 text-[9px] font-bold text-slate-700 dark:text-slate-300">
              No searches found
            </h4>

            <p className="mx-auto mt-2 max-w-sm text-[7px] leading-4 text-slate-400">
              {searches.length === 0
                ? "Your recent event searches will appear here."
                : "Try changing your filters or clearing the current search filters."}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-[6px] font-bold text-white hover:bg-indigo-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventParticipantSearchHistory;