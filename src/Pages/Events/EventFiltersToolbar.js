import { Grid, List } from "lucide-react";
import StyledDropdown from "../../components/StyledDropdown";

const EVENT_FILTERS = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "conference", label: "Conferences" },
  { key: "workshop", label: "Workshops" },
];

const FilterButton = ({ filter, filterType, onFilterChange }) => {
  const isActive = filterType === filter.key;

  return (
    <button
      onClick={() => onFilterChange(filter.key)}
      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full transition ${
        isActive
          ? "bg-black text-white"
          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700"
      }`}
      aria-pressed={isActive}
    >
      {filter.label}
    </button>
  );
};

const ViewModeButton = ({ mode, activeMode, onViewModeChange, icon: Icon }) => {
  const isActive = activeMode === mode;

  return (
    <button
      onClick={() => onViewModeChange(mode)}
      className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${
        isActive
          ? "bg-black text-white shadow-md"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
      aria-label={`${mode === "grid" ? "Grid" : "List"} view`}
      aria-pressed={isActive}
    >
      <Icon size={16} />
    </button>
  );
};

const EventFiltersToolbar = ({
  filterType,
  onFilterChange,
  sortType,
  onSortChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="mb-8 sm:mb-10 flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-center sm:justify-start">
        {EVENT_FILTERS.map((filter) => (
          <FilterButton
            key={filter.key}
            filter={filter}
            filterType={filterType}
            onFilterChange={onFilterChange}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <label htmlFor="sort-events" className="sr-only">
            Sort events
          </label>
          <StyledDropdown
            label=""
            value={sortType === "" ? "" : sortType}
            onChange={onSortChange}
            options={["Newest", "Upcoming"]}
            placeholder="Sort by Date"
          />
        </div>

        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
          <ViewModeButton
            mode="grid"
            activeMode={viewMode}
            onViewModeChange={onViewModeChange}
            icon={Grid}
          />
          <ViewModeButton
            mode="list"
            activeMode={viewMode}
            onViewModeChange={onViewModeChange}
            icon={List}
          />
        </div>
      </div>
    </div>
  );
};

export default EventFiltersToolbar;
