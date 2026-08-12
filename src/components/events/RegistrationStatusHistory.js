import { useMemo } from "react";
import {
  ClipboardCheck,
  History,
} from "lucide-react";
import RegistrationStatusTimeline from "./RegistrationStatusTimeline";
import {
  getCurrentRegistrationStatus,
  normalizeStatusHistory,
  formatStatusTimestamp,
} from "../../utils/registrationStatusHistoryUtils";

const RegistrationStatusHistory = ({
  registration,
  statusHistory = [],
}) => {
  const history = useMemo(
    () =>
      normalizeStatusHistory(
        statusHistory
      ),
    [statusHistory]
  );

  const currentStatus = useMemo(
    () =>
      getCurrentRegistrationStatus(
        history
      ),
    [history]
  );

  if (!registration && history.length === 0) {
    return (
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-md dark:border-slate-700 dark:bg-slate-900">
        <History
          size={44}
          className="mx-auto mb-4 text-slate-400"
        />

        <h2 className="text-lg font-semibold text-slate-700 dark:text-white">
          No Registration History
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Registration status updates will appear
          here as your event participation progresses.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <History
            size={24}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Registration Status History
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track the progress of your event registration.
          </p>
        </div>
      </div>

      {/* Registration details */}
      {registration && (
        <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Event
              </p>

              <h3 className="mt-1 font-semibold text-slate-800 dark:text-white">
                {registration.eventName ||
                  registration.name ||
                  "Event"}
              </h3>

              {registration.registrationId && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Registration ID:{" "}
                  <span className="font-medium">
                    {registration.registrationId}
                  </span>
                </p>
              )}
            </div>

            <div className="rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              {currentStatus || "Registered"}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="mt-8">
        <RegistrationStatusTimeline
          history={history}
        />
      </div>

      {/* Latest update */}
      {history.length > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <ClipboardCheck
            size={20}
            className="text-green-600 dark:text-green-400"
          />

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest Status Update
            </p>

            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              {currentStatus}
            </p>

            {history[history.length - 1]?.timestamp && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {formatStatusTimestamp(
                  history[history.length - 1]
                    .timestamp
                )}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default RegistrationStatusHistory;