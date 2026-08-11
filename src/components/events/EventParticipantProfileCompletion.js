import {
  Check,
  ChevronRight,
  CircleUserRound,
  GraduationCap,
  Mail,
  UserRound,
  Wrench,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_PROFILE = {
  photo: "",
  bio: "",
  skills: [],
  education: "",
  contact: "",
};

const PROFILE_FIELDS = [
  {
    key: "photo",
    label: "Profile photo",
    description: "Add a profile photo",
    icon: CircleUserRound,
  },
  {
    key: "bio",
    label: "Bio",
    description: "Add a short introduction",
    icon: UserRound,
  },
  {
    key: "skills",
    label: "Skills",
    description: "Add your skills and interests",
    icon: Wrench,
  },
  {
    key: "education",
    label: "Education",
    description: "Add your education details",
    icon: GraduationCap,
  },
  {
    key: "contact",
    label: "Contact information",
    description: "Add your contact information",
    icon: Mail,
  },
];

const EventParticipantProfileCompletion = ({
  profile = DEFAULT_PROFILE,
  onCompleteProfile,
  onFieldClick,
  className = "",
}) => {
  const normalizedProfile = {
    ...DEFAULT_PROFILE,
    ...profile,
  };

  const completion = useMemo(() => {
    const completedFields =
      PROFILE_FIELDS.filter((field) =>
        isFieldComplete(
          normalizedProfile[field.key]
        )
      );

    const percentage = Math.round(
      (completedFields.length /
        PROFILE_FIELDS.length) *
        100
    );

    return {
      completedFields,
      percentage,
      missingFields:
        PROFILE_FIELDS.filter(
          (field) =>
            !isFieldComplete(
              normalizedProfile[field.key]
            )
        ),
    };
  }, [profile]);

  const getStatus = () => {
    if (completion.percentage === 100) {
      return {
        label: "Profile Complete",
        text:
          "Your profile is ready for event registration.",
        className:
          "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      };
    }

    if (completion.percentage >= 80) {
      return {
        label: "Almost Complete",
        text:
          "Complete the remaining information before registering.",
        className:
          "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
      };
    }

    if (completion.percentage >= 50) {
      return {
        label: "Partially Complete",
        text:
          "Add the missing information to improve your profile.",
        className:
          "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
      };
    }

    return {
      label: "Profile Incomplete",
      text:
        "Complete your profile to avoid missing registration information.",
      className:
        "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    };
  };

  const status = getStatus();

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <CircleUserRound
            size={21}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Registration Readiness
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Complete Your Profile
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Make sure your participant profile has the
            information required for a smooth event
            registration.
          </p>
        </div>
      </div>

      {/* Completion summary */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Profile Completion
            </p>

            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              {completion.percentage}%
            </p>
          </div>

          <div
            className={`rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide ${status.className}`}
          >
            {status.label}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completion.percentage === 100
                ? "bg-green-500"
                : completion.percentage >= 80
                ? "bg-indigo-500"
                : completion.percentage >= 50
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
            style={{
              width: `${completion.percentage}%`,
            }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-[9px] text-slate-400">
            {completion.completedFields.length} of{" "}
            {PROFILE_FIELDS.length} sections completed
          </p>

          {completion.percentage === 100 && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-green-600 dark:text-green-400">
              <Check size={11} />
              Ready
            </span>
          )}
        </div>
      </div>

      {/* Status message */}
      <div
        className={`mt-4 rounded-xl p-3 ${status.className}`}
      >
        <p className="text-[10px] font-bold">
          {status.label}
        </p>

        <p className="mt-1 text-[10px] leading-4 opacity-80">
          {status.text}
        </p>
      </div>

      {/* Missing information */}
      {completion.missingFields.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Missing Information
              </h3>

              <p className="mt-1 text-[10px] text-slate-400">
                Complete these fields before registration.
              </p>
            </div>

            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[9px] font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {completion.missingFields.length} missing
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {completion.missingFields.map(
              (field) => {
                const Icon = field.icon;

                return (
                  <button
                    key={field.key}
                    type="button"
                    onClick={() =>
                      onFieldClick?.(
                        field.key
                      )
                    }
                    className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800 dark:hover:bg-indigo-900/10"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <Icon size={15} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {field.label}
                      </p>

                      <p className="mt-0.5 text-[9px] text-slate-400">
                        {field.description}
                      </p>
                    </div>

                    <ChevronRight
                      size={15}
                      className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500"
                    />
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Completed information */}
      {completion.completedFields.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Completed Information
          </h3>

          <div className="mt-3 space-y-2">
            {completion.completedFields.map(
              (field) => {
                const Icon = field.icon;

                return (
                  <div
                    key={field.key}
                    className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-3 dark:border-green-900/30 dark:bg-green-900/10"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <Check size={14} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                        {field.label}
                      </p>
                    </div>

                    <Icon
                      size={14}
                      className="text-green-500"
                    />
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* Complete profile button */}
      {completion.percentage < 100 && (
        <button
          type="button"
          onClick={() =>
            onCompleteProfile?.(
              completion.missingFields.map(
                (field) => field.key
              )
            )
          }
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
        >
          Complete Missing Information
          <ChevronRight size={14} />
        </button>
      )}

      {/* Ready message */}
      {completion.percentage === 100 && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-900/10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <Check size={17} />
          </div>

          <div>
            <p className="text-xs font-bold text-green-700 dark:text-green-400">
              Your profile is ready!
            </p>

            <p className="mt-1 text-[9px] text-green-600 dark:text-green-500">
              You have completed all required profile
              information for event registration.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

/* ----------------------------------
   Field completion helper
----------------------------------- */

const isFieldComplete = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return true;
  }

  if (value === null || value === undefined) {
    return false;
  }

  return String(value).trim().length > 0;
};

export default EventParticipantProfileCompletion;