import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const EventOrganizerPerformanceDashboard = ({
  events = [],
  className = "",
}) => {
  const [dateRange, setDateRange] =
    useState("all");

  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) {
      return [];
    }

    if (dateRange === "all") {
      return events;
    }

    const now = new Date();

    const days = {
      "7-days": 7,
      "30-days": 30,
      "90-days": 90,
      "1-year": 365,
    }[dateRange];

    if (!days) {
      return events;
    }

    const startDate = new Date(now);
    startDate.setDate(
      startDate.getDate() - days
    );

    return events.filter((event) => {
      const date = getEventDate(event);

      return date && date >= startDate;
    });
  }, [events, dateRange]);

  const stats = useMemo(
    () => calculateStats(filteredEvents),
    [filteredEvents]
  );

  const registrationGrowth =
    calculateRegistrationGrowth(
      filteredEvents
    );

  const feedback = calculateFeedbackStats(
    filteredEvents
  );

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <BarChart3
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Performance Dashboard
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Track your event performance and
              participant engagement.
            </p>
          </div>
        </div>

        {/* Date filter */}
        <div className="relative">
          <CalendarDays
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <select
            value={dateRange}
            onChange={(event) =>
              setDateRange(
                event.target.value
              )
            }
            className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500"
            aria-label="Filter analytics by date range"
          >
            <option value="all">
              All Time
            </option>
            <option value="7-days">
              Last 7 Days
            </option>
            <option value="30-days">
              Last 30 Days
            </option>
            <option value="90-days">
              Last 90 Days
            </option>
            <option value="1-year">
              Last Year
            </option>
          </select>

          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>

      {/* Main statistics */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Events Created"
          value={stats.totalEvents}
        />

        <StatCard
          icon={Users}
          label="Total Registrations"
          value={stats.totalRegistrations}
        />

        <StatCard
          icon={Activity}
          label="Average Attendance"
          value={`${stats.averageAttendance}%`}
        />

        <StatCard
          icon={Star}
          label="Average Rating"
          value={
            stats.averageRating
              ? `${stats.averageRating}/5`
              : "N/A"
          }
        />
      </div>

      {/* Secondary statistics */}
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat
          label="Total Participants"
          value={stats.totalParticipants}
          icon={Users}
        />

        <MiniStat
          label="Growth"
          value={`${registrationGrowth}%`}
          icon={TrendingUp}
        />

        <MiniStat
          label="Feedback Responses"
          value={feedback.total}
          icon={MessageSquare}
        />

        <MiniStat
          label="Positive Feedback"
          value={`${feedback.positivePercentage}%`}
          icon={Star}
        />
      </div>

      {/* Registration growth */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Registration Growth
            </h3>

            <p className="mt-1 text-[10px] text-slate-400">
              Registration activity across your events.
            </p>
          </div>

          <TrendingUp
            size={18}
            className="text-indigo-500"
          />
        </div>

        <GrowthBars
          events={filteredEvents}
        />
      </div>

      {/* Attendance + Feedback */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <AttendanceOverview
          events={filteredEvents}
          average={stats.averageAttendance}
        />

        <FeedbackOverview
          feedback={feedback}
        />
      </div>

      {/* Event performance table */}
      <EventPerformanceTable
        events={filteredEvents}
      />

      {/* Empty state */}
      {filteredEvents.length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <BarChart3
            size={30}
            className="mx-auto text-slate-400"
          />

          <h3 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
            No event data available
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
            Create or select events to see organizer
            performance analytics.
          </p>
        </div>
      )}
    </section>
  );
};

/* ----------------------------------
   Statistic card
----------------------------------- */

const StatCard = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
          <Icon
            size={15}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>
      </div>

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/* ----------------------------------
   Mini statistic
----------------------------------- */

