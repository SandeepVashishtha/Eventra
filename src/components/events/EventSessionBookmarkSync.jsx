import {
  Bookmark,
  Check,
  Cloud,
  Laptop,
  Smartphone,
  Tablet,
  RefreshCw,
  Monitor,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_SESSIONS = [
  {
    id: 1,
    title: "AI & Machine Learning Workshop",
    speaker: "Dr. Priya Sharma",
    time: "10:00 AM - 11:00 AM",
    room: "Hall A",
  },
  {
    id: 2,
    title: "Building Modern React Applications",
    speaker: "Rahul Mehta",
    time: "11:30 AM - 12:30 PM",
    room: "Hall B",
  },
  {
    id: 3,
    title: "Cloud Deployment Strategies",
    speaker: "Ankit Patel",
    time: "2:00 PM - 3:00 PM",
    room: "Hall C",
  },
];

const DEVICE_ICONS = {
  desktop: Monitor,
  laptop: Laptop,
  tablet: Tablet,
  mobile: Smartphone,
};

const EventSessionBookmarkSync = ({
  sessions = DEFAULT_SESSIONS,
  initialBookmarks = [1, 3],
}) => {
  const [bookmarks, setBookmarks] =
    useState(initialBookmarks);

  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(
    "Just now"
  );

  const [device, setDevice] = useState("desktop");

  const bookmarkedSessions = useMemo(
    () =>
      sessions.filter((session) =>
        bookmarks.includes(session.id)
      ),
    [sessions, bookmarks]
  );

  const syncBookmarks = () => {
    setSyncing(true);

    setTimeout(() => {
      setSyncing(false);
      setLastSynced("Just now");
    }, 900);
  };

  const toggleBookmark = (sessionId) => {
    setBookmarks((current) =>
      current.includes(sessionId)
        ? current.filter((id) => id !== sessionId)
        : [...current, sessionId]
    );

    setLastSynced("Syncing...");
  };

  useEffect(() => {
    if (lastSynced !== "Syncing...") return;

    const timer = setTimeout(() => {
      setLastSynced("Just now");
    }, 700);

    return () => clearTimeout(timer);
  }, [lastSynced]);

  const DeviceIcon =
    DEVICE_ICONS[device] || Monitor;

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Bookmark size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Personalized Schedule
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Session Bookmark Sync
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Keep your bookmarked event sessions synchronized
              across all your devices.
            </p>
          </div>
        </div>

        {/* Sync Button */}
        <button
          type="button"
          onClick={syncBookmarks}
          disabled={syncing}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[7px] font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={13}
            className={
              syncing ? "animate-spin" : ""
            }
          />

          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {/* Sync Status */}
      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green-600 dark:bg-slate-900 dark:text-green-400">
              <Cloud size={17} />
            </div>

            <div>
              <h3 className="text-[9px] font-bold text-green-800 dark:text-green-300">
                Bookmarks are synchronized
              </h3>

              <p className="mt-1 text-[6px] text-green-600 dark:text-green-400">
                Last synchronized: {lastSynced}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Check
              size={13}
              className="text-green-600 dark:text-green-400"
            />

            <span className="text-[6px] font-bold text-green-700 dark:text-green-400">
              {bookmarks.length} bookmarked{" "}
              {bookmarks.length === 1
                ? "session"
                : "sessions"}
            </span>
          </div>
        </div>
      </div>

      {/* Devices */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Synced Devices
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Your bookmarks are available on every connected
              device.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(DEVICE_ICONS).map(
            ([name, Icon]) => (
              <button
                key={name}
                type="button"
                onClick={() => setDevice(name)}
                className={`rounded-2xl border p-4 text-left transition ${
                  device === name
                    ? "border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-900/20"
                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`rounded-xl p-2 ${
                      device === name
                        ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    <Icon size={16} />
                  </div>

                  {device === name && (
                    <Check
                      size={13}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                  )}
                </div>

                <p className="mt-3 text-[8px] font-bold capitalize text-slate-700 dark:text-slate-300">
                  {name}
                </p>

                <p className="mt-1 text-[6px] text-slate-400">
                  Bookmarks synced
                </p>
              </button>
            )
          )}
        </div>
      </div>

      {/* Current Device */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <DeviceIcon size={16} />
          </div>

          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Current Device
            </h3>

            <p className="mt-1 text-[6px] capitalize text-slate-400">
              {device} • Changes are automatically synchronized
            </p>
          </div>
        </div>
      </div>

      {/* Bookmarked Sessions */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Your Bookmarked Sessions
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              These sessions will remain available when you
              switch devices.
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {bookmarkedSessions.length} saved
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {sessions.map((session) => {
            const isBookmarked = bookmarks.includes(
              session.id
            );

            return (
              <div
                key={session.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isBookmarked
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                    }`}
                  >
                    <Bookmark
                      size={17}
                      fill={
                        isBookmarked
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </div>

                  <div>
                    <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
                      {session.title}
                    </h4>

                    <p className="mt-1 text-[6px] text-slate-400">
                      {session.speaker}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[5px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {session.time}
                      </span>

                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[5px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {session.room}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggleBookmark(session.id)
                  }
                  className={`rounded-xl px-4 py-2 text-[6px] font-bold transition ${
                    isBookmarked
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  {isBookmarked
                    ? "Bookmarked"
                    : "Bookmark"}
                </button>
              </div>
            );
          })}

          {bookmarkedSessions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <Bookmark
                size={22}
                className="mx-auto text-slate-400"
              />

              <p className="mt-3 text-[8px] font-bold text-slate-600 dark:text-slate-300">
                No bookmarked sessions
              </p>

              <p className="mt-1 text-[6px] text-slate-400">
                Bookmark sessions to keep them synchronized
                across your devices.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sync Information */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <InfoCard
          icon={Cloud}
          title="Cloud Sync"
          description="Bookmarks are stored with your account."
        />

        <InfoCard
          icon={RefreshCw}
          title="Automatic Updates"
          description="Changes are synchronized automatically."
        />

        <InfoCard
          icon={Check}
          title="Consistent Schedule"
          description="Access the same sessions everywhere."
        />
      </div>
    </section>
  );
};

const InfoCard = ({
  icon: Icon,
  title,
  description,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <Icon size={15} />
      </div>

      <div>
        <h4 className="text-[7px] font-bold text-slate-700 dark:text-slate-300">
          {title}
        </h4>

        <p className="mt-1 text-[6px] leading-3 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  </div>
);

export default EventSessionBookmarkSync;