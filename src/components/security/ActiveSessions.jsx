import { RefreshCw, LogOut, Shield, Loader2 } from "lucide-react";
import useActiveSessions from "../../hooks/useActiveSessions";
import SessionCard from "./SessionCard";

const ActiveSessions = () => {
  const {
    sessions,
    loading,
    error,
    revokingId,
    revokingAll,
    refresh,
    revokeSession,
    revokeAllOtherSessions,
  } = useActiveSessions();

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <section className="space-y-5" aria-labelledby="active-sessions-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="active-sessions-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Active Sessions
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor and manage devices currently signed in to your account.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-bg px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
          </button>
          {otherSessions.length > 0 && (
            <button
              type="button"
              onClick={revokeAllOtherSessions}
              disabled={revokingAll}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
            >
              {revokingAll ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Log out all other devices
            </button>
          )}
        </div>
      </div>

      {loading && sessions.length === 0 && (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 py-12 dark:border-slate-700">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" aria-hidden="true" />
          <span className="sr-only">Loading sessions</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && !error && sessions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center dark:border-slate-700">
          <Shield className="mx-auto mb-3 h-8 w-8 text-slate-400" aria-hidden="true" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No active sessions found.</p>
        </div>
      )}

      <div className="space-y-3">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onRevoke={revokeSession}
            isRevoking={revokingId === session.id}
          />
        ))}
      </div>
    </section>
  );
};

export default ActiveSessions;
