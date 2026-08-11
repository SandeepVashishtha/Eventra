import { useMemo, useState } from "react";
import {
  CalendarDays,
  Award,
  CheckCircle,
  Clock,
  Filter,
  History,
} from "lucide-react";
import AttendanceHistoryCard from "./AttendanceHistoryCard";
import {
  filterAttendanceHistory,
  getAttendanceSummary,
  getAvailableEventTypes,
  getAvailableYears,
  sortAttendanceHistory,
} from "../../utils/attendanceHistoryUtils";

const AttendanceHistoryDashboard = ({
  events = [],
}) => {
  const [selectedYear, setSelectedYear] =
    useState("All");

  const [selectedType, setSelectedType] =
    useState("All");

  const [sortDirection, setSortDirection] =
    useState("desc");

  const years = useMemo(
    () => getAvailableYears(events),
    [events]
  );

  const eventTypes = useMemo(
    () => getAvailableEventTypes(events),
    [events]
  );

  const summary = useMemo(
    () =>
      getAttendanceSummary(events),
    [events]
  );

  const filteredEvents = useMemo(() => {
    const filtered =
      filterAttendanceHistory(events, {
        year: selectedYear,
        eventType: selectedType,
      });

    return sortAttendanceHistory(
      filtered,
      sortDirection
    );
  }, [
    events,
    selectedYear,
    selectedType,
    sortDirection,
  ]);

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <History
              size={25}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              Attendance History
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              View your event participation and
              attendance history.
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={CheckCircle}
          label="Events Attended"
          value={
            summary.totalEventsAttended
          }
          description="Total events attended"
        />

        <SummaryCard
          icon={CalendarDays}
          label="Upcoming Events"
          value={
            summary.upcomingEvents
          }
          description="Events still to attend"
        />

        <SummaryCard
          icon={Clock}
          label="Past Events"
          value={summary.pastEvents}
          description="Events already completed"
        />

        <SummaryCard
          icon={Award}
          label="Certificates"
          value={
            summary.certificatesIssued
          }
          description="Certificates issued"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2">
          <Filter
            size={18}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <h3 className="font-semibold text-slate-800 dark:text-white">
            Filter Attendance History
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Year */}
          <div>
            <label
              htmlFor="attendance-year"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Year
            </label>

            <select
              id="attendance-year"
              value={selectedYear}
              onChange={(event) =>
                setSelectedYear(
                  event.target.value ===
                    "All"
                    ? "All"
                    : Number(
                        event.target.value
                      )
                )
              }
              className={selectClass}
            >
              <option value="All">
                All Years
              </option>

              {years.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Event type */}
          <div>
            <label
              htmlFor="attendance-type"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Event Type
            </label>

            <select
              id="attendance-type"
              value={selectedType}
              onChange={(event) =>
                setSelectedType(
                  event.target.value
                )
              }
              className={selectClass}
            >
              <option value="All">
                All Event Types
              </option>

              {eventTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label
              htmlFor="attendance-sort"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Sort By
            </label>

            <select
              id="attendance-sort"
              value={sortDirection}
              onChange={(event) =>
                setSortDirection(
                  event.target.value
                )
              }
              className={selectClass}
            >
              <option value="desc">
                Newest First
              </option>

              <option value="asc">
                Oldest First
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Participation History
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1
                ? "event"
                : "events"}{" "}
              found
            </p>
          </div>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredEvents.map(
              (event, index) => (
                <AttendanceHistoryCard
                  key={
                    event.id ||
                    event.eventId ||
                    `${event.eventName || event.name}-${index}`
                  }
                  event={event}
                />
              )
            )}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  description,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
        <Icon
          size={20}
          className="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      <span className="text-2xl font-bold text-slate-800 dark:text-white">
        {value}
      </span>
    </div>

    <h4 className="mt-4 font-semibold text-slate-700 dark:text-slate-200">
      {label}
    </h4>

    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
      {description}
    </p>
  </div>
);

const EmptyState = () => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
    <History
      size={42}
      className="mx-auto mb-4 text-slate-400"
    />

    <h3 className="font-semibold text-slate-700 dark:text-white">
      No attendance records found
    </h3>

    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
      Try changing the year or event type filter,
      or attend an event to build your participation
      history.
    </p>
  </div>
);

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

export default AttendanceHistoryDashboard;