const MiniStat = ({
  label,
  value,
  icon: Icon,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <Icon
          size={14}
          className="text-slate-400"
        />

        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
      </div>

      <p className="mt-2 text-sm font-bold text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/* ----------------------------------
   Registration growth bars
----------------------------------- */

const GrowthBars = ({
  events,
}) => {
  const values = events
    .slice(-6)
    .map((event) =>
      getRegistrationCount(event)
    );

  if (!values.length) {
    return (
      <div className="flex h-32 items-center justify-center text-xs text-slate-400">
        No registration data available.
      </div>
    );
  }

  const maxValue = Math.max(
    ...values,
    1
  );

  return (
    <div className="mt-5 flex h-36 items-end gap-2 sm:gap-3">
      {values.map(
        (value, index) => {
          const height = Math.max(
            6,
            (value / maxValue) *
              100
          );

          return (
            <div
              key={index}
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                {value}
              </span>

              <div className="flex h-full w-full items-end">
                <div
                  className="w-full rounded-t-lg bg-indigo-500 transition-all"
                  style={{
                    height: `${height}%`,
                  }}
                  title={`${value} registrations`}
                />
              </div>

              <span className="text-[9px] text-slate-400">
                {index + 1}
              </span>
            </div>
          );
        }
      )}
    </div>
  );
};

/* ----------------------------------
   Attendance overview
----------------------------------- */

const AttendanceOverview = ({
  average,
  events,
}) => {
  const getAttendanceColor = () => {
    if (average >= 80) {
      return "text-green-600 dark:text-green-400";
    }

    if (average >= 60) {
      return "text-amber-600 dark:text-amber-400";
    }

    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Attendance Overview
          </h3>

          <p className="mt-1 text-[10px] text-slate-400">
            Average attendance across events.
          </p>
        </div>

        <Activity
          size={17}
          className="text-indigo-500"
        />
      </div>

      <div className="mt-6 flex items-center gap-5">
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[10px] border-indigo-100 dark:border-indigo-950">
          <span
            className={`text-xl font-bold ${getAttendanceColor()}`}
          >
            {average}%
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            {events.length} events analyzed
          </p>

          <p className="mt-2 text-[11px] leading-5 text-slate-400">
            Higher attendance indicates stronger
            participant engagement.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------
   Feedback overview
----------------------------------- */

const FeedbackOverview = ({
  feedback,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Feedback Statistics
          </h3>

          <p className="mt-1 text-[10px] text-slate-400">
            Participant feedback across events.
          </p>
        </div>

        <MessageSquare
          size={17}
          className="text-indigo-500"
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <FeedbackItem
          label="Responses"
          value={feedback.total}
        />

        <FeedbackItem
          label="Average Rating"
          value={
            feedback.averageRating
              ? `${feedback.averageRating}/5`
              : "N/A"
          }
        />

        <FeedbackItem
          label="Positive"
          value={`${feedback.positivePercentage}%`}
        />

        <FeedbackItem
          label="Negative"
          value={`${feedback.negativePercentage}%`}
        />
      </div>
    </div>
  );
};

const FeedbackItem = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/* ----------------------------------
   Event performance table
----------------------------------- */

const EventPerformanceTable = ({
  events,
}) => {
  if (!events.length) {
    return null;
  }

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-4 dark:border-slate-700">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
          Event Performance
        </h3>

        <p className="mt-1 text-[10px] text-slate-400">
          Compare registrations and attendance by event.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Event
              </th>

              <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Registrations
              </th>

              <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Attendees
              </th>

              <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Attendance
              </th>

              <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Rating
              </th>
            </tr>
          </thead>

          <tbody>
            {events.map(
              (event, index) => {
                const registrations =
                  getRegistrationCount(
                    event
                  );

                const attendees =
                  getAttendeeCount(
                    event
                  );

                const attendance =
                  registrations
                    ? Math.round(
                        (attendees /
                          registrations) *
                          100
                      )
                    : 0;

                const rating =
                  getRating(event);

                return (
                  <tr
                    key={
                      event.id ||
                      event.eventId ||
                      index
                    }
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="max-w-[220px] px-4 py-3">
                      <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {getEventTitle(
                          event
                        )}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {registrations}
                    </td>

                    <td className="px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {attendees}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[9px] font-bold ${
                          attendance >=
                          80
                            ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                            : attendance >=
                              60
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                            : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {attendance}%
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {rating
                        ? `${rating}/5`
                        : "N/A"}
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ----------------------------------
   Data helpers
----------------------------------- */

const getEventTitle = (
  event = {}
) => {
  return (
    event.title ||
    event.name ||
    event.eventTitle ||
    "Untitled Event"
  );
};

const getEventDate = (
  event = {}
) => {
  const value =
    event.date ||
    event.startDate ||
    event.startDateTime ||
    event.createdAt ||
    event.eventDate;

  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
};

const getRegistrationCount = (
  event = {}
) => {
  const direct =
    event.totalRegistrations ??
    event.registrationsCount ??
    event.registrationCount ??
    event.registeredCount;

  if (
    direct !== undefined &&
    direct !== null
  ) {
    return Number(direct) || 0;
  }

  if (
    Array.isArray(
      event.registrations
    )
  ) {
    return event.registrations.length;
  }

  if (
    Array.isArray(
      event.registeredParticipants
    )
  ) {
    return event.registeredParticipants.length;
  }

  return 0;
};

const getAttendeeCount = (
  event = {}
) => {
  const direct =
    event.totalAttendees ??
    event.attendeesCount ??
    event.attendeeCount ??
    event.attendedCount;

  if (
    direct !== undefined &&
    direct !== null
  ) {
    return Number(direct) || 0;
  }

  if (
    Array.isArray(
      event.attendees
    )
  ) {
    return event.attendees.length;
  }

  if (
    Array.isArray(
      event.participants
    )
  ) {
    return event.participants.filter(
      (participant) =>
        participant.attended ===
          true ||
        participant.attendanceStatus ===
          "attended"
    ).length;
  }

  return 0;
};

const getParticipantCount = (
  event = {}
) => {
  const direct =
    event.totalParticipants ??
    event.participantCount;

  if (
    direct !== undefined &&
    direct !== null
  ) {
    return Number(direct) || 0;
  }

  return Math.max(
    getRegistrationCount(
      event
    ),
    getAttendeeCount(event)
  );
};

const getRating = (
  event = {}
) => {
  const rating =
    event.averageRating ??
    event.rating ??
    event.eventRating;

  const value =
    Number(rating);

  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return 0;
  }

  return Number(
    value.toFixed(1)
  );
};

const calculateStats = (
  events
) => {
  const totalEvents =
    events.length;

  const totalRegistrations =
    events.reduce(
      (sum, event) =>
        sum +
        getRegistrationCount(
          event
        ),
      0
    );

  const totalAttendees =
    events.reduce(
      (sum, event) =>
        sum +
        getAttendeeCount(
          event
        ),
      0
    );

  const totalParticipants =
    events.reduce(
      (sum, event) =>
        sum +
        getParticipantCount(
          event
        ),
      0
    );

  const averageAttendance =
    totalRegistrations > 0
      ? Math.round(
          (totalAttendees /
            totalRegistrations) *
            100
        )
      : 0;

  const ratings = events
    .map((event) =>
      getRating(event)
    )
    .filter(
      (rating) => rating > 0
    );

  const averageRating =
    ratings.length > 0
      ? Number(
          (
            ratings.reduce(
              (sum, rating) =>
                sum + rating,
              0
            ) /
            ratings.length
          ).toFixed(1)
        )
      : 0;

  return {
    totalEvents,
    totalRegistrations,
    totalAttendees,
    totalParticipants,
    averageAttendance,
    averageRating,
  };
};

const calculateRegistrationGrowth = (
  events
) => {
  if (events.length < 2) {
    return 0;
  }

  const sorted = [
    ...events,
  ].sort(
    (a, b) =>
      (getEventDate(a)?.getTime() ||
        0) -
      (getEventDate(b)?.getTime() ||
        0)
  );

  const midpoint =
    Math.ceil(
      sorted.length / 2
    );

  const previous =
    sorted.slice(
      0,
      midpoint
    );

  const current =
    sorted.slice(
      midpoint
    );

  const previousTotal =
    previous.reduce(
      (sum, event) =>
        sum +
        getRegistrationCount(
          event
        ),
      0
    );

  const currentTotal =
    current.reduce(
      (sum, event) =>
        sum +
        getRegistrationCount(
          event
        ),
      0
    );

  if (
    previousTotal === 0
  ) {
    return currentTotal > 0
      ? 100
      : 0;
  }

  return Math.round(
    ((currentTotal -
      previousTotal) /
      previousTotal) *
      100
  );
};

const calculateFeedbackStats = (
  events
) => {
  const feedback = [];

  events.forEach(
    (event) => {
      if (
        Array.isArray(
          event.feedback
        )
      ) {
        feedback.push(
          ...event.feedback
        );
      }
    }
  );

  const ratings = feedback
    .map((item) =>
      typeof item ===
      "object"
        ? item.rating ??
          item.score
        : Number(item)
    )
    .map(Number)
    .filter(
      (value) =>
        Number.isFinite(
          value
        )
    );

  const total =
    feedback.length;

  const positive =
    ratings.filter(
      (rating) =>
        rating >= 4
    ).length;

  const negative =
    ratings.filter(
      (rating) =>
        rating <= 2
    ).length;

  const averageRating =
    ratings.length
      ? Number(
          (
            ratings.reduce(
              (sum, rating) =>
                sum + rating,
              0
            ) /
            ratings.length
          ).toFixed(1)
        )
      : 0;

  return {
    total,
    positive,
    negative,
    averageRating,
    positivePercentage:
      ratings.length
        ? Math.round(
            (positive /
              ratings.length) *
              100
          )
        : 0,
    negativePercentage:
      ratings.length
        ? Math.round(
            (negative /
              ratings.length) *
              100
          )
        : 0,
  };
};

export default EventOrganizerPerformanceDashboard;