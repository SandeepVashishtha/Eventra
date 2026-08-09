import {
  CheckCircle2,
  Circle,
  ClipboardCheck,
  RotateCcw,
} from "lucide-react";

import {
  createChecklistState,
  getChecklistSummary,
  getPreparationStatus,
  resetChecklist,
  toggleChecklistItem,
} from "../../utils/eventPreparationChecklistUtils";

import ChecklistItem from "./ChecklistItem";

const EventPreparationChecklist = ({
  event = {},
  completedItems = [],
  onChange,
  showReset = true,
}) => {
  const checklist = createChecklistState(
    event,
    completedItems
  );

  const summary =
    getChecklistSummary(checklist);

  const status =
    getPreparationStatus(checklist);

  const handleToggle = (itemId) => {
    const updatedChecklist =
      toggleChecklistItem(
        checklist,
        itemId
      );

    onChange?.({
      checklist: updatedChecklist,
      completedItemIds:
        updatedChecklist
          .filter(
            (item) =>
              item.completed === true
          )
          .map((item) => item.id),
      summary:
        getChecklistSummary(
          updatedChecklist
        ),
    });
  };

  const handleReset = () => {
    const updatedChecklist =
      resetChecklist(checklist);

    onChange?.({
      checklist: updatedChecklist,
      completedItemIds: [],
      summary:
        getChecklistSummary(
          updatedChecklist
        ),
    });
  };

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <ClipboardCheck
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Event Preparation Checklist
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Complete these steps before attending the event.
            </p>
          </div>
        </div>

        {showReset &&
          summary.completed > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
      </div>

      {/* Progress */}
      <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Preparation progress
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {summary.completed} of{" "}
              {summary.total} completed
            </p>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {summary.percentage}%
            </p>

            <p className="text-xs font-medium text-slate-400">
              {status}
            </p>
          </div>
        </div>

        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
          role="progressbar"
          aria-valuenow={
            summary.percentage
          }
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Event preparation progress"
        >
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${summary.percentage}%`,
            }}
          />
        </div>
      </div>

      {/* Completion message */}
      {summary.isComplete && (
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
          />

          <div>
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              You're ready for the event!
            </p>

            <p className="mt-1 text-xs leading-5 text-green-700 dark:text-green-400">
              All preparation checklist items have
              been completed.
            </p>
          </div>
        </div>
      )}

      {/* Checklist */}
      <div className="mt-5 space-y-3">
        {checklist.length > 0 ? (
          checklist.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={() =>
                handleToggle(
                  item.id
                )
              }
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
            <Circle
              size={24}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              No preparation items available.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              The organizer has not configured a
              preparation checklist.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventPreparationChecklist;