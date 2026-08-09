import { useMemo, useState } from "react";
import {
  Languages,
  RotateCcw,
} from "lucide-react";
import LanguageFilterChip from "./LanguageFilterChip";
import {
  filterEventsByLanguages,
  getFilterLanguages,
  toggleLanguage,
} from "../../utils/eventLanguageFilterUtils";

const EventLanguageFilter = ({
  events = [],
  onFilterChange,
  onFilteredEventsChange,
}) => {
  const [selectedLanguages, setSelectedLanguages] =
    useState([]);

  const languages = useMemo(
    () => getFilterLanguages(events),
    [events]
  );

  const filteredEvents = useMemo(
    () =>
      filterEventsByLanguages(
        events,
        selectedLanguages
      ),
    [events, selectedLanguages]
  );

  const handleLanguageToggle = (language) => {
    const updatedLanguages =
      toggleLanguage(
        selectedLanguages,
        language
      );

    setSelectedLanguages(updatedLanguages);

    onFilterChange?.(
      updatedLanguages
    );

    onFilteredEventsChange?.(
      filterEventsByLanguages(
        events,
        updatedLanguages
      )
    );
  };

  const handleClearFilters = () => {
    setSelectedLanguages([]);

    onFilterChange?.([]);

    onFilteredEventsChange?.(events);
  };

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Languages
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Event Language
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Find events available in your preferred
              language.
            </p>
          </div>
        </div>

        {selectedLanguages.length > 0 && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw size={15} />
            Clear Filters
          </button>
        )}
      </div>

      {/* Language chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        {languages.map((language) => (
          <LanguageFilterChip
            key={language}
            language={language}
            selected={selectedLanguages.some(
              (selectedLanguage) =>
                selectedLanguage.toLowerCase() ===
                language.toLowerCase()
            )}
            onClick={() =>
              handleLanguageToggle(language)
            }
          />
        ))}
      </div>

      {/* Filter summary */}
      <div className="mt-5 flex flex-col gap-1 border-t border-slate-200 pt-4 text-sm dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-slate-500 dark:text-slate-400">
          {selectedLanguages.length === 0
            ? "Showing events in all languages"
            : `Filtering by: ${selectedLanguages.join(
                ", "
              )}`}
        </p>

        <p className="font-medium text-slate-700 dark:text-slate-200">
          {filteredEvents.length}{" "}
          {filteredEvents.length === 1
            ? "event"
            : "events"}{" "}
          found
        </p>
      </div>
    </section>
  );
};

export default EventLanguageFilter;