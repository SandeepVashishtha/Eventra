import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import CategoryFilterChip from "./CategoryFilterChip";
import {
  EVENT_CATEGORIES,
  filterEventsByCategory,
} from "../../utils/eventCategoryFilterUtils";

const EventCategoryQuickFilters = ({
  events = [],
  onFilterChange,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);

    const filteredEvents =
      filterEventsByCategory(events, category);

    onFilterChange?.(
      filteredEvents,
      category
    );
  };

  const handleClear = () => {
    handleCategoryChange("All");
  };

  return (
    <section className="w-full">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal
            size={20}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            Browse by Category
          </h2>
        </div>

        {selectedCategory !== "All" && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={15} />
            Clear
          </button>
        )}
      </div>

      {/* Category chips */}
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        role="group"
        aria-label="Event categories"
      >
        {EVENT_CATEGORIES.map((category) => (
          <CategoryFilterChip
            key={category}
            category={category}
            selected={
              selectedCategory === category
            }
            onClick={handleCategoryChange}
          />
        ))}
      </div>

      {/* Selected category */}
      {selectedCategory !== "All" && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Showing{" "}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {selectedCategory}
          </span>{" "}
          events
        </p>
      )}
    </section>
  );
};

export default EventCategoryQuickFilters;