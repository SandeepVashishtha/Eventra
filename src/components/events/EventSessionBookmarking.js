import {
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Search,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY =
  "eventra-bookmarked-sessions";

const EventSessionBookmarking = ({
  sessions = [],
  title = "Event Sessions",
  subtitle = "Build your personalized schedule by bookmarking the sessions you want to attend.",
  className = "",
  storageKey = STORAGE_KEY,
  onBookmarkChange,
  onReminderChange,
}) => {
  const normalizedSessions = useMemo(
    () =>
      Array.isArray(sessions)
        ? sessions.map(normalizeSession)
        : [],
    [sessions]
  );

  const [bookmarkedIds, setBookmarkedIds] =
    useState(() => {
      return loadBookmarks(storageKey);
    });

  const [reminderIds, setReminderIds] =
    useState(() => {
      return loadReminders(storageKey);
    });

  const [showBookmarkedOnly, setShowBookmarkedOnly] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [selectedDate, setSelectedDate] =
    useState("all");

  useEffect(() => {
    saveBookmarks(
      storageKey,
      bookmarkedIds
    );
  }, [
    bookmarkedIds,
    storageKey,
  ]);

  useEffect(() => {
    saveReminders(
      storageKey,
      reminderIds
    );
  }, [
    reminderIds,
    storageKey,
  ]);

  const availableDates = useMemo(() => {
    const dates = normalizedSessions
      .map((session) =>
        session.startTime
          ? getDateKey(
              session.startTime
            )
          : null
      )
      .filter(Boolean);

    return [...new Set(dates)].sort();
  }, [normalizedSessions]);

  const filteredSessions = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return normalizedSessions.filter(
      (session) => {
        const matchesSearch =
          !query ||
          [
            session.title,
            session.description,
            session.speakerName,
            session.track,
            session.venue,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query);

        const matchesBookmark =
          !showBookmarkedOnly ||
          bookmarkedIds.has(
            session.id
          );

        const matchesDate =
          selectedDate === "all" ||
          getDateKey(
            session.startTime
          ) === selectedDate;

        return (
          matchesSearch &&
          matchesBookmark &&
          matchesDate
        );
      }
    );
  }, [
    normalizedSessions,
    search,
    showBookmarkedOnly,
    bookmarkedIds,
    selectedDate,
  ]);

  const bookmarkedCount =
    normalizedSessions.filter(
      (session) =>
        bookmarkedIds.has(
          session.id
        )
    ).length;

  const reminderCount =
    normalizedSessions.filter(
      (session) =>
        reminderIds.has(session.id)
    ).length;

  const toggleBookmark = (session) => {
    setBookmarkedIds((previous) => {
      const next = new Set(previous);

      if (next.has(session.id)) {
        next.delete(session.id);
      } else {
        next.add(session.id);
      }

      onBookmarkChange?.(
        session,
        next.has(session.id)
      );

      return next;
    });
  };

  const toggleReminder = (session) => {
    setReminderIds((previous) => {
      const next = new Set(previous);

      if (next.has(session.id)) {
        next.delete(session.id);
      } else {
        next.add(session.id);
      }

      onReminderChange?.(
        session,
        next.has(session.id)
      );

      return next;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedDate("all");
    setShowBookmarkedOnly(false);
  };

  const hasFilters =
    Boolean(search.trim()) ||
    selectedDate !== "all" ||
    showBookmarkedOnly;

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Bookmark
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Personalized Schedule
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <SummaryCard
            icon={<Bookmark size={14} />}
            label="Bookmarked"
            value={bookmarkedCount}
          />

          <SummaryCard
            icon={<Bell size={14} />}
            label="Reminders"
            value={reminderCount}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_180px_auto]">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search sessions, speakers, tracks..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>

        <select
          value={selectedDate}
          onChange={(event) =>
            setSelectedDate(
              event.target.value
            )
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          aria-label="Filter sessions by date"
        >
          <option value="all">
            All Dates
          </option>

          {availableDates.map(
            (date) => (
              <option
                key={date}
                value={date}
              >
                {formatDate(date)}
              </option>
            )
          )}
        </select>

        <button
          type="button"
          onClick={() =>
            setShowBookmarkedOnly(
              (value) => !value
            )
          }
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition ${
            showBookmarkedOnly
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          }`}
        >
          <Bookmark
            size={14}
            fill={
              showBookmarkedOnly
                ? "currentColor"
                : "none"
            }
          />
          Bookmarked Only
        </button>
      </div>

      {/* Filter summary */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-semibold text-slate-400">
          Showing{" "}
          <span className="text-slate-600 dark:text-slate-300">
            {filteredSessions.length}
          </span>{" "}
          of{" "}
          <span className="text-slate-600 dark:text-slate-300">
            {normalizedSessions.length}
          </span>{" "}
          sessions
        </p>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-[10px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Session list */}
      {filteredSessions.length === 0 ? (
        <EmptyState
          bookmarkedOnly={
            showBookmarkedOnly
          }
          hasSessions={
            normalizedSessions.length >
            0
          }
          onClear={clearFilters}
        />
      ) : (
        <div className="mt-5 grid gap-4">
          {filteredSessions.map(
            (session) => (
              <SessionCard
                key={session.id}
                session={session}
                bookmarked={bookmarkedIds.has(
                  session.id
                )}
                reminderEnabled={reminderIds.has(
                  session.id
                )}
                onBookmark={
                  toggleBookmark
                }
                onReminder={
                  toggleReminder
                }
              />
            )
          )}
        </div>
      )}
    </section>
  );
};

/* ----------------------------------
   Session card
----------------------------------- */

const SessionCard = ({
  session,
  bookmarked,
  reminderEnabled,
  onBookmark,
  onReminder,
}) => {
  const now = Date.now();

  const isStarted =
    session.startTime &&
    new Date(
      session.startTime
    ).getTime() <= now;

  const isFinished =
    session.endTime &&
    new Date(
      session.endTime
    ).getTime() < now;

  return (
    <article
      className={`rounded-2xl border bg-white p-4 transition dark:bg-slate-900 ${
        bookmarked
          ? "border-indigo-200 shadow-sm dark:border-indigo-800"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Time */}
        <div className="flex shrink-0 items-center gap-3 lg:w-40 lg:flex-col lg:items-start lg:gap-1">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Clock3 size={15} />

            <span className="text-xs font-bold">
              {formatTimeRange(
                session.startTime,
                session.endTime
              )}
            </span>
          </div>

          {session.startTime && (
            <p className="text-[9px] text-slate-400">
              {formatDate(
                session.startTime
              )}
            </p>
          )}
        </div>

        {/* Main information */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {session.track && (
              <span className="rounded-full bg-indigo-50 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                {session.track}
              </span>
            )}

            {isStarted &&
              !isFinished && (
                <span className="rounded-full bg-green-50 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-green-600 dark:bg-green-900/20 dark:text-green-400">
                  Live
                </span>
              )}

            {isFinished && (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Completed
              </span>
            )}
          </div>

          <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
            {session.title}
          </h3>

          {session.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {session.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {session.speakerName && (
              <MetaItem
                icon={
                  <UserRound
                    size={11}
                  />
                }
                text={
                  session.speakerName
                }
              />
            )}

            {session.venue && (
              <MetaItem
                icon={
                  <MapPin size={11} />
                }
                text={
                  session.venue
                }
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-2 lg:flex-col">
          <button
            type="button"
            onClick={() =>
              onBookmark(session)
            }
            aria-pressed={bookmarked}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-bold transition lg:min-w-[120px] ${
              bookmarked
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            <Bookmark
              size={13}
              fill={
                bookmarked
                  ? "currentColor"
                  : "none"
              }
            />

            {bookmarked
              ? "Bookmarked"
              : "Bookmark"}
          </button>

          <button
            type="button"
            onClick={() =>
              onReminder(session)
            }
            aria-pressed={
              reminderEnabled
            }
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-bold transition lg:min-w-[120px] ${
              reminderEnabled
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "border border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {reminderEnabled ? (
              <Check size={13} />
            ) : (
              <Bell size={13} />
            )}

            {reminderEnabled
              ? "Reminder On"
              : "Remind Me"}
          </button>
        </div>
      </div>
    </article>
  );
};

/* ----------------------------------
   Summary card
----------------------------------- */

const SummaryCard = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="min-w-[88px] rounded-xl bg-white px-3 py-2 text-center shadow-sm dark:bg-slate-900">
      <div className="flex items-center justify-center gap-1 text-indigo-500">
        {icon}

        <span className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
};

/* ----------------------------------
   Meta item
----------------------------------- */

const MetaItem = ({
  icon,
  text,
}) => {
  return (
    <span className="inline-flex items-center gap-1.5 text-[9px] font-medium text-slate-400">
      {icon}
      {text}
    </span>
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyState = ({
  bookmarkedOnly,
  hasSessions,
  onClear,
}) => {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Bookmark size={22} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">
        {!hasSessions
          ? "No sessions available"
          : bookmarkedOnly
          ? "No bookmarked sessions"
          : "No matching sessions"}
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
        {!hasSessions
          ? "Event sessions will appear here when they are available."
          : bookmarkedOnly
          ? "Bookmark sessions to build your personalized event schedule."
          : "Try changing your search or date filters."}
      </p>

      {(bookmarkedOnly ||
        hasSessions) && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

/* ----------------------------------
   Normalize session
----------------------------------- */

const normalizeSession = (
  session = {},
  index
) => {
  const speaker =
    session.speaker ||
    session.speakers?.[0] ||
    {};

  const startTime =
    session.startTime ||
    session.start ||
    session.startsAt ||
    session.dateTime ||
    null;

  const endTime =
    session.endTime ||
    session.end ||
    session.endsAt ||
    null;

  return {
    ...session,

    id:
      String(
        session.id ||
          session.sessionId ||
          session._id ||
          `session-${index}`
      ),

    title:
      session.title ||
      session.name ||
      "Event Session",

    description:
      session.description ||
      session.summary ||
      "",

    startTime,

    endTime,

    track:
      session.track ||
      session.category ||
      "",

    venue:
      session.venue ||
      session.location ||
      session.room ||
      "",

    speakerName:
      session.speakerName ||
      speaker.name ||
      [
        speaker.firstName,
        speaker.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      "",

    reminderMinutes:
      Number(
        session.reminderMinutes ??
          15
      ),
  };
};

/* ----------------------------------
   Storage
----------------------------------- */

const loadBookmarks = (
  storageKey
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return new Set();
  }

  try {
    const stored =
      window.localStorage.getItem(
        `${storageKey}:bookmarks`
      );

    const parsed =
      stored
        ? JSON.parse(stored)
        : [];

    return new Set(
      Array.isArray(parsed)
        ? parsed.map(String)
        : []
    );
  } catch {
    return new Set();
  }
};

const saveBookmarks = (
  storageKey,
  bookmarks
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      `${storageKey}:bookmarks`,
      JSON.stringify(
        Array.from(bookmarks)
      )
    );
  } catch {
    // Ignore localStorage failures.
  }
};

const loadReminders = (
  storageKey
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return new Set();
  }

  try {
    const stored =
      window.localStorage.getItem(
        `${storageKey}:reminders`
      );

    const parsed =
      stored
        ? JSON.parse(stored)
        : [];

    return new Set(
      Array.isArray(parsed)
        ? parsed.map(String)
        : []
    );
  } catch {
    return new Set();
  }
};

const saveReminders = (
  storageKey,
  reminders
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      `${storageKey}:reminders`,
      JSON.stringify(
        Array.from(reminders)
      )
    );
  } catch {
    // Ignore localStorage failures.
  }
};

/* ----------------------------------
   Date helpers
----------------------------------- */

const getDateKey = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    }
  ).format(date);
};

const formatTime = (
  value
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
};

const formatTimeRange = (
  start,
  end
) => {
  if (!start) {
    return "Time not set";
  }

  const startLabel =
    formatTime(start);

  if (!end) {
    return startLabel;
  }

  return `${startLabel} – ${formatTime(
    end
  )}`;
};

export default EventSessionBookmarking;