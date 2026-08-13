import {
  Archive,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Search,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_EVENTS = [
  {
    id: 1,
    name: "AI Hackathon 2026",
    date: "Aug 10, 2026",
    year: "2026",
    category: "Hackathon",
    status: "Completed",
    participants: 240,
    attendance: 218,
    feedback: 4.7,
    resources: 12,
    certificates: 215,
  },
  {
    id: 2,
    name: "Web Development Workshop",
    date: "Jul 18, 2026",
    year: "2026",
    category: "Workshop",
    status: "Completed",
    participants: 120,
    attendance: 108,
    feedback: 4.5,
    resources: 8,
    certificates: 105,
  },
  {
    id: 3,
    name: "Cloud Computing Conference",
    date: "Jun 05, 2026",
    year: "2026",
    category: "Conference",
    status: "Completed",
    participants: 350,
    attendance: 319,
    feedback: 4.8,
    resources: 18,
    certificates: 310,
  },
  {
    id: 4,
    name: "Data Science Bootcamp",
    date: "Dec 12, 2025",
    year: "2025",
    category: "Bootcamp",
    status: "Completed",
    participants: 90,
    attendance: 84,
    feedback: 4.6,
    resources: 15,
    certificates: 82,
  },
  {
    id: 5,
    name: "Startup Networking Meet",
    date: "Nov 20, 2025",
    year: "2025",
    category: "Networking",
    status: "Cancelled",
    participants: 75,
    attendance: 0,
    feedback: 0,
    resources: 3,
    certificates: 0,
  },
];

const EventOrganizerEventArchive = ({
  events = DEFAULT_EVENTS,
}) => {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("All");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const years = useMemo(
    () => ["All", ...new Set(events.map((event) => event.year))],
    [events]
  );

  const categories = useMemo(
    () => [
      "All",
      ...new Set(events.map((event) => event.category)),
    ],
    [events]
  );

  const statuses = ["All", "Completed", "Cancelled"];

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        event.name.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query);

      const matchesYear =
        year === "All" || event.year === year;

      const matchesCategory =
        category === "All" ||
        event.category === category;

      const matchesStatus =
        status === "All" || event.status === status;

      return (
        matchesSearch &&
        matchesYear &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [events, search, year, category, status]);

  const completedCount = events.filter(
    (event) => event.status === "Completed"
  ).length;

  const cancelledCount = events.filter(
    (event) => event.status === "Cancelled"
  ).length;

  const totalParticipants = events.reduce(
    (sum, event) => sum + event.participants,
    0
  );

  const clearFilters = () => {
    setSearch("");
    setYear("All");
    setCategory("All");
    setStatus("All");
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Archive size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Tools
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Event Archive
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Access completed and cancelled events while
              keeping your active event dashboard organized.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Archived Events
          </p>

          <p className="mt-1 text-xl font-black text-indigo-600 dark:text-indigo-400">
            {events.length}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={Archive}
          label="Total Archived"
          value={events.length}
        />

        <SummaryCard
          icon={ClipboardCheck}
          label="Completed"
          value={completedCount}
        />

        <SummaryCard
          icon={Users}
          label="Participants"
          value={totalParticipants}
        />
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          {/* Search */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search archived events..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-indigo-900/30"
            />
          </div>

          <SelectFilter
            label="Year"
            value={year}
            options={years}
            onChange={setYear}
          />

          <SelectFilter
            label="Category"
            value={category}
            options={categories}
            onChange={setCategory}
          />

          <SelectFilter
            label="Status"
            value={status}
            options={statuses}
            onChange={setStatus}
          />

          <button
            type="button"
            onClick={clearFilters}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-[7px] font-bold text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400"
          >
            <X size={13} />
            Clear
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Archived Events
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              {filteredEvents.length} event
              {filteredEvents.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onView={() => setSelectedEvent(event)}
              />
            ))}
          </div>
        ) : (
          <EmptyState onClear={clearFilters} />
        )}
      </div>

      {/* Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
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
   Select Filter
--------------------------------- */

const SelectFilter = ({
  label,
  value,
  options,
  onChange,
}) => (
  <div>
    <label className="mb-1 block text-[6px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </label>

    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-[7px] font-bold text-slate-600 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

/* --------------------------------
   Event Card
--------------------------------- */

const EventCard = ({ event, onView }) => {
  const attendancePercentage =
    event.participants > 0
      ? Math.round(
          (event.attendance / event.participants) * 100
        )
      : 0;

  const isCancelled = event.status === "Cancelled";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Event Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
              {event.name}
            </h4>

            <span
              className={`rounded-full px-2.5 py-1 text-[5px] font-bold ${
                isCancelled
                  ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              }`}
            >
              {event.status}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1 text-[6px] text-slate-400">
              <CalendarDays size={10} />
              {event.date}
            </span>

            <span className="text-[6px] text-slate-400">
              {event.category}
            </span>

            <span className="text-[6px] text-slate-400">
              {event.year}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:min-w-[300px]">
          <MiniStat
            label="Participants"
            value={event.participants}
          />

          <MiniStat
            label="Attendance"
            value={`${attendancePercentage}%`}
          />

          <MiniStat
            label="Feedback"
            value={
              event.feedback > 0
                ? `${event.feedback}/5`
                : "—"
            }
          />
        </div>

        {/* Action */}
        <button
          type="button"
          onClick={onView}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[7px] font-bold text-white transition hover:bg-indigo-700"
        >
          View Archive
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};

/* --------------------------------
   Mini Stat
--------------------------------- */

const MiniStat = ({ label, value }) => (
  <div>
    <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-[8px] font-black text-slate-700 dark:text-slate-200">
      {value}
    </p>
  </div>
);

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = ({ onClear }) => (
  <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center dark:border-slate-700">
    <Archive
      size={30}
      className="text-slate-300 dark:text-slate-600"
    />

    <h4 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
      No archived events found
    </h4>

    <p className="mt-1 max-w-sm text-[7px] leading-4 text-slate-400">
      Try changing your search or filters to find a completed
      or cancelled event.
    </p>

    <button
      type="button"
      onClick={onClear}
      className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-[7px] font-bold text-white hover:bg-indigo-700"
    >
      Clear filters
    </button>
  </div>
);

/* --------------------------------
   Details Modal
--------------------------------- */

const EventDetailsModal = ({
  event,
  onClose,
}) => {
  const attendancePercentage =
    event.participants > 0
      ? Math.round(
          (event.attendance / event.participants) * 100
        )
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {event.name}
              </h3>

              <span
                className={`rounded-full px-2.5 py-1 text-[6px] font-bold ${
                  event.status === "Cancelled"
                    ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                }`}
              >
                {event.status}
              </span>
            </div>

            <p className="mt-1 text-[7px] text-slate-400">
              {event.date} · {event.category}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            aria-label="Close event details"
          >
            <X size={18} />
          </button>
        </div>

        {/* Archive Data */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailCard
            icon={Users}
            label="Participants"
            value={event.participants}
          />

          <DetailCard
            icon={ClipboardCheck}
            label="Attendance"
            value={`${attendancePercentage}%`}
          />

          <DetailCard
            icon={FileText}
            label="Resources"
            value={event.resources}
          />

          <DetailCard
            icon={FileText}
            label="Certificates"
            value={event.certificates}
          />

          <DetailCard
            icon={CalendarDays}
            label="Year"
            value={event.year}
          />

          <DetailCard
            icon={Archive}
            label="Feedback"
            value={
              event.feedback > 0
                ? `${event.feedback}/5`
                : "No feedback"
            }
          />
        </div>

        {/* Preserved Data */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
          <h4 className="text-[8px] font-bold text-slate-800 dark:text-white">
            Archived Data
          </h4>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              "Event details",
              "Participant records",
              "Attendance",
              "Feedback",
              "Resources",
              "Certificates",
              "Analytics",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-xl bg-white p-3 dark:bg-slate-900"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />

                <span className="text-[7px] font-semibold text-slate-600 dark:text-slate-300">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-indigo-600 py-3 text-[7px] font-bold text-white transition hover:bg-indigo-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

/* --------------------------------
   Detail Card
--------------------------------- */

const DetailCard = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
    <div className="flex items-center gap-2">
      <Icon
        size={14}
        className="text-indigo-500"
      />

      <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>

    <p className="mt-2 text-lg font-black text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

export default EventOrganizerEventArchive;