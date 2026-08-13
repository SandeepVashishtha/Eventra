import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const FILTERS = [
  {
    id: "all",
    label: "All",
    icon: Filter,
  },
  {
    id: "upcoming",
    label: "Upcoming",
    icon: CalendarClock,
  },
  {
    id: "pending",
    label: "Pending",
    icon: Clock3,
  },
  {
    id: "confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
  },
  {
    id: "attended",
    label: "Attended",
    icon: CalendarCheck,
  },
  {
    id: "completed",
    label: "Completed",
    icon: CheckCircle2,
  },
  {
    id: "cancelled",
    label: "Cancelled",
    icon: XCircle,
  },
];

const EventRegistrationStatusFilter = ({
  registrations = [],
  onFilterChange,
  onRegistrationClick,
  className = "",
}) => {
  const [activeFilter, setActiveFilter] =
    useState("all");

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const filteredRegistrations = useMemo(() => {
    if (activeFilter === "all") {
      return registrations;
    }

    return registrations.filter(
      (registration) =>
        getRegistrationStatus(
          registration
        ) === activeFilter
    );
  }, [
    registrations,
    activeFilter,
  ]);

  const counts = useMemo(() => {
    const result = {
      all: registrations.length,
      upcoming: 0,
      pending: 0,
      confirmed: 0,
      attended: 0,
      completed: 0,
      cancelled: 0,
    };

    registrations.forEach(
      (registration) => {
        const status =
          getRegistrationStatus(
            registration
          );

        if (result[status] !== undefined) {
          result[status] += 1;
        }
      }
    );

    return result;
  }, [registrations]);

  const handleFilterChange = (
    filter
  ) => {
    setActiveFilter(filter);

    onFilterChange?.(filter);

    setMobileOpen(false);
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            My Registrations
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Event Registrations
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Filter your registered events by status.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
            Showing
          </p>

          <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
            {filteredRegistrations.length}
            <span className="ml-1 text-[8px] font-normal text-slate-400">
              of {registrations.length}
            </span>
          </p>
        </div>
      </div>

      {/* Desktop filters */}
      <div className="mt-6 hidden gap-2 overflow-x-auto pb-1 md:flex">
        {FILTERS.map((filter) => {
          const Icon = filter.icon;
          const active =
            activeFilter ===
            filter.id;

          return (
            <button
              key={filter.id}
              type="button"
              onClick={() =>
                handleFilterChange(
                  filter.id
                )
              }
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-[8px] font-bold transition ${
                active
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              <Icon size={13} />

              <span>
                {filter.label}
              </span>

              <span
                className={`rounded-full px-2 py-0.5 text-[7px] ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                }`}
              >
                {counts[filter.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile filter */}
      <div className="relative mt-5 md:hidden">
        <button
          type="button"
          onClick={() =>
            setMobileOpen(
              (current) => !current
            )
          }
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
        >
          <span className="flex items-center gap-2 text-[9px] font-bold text-slate-700 dark:text-slate-200">
            <Filter size={13} />

            {FILTERS.find(
              (item) =>
                item.id ===
                activeFilter
            )?.label || "All"}

            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[7px] text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              {counts[activeFilter]}
            </span>
          </span>

          <ChevronDown
            size={15}
            className={`text-slate-400 transition-transform ${
              mobileOpen
                ? "rotate-180"
                : ""
            }`}
          />
        </button>

        {mobileOpen && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            {FILTERS.map((filter) => {
              const Icon =
                filter.icon;

              const active =
                activeFilter ===
                filter.id;

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() =>
                    handleFilterChange(
                      filter.id
                    )
                  }
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left ${
                    active
                      ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                      : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon size={14} />

                  <span className="flex-1 text-[8px] font-bold">
                    {filter.label}
                  </span>

                  <span className="text-[7px] font-bold">
                    {counts[filter.id]}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Registration list */}
      <div className="mt-5 space-y-3">
        {filteredRegistrations.length >
        0 ? (
          filteredRegistrations.map(
            (registration, index) => (
              <RegistrationCard
                key={
                  registration.id ||
                  registration.registrationId ||
                  index
                }
                registration={
                  registration
                }
                onClick={() =>
                  onRegistrationClick?.(
                    registration
                  )
                }
              />
            )
          )
        ) : (
          <EmptyState
            activeFilter={
              activeFilter
            }
            onReset={() =>
              handleFilterChange(
                "all"
              )
            }
          />
        )}
      </div>
    </section>
  );
};

const RegistrationCard = ({
  registration,
  onClick,
}) => {
  const status =
    getRegistrationStatus(
      registration
    );

  const config =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG.pending;

  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-900/50 sm:flex-row sm:items-center"
    >
      {/* Event icon */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <CalendarClock size={18} />
      </div>

      {/* Main information */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[10px] font-bold text-slate-800 dark:text-white">
          {registration.eventName ||
            registration.event?.title ||
            "Untitled Event"}
        </h3>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {registration.date && (
            <span className="text-[7px] text-slate-400">
              {formatDate(
                registration.date
              )}
            </span>
          )}

          {registration.venue && (
            <span className="text-[7px] text-slate-400">
              {registration.venue}
            </span>
          )}

          {registration.registrationId && (
            <span className="text-[7px] text-slate-400">
              ID:{" "}
              {
                registration.registrationId
              }
            </span>
          )}
        </div>
      </div>

      {/* Status */}
      <div
        className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 ${config.badge}`}
      >
        <Icon size={12} />

        <span className="text-[8px] font-bold">
          {config.label}
        </span>
      </div>
    </button>
  );
};

const EmptyState = ({
  activeFilter,
  onReset,
}) => {
  const filterLabel =
    FILTERS.find(
      (filter) =>
        filter.id === activeFilter
    )?.label || "selected";

  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Filter size={20} />
      </div>

      <h3 className="mt-4 text-[10px] font-bold text-slate-700 dark:text-slate-200">
        No {filterLabel.toLowerCase()} registrations
      </h3>

      <p className="mx-auto mt-1 max-w-xs text-[8px] leading-4 text-slate-400">
        There are no event registrations matching this
        status.
      </p>

      {activeFilter !==
        "all" && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-[8px] font-bold text-white hover:bg-indigo-700"
        >
          Show All Registrations
        </button>
      )}
    </div>
  );
};

const STATUS_CONFIG = {
  upcoming: {
    label: "Upcoming",
    icon: CalendarClock,
    badge:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400",
  },
  pending: {
    label: "Pending",
    icon: Clock3,
    badge:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    badge:
      "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400",
  },
  attended: {
    label: "Attended",
    icon: CalendarCheck,
    badge:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    badge:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/10 dark:text-purple-400",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    badge:
      "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400",
  },
};

const getRegistrationStatus = (
  registration
) => {
  const explicitStatus =
    String(
      registration.status ||
        registration.registrationStatus ||
        ""
    )
      .trim()
      .toLowerCase();

  const statusAliases = {
    canceled: "cancelled",
    rejected: "cancelled",
    approved: "confirmed",
    registered: "confirmed",
    complete: "completed",
  };

  if (
    STATUS_CONFIG[explicitStatus]
  ) {
    return explicitStatus;
  }

  if (
    statusAliases[explicitStatus]
  ) {
    return statusAliases[
      explicitStatus
    ];
  }

  /*
   * Calculate upcoming status from
   * event date when no explicit
   * status is available.
   */
  if (registration.date) {
    const eventDate =
      new Date(
        registration.date
      );

    if (
      !Number.isNaN(
        eventDate.getTime()
      ) &&
      eventDate > new Date()
    ) {
      return "upcoming";
    }
  }

  return "pending";
};

const formatDate = (value) => {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

export default EventRegistrationStatusFilter;