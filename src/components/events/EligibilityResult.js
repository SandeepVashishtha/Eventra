import {
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  getEligibilityMessage,
} from "../../utils/eventEligibilityUtils";

const EligibilityResult = ({ result }) => {
  if (!result) return null;

  const isEligible = result.eligible;

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isEligible
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
          : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
      }`}
      role="status"
      aria-live="polite"
    >
      {/* Result header */}
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            isEligible
              ? "bg-green-100 dark:bg-green-900/40"
              : "bg-red-100 dark:bg-red-900/40"
          }`}
        >
          {isEligible ? (
            <CheckCircle
              size={25}
              className="text-green-600 dark:text-green-400"
            />
          ) : (
            <XCircle
              size={25}
              className="text-red-600 dark:text-red-400"
            />
          )}
        </div>

        <div>
          <h3
            className={`text-lg font-bold ${
              isEligible
                ? "text-green-800 dark:text-green-300"
                : "text-red-800 dark:text-red-300"
            }`}
          >
            {isEligible
              ? "Eligible"
              : "Not Eligible"}
          </h3>

          <p
            className={`mt-1 text-sm ${
              isEligible
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {getEligibilityMessage(result)}
          </p>
        </div>
      </div>

      {/* Requirement results */}
      {result.results &&
        Object.keys(result.results).length > 0 && (
          <div className="mt-5 space-y-2">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Requirement Check
            </h4>

            {Object.entries(
              result.results
            ).map(
              ([requirement, check]) => (
                <RequirementRow
                  key={requirement}
                  requirement={requirement}
                  check={check}
                />
              )
            )}
          </div>
        )}

      {/* Failed requirements */}
      {!isEligible &&
        result.failedRequirements?.length >
          0 && (
          <div className="mt-5 rounded-xl border border-red-200 bg-white/70 p-4 dark:border-red-800 dark:bg-slate-900/40">
            <div className="flex items-center gap-2">
              <AlertCircle
                size={18}
                className="text-red-600 dark:text-red-400"
              />

              <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">
                Requirements Not Met
              </h4>
            </div>

            <ul className="mt-3 space-y-2">
              {result.failedRequirements.map(
                (item) => (
                  <li
                    key={item.requirement}
                    className="text-sm text-red-700 dark:text-red-400"
                  >
                    <span className="font-semibold capitalize">
                      {formatRequirementName(
                        item.requirement
                      )}
                      :
                    </span>{" "}
                    {item.reason}
                  </li>
                )
              )}
            </ul>
          </div>
        )}
    </div>
  );
};

const RequirementRow = ({
  requirement,
  check,
}) => {
  const passed = check?.eligible;

  return (
    <div className="flex items-start gap-3 rounded-xl bg-white/70 px-4 py-3 dark:bg-slate-900/40">
      {passed ? (
        <CheckCircle
          size={18}
          className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
        />
      ) : (
        <XCircle
          size={18}
          className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
        />
      )}

      <div className="min-w-0">
        <p className="text-sm font-semibold capitalize text-slate-800 dark:text-white">
          {formatRequirementName(
            requirement
          )}
        </p>

        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {check?.reason ||
            "No additional information available."}
        </p>

        {check?.missingSkills?.length >
          0 && (
          <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
            Missing:{" "}
            {check.missingSkills.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
};

const formatRequirementName = (
  requirement
) => {
  const names = {
    age: "Age",
    education: "Education",
    location: "Location",
    skills: "Required Skills",
    team: "Team Requirement",
    category: "Participant Category",
  };

  return (
    names[requirement] ||
    requirement
  );
};

export default EligibilityResult;