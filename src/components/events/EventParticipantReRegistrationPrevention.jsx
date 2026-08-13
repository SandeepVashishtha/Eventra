import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";

const DEFAULT_DATA = {
  previousRegistration: {
    status: "Cancelled",
    cancellationDate: "August 10, 2026",
    registrationId: "REG-10482",
  },
  reRegistrationAllowed: false,
};

const EventParticipantReRegistrationPrevention = ({
  data = DEFAULT_DATA,
  onRequestReRegistration,
}) => {
  const previousRegistration = data.previousRegistration;
  const isAllowed = data.reRegistrationAllowed;

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <ShieldCheck size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Registration Status
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Re-Registration Eligibility
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Review your previous registration and determine whether
              you can register for this event again.
            </p>
          </div>
        </div>

        <StatusBadge allowed={isAllowed} />
      </div>

      {/* Previous Registration */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <UserCheck
            size={16}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Previous Registration
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Existing registration information for this event.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <InfoCard
            label="Registration Status"
            value={previousRegistration.status}
          />

          <InfoCard
            label="Cancellation Date"
            value={previousRegistration.cancellationDate}
          />

          <InfoCard
            label="Registration ID"
            value={previousRegistration.registrationId}
          />
        </div>
      </div>

      {/* Eligibility */}
      <div
        className={`mt-6 rounded-2xl border p-5 ${
          isAllowed
            ? "border-green-100 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
            : "border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              isAllowed
                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {isAllowed ? (
              <CheckCircle2 size={16} />
            ) : (
              <XCircle size={16} />
            )}
          </div>

          <div>
            <h3
              className={`text-[10px] font-bold ${
                isAllowed
                  ? "text-green-800 dark:text-green-300"
                  : "text-red-800 dark:text-red-300"
              }`}
            >
              {isAllowed
                ? "Re-Registration Available"
                : "Re-Registration Not Available"}
            </h3>

            <p
              className={`mt-1 text-[7px] leading-relaxed ${
                isAllowed
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              }`}
            >
              {isAllowed
                ? "The organizer permits participants with cancelled registrations to register again."
                : "The organizer has disabled re-registration after cancellation. Please contact the organizer if you need an exception."}
            </p>
          </div>
        </div>
      </div>

      {/* Registration History */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <CalendarDays
            size={16}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Registration History
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Previous registration activity for this event.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
              <XCircle size={15} />
            </div>

            <div className="mt-2 h-10 w-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="pt-1">
            <p className="text-[8px] font-bold text-slate-800 dark:text-white">
              Registration Cancelled
            </p>

            <p className="mt-1 text-[6px] text-slate-400">
              {previousRegistration.cancellationDate}
            </p>

            <p className="mt-2 text-[7px] text-slate-500 dark:text-slate-400">
              Registration ID: {previousRegistration.registrationId}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <UserCheck size={15} />
          </div>

          <div className="pt-1">
            <p className="text-[8px] font-bold text-slate-800 dark:text-white">
              Current Registration Status
            </p>

            <p className="mt-1 text-[6px] text-slate-400">
              {isAllowed
                ? "Eligible to create a new registration."
                : "New registration is currently blocked."}
            </p>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <AlertTriangle
            size={14}
            className="mt-0.5 shrink-0 text-amber-500"
          />

          <p className="text-[7px] leading-relaxed text-slate-500 dark:text-slate-400">
            Previous registration records are preserved to prevent
            duplicate registration data.
          </p>
        </div>

        <button
          type="button"
          disabled={!isAllowed}
          onClick={onRequestReRegistration}
          className={`rounded-xl px-4 py-2.5 text-[7px] font-bold transition ${
            isAllowed
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
          }`}
        >
          {isAllowed
            ? "Register Again"
            : "Re-Registration Disabled"}
        </button>
      </div>
    </section>
  );
};

const StatusBadge = ({ allowed }) => (
  <span
    className={`w-fit rounded-full px-3 py-1.5 text-[6px] font-bold ${
      allowed
        ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
        : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
    }`}
  >
    {allowed ? "Eligible" : "Not Eligible"}
  </span>
);

const InfoCard = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
    <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-2 break-words text-[8px] font-black text-slate-800 dark:text-white">
      {value}
    </p>
  </div>
);

export default EventParticipantReRegistrationPrevention;