import {
  AlertCircle,
  CheckCircle2,
  Info,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_REQUIREMENTS = [
  {
    id: "student-status",
    requirement: "Student Status",
    currentValue: "Active Student",
    requiredValue: "Active Student",
    status: "eligible",
    message: "Your student status meets this requirement.",
  },
  {
    id: "skill",
    requirement: "Required Skill",
    currentValue: "Python",
    requiredValue: "Python",
    status: "eligible",
    message: "Your profile contains the required skill.",
  },
  {
    id: "age",
    requirement: "Age Requirement",
    currentValue: "Not provided",
    requiredValue: "18+",
    status: "update",
    message: "Update your profile with your date of birth.",
  },
  {
    id: "category",
    requirement: "Participant Category",
    currentValue: "Student",
    requiredValue: "Student",
    status: "eligible",
    message: "Your participant category is eligible.",
  },
];

const EventRegistrationEligibilityPreview = ({
  requirements = DEFAULT_REQUIREMENTS,
  eventName = "AI Hackathon 2026",
  onUpdateProfile,
  onContinue,
}) => {
  const summary = useMemo(() => {
    const eligible = requirements.filter(
      (item) => item.status === "eligible"
    ).length;

    const updates = requirements.filter(
      (item) => item.status === "update"
    ).length;

    const ineligible = requirements.filter(
      (item) => item.status === "ineligible"
    ).length;

    const checked = requirements.length;

    const score =
      checked > 0
        ? Math.round((eligible / checked) * 100)
        : 0;

    return {
      eligible,
      updates,
      ineligible,
      checked,
      score,
    };
  }, [requirements]);

  const canContinue =
    summary.ineligible === 0 &&
    summary.updates === 0;

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <ShieldCheck size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Registration Preview
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Eligibility Preview
            </h2>

            <p className="mt-1 max-w-xl text-xs text-slate-500 dark:text-slate-400">
              Check your eligibility before starting the full
              registration form.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Eligibility
          </p>

          <p
            className={`mt-1 text-2xl font-black ${
              summary.ineligible > 0
                ? "text-red-600 dark:text-red-400"
                : summary.updates > 0
                ? "text-amber-600 dark:text-amber-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            {summary.score}%
          </p>
        </div>
      </div>

      {/* Event */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <UserRound size={15} />
          </div>

          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Event
            </p>

            <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
              {eventName}
            </h3>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Eligible"
          value={summary.eligible}
          icon={CheckCircle2}
          type="success"
        />

        <SummaryCard
          label="Needs Update"
          value={summary.updates}
          icon={AlertCircle}
          type="warning"
        />

        <SummaryCard
          label="Not Eligible"
          value={summary.ineligible}
          icon={AlertCircle}
          type="danger"
        />
      </div>

      {/* Requirement List */}
      <div className="mt-6">
        <div className="mb-4">
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Eligibility Requirements
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Your current profile information is compared with
            each event requirement.
          </p>
        </div>

        <div className="space-y-3">
          {requirements.map((item) => (
            <RequirementCard
              key={item.id}
              item={item}
            />
          ))}
        </div>
      </div>

      {/* Update Warning */}
      {summary.updates > 0 && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
            />

            <div className="flex-1">
              <h4 className="text-[8px] font-bold text-amber-700 dark:text-amber-400">
                Profile information needs updating
              </h4>

              <p className="mt-1 text-[7px] leading-4 text-amber-600 dark:text-amber-500">
                Some eligibility requirements cannot be
                verified with your current profile information.
              </p>

              <button
                type="button"
                onClick={onUpdateProfile}
                className="mt-3 rounded-xl bg-amber-600 px-4 py-2.5 text-[7px] font-bold text-white transition hover:bg-amber-700"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ineligible Warning */}
      {summary.ineligible > 0 && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
            />

            <div>
              <h4 className="text-[8px] font-bold text-red-700 dark:text-red-400">
                You may not be eligible
              </h4>

              <p className="mt-1 text-[7px] leading-4 text-red-600 dark:text-red-500">
                One or more event requirements are not currently
                satisfied.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <Info
          size={16}
          className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
        />

        <p className="text-[7px] leading-4 text-indigo-600 dark:text-indigo-400">
          Eligibility preview is based on the information
          currently available in your profile. Final eligibility
          may be verified during registration.
        </p>
      </div>

      {/* Continue */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => onContinue?.(requirements)}
          disabled={!canContinue}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[8px] font-bold transition ${
            canContinue
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
          }`}
        >
          {canContinue ? (
            <>
              <CheckCircle2 size={14} />
              Continue to Registration
            </>
          ) : (
            <>
              <AlertCircle size={14} />
              Resolve Eligibility Issues
            </>
          )}
        </button>
      </div>
    </section>
  );
};

/* --------------------------------
   Summary Card
--------------------------------- */

const SummaryCard = ({
  label,
  value,
  icon: Icon,
  type,
}) => {
  const styles = {
    success:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    warning:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    danger:
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles[type]}`}
        >
          <Icon size={15} />
        </div>

        <div>
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Requirement Card
--------------------------------- */

const RequirementCard = ({ item }) => {
  const isEligible = item.status === "eligible";
  const needsUpdate = item.status === "update";
  const isIneligible = item.status === "ineligible";

  const statusStyles = isEligible
    ? {
        wrapper:
          "border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10",
        icon:
          "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        title:
          "text-green-700 dark:text-green-400",
        badge:
          "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      }
    : isIneligible
    ? {
        wrapper:
          "border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10",
        icon:
          "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
        title:
          "text-red-700 dark:text-red-400",
        badge:
          "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
      }
    : {
        wrapper:
          "border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10",
        icon:
          "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
        title:
          "text-amber-700 dark:text-amber-400",
        badge:
          "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
      };

  return (
    <div
      className={`rounded-2xl border p-4 ${statusStyles.wrapper}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${statusStyles.icon}`}
        >
          {isEligible ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              className={`text-[8px] font-bold ${statusStyles.title}`}
            >
              {item.requirement}
            </h4>

            <span
              className={`rounded-full px-2 py-1 text-[5px] font-bold ${statusStyles.badge}`}
            >
              {isEligible
                ? "Eligible"
                : isIneligible
                ? "Not Eligible"
                : "Update Profile"}
            </span>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
                Your Information
              </p>

              <p className="mt-1 text-[7px] font-semibold text-slate-700 dark:text-slate-300">
                {item.currentValue || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
                Required
              </p>

              <p className="mt-1 text-[7px] font-semibold text-slate-700 dark:text-slate-300">
                {item.requiredValue || "Not specified"}
              </p>
            </div>
          </div>

          <p className="mt-3 text-[6px] leading-4 text-slate-500 dark:text-slate-400">
            {item.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationEligibilityPreview;