import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import ActiveSessions from "./ActiveSessions";

const SecuritySettings = () => {
  useDocumentTitle("Eventra | Security Settings");

  return (
    <section className="min-h-screen bg-bg text-text py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-4">
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Settings
          </Link>
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 font-semibold">
              Account Security
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Security Settings</h1>
            <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
              Review active login sessions, monitor account activity across devices, and revoke access remotely.
            </p>
          </div>
        </div>

        <article className="rounded-3xl border border-slate-200/70 dark:border-slate-700/90 bg-card-bg/70 p-6 shadow-sm">
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-2xl bg-teal-50 p-3 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Session Management
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sessions refresh automatically. Suspicious logins from new devices are flagged for your review.
              </p>
            </div>
          </div>

          <ActiveSessions />
        </article>

        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-100/50 bg-amber-50/50 p-4 text-xs text-amber-800 dark:border-amber-900/20 dark:bg-amber-950/10 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            If you see an unfamiliar device, log it out immediately and change your password. Session data includes
            browser, operating system, login time, and approximate IP address for security monitoring.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SecuritySettings;
