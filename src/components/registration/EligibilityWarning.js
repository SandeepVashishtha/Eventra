import {
  AlertTriangle,
  ArrowRight,
  XCircle,
} from "lucide-react";

const EligibilityWarning = ({
  failedRequirements = [],
  title = "Registration eligibility warning",
  description = "You may not meet all of the requirements for this event.",
  onContinue,
  continueLabel = "Continue Anyway",
  showContinueButton = false,
  className = "",
}) => {
  const requirements =
    Array.isArray(failedRequirements)
      ? failedRequirements
      : [];

  return (
    <div
      role="alert"
      className={`mb-5 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
          <AlertTriangle
            size={20}
            className="text-amber-600 dark:text-amber-400"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {/* Failed requirements */}
      {requirements.length > 0 && (
        <div className="border-t border-amber-200/80 px-4 py-4 dark:border-amber-900/40">
          <p className="mb-3 text-xs font-semibold text-amber-800 dark:text-amber-300">
            Requirements that need attention
          </p>

          <div className="space-y-2">
            {requirements.map(
              (requirement, index) => (
                <FailedRequirement
                  key={
                    requirement?.id ||
                    requirement?.label ||
                    index
                  }
                  requirement={
                    requirement
                  }
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Action */}
      {showContinueButton &&
        onContinue && (
          <div className="border-t border-amber-200/80 p-4 dark:border-amber-900/40">
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              {continueLabel}
              <ArrowRight size={14} />
            </button>
          </div>
        )}
    </div>
  );
};

const FailedRequirement = ({
  requirement,
}) => {
  const label =
    requirement?.label ||
    requirement?.title ||
    "Eligibility requirement";

  const description =
    requirement?.message ||
    requirement?.description ||
    "This requirement has not been satisfied.";

  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-white/70 p-3 dark:border-red-900/30 dark:bg-slate-900/40">
      <XCircle
        size={17}
        className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
      />

      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {label}
        </p>

        <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
};

export default EligibilityWarning;