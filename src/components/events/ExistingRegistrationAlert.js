import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  Info,
  TicketCheck,
} from "lucide-react";

const STATUS_CONFIG = {
  confirmed: {
    label: "Confirmed",
    description:
      "You are already registered for this event.",
    icon: CheckCircle2,
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/10 dark:text-green-300",
    iconClass:
      "text-green-600 dark:text-green-400",
  },

  approved: {
    label: "Approved",
    description:
      "Your registration has been approved.",
    icon: CheckCircle2,
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/10 dark:text-green-300",
    iconClass:
      "text-green-600 dark:text-green-400",
  },

  pending: {
    label: "Pending",
    description:
      "Your registration is currently pending.",
    icon: Clock3,
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/10 dark:text-amber-300",
    iconClass:
      "text-amber-600 dark:text-amber-400",
  },

  waitlisted: {
    label: "Waitlisted",
    description:
      "You are already on the event waitlist.",
    icon: Clock3,
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/10 dark:text-blue-300",
    iconClass:
      "text-blue-600 dark:text-blue-400",
  },

  default: {
    label: "Already Registered",
    description:
      "You already have an active registration for this event.",
    icon: Info,
    className:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-900/10 dark:text-indigo-300",
    iconClass:
      "text-indigo-600 dark:text-indigo-400",
  },
};

const ExistingRegistrationAlert = ({
  registration = {},
  status = "",
  registrationUrl = "",
  message = "",
}) => {
  const normalizedStatus = String(
    status ||
      registration.status ||
      ""
  )
    .trim()
    .toLowerCase();

  const config =
    STATUS_CONFIG[
      normalizedStatus
    ] || STATUS_CONFIG.default;

  const Icon = config.icon;

  const registrationId =
    registration.registrationId ||
    registration.registration_id ||
    registration.id ||
    "";

  const eventName =
    registration.eventName ||
    registration.event?.name ||
    registration.event?.title ||
    "";

  const registrationDate =
    registration.createdAt ||
    registration.registeredAt ||
    registration.registrationDate ||
    "";

  const displayMessage =
    message || config.description;

  return (
    <section
      role="alert"
      aria-live="polite"
      className={`w-full rounded-2xl border p-5 ${config.className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/70 dark:bg-slate-900/40">
          <Icon
            size={22}
            className={config.iconClass}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold">
              {config.label}
            </h2>

            <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide dark:bg-slate-900/40">
              Registration Exists
            </span>
          </div>

          <p className="mt-1 text-sm leading-6 opacity-90">
            {displayMessage}
          </p>
        </div>
      </div>

      {/* Registration details */}
      {(registrationId ||
        eventName ||
        registrationDate) && (
        <div className="mt-4 rounded-xl bg-white/60 p-4 dark:bg-slate-900/30">
          <div className="grid gap-3 sm:grid-cols-2">
            {eventName && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide opacity-60">
                  Event
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {eventName}
                </p>
              </div>
            )}

            {registrationId && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide opacity-60">
                  Registration ID
                </p>

                <p className="mt-1 break-all font-mono text-sm font-semibold">
                  {registrationId}
                </p>
              </div>
            )}

            {registrationDate && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide opacity-60">
                  Registered
                </p>

                <p className="mt-1 text-sm font-medium">
                  {formatRegistrationDate(
                    registrationDate
                  )}
                </p>
              </div>
            )}

            {status && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide opacity-60">
                  Status
                </p>

                <p className="mt-1 text-sm font-semibold capitalize">
                  {status}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Existing registration action */}
      {registrationUrl && (
        <a
          href={registrationUrl}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
        >
          <TicketCheck size={16} />
          View Existing Registration
          <ExternalLink
            size={14}
            className="ml-1"
          />
        </a>
      )}

      {/* No registration link fallback */}
      {!registrationUrl && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/50 p-3 text-xs leading-5 dark:bg-slate-900/30">
          <Info
            size={15}
            className="mt-0.5 shrink-0"
          />

          <p>
            A registration for this event already
            exists on your account. Please check your
            dashboard for registration details.
          </p>
        </div>
      )}
    </section>
  );
};

/**
 * Safely format the registration timestamp.
 */
const formatRegistrationDate = (
  value
) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

export default ExistingRegistrationAlert;