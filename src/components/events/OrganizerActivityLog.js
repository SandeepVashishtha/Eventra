import { useMemo, useState } from "react";
import {
  Activity,
  Bell,
  CalendarPlus,
  CalendarX,
  ChevronDown,
  Edit3,
  Megaphone,
  Search,
  UserMinus,
  X,
} from "lucide-react";
import ActivityLogItem from "./ActivityLogItem";
import {
  ACTIVITY_LABELS,
  ACTIVITY_TYPES,
  getActivityTypes,
  prepareActivityLog,
} from "../../utils/organizerActivityLogUtils";

const OrganizerActivityLog = ({
  activities = [],
  eventId = null,
  title = "Organizer Activity Log",
  showFilters = true,
  maxItems = null,
  onActivitySelect,
}) => {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedType, setSelectedType] =
    useState("all");

  const [isFilterOpen, setIsFilterOpen] =
    useState(false);

  const availableTypes = useMemo(
    () =>
      getActivityTypes(activities),
    [activities]
  );

  const filteredActivities =
    useMemo(
      () =>
        prepareActivityLog(
          activities,
          {
            sortOrder: "desc",
            limit: maxItems,
            search: searchTerm,
            type: selectedType,
            eventId,
          }
        ),
      [
        activities,
        maxItems,
        searchTerm,
        selectedType,
        eventId,
      ]
    );

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
  };

  const hasFilters =
    Boolean(searchTerm) ||
    selectedType !== "all";

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 p-5 dark:border-slate-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
              <Activity
                size={20}
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {title}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Track changes and actions made by
                organizers.
              </p>
            </div>
          </div>

          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {filteredActivities.length}{" "}
            {filteredActivities.length === 1
              ? "activity"
              : "activities"}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            {/* Search */}
            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search activity..."
                aria-label="Search activity log"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Type filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setIsFilterOpen(
                    (open) => !open
                  )
                }
                aria-expanded={
                  isFilterOpen
                }
                className="inline-flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 md:w-56"
              >
                <span>
                  {selectedType === "all"
                    ? "All activities"
                    : getActivityLabel(
                        selectedType
                      )}
                </span>

                <ChevronDown
                  size={16}
                  className={
                    isFilterOpen
                      ? "rotate-180 transition-transform"
                      : "transition-transform"
                  }
                />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 z-20 mt-2 w-full min-w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                  <FilterOption
                    label="All activities"
                    selected={
                      selectedType ===
                      "all"
                    }
                    onClick={() => {
                      setSelectedType(
                        "all"
                      );
                      setIsFilterOpen(
                        false
                      );
                    }}
                  />

                  {availableTypes.map(
                    (type) => (
                      <FilterOption
                        key={type}
                        label={getActivityLabel(
                          type
                        )}
                        selected={
                          selectedType ===
                          type
                        }
                        onClick={() => {
                          setSelectedType(
                            type
                          );
                          setIsFilterOpen(
                            false
                          );
                        }}
                      />
                    )
                  )}
                </div>
              )}
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={
                  handleClearFilters
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <X size={15} />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Activity list */}
      <div className="p-5">
        {filteredActivities.length >
        0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div
              aria-hidden="true"
              className="absolute bottom-5 left-[18px] top-5 w-px bg-slate-200 dark:bg-slate-700"
            />

            <div className="relative space-y-5">
              {filteredActivities.map(
                (activity, index) => (
                  <ActivityLogItem
                    key={
                      activity.id ||
                      `${activity.type}-${activity.timestamp}-${index}`
                    }
                    activity={
                      activity
                    }
                    isLast={
                      index ===
                      filteredActivities.length -
                        1
                    }
                    onClick={() =>
                      onActivitySelect?.(
                        activity
                      )
                    }
                  />
                )
              )}
            </div>
          </div>
        ) : (
          <EmptyActivityState
            hasFilters={hasFilters}
            onClear={handleClearFilters}
          />
        )}
      </div>
    </section>
  );
};

/**
 * Filter dropdown option.
 */
const FilterOption = ({
  label,
  selected,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition ${
      selected
        ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
        : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
    }`}
  >
    {label}
  </button>
);

/**
 * Empty activity state.
 */
const EmptyActivityState = ({
  hasFilters,
  onClear,
}) => (
  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
    <Activity
      size={36}
      className="mx-auto text-slate-400"
    />

    <h3 className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
      {hasFilters
        ? "No matching activity"
        : "No activity yet"}
    </h3>

    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
      {hasFilters
        ? "Try changing your search or activity filter."
        : "Organizer actions will appear here."}
    </p>

    {hasFilters && (
      <button
        type="button"
        onClick={onClear}
        className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Clear Filters
      </button>
    )}
  </div>
);

/**
 * Get a human-readable activity label.
 */
const getActivityLabel = (type) => {
  return (
    ACTIVITY_LABELS[type] ||
    formatActivityType(type)
  );
};

/**
 * Fallback formatting for unknown activity types.
 */
const formatActivityType = (type) => {
  if (!type) {
    return "Activity";
  }

  return String(type)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

/**
 * Exported icon helper for ActivityLogItem
 * or other organizer components.
 */
export const getActivityIcon = (
  type
) => {
  switch (type) {
    case ACTIVITY_TYPES.EVENT_CREATED:
      return CalendarPlus;

    case ACTIVITY_TYPES.EVENT_UPDATED:
      return Edit3;

    case ACTIVITY_TYPES.REGISTRATION_OPENED:
      return Bell;

    case ACTIVITY_TYPES.REGISTRATION_CLOSED:
      return CalendarX;

    case ACTIVITY_TYPES.ANNOUNCEMENT_PUBLISHED:
      return Megaphone;

    case ACTIVITY_TYPES.PARTICIPANT_REMOVED:
      return UserMinus;

    case ACTIVITY_TYPES.EVENT_CANCELLED:
      return CalendarX;

    default:
      return Activity;
  }
};

export default OrganizerActivityLog;