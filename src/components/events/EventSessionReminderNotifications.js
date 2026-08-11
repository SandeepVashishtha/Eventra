import {
  Bell,
  BellRing,
  CalendarClock,
  Check,
  Clock3,
  Link as LinkIcon,
  MapPin,
  Search,
  Settings2,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_SESSIONS = [
  {
    id: "SESSION-001",
    name: "Introduction to Generative AI",
    speaker: "Dr. Ananya Sharma",
    startTime: "2026-08-15T10:00:00",
    endTime: "2026-08-15T11:00:00",
    venue: "Main Auditorium",
    meetingLink: "https://meet.example.com/session-001",
    bookmarked: true,
    registered: true,
    reminders: {
      thirtyMinutes: true,
      tenMinutes: true,
    },
  },
  {
    id: "SESSION-002",
    name: "Building Scalable React Applications",
    speaker: "Rahul Mehta",
    startTime: "2026-08-15T12:30:00",
    endTime: "2026-08-15T13:30:00",
    venue: "Hall B",
    meetingLink: "https://meet.example.com/session-002",
    bookmarked: true,
    registered: false,
    reminders: {
      thirtyMinutes: true,
      tenMinutes: false,
    },
  },
  {
    id: "SESSION-003",
    name: "Data Science Career Workshop",
    speaker: "Priya Patel",
    startTime: "2026-08-15T15:00:00",
    endTime: "2026-08-15T16:00:00",
    venue: "Workshop Room 2",
    meetingLink: "https://meet.example.com/session-003",
    bookmarked: false,
    registered: true,
    reminders: {
      thirtyMinutes: true,
      tenMinutes: true,
    },
  },
  {
    id: "SESSION-004",
    name: "Future of Cloud Computing",
    speaker: "Arjun Shah",
    startTime: "2026-08-15T17:30:00",
    endTime: "2026-08-15T18:30:00",
    venue: "Online",
    meetingLink: "https://meet.example.com/session-004",
    bookmarked: false,
    registered: false,
    reminders: {
      thirtyMinutes: false,
      tenMinutes: false,
    },
  },
];

const DEFAULT_SETTINGS = {
  thirtyMinutes: true,
  tenMinutes: true,
  notifyBookmarked: true,
  notifyRegistered: true,
};

const EventSessionReminderNotifications = ({
  eventId = "event-14294",
  eventTitle = "AI & ML Conference",
  sessions = DEFAULT_SESSIONS,
  initialSettings = DEFAULT_SETTINGS,
  onReminderSettingsChange,
  onReminderScheduled,
  onReminderCancelled,
  className = "",
}) => {
  const [sessionData, setSessionData] = useState(sessions);
  const [settings, setSettings] = useState(initialSettings);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [selectedSession, setSelectedSession] =
    useState(null);

  const [notice, setNotice] = useState("");

  const [showSettings, setShowSettings] =
    useState(false);

  const [reminderLog, setReminderLog] =
    useState([]);

  const updateSettings = async (key) => {
    const updatedSettings = {
      ...settings,
      [key]: !settings[key],
    };

    setSettings(updatedSettings);

    await onReminderSettingsChange?.({
      eventId,
      settings: updatedSettings,
    });
  };

  const updateSessionReminder = async (
    sessionId,
    reminderType
  ) => {
    const updatedSessions = sessionData.map(
      (session) => {
        if (session.id !== sessionId) {
          return session;
        }

        return {
          ...session,
          reminders: {
            ...session.reminders,
            [reminderType]:
              !session.reminders[reminderType],
          },
        };
      }
    );

    setSessionData(updatedSessions);

    const updatedSession =
      updatedSessions.find(
        (session) =>
          session.id === sessionId
      );

    if (
      updatedSession?.reminders[
        reminderType
      ]
    ) {
      setNotice(
        `${getReminderLabel(
          reminderType
        )} reminder enabled for ${updatedSession.name}.`
      );

      await onReminderScheduled?.({
        eventId,
        eventTitle,
        session: updatedSession,
        reminderType,
      });
    } else {
      setNotice(
        `${getReminderLabel(
          reminderType
        )} reminder disabled for ${updatedSession.name}.`
      );

      await onReminderCancelled?.({
        eventId,
        eventTitle,
        session: updatedSession,
        reminderType,
      });
    }
  };

  const sendTestReminder = (session, reminderType) => {
    const reminder = {
      id: `${session.id}-${reminderType}-${Date.now()}`,
      sessionId: session.id,
      sessionName: session.name,
      speaker: session.speaker,
      reminderType,
      sentAt: new Date().toISOString(),
    };

    setReminderLog((current) => [
      reminder,
      ...current,
    ]);

    setNotice(
      `Test ${getReminderLabel(
        reminderType
      )} reminder sent for ${session.name}.`
    );
  };

  const getParticipantInterest = (
    session
  ) => {
    if (
      settings.notifyBookmarked &&
      session.bookmarked
    ) {
      return true;
    }

    if (
      settings.notifyRegistered &&
      session.registered
    ) {
      return true;
    }

    return false;
  };

  const getReminderCount = (session) => {
    let count = 0;

    if (
      settings.thirtyMinutes &&
      session.reminders.thirtyMinutes &&
      getParticipantInterest(session)
    ) {
      count += 1;
    }

    if (
      settings.tenMinutes &&
      session.reminders.tenMinutes &&
      getParticipantInterest(session)
    ) {
      count += 1;
    }

    return count;
  };

  const filteredSessions = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return sessionData.filter(
      (session) => {
        const matchesSearch =
          !query ||
          session.name
            .toLowerCase()
            .includes(query) ||
          session.speaker
            .toLowerCase()
            .includes(query) ||
          session.venue
            .toLowerCase()
            .includes(query);

        const participantInterested =
          getParticipantInterest(session);

        const matchesFilter =
          filter === "All" ||
          (filter === "Bookmarked" &&
            session.bookmarked) ||
          (filter === "Registered" &&
            session.registered) ||
          (filter === "Reminders Active" &&
            getReminderCount(session) >
              0) ||
          (filter === "No Reminders" &&
            getReminderCount(session) === 0);

        return (
          matchesSearch &&
          matchesFilter &&
          (participantInterested ||
            filter === "All")
        );
      }
    );
  }, [
    sessionData,
    search,
    filter,
    settings,
  ]);

  const interestedSessions =
    sessionData.filter(
      getParticipantInterest
    ).length;

  const activeReminderCount =
    sessionData.reduce(
      (total, session) =>
        total +
        getReminderCount(session),
      0
    );

  const bookmarkedCount =
    sessionData.filter(
      (session) =>
        session.bookmarked
    ).length;

  const registeredCount =
    sessionData.filter(
      (session) =>
        session.registered
    ).length;

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <BellRing
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Personalized Notifications
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Session Reminder Notifications
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Send reminders before bookmarked or registered
              sessions so participants do not miss important
              sessions.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowSettings(
              (current) => !current
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[9px] font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <Settings2 size={13} />
          Reminder Settings
        </button>
      </div>

      {/* Notice */}
      {notice && (
        <div className="mt-5 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <Bell
            size={14}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <p className="flex-1 text-[9px] font-semibold text-indigo-700 dark:text-indigo-300">
            {notice}
          </p>

          <button
            type="button"
            onClick={() => setNotice("")}
            className="text-indigo-400"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={<CalendarClock size={15} />}
          label="Sessions"
          value={sessionData.length}
        />

        <SummaryCard
          icon={<BookmarkIcon />}
          label="Bookmarked"
          value={bookmarkedCount}
        />

        <SummaryCard
          icon={<User size={15} />}
          label="Registered"
          value={registeredCount}
        />

        <SummaryCard
          icon={<BellRing size={15} />}
          label="Active Reminders"
          value={activeReminderCount}
        />
      </div>

      {/* Global settings */}
      {showSettings && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Settings2
              size={14}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Global Reminder Settings
            </h3>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <SettingRow
              title="30-minute reminders"
              description="Notify participants 30 minutes before the session."
              enabled={
                settings.thirtyMinutes
              }
              onToggle={() =>
                updateSettings(
                  "thirtyMinutes"
                )
              }
            />

            <SettingRow
              title="10-minute reminders"
              description="Notify participants 10 minutes before the session."
              enabled={
                settings.tenMinutes
              }
              onToggle={() =>
                updateSettings(
                  "tenMinutes"
                )
              }
            />

            <SettingRow
              title="Bookmarked sessions"
              description="Send reminders for sessions bookmarked by the participant."
              enabled={
                settings.notifyBookmarked
              }
              onToggle={() =>
                updateSettings(
                  "notifyBookmarked"
                )
              }
            />

            <SettingRow
              title="Registered sessions"
              description="Send reminders for sessions the participant registered for."
              enabled={
                settings.notifyRegistered
              }
              onToggle={() =>
                updateSettings(
                  "notifyRegistered"
                )
              }
            />
          </div>
        </div>
      )}

      {/* Reminder timing */}
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <TimingCard
          icon={<Clock3 size={16} />}
          title="30 Minutes Before"
          description="Early reminder to help participants prepare."
          enabled={
            settings.thirtyMinutes
          }
        />

        <TimingCard
          icon={<BellRing size={16} />}
          title="10 Minutes Before"
          description="Final reminder before the session begins."
          enabled={
            settings.tenMinutes
          }
        />
      </div>

      {/* Search and filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search session, speaker, or venue..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            "All",
            "Bookmarked",
            "Registered",
            "Reminders Active",
            "No Reminders",
          ].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() =>
                setFilter(option)
              }
              className={`rounded-xl border px-3 py-2.5 text-[8px] font-bold ${
                filter === option
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Session cards */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {filteredSessions.map(
          (session) => (
            <SessionCard
              key={session.id}
              session={session}
              globalSettings={
                settings
              }
              reminderCount={getReminderCount(
                session
              )}
              onToggleReminder={
                updateSessionReminder
              }
              onTestReminder={
                sendTestReminder
              }
              onSelect={() =>
                setSelectedSession(
                  session
                )
              }
            />
          )
        )}
      </div>

      {filteredSessions.length ===
        0 && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white py-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <CalendarClock
            size={25}
            className="mx-auto text-slate-300 dark:text-slate-600"
          />

          <p className="mt-3 text-[9px] font-bold text-slate-500 dark:text-slate-400">
            No sessions found.
          </p>
        </div>
      )}

      {/* Selected session details */}
      {selectedSession && (
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-white p-4 dark:border-indigo-900/30 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                Selected Session
              </p>

              <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
                {selectedSession.name}
              </h3>

              <p className="mt-1 text-[8px] text-slate-400">
                {selectedSession.id}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedSession(
                  null
                )
              }
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem
              icon={<User size={13} />}
              label="Speaker"
              value={
                selectedSession.speaker
              }
            />

            <DetailItem
              icon={
                <CalendarClock size={13} />
              }
              label="Start Time"
              value={formatDateTime(
                selectedSession.startTime
              )}
            />

            <DetailItem
              icon={<MapPin size={13} />}
              label="Venue"
              value={
                selectedSession.venue
              }
            />

            <DetailItem
              icon={<BellRing size={13} />}
              label="Reminders"
              value={`${getReminderCount(
                selectedSession
              )} active`}
            />
          </div>
        </div>
      )}

      {/* Reminder log */}
      {reminderLog.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Bell
              size={14}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <h3 className="text-xs font-bold text-slate-800 dark:text-white">
              Recent Reminder Activity
            </h3>
          </div>

          <div className="mt-4 space-y-2">
            {reminderLog
              .slice(0, 5)
              .map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950"
                >
                  <div>
                    <p className="text-[8px] font-bold text-slate-700 dark:text-slate-200">
                      {log.sessionName}
                    </p>

                    <p className="mt-1 text-[7px] text-slate-400">
                      {log.speaker} ·{" "}
                      {getReminderLabel(
                        log.reminderType
                      )}
                    </p>
                  </div>

                  <span className="text-[7px] font-semibold text-slate-400">
                    {formatDateTime(
                      log.sentAt
                    )}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
};

const SessionCard = ({
  session,
  globalSettings,
  reminderCount,
  onToggleReminder,
  onTestReminder,
  onSelect,
}) => {
  const interested =
    (globalSettings.notifyBookmarked &&
      session.bookmarked) ||
    (globalSettings.notifyRegistered &&
      session.registered);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {session.bookmarked && (
              <span className="rounded-full bg-amber-50 px-2 py-1 text-[7px] font-bold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                Bookmarked
              </span>
            )}

            {session.registered && (
              <span className="rounded-full bg-green-50 px-2 py-1 text-[7px] font-bold text-green-600 dark:bg-green-900/20 dark:text-green-400">
                Registered
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onSelect}
            className="mt-2 text-left"
          >
            <h3 className="text-sm font-bold text-slate-800 hover:text-indigo-600 dark:text-white">
              {session.name}
            </h3>
          </button>

          <p className="mt-1 text-[8px] text-slate-400">
            {session.id}
          </p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <BellRing size={15} />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <InfoRow
          icon={<User size={12} />}
          text={session.speaker}
        />

        <InfoRow
          icon={<CalendarClock size={12} />}
          text={formatDateTime(
            session.startTime
          )}
        />

        <InfoRow
          icon={<MapPin size={12} />}
          text={session.venue}
        />

        <InfoRow
          icon={<LinkIcon size={12} />}
          text="Meeting link available"
        />
      </div>

      {!interested && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
          <p className="text-[8px] text-slate-400">
            Reminder is inactive because this session is
            neither bookmarked nor registered.
          </p>
        </div>
      )}

      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
        <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
          Reminder Schedule
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <ReminderToggle
            label="30 minutes before"
            enabled={
              session.reminders
                .thirtyMinutes
            }
            disabled={
              !globalSettings.thirtyMinutes ||
              !interested
            }
            onClick={() =>
              onToggleReminder(
                session.id,
                "thirtyMinutes"
              )
            }
          />

          <ReminderToggle
            label="10 minutes before"
            enabled={
              session.reminders
                .tenMinutes
            }
            disabled={
              !globalSettings.tenMinutes ||
              !interested
            }
            onClick={() =>
              onToggleReminder(
                session.id,
                "tenMinutes"
              )
            }
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-[8px] font-semibold text-slate-400">
          {reminderCount} reminder
          {reminderCount === 1
            ? ""
            : "s"} active
        </span>

        <div className="flex gap-2">
          {session.reminders
            .thirtyMinutes &&
            globalSettings.thirtyMinutes &&
            interested && (
              <button
                type="button"
                onClick={() =>
                  onTestReminder(
                    session,
                    "thirtyMinutes"
                  )
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-[7px] font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Test 30m
              </button>
            )}

          {session.reminders
            .tenMinutes &&
            globalSettings.tenMinutes &&
            interested && (
              <button
                type="button"
                onClick={() =>
                  onTestReminder(
                    session,
                    "tenMinutes"
                  )
                }
                className="rounded-lg bg-indigo-600 px-3 py-2 text-[7px] font-bold text-white hover:bg-indigo-700"
              >
                Test 10m
              </button>
            )}
        </div>
      </div>
    </article>
  );
};

const SummaryCard = ({
  icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center justify-between">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        {icon}
      </div>

      <span className="text-lg font-bold text-slate-800 dark:text-white">
        {value}
      </span>
    </div>

    <p className="mt-3 text-[8px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>
  </div>
);

const SettingRow = ({
  title,
  description,
  enabled,
  onToggle,
}) => (
  <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
    <div>
      <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
        {title}
      </p>

      <p className="mt-1 text-[8px] leading-4 text-slate-400">
        {description}
      </p>
    </div>

    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      className={`relative h-5 w-9 shrink-0 rounded-full transition ${
        enabled
          ? "bg-indigo-600"
          : "bg-slate-300 dark:bg-slate-700"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
          enabled
            ? "left-[18px]"
            : "left-0.5"
        }`}
      />
    </button>
  </div>
);

const TimingCard = ({
  icon,
  title,
  description,
  enabled,
}) => (
  <div
    className={`rounded-2xl border p-4 ${
      enabled
        ? "border-indigo-100 bg-indigo-50 dark:border-indigo-900/30 dark:bg-indigo-900/10"
        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
    }`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          enabled
            ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
            : "bg-slate-100 text-slate-400 dark:bg-slate-800"
        }`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
          {title}
        </p>

        <p className="mt-1 text-[8px] text-slate-400">
          {description}
        </p>
      </div>
    </div>
  </div>
);

const ReminderToggle = ({
  label,
  enabled,
  disabled,
  onClick,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left ${
      disabled
        ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50 dark:border-slate-800 dark:bg-slate-950"
        : enabled
        ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900/30 dark:bg-indigo-900/10"
        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
    }`}
  >
    <span
      className={`text-[8px] font-bold ${
        enabled
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-slate-500 dark:text-slate-400"
      }`}
    >
      {label}
    </span>

    <span
      className={`flex h-5 w-5 items-center justify-center rounded-full ${
        enabled
          ? "bg-indigo-600 text-white"
          : "bg-slate-200 text-slate-400 dark:bg-slate-800"
      }`}
    >
      {enabled && <Check size={10} />}
    </span>
  </button>
);

const InfoRow = ({
  icon,
  text,
}) => (
  <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-950">
    <span className="text-slate-400">
      {icon}
    </span>

    <span className="truncate text-[8px] text-slate-500 dark:text-slate-400">
      {text}
    </span>
  </div>
);

const DetailItem = ({
  icon,
  label,
  value,
}) => (
  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
    <div className="flex items-center gap-2 text-slate-400">
      {icon}

      <span className="text-[7px] font-bold uppercase tracking-wide">
        {label}
      </span>
    </div>

    <p className="mt-2 truncate text-[9px] font-semibold text-slate-700 dark:text-slate-200">
      {value}
    </p>
  </div>
);

const BookmarkIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const getReminderLabel = (
  reminderType
) =>
  reminderType ===
  "thirtyMinutes"
    ? "30-minute"
    : "10-minute";

const formatDateTime = (
  value
) => {
  if (!value) return "—";

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Invalid date";
  }

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default EventSessionReminderNotifications;