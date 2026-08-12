import { useMemo, useState } from "react";
import {
  Check,
  Plus,
  RotateCcw,
  Search,
  Tags,
  X,
} from "lucide-react";
import SkillTag from "./SkillTag";
import {
  addSkillTag,
  clearSkillFilters,
  filterEventsBySkills,
  getSkillFilterOptions,
  getEventSkillTags,
  removeSkillTag,
  toggleSkillTag,
} from "../../utils/eventSkillTagUtils";

const EventSkillTags = ({
  events = [],
  initialSkills = [],
  editable = false,
  onSkillsChange,
  onFilterChange,
  onFilteredEventsChange,
}) => {
  const [selectedSkills, setSelectedSkills] =
    useState(initialSkills);

  const [customSkill, setCustomSkill] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const availableSkills = useMemo(
    () =>
      getSkillFilterOptions(events),
    [events]
  );

  const filteredSkillOptions =
    useMemo(() => {
      const query = searchTerm
        .trim()
        .toLowerCase();

      if (!query) {
        return availableSkills;
      }

      return availableSkills.filter(
        (skill) =>
          skill
            .toLowerCase()
            .includes(query)
      );
    }, [
      availableSkills,
      searchTerm,
    ]);

  const filteredEvents = useMemo(
    () =>
      filterEventsBySkills(
        events,
        selectedSkills
      ),
    [events, selectedSkills]
  );

  const handleSkillToggle = (
    skill
  ) => {
    const updatedSkills =
      toggleSkillTag(
        selectedSkills,
        skill
      );

    setSelectedSkills(updatedSkills);

    onSkillsChange?.(updatedSkills);
    onFilterChange?.(updatedSkills);

    onFilteredEventsChange?.(
      filterEventsBySkills(
        events,
        updatedSkills
      )
    );
  };

  const handleAddCustomSkill = () => {
    const skill = customSkill.trim();

    if (!skill) {
      return;
    }

    const updatedSkills =
      addSkillTag(
        selectedSkills,
        skill
      );

    setSelectedSkills(updatedSkills);
    setCustomSkill("");

    onSkillsChange?.(updatedSkills);
    onFilterChange?.(updatedSkills);

    onFilteredEventsChange?.(
      filterEventsBySkills(
        events,
        updatedSkills
      )
    );
  };

  const handleRemoveSkill = (
    skill
  ) => {
    const updatedSkills =
      removeSkillTag(
        selectedSkills,
        skill
      );

    setSelectedSkills(updatedSkills);

    onSkillsChange?.(updatedSkills);
    onFilterChange?.(updatedSkills);

    onFilteredEventsChange?.(
      filterEventsBySkills(
        events,
        updatedSkills
      )
    );
  };

  const handleClearFilters = () => {
    const clearedSkills =
      clearSkillFilters();

    setSelectedSkills(clearedSkills);

    onSkillsChange?.(clearedSkills);
    onFilterChange?.(clearedSkills);
    onFilteredEventsChange?.(events);
  };

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Tags
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Event Skills
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Filter events by technical skills
              and interests.
            </p>
          </div>
        </div>

        {selectedSkills.length > 0 && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw size={15} />
            Clear
          </button>
        )}
      </div>

      {/* Selected skills */}
      {selectedSkills.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Selected Skills
          </p>

          <div className="flex flex-wrap gap-2">
            {selectedSkills.map(
              (skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() =>
                    handleRemoveSkill(
                      skill
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                  aria-label={`Remove ${skill} filter`}
                >
                  <Check size={13} />
                  {skill}
                  <X size={13} />
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Search skills */}
      <div className="relative mt-5">
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
          placeholder="Search skills..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          aria-label="Search event skills"
        />
      </div>

      {/* Skill options */}
      <div className="mt-4 flex flex-wrap gap-2">
        {filteredSkillOptions.map(
          (skill) => (
            <SkillTag
              key={skill}
              skill={skill}
              selected={selectedSkills.some(
                (selectedSkill) =>
                  selectedSkill.toLowerCase() ===
                  skill.toLowerCase()
              )}
              onClick={() =>
                handleSkillToggle(
                  skill
                )
              }
            />
          )
        )}
      </div>

      {filteredSkillOptions.length ===
        0 && (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          No matching skills found.
        </p>
      )}

      {/* Add custom skill */}
      {editable && (
        <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-700">
          <label
            htmlFor="custom-event-skill"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Add Skill Tag
          </label>

          <div className="flex gap-2">
            <input
              id="custom-event-skill"
              type="text"
              value={customSkill}
              onChange={(event) =>
                setCustomSkill(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                ) {
                  event.preventDefault();
                  handleAddCustomSkill();
                }
              }}
              placeholder="e.g. Machine Learning"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            <button
              type="button"
              onClick={
                handleAddCustomSkill
              }
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>
      )}

      {/* Event result summary */}
      <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4 text-sm dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-slate-500 dark:text-slate-400">
          {selectedSkills.length === 0
            ? "Showing events with all skills"
            : `Filtering by ${selectedSkills.length} ${
                selectedSkills.length === 1
                  ? "skill"
                  : "skills"
              }`}
        </span>

        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {filteredEvents.length}{" "}
          {filteredEvents.length === 1
            ? "event"
            : "events"}{" "}
          found
        </span>
      </div>

      {/* Selected skill event preview */}
      {selectedSkills.length > 0 &&
        events.length > 0 && (
          <div className="mt-3 text-xs text-slate-400">
            {filteredEvents.length === 0
              ? "No events match the selected skills."
              : "Matching events are ready to display in the event list."}
          </div>
        )}
    </section>
  );
};

export default EventSkillTags;