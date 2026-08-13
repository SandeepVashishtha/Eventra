import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  Copy,
  GitBranch,
  History,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_CLONING_HISTORY = [
  {
    id: 1,
    sourceEvent: "AI Hackathon 2025",
    clonedEvent: "AI Hackathon 2026",
    cloneDate: "Aug 12, 2026",
    cloneTime: "10:30 AM",
    organizer: "Jainiksha",
    modifiedFields: [
      "Event date",
      "Registration deadline",
      "Venue",
      "Participant capacity",
    ],
  },
  {
    id: 2,
    sourceEvent: "Web Development Workshop",
    clonedEvent: "Advanced Web Development Workshop",
    cloneDate: "Jul 28, 2026",
    cloneTime: "02:15 PM",
    organizer: "Jainiksha",
    modifiedFields: [
      "Event title",
      "Session structure",
      "Speakers",
    ],
  },
  {
    id: 3,
    sourceEvent: "Cloud Computing Conference 2025",
    clonedEvent: "Cloud Computing Conference 2026",
    cloneDate: "Jun 18, 2026",
    cloneTime: "11:45 AM",
    organizer: "Jainiksha",
    modifiedFields: [
      "Event date",
      "Venue",
      "FAQ",
      "Registration fields",
      "Notification settings",
    ],
  },
];

