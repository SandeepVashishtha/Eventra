import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Clock3,
  History,
  Minus,
  Search,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_HISTORY = [
  {
    id: "capacity-1",
    previousCapacity: 100,
    newCapacity: 150,
    changedAt: "2026-08-12T10:30:00",
    changedBy: "Jainiksha Patel",
    reason: "Additional venue space became available.",
  },
  {
    id: "capacity-2",
    previousCapacity: 150,
    newCapacity: 125,
    changedAt: "2026-08-10T14:15:00",
    changedBy: "Jainiksha Patel",
    reason: "Adjusted capacity based on venue restrictions.",
  },
  {
    id: "capacity-3",
    previousCapacity: 75,
    newCapacity: 100,
    changedAt: "2026-08-05T09:00:00",
    changedBy: "Event Organizer",
    reason: "Additional seating was arranged.",
  },
];

const formatDateTime = (value) => {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getChangeType = (previous, current) => {
  if (current > previous) return "increase";
  if (current < previous) return "decrease";
  return "unchanged";
};

const RegistrationCapacityHistory = ({
  history = DEFAULT_HISTORY,
  currentCapacity,
  onCapacityChange,
  className = "",
}) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [showForm, setShowForm] =
    useState(false);

  const [newCapacity, setNewCapacity] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const processedHistory = useMemo(() => {
    return history.map((item) => ({
      ...item,
      changeType: getChangeType(
        item.previousCapacity,
        item.newCapacity
      ),
      difference:
        item.newCapacity -
        item.previousCapacity,
    }));
  }, [history]);

  const filteredHistory = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return processedHistory.filter((item) => {
      const matchesSearch =
        !query ||
        item.changedBy
          ?.toLowerCase()
          .includes(query) ||
        item.reason
          ?.toLowerCase()
          .includes(query);

      const matchesFilter =
        filter === "all" ||
        item.changeType === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    processedHistory,
    search,
    filter,
  ]);

  const latestCapacity =
    currentCapacity ??
    history[0]?.newCapacity ??
    0;

  const totalIncrease = history.reduce(
    (total, item) =>
      item.newCapacity >
      item.previousCapacity
        ? total +
          (item.newCapacity -
            item.previousCapacity)
        : total,
    0
  );

  const totalDecrease = history.reduce(
    (total, item) =>
      item.newCapacity <
      item.previousCapacity
        ? total +
          (item.previousCapacity -
            item.newCapacity)
        : total,
    0
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    const capacity = Number(newCapacity);

    if (
      !Number.isFinite(capacity) ||
      capacity < 1
    ) {
      return;
    }

    setSaving(true);

    try {
      await onCapacityChange?.({
        newCapacity: capacity,
        reason: reason.trim(),
        changedAt:
          new Date().toISOString(),
      });

      setNewCapacity("");
      setReason("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <History size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Event Capacity
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Registration Capacity History
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Track historical changes to the event
              registration capacity.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowForm((value) => !value)
          }
          className="rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700"
        >
          {showForm
            ? "Cancel"
            : "Change Capacity"}
        </button>
      </div>

      {/* Current Capacity */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Current Capacity"
          value={latestCapacity}
          suffix="seats"
          type="current"
        />

        <SummaryCard
          label="Capacity Increases"
          value={totalIncrease}
          suffix="seats"
          type="increase"
        />

        <SummaryCard
          label="Capacity Decreases"
          value={totalDecrease}
          suffix="seats"
          type="decrease"
        />

        <SummaryCard
          label="Total Changes"
          value={history.length}
          suffix="changes"
          type="neutral"
        />
      </div>

      {/* Capacity Change Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-indigo-600 dark:bg-slate-900 dark:text-indigo-400">
              <History size={16} />
            </div>

            <div>
              <h3 className="text-[9px] font-bold text-indigo-700 dark:text-indigo-400">
                Update Registration Capacity
              </h3>

              <p className="mt-1 text-[7px] text-indigo-700/70 dark:text-indigo-400/70">
                The change will be recorded in the capacity
                history.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
                Previous Capacity
              </label>

              <input
                value={latestCapacity}
                disabled
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
                New Capacity
              </label>

              <input
                type="number"
                min="1"
                value={newCapacity}
                onChange={(event) =>
                  setNewCapacity(
                    event.target.value
                  )
                }
                placeholder="Enter new capacity"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
              Reason{" "}
              <span className="font-normal text-slate-400">
                (optional)
              </span>
            </label>

            <textarea
              value={reason}
              onChange={(event) =>
                setReason(
                  event.target.value
                )
              }
              rows={3}
              maxLength={500}
              placeholder="Why is the capacity being changed?"
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Capacity Change"}
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search organizer or reason..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[8px] font-semibold outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="all">
              All Changes
            </option>

            <option value="increase">
              Capacity Increased
            </option>

            <option value="decrease">
              Capacity Decreased
            </option>

            <option value="unchanged">
              No Change
            </option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-6">
        {filteredHistory.length ===
        0 ? (
          <EmptyState />
        ) : (
          <div className="relative">
            <div className="absolute bottom-0 left-5 top-0 hidden w-px bg-slate-200 sm:block dark:bg-slate-800" />

            <div className="space-y-4">
              {filteredHistory.map(
                (item) => (
                  <CapacityHistoryItem
                    key={item.id}
                    item={item}
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* --------------------------------
   History Item
--------------------------------- */

const CapacityHistoryItem = ({
  item,
}) => {
  const isIncrease =
    item.changeType ===
    "increase";

  const isDecrease =
    item.changeType ===
    "decrease";

  const Icon = isIncrease
    ? ArrowUp
    : isDecrease
    ? ArrowDown
    : Minus;

  const iconClass = isIncrease
    ? "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400"
    : isDecrease
    ? "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400"
    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  const differenceLabel =
    isIncrease
      ? `+${item.difference}`
      : item.difference;

  return (
    <article className="relative rounded-2xl border border-slate-200 bg-white p-5 sm:ml-10 dark:border-slate-700 dark:bg-slate-900">
      {/* Timeline icon */}
      <div
        className={`absolute -left-[3.05rem] top-5 hidden h-10 w-10 items-center justify-center rounded-xl border-4 border-slate-50 sm:flex dark:border-slate-950 ${iconClass}`}
      >
        <Icon size={15} />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:hidden ${iconClass}`}
          >
            <Icon size={17} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                {isIncrease
                  ? "Capacity Increased"
                  : isDecrease
                  ? "Capacity Decreased"
                  : "Capacity Updated"}
              </h3>

              <span
                className={`rounded-full px-2.5 py-1 text-[6px] font-bold ${iconClass}`}
              >
                {differenceLabel} seats
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <CapacityValue
                value={
                  item.previousCapacity
                }
                label="Previous"
              />

              <ArrowRight />

              <CapacityValue
                value={
                  item.newCapacity
                }
                label="New"
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 text-left lg:text-right">
          <div className="inline-flex items-center gap-1 text-[7px] font-semibold text-slate-500 dark:text-slate-400">
            <Clock3 size={10} />
            {formatDateTime(
              item.changedAt
            )}
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <User size={12} />
          </div>

          <div>
            <p className="text-[6px] uppercase tracking-wide text-slate-400">
              Changed By
            </p>

            <p className="text-[7px] font-bold text-slate-700 dark:text-slate-300">
              {item.changedBy ||
                "Unknown organizer"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-[6px] uppercase tracking-wide text-slate-400">
            Change Date
          </p>

          <p className="mt-1 flex items-center gap-1 text-[7px] font-bold text-slate-700 dark:text-slate-300">
            <CalendarDays size={10} />
            {formatDateTime(
              item.changedAt
            )}
          </p>
        </div>
      </div>

      {/* Reason */}
      {item.reason && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Reason
          </p>

          <p className="mt-1 text-[7px] leading-4 text-slate-600 dark:text-slate-300">
            {item.reason}
          </p>
        </div>
      )}
    </article>
  );
};

/* --------------------------------
   Capacity Value
--------------------------------- */

const CapacityValue = ({
  value,
  label,
}) => {
  return (
    <div>
      <p className="text-[6px] uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   Summary Card
--------------------------------- */

const SummaryCard = ({
  label,
  value,
  suffix,
  type,
}) => {
  const styles = {
    current:
      "text-indigo-600 dark:text-indigo-400",
    increase:
      "text-green-600 dark:text-green-400",
    decrease:
      "text-red-600 dark:text-red-400",
    neutral:
      "text-slate-800 dark:text-white",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-2 flex items-baseline gap-1">
        <p
          className={`text-xl font-black ${styles[type]}`}
        >
          {value}
        </p>

        <span className="text-[6px] text-slate-400">
          {suffix}
        </span>
      </div>
    </div>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = () => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <History
        size={30}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-300">
        No capacity changes found
      </p>

      <p className="mt-1 text-[7px] text-slate-400">
        Capacity changes will appear here once they are
        recorded.
      </p>
    </div>
  );
};

/* --------------------------------
   Arrow
--------------------------------- */

const ArrowRight = () => {
  return (
    <div className="text-slate-300">
      →
    </div>
  );
};

export default RegistrationCapacityHistory;