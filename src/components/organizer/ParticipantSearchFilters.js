import {
  CalendarDays,
  ChevronDown,
  Filter,
  Mail,
  RotateCcw,
  Search,
  Users,
} from "lucide-react";
import { useMemo } from "react";

const ParticipantSearchFilters = ({
  filters = {},
  onFiltersChange,
  onClear,
  teams = [],
  categories = [],
  className = "",
}) => {
  const currentFilters = useMemo(
    () => ({
      search: "",
      registrationStatus: "",
      team: "",
      attendanceStatus: "",
      registrationDate: "",
      participantCategory: "",
      ...filters,
    }),
    [filters]
  );

  const updateFilter = (
    field,
    value
  ) => {
    onFiltersChange?.({
      ...currentFilters,
      [field]: value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onFiltersChange?.(currentFilters);
  };

  const handleClear = () => {
    onClear?.();

    if (!onClear) {
      onFiltersChange?.({
        search: "",
        registrationStatus: "",
        team: "",
        attendanceStatus: "",
        registrationDate: "",
        participantCategory: "",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <Filter
              size={18}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">
              Participant Search & Filters
            </h2>

            <p className="text-[11px] text-slate-400">
              Find participants quickly.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-900/40 dark:hover:bg-red-900/10 dark:hover:text-red-400"
        >
          <RotateCcw size={13} />
          Clear Filters
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <label
          htmlFor="participant-search"
          className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          Search participant
        </label>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="participant-search"
            type="search"
            value={
              currentFilters.search
            }
            onChange={(event) =>
              updateFilter(
                "search",
                event.target.value
              )
            }
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-900/30"
          />

          {currentFilters.search && (
            <button
              type="button"
              onClick={() =>
                updateFilter(
                  "search",
                  ""
                )
              }
              aria-label="Clear participant search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-red-500"
            >
              ×
            </button>
          )}
        </div>

        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400">
          <Mail size={11} />
          Search using participant name or email.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <FilterSelect
          label="Registration Status"
          value={
            currentFilters.registrationStatus
          }
          onChange={(value) =>
            updateFilter(
              "registrationStatus",
              value
            )
          }
          options={[
            {
              value: "registered",
              label: "Registered",
            },
            {
              value: "pending",
              label: "Pending",
            },
            {
              value: "cancelled",
              label: "Cancelled",
            },
            {
              value: "waitlisted",
              label: "Waitlisted",
            },
          ]}
        />

        <FilterSelect
          label="Team"
          value={currentFilters.team}
          onChange={(value) =>
            updateFilter(
              "team",
              value
            )
          }
          options={teams.map(
            (team) => ({
              value:
                typeof team ===
                "object"
                  ? team.id ||
                    team.name
                  : team,
              label:
                typeof team ===
                "object"
                  ? team.name ||
                    team.label ||
                    team.id
                  : team,
            })
          )}
          icon={Users}
        />

        <FilterSelect
          label="Attendance Status"
          value={
            currentFilters.attendanceStatus
          }
          onChange={(value) =>
            updateFilter(
              "attendanceStatus",
              value
            )
          }
          options={[
            {
              value: "attended",
              label: "Attended",
            },
            {
              value: "absent",
              label: "Absent",
            },
            {
              value: "not-marked",
              label: "Not Marked",
            },
          ]}
        />

        <FilterSelect
          label="Registration Date"
          value={
            currentFilters.registrationDate
          }
          onChange={(value) =>
            updateFilter(
              "registrationDate",
              value
            )
          }
          options={[
            {
              value: "today",
              label: "Today",
            },
            {
              value: "last-7-days",
              label: "Last 7 Days",
            },
            {
              value: "last-30-days",
              label: "Last 30 Days",
            },
            {
              value: "last-90-days",
              label: "Last 90 Days",
            },
          ]}
          icon={CalendarDays}
        />

        <FilterSelect
          label="Participant Category"
          value={
            currentFilters.participantCategory
          }
          onChange={(value) =>
            updateFilter(
              "participantCategory",
              value
            )
          }
          options={categories.map(
            (category) => ({
              value:
                typeof category ===
                "object"
                  ? category.id ||
                    category.name
                  : category,
              label:
                typeof category ===
                "object"
                  ? category.name ||
                    category.label ||
                    category.id
                  : category,
            })
          )}
        />
      </div>

      {/* Apply */}
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <Search size={14} />
          Apply Filters
        </button>
      </div>
    </form>
  );
};

/**
 * Reusable select control.
 */
const FilterSelect = ({
  label,
  value,
  onChange,
  options = [],
  icon: Icon = ChevronDown,
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="relative">
        <select
          value={value || ""}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-xs text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/30"
        >
          <option value="">
            All {label}
          </option>

          {options.map(
            (option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            )
          )}
        </select>

        <Icon
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
};

export default ParticipantSearchFilters;