const EventOrganizerEventCloningHistory = ({
  history = DEFAULT_CLONING_HISTORY,
}) => {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return history;
    }

    return history.filter(
      (item) =>
        item.sourceEvent.toLowerCase().includes(query) ||
        item.clonedEvent.toLowerCase().includes(query) ||
        item.organizer.toLowerCase().includes(query)
    );
  }, [history, search]);

  const totalModifiedFields = history.reduce(
    (total, item) =>
      total + item.modifiedFields.length,
    0
  );

  const uniqueSourceEvents = new Set(
    history.map((item) => item.sourceEvent)
  ).size;

  const toggleExpanded = (id) => {
    setExpandedId((current) =>
      current === id ? null : id
    );
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <History size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Tools
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Event Cloning History
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Track which events were cloned, when they were
              created, who created them, and what changed afterward.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Clone Records
          </p>

          <p className="mt-1 text-xl font-black text-indigo-600 dark:text-indigo-400">
            {history.length}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={Copy}
          label="Total Clones"
          value={history.length}
        />

        <SummaryCard
          icon={GitBranch}
          label="Source Events"
          value={uniqueSourceEvents}
        />

        <SummaryCard
          icon={History}
          label="Modified Fields"
          value={totalModifiedFields}
        />
      </div>

      {/* Search */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <label className="mb-2 block text-[6px] font-bold uppercase tracking-wide text-slate-400">
          Search Clone History
        </label>

        <div className="relative">
          <History
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search source event, cloned event, or organizer..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-indigo-900/30"
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Clone Activity
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              {filteredHistory.length} record
              {filteredHistory.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {filteredHistory.length > 0 ? (
          <div className="space-y-4">
            {filteredHistory.map((record) => (
              <CloneHistoryCard
                key={record.id}
                record={record}
                expanded={expandedId === record.id}
                onToggle={() =>
                  toggleExpanded(record.id)
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
};

/* --------------------------------
   Summary Card
--------------------------------- */

const SummaryCard = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <Icon size={15} />
      </div>

      <div>
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </div>
);

/* --------------------------------
   Clone History Card
--------------------------------- */

const CloneHistoryCard = ({
  record,
  expanded,
  onToggle,
}) => (
  <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900">
    {/* Main */}
    <div className="p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Clone Icon */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Copy size={18} />
          </div>

          <div className="lg:hidden">
            <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Clone Date
            </p>

            <p className="mt-1 text-[7px] font-bold text-slate-600 dark:text-slate-300">
              {record.cloneDate}
            </p>
          </div>
        </div>

        {/* Source */}
        <div className="min-w-0 flex-1">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Source Event
          </p>

          <h4 className="mt-1 truncate text-[9px] font-bold text-slate-800 dark:text-white">
            {record.sourceEvent}
          </h4>
        </div>

        {/* Arrow */}
        <div className="hidden shrink-0 items-center lg:flex">
          <div className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
          <GitBranch
            size={15}
            className="mx-2 text-indigo-500"
          />
          <div className="h-px w-8 bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Cloned */}
        <div className="min-w-0 flex-1">
          <p className="text-[6px] font-bold uppercase tracking-wide text-indigo-500">
            Cloned Event
          </p>

          <h4 className="mt-1 truncate text-[9px] font-bold text-slate-800 dark:text-white">
            {record.clonedEvent}
          </h4>
        </div>

        {/* Date */}
        <div className="hidden min-w-[120px] lg:block">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Clone Date
          </p>

          <p className="mt-1 flex items-center gap-1 text-[7px] font-bold text-slate-600 dark:text-slate-300">
            <CalendarDays size={10} />
            {record.cloneDate}
          </p>

          <p className="mt-1 flex items-center gap-1 text-[6px] text-slate-400">
            <Clock3 size={9} />
            {record.cloneTime}
          </p>
        </div>

        {/* Expand */}
        <button
          type="button"
          onClick={onToggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-950 dark:hover:bg-indigo-900/20"
          aria-label={
            expanded
              ? "Collapse clone details"
              : "Expand clone details"
          }
        >
          {expanded ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>
      </div>

      {/* Organizer */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <User
            size={11}
            className="text-slate-400"
          />

          <span className="text-[6px] text-slate-400">
            Cloned by
          </span>

          <span className="text-[6px] font-bold text-slate-600 dark:text-slate-300">
            {record.organizer}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <History
            size={11}
            className="text-slate-400"
          />

          <span className="text-[6px] text-slate-400">
            Modified fields
          </span>

          <span className="rounded-full bg-indigo-50 px-2 py-1 text-[5px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {record.modifiedFields.length}
          </span>
        </div>
      </div>
    </div>

    {/* Expanded Details */}
    {expanded && (
      <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Clone Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h5 className="text-[8px] font-bold text-slate-800 dark:text-white">
              Clone Information
            </h5>

            <div className="mt-3 space-y-3">
              <InfoRow
                label="Source event"
                value={record.sourceEvent}
              />

              <InfoRow
                label="Cloned event"
                value={record.clonedEvent}
              />

              <InfoRow
                label="Clone date"
                value={record.cloneDate}
              />

              <InfoRow
                label="Clone time"
                value={record.cloneTime}
              />

              <InfoRow
                label="Organizer"
                value={record.organizer}
              />
            </div>
          </div>

          {/* Modified Fields */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h5 className="text-[8px] font-bold text-slate-800 dark:text-white">
              Modified After Cloning
            </h5>

            <p className="mt-1 text-[6px] text-slate-400">
              Fields changed after the new event was created.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {record.modifiedFields.map((field) => (
                <span
                  key={field}
                  className="rounded-lg bg-indigo-50 px-2.5 py-2 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Cloned From Reference */}
        <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <div className="flex items-start gap-3">
            <GitBranch
              size={17}
              className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
            />

            <div>
              <p className="text-[7px] font-bold text-indigo-700 dark:text-indigo-400">
                Cloned From
              </p>

              <p className="mt-1 text-[8px] font-black text-indigo-800 dark:text-indigo-300">
                {record.sourceEvent}
              </p>

              <p className="mt-1 text-[6px] leading-4 text-indigo-600/70 dark:text-indigo-400/70">
                This event was created using the configuration
                of the source event shown above.
              </p>
            </div>
          </div>
        </div>
      </div>
    )}
  </article>
);

/* --------------------------------
   Info Row
--------------------------------- */

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0 dark:border-slate-800">
    <span className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </span>

    <span className="text-[7px] font-semibold text-slate-600 dark:text-slate-300">
      {value}
    </span>
  </div>
);

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = () => (
  <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center dark:border-slate-700">
    <History
      size={30}
      className="text-slate-300 dark:text-slate-600"
    />

    <h4 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
      No cloning history found
    </h4>

    <p className="mt-1 max-w-sm text-[7px] leading-4 text-slate-400">
      Cloned events will appear here with their source event,
      clone date, organizer, and modified fields.
    </p>
  </div>
);

export default EventOrganizerEventCloningHistory;