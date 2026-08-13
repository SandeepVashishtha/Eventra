import {
  CheckCircle2,
  Clock3,
  Laptop,
  LogOut,
  Monitor,
  Smartphone,
  ShieldCheck,
  Tablet,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_SESSIONS = [
  {
    id: 1,
    device: "Windows PC",
    browser: "Chrome",
    location: "Daman, India",
    lastActivity: "Active now",
    lastActivityTime: new Date(),
    current: true,
    deviceType: "desktop",
  },
  {
    id: 2,
    device: "Android Phone",
    browser: "Chrome Mobile",
    location: "Daman, India",
    lastActivity: "15 minutes ago",
    lastActivityTime: new Date(Date.now() - 15 * 60 * 1000),
    current: false,
    deviceType: "mobile",
  },
  {
    id: 3,
    device: "iPad",
    browser: "Safari",
    location: "Mumbai, India",
    lastActivity: "2 hours ago",
    lastActivityTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    current: false,
    deviceType: "tablet",
  },
];

const DeviceSessionManagement = ({
  sessions = DEFAULT_SESSIONS,
  onSignOut,
  onSignOutAll,
}) => {
  const [activeSessions, setActiveSessions] =
    useState(sessions);

  const [selectedSession, setSelectedSession] =
    useState(null);

  const currentSession = useMemo(
    () =>
      activeSessions.find(
        (session) => session.current
      ),
    [activeSessions]
  );

  const signOutSession = (session) => {
    setActiveSessions((current) =>
      current.filter(
        (item) => item.id !== session.id
      )
    );

    setSelectedSession(null);

    if (onSignOut) {
      onSignOut(session);
    }
  };

  const signOutAllSessions = () => {
    setActiveSessions((current) =>
      current.filter(
        (session) => session.current
      )
    );

    if (onSignOutAll) {
      onSignOutAll();
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <ShieldCheck size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Account Security
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Device Sessions
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Review devices currently signed in to your Eventra account
              and sign out sessions you do not recognize.
            </p>
          </div>
        </div>

        {activeSessions.length > 1 && (
          <button
            type="button"
            onClick={signOutAllSessions}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-[7px] font-bold text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:bg-slate-900 dark:text-red-400"
          >
            <LogOut size={12} />
            Sign Out Other Sessions
          </button>
        )}
      </div>

      {/* Security Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={ShieldCheck}
          label="Active Sessions"
          value={activeSessions.length}
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Current Session"
          value={currentSession ? "Active" : "None"}
        />

        <SummaryCard
          icon={Clock3}
          label="Last Activity"
          value={
            currentSession
              ? currentSession.lastActivity
              : "--"
          }
        />
      </div>

      {/* Current Session */}
      {currentSession && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/30 dark:bg-green-900/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-green-600 dark:bg-slate-900 dark:text-green-400">
              {getDeviceIcon(
                currentSession.deviceType
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[9px] font-bold text-green-800 dark:text-green-300">
                  Current Session
                </h3>

                <span className="rounded-full bg-green-100 px-2.5 py-1 text-[5px] font-bold uppercase text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Active Now
                </span>
              </div>

              <p className="mt-1 text-[8px] font-bold text-slate-700 dark:text-slate-300">
                {currentSession.device}
              </p>

              <p className="mt-1 text-[6px] text-slate-500 dark:text-slate-400">
                {currentSession.browser} ·{" "}
                {currentSession.location}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
                Last Activity
              </p>

              <p className="mt-1 text-[7px] font-bold text-green-600 dark:text-green-400">
                {currentSession.lastActivity}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sessions */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Active Devices
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Devices and browsers currently associated with your account.
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {activeSessions.length}{" "}
            {activeSessions.length === 1
              ? "Session"
              : "Sessions"}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {activeSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onView={() =>
                setSelectedSession(session)
              }
              onSignOut={() =>
                signOutSession(session)
              }
            />
          ))}

          {!activeSessions.length && (
            <EmptySessions />
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
        <ShieldCheck
          size={16}
          className="mt-0.5 shrink-0 text-blue-500"
        />

        <div>
          <p className="text-[8px] font-bold text-blue-700 dark:text-blue-400">
            Keep your account secure
          </p>

          <p className="mt-1 text-[7px] leading-4 text-blue-700/70 dark:text-blue-400/70">
            If you do not recognize a device or location, sign out
            from that session and update your account password.
          </p>
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          onClose={() =>
            setSelectedSession(null)
          }
          onSignOut={() =>
            signOutSession(selectedSession)
          }
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
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Icon size={15} />
        </div>

        <div className="min-w-0">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-black text-slate-800 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Session Card
--------------------------------- */

const SessionCard = ({
  session,
  onView,
  onSignOut,
}) => {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        session.current
          ? "border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/40 dark:bg-indigo-900/10"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Device Icon */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            session.current
              ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          {getDeviceIcon(
            session.deviceType
          )}
        </div>

        {/* Information */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-[8px] font-bold text-slate-800 dark:text-white">
              {session.device}
            </h4>

            {session.current && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[5px] font-bold uppercase text-green-600 dark:bg-green-900/20 dark:text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Current Session
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-3">
            <span className="text-[6px] font-semibold text-slate-500 dark:text-slate-400">
              Browser: {session.browser}
            </span>

            <span className="text-[6px] font-semibold text-slate-500 dark:text-slate-400">
              Location: {session.location}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <Clock3
              size={9}
              className="text-slate-400"
            />

            <span className="text-[6px] text-slate-400">
              Last activity:{" "}
              {session.lastActivity}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onView}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-[6px] font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            View Details
          </button>

          {!session.current && (
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2.5 text-[6px] font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
            >
              <LogOut size={10} />
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptySessions = () => {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center dark:border-slate-700">
      <ShieldCheck
        size={26}
        className="text-slate-300 dark:text-slate-600"
      />

      <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">
        No active sessions
      </p>

      <p className="mt-1 text-[7px] text-slate-400">
        Your current session may have ended.
      </p>
    </div>
  );
};

/* --------------------------------
   Details Modal
--------------------------------- */

const SessionDetailsModal = ({
  session,
  onClose,
  onSignOut,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              {getDeviceIcon(
                session.deviceType
              )}
            </div>

            <div>
              <p className="text-[6px] font-bold uppercase tracking-wide text-indigo-500">
                Session Details
              </p>

              <h3 className="mt-1 text-sm font-black text-slate-800 dark:text-white">
                {session.device}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 dark:bg-slate-800 dark:hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5">
          <DetailItem
            label="Device"
            value={session.device}
          />

          <DetailItem
            label="Browser"
            value={session.browser}
          />

          <DetailItem
            label="Location"
            value={session.location}
          />

          <DetailItem
            label="Last Activity"
            value={session.lastActivity}
          />

          <DetailItem
            label="Session Status"
            value={
              session.current
                ? "Current"
                : "Active"
            }
          />

          <DetailItem
            label="Device Type"
            value={session.deviceType}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 p-5 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-3 text-[7px] font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            Close
          </button>

          {!session.current && (
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-[7px] font-bold text-white hover:bg-red-700"
            >
              <LogOut size={11} />
              Sign Out Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Detail Item
--------------------------------- */

const DetailItem = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-[7px] font-bold capitalize text-slate-700 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   Device Icon
--------------------------------- */

const getDeviceIcon = (deviceType) => {
  switch (deviceType) {
    case "mobile":
      return <Smartphone size={18} />;

    case "tablet":
      return <Tablet size={18} />;

    case "desktop":
      return <Monitor size={18} />;

    case "laptop":
      return <Laptop size={18} />;

    default:
      return <Monitor size={18} />;
  }
};

export default DeviceSessionManagement;