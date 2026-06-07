import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  ShieldAlert,
  LogOut,
  Loader2,
} from "lucide-react";

const deviceIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

const formatRelativeTime = (isoString) => {
  if (!isoString) return "Unknown";
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const formatDateTime = (isoString) => {
  if (!isoString) return "Unknown";
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const SessionCard = ({ session, onRevoke, isRevoking }) => {
  const DeviceIcon = deviceIcons[session.deviceType] || Monitor;

  return (
    <article
      className={`rounded-2xl border p-5 transition ${
        session.isCurrent
          ? "border-emerald-400/60 bg-emerald-50/40 dark:border-emerald-700/50 dark:bg-emerald-950/20"
          : "border-slate-200/70 bg-bg/50 dark:border-slate-700/90"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
            <DeviceIcon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {session.browser} on {session.os}
              </h3>
              {session.isCurrent && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Current session
                </span>
              )}
              {session.suspicious && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                  New device
                </span>
              )}
            </div>
            <p className="text-xs capitalize text-slate-500 dark:text-slate-400">
              {session.deviceType} device
            </p>
          </div>
        </div>

        {!session.isCurrent && (
          <button
            type="button"
            onClick={() => onRevoke(session.id)}
            disabled={isRevoking}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50"
          >
            {isRevoking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            Log out device
          </button>
        )}
      </div>

      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <div>
            <dt className="sr-only">Login time</dt>
            <dd>
              <span className="block text-[10px] uppercase tracking-wide text-slate-400">Logged in</span>
              {formatDateTime(session.loginAt)}
            </dd>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <div>
            <dt className="sr-only">Last active</dt>
            <dd>
              <span className="block text-[10px] uppercase tracking-wide text-slate-400">Last active</span>
              {formatRelativeTime(session.lastActiveAt)}
            </dd>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Globe className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <div>
            <dt className="sr-only">IP address</dt>
            <dd>
              <span className="block text-[10px] uppercase tracking-wide text-slate-400">IP address</span>
              {session.ipAddress || "Unknown"}
            </dd>
          </div>
        </div>
      </dl>
    </article>
  );
};

export default SessionCard;
