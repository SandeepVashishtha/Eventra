import React, { useState } from "react";

interface EligibilityRequirements {
  minimumAge?: number;
  maximumAge?: number;
  experienceLevel?: string;
  studentOnly?: boolean;
  allowedLocations?: string[];
  requiredSkills?: string[];
}

interface UserEligibilityData {
  age: string;
  experienceLevel: string;
  isStudent: boolean;
  location: string;
  skills: string;
}

interface EligibilityResult {
  eligible: boolean;
  failedRequirements: string[];
}

interface EventEligibilityCheckerProps {
  eventName: string;
  requirements?: EligibilityRequirements;
}

const EventEligibilityChecker: React.FC<
  EventEligibilityCheckerProps
> = ({
  eventName,
  requirements = {},
}) => {
  const [userData, setUserData] =
    useState<UserEligibilityData>({
      age: "",
      experienceLevel: "",
      isStudent: false,
      location: "",
      skills: "",
    });

  const [result, setResult] =
    useState<EligibilityResult | null>(null);

  const [showChecker, setShowChecker] =
    useState(false);

  const [error, setError] = useState("");

  /*
   * Update form fields.
   */
  const handleChange = (
    field: keyof UserEligibilityData,
    value: string | boolean
  ) => {
    setUserData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setResult(null);
    setError("");
  };

  /*
   * Check all eligibility requirements.
   */
  const checkEligibility = () => {
    const failedRequirements: string[] = [];

    /*
     * Validate age.
     */
    const age = Number(userData.age);

    if (
      requirements.minimumAge !== undefined &&
      (!userData.age ||
        Number.isNaN(age) ||
        age < requirements.minimumAge)
    ) {
      failedRequirements.push(
        `You must be at least ${requirements.minimumAge} years old.`
      );
    }

    if (
      requirements.maximumAge !== undefined &&
      userData.age &&
      !Number.isNaN(age) &&
      age > requirements.maximumAge
    ) {
      failedRequirements.push(
        `You must be ${requirements.maximumAge} years old or younger.`
      );
    }

    /*
     * Experience requirement.
     */
    if (
      requirements.experienceLevel &&
      userData.experienceLevel
    ) {
      const required =
        requirements.experienceLevel.toLowerCase();

      const current =
        userData.experienceLevel.toLowerCase();

      const levels = [
        "beginner",
        "intermediate",
        "advanced",
        "expert",
      ];

      const requiredIndex = levels.indexOf(required);
      const currentIndex = levels.indexOf(current);

      if (
        requiredIndex !== -1 &&
        currentIndex !== -1 &&
        currentIndex < requiredIndex
      ) {
        failedRequirements.push(
          `This event requires ${requirements.experienceLevel} experience level.`
        );
      }
    }

    /*
     * Student requirement.
     */
    if (
      requirements.studentOnly &&
      !userData.isStudent
    ) {
      failedRequirements.push(
        "This event is available only to students."
      );
    }

    /*
     * Location requirement.
     */
    if (
      requirements.allowedLocations &&
      requirements.allowedLocations.length > 0
    ) {
      const userLocation =
        userData.location.trim().toLowerCase();

      const locationMatches =
        requirements.allowedLocations.some(
          (location) =>
            location.toLowerCase() === userLocation
        );

      if (!locationMatches) {
        failedRequirements.push(
          `This event is available only in: ${requirements.allowedLocations.join(
            ", "
          )}.`
        );
      }
    }

    /*
     * Required skills.
     */
    if (
      requirements.requiredSkills &&
      requirements.requiredSkills.length > 0
    ) {
      const userSkills = userData.skills
        .split(",")
        .map((skill) => skill.trim().toLowerCase())
        .filter(Boolean);

      const missingSkills =
        requirements.requiredSkills.filter(
          (requiredSkill) =>
            !userSkills.includes(
              requiredSkill.toLowerCase()
            )
        );

      if (missingSkills.length > 0) {
        failedRequirements.push(
          `Required skills missing: ${missingSkills.join(
            ", "
          )}.`
        );
      }
    }

    setResult({
      eligible: failedRequirements.length === 0,
      failedRequirements,
    });
  };

  /*
   * Reset the checker.
   */
  const resetChecker = () => {
    setUserData({
      age: "",
      experienceLevel: "",
      isStudent: false,
      location: "",
      skills: "",
    });

    setResult(null);
    setError("");
  };

  /*
   * Display requirement value.
   */
  const renderRequirements = () => {
    const hasRequirements =
      requirements.minimumAge !== undefined ||
      requirements.maximumAge !== undefined ||
      requirements.experienceLevel ||
      requirements.studentOnly ||
      (requirements.allowedLocations &&
        requirements.allowedLocations.length > 0) ||
      (requirements.requiredSkills &&
        requirements.requiredSkills.length > 0);

    if (!hasRequirements) {
      return (
        <div className="rounded-xl bg-gray-50 p-5 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No specific eligibility requirements have been
            provided for this event.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {requirements.minimumAge !== undefined && (
          <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <span className="text-lg">🎂</span>

            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Minimum Age
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {requirements.minimumAge} years
              </p>
            </div>
          </div>
        )}

        {requirements.maximumAge !== undefined && (
          <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <span className="text-lg">🎂</span>

            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Maximum Age
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {requirements.maximumAge} years
              </p>
            </div>
          </div>
        )}

        {requirements.experienceLevel && (
          <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <span className="text-lg">📈</span>

            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Experience Level
              </p>

              <p className="mt-1 capitalize text-sm text-gray-500 dark:text-gray-400">
                {requirements.experienceLevel}
              </p>
            </div>
          </div>
        )}

        {requirements.studentOnly && (
          <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <span className="text-lg">🎓</span>

            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Student Status
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Only students are eligible.
              </p>
            </div>
          </div>
        )}

        {requirements.allowedLocations &&
          requirements.allowedLocations.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
              <span className="text-lg">📍</span>

              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Eligible Locations
                </p>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {requirements.allowedLocations.join(
                    ", "
                  )}
                </p>
              </div>
            </div>
          )}

        {requirements.requiredSkills &&
          requirements.requiredSkills.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
              <span className="text-lg">🛠️</span>

              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Required Skills
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {requirements.requiredSkills.map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
      </div>
    );
  };

  return (
    <section className="w-full space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
            ✓
          </div>

          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Event Eligibility
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              Check Your Eligibility
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Check whether you meet the requirements before
              registering for <strong>{eventName}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          REQUIREMENTS
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Eligibility Requirements
          </h3>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review the requirements before checking your
            eligibility.
          </p>
        </div>

        {renderRequirements()}
      </div>

      {/* =====================================================
          CHECK ELIGIBILITY BUTTON
      ====================================================== */}
      {!showChecker && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                Ready to check?
              </h3>

              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                Provide a few details to see whether you appear
                eligible.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowChecker(true)}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Check Eligibility
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          ELIGIBILITY FORM
      ====================================================== */}
      {showChecker && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Information
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Enter the information required to perform the
              eligibility check.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Age */}
            {(requirements.minimumAge !== undefined ||
              requirements.maximumAge !== undefined) && (
              <div>
                <label
                  htmlFor="eligibility-age"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Age
                </label>

                <input
                  id="eligibility-age"
                  type="number"
                  min="1"
                  max="120"
                  value={userData.age}
                  onChange={(event) =>
                    handleChange(
                      "age",
                      event.target.value
                    )
                  }
                  placeholder="Enter your age"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            )}

            {/* Experience */}
            {requirements.experienceLevel && (
              <div>
                <label
                  htmlFor="eligibility-experience"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Experience Level
                </label>

                <select
                  id="eligibility-experience"
                  value={userData.experienceLevel}
                  onChange={(event) =>
                    handleChange(
                      "experienceLevel",
                      event.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">
                    Select experience level
                  </option>

                  <option value="beginner">
                    Beginner
                  </option>

                  <option value="intermediate">
                    Intermediate
                  </option>

                  <option value="advanced">
                    Advanced
                  </option>

                  <option value="expert">
                    Expert
                  </option>
                </select>
              </div>
            )}

            {/* Location */}
            {requirements.allowedLocations &&
              requirements.allowedLocations.length > 0 && (
                <div>
                  <label
                    htmlFor="eligibility-location"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Location
                  </label>

                  <select
                    id="eligibility-location"
                    value={userData.location}
                    onChange={(event) =>
                      handleChange(
                        "location",
                        event.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">
                      Select your location
                    </option>

                    {requirements.allowedLocations.map(
                      (location) => (
                        <option
                          key={location}
                          value={location}
                        >
                          {location}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

            {/* Skills */}
            {requirements.requiredSkills &&
              requirements.requiredSkills.length > 0 && (
                <div>
                  <label
                    htmlFor="eligibility-skills"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Your Skills
                  </label>

                  <input
                    id="eligibility-skills"
                    type="text"
                    value={userData.skills}
                    onChange={(event) =>
                      handleChange(
                        "skills",
                        event.target.value
                      )
                    }
                    placeholder="e.g. React, Python, Java"
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Separate multiple skills with commas.
                  </p>
                </div>
              )}
          </div>

          {/* Student checkbox */}
          {requirements.studentOnly && (
            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <input
                type="checkbox"
                checked={userData.isStudent}
                onChange={(event) =>
                  handleChange(
                    "isStudent",
                    event.target.checked
                  )
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />

              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  I am currently a student
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This event requires student status.
                </p>
              </div>
            </label>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetChecker}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={checkEligibility}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Check Eligibility
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          RESULT
      ====================================================== */}
      {result && (
        <div
          className={`rounded-2xl border p-6 shadow-sm ${
            result.eligible
              ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
              : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl ${
                result.eligible
                  ? "bg-green-100 dark:bg-green-900"
                  : "bg-red-100 dark:bg-red-900"
              }`}
            >
              {result.eligible ? "✓" : "!"}
            </div>

            <div className="flex-1">
              <h3
                className={`text-xl font-bold ${
                  result.eligible
                    ? "text-green-800 dark:text-green-300"
                    : "text-red-800 dark:text-red-300"
                }`}
              >
                {result.eligible
                  ? "You Appear Eligible"
                  : "Eligibility Requirements Not Met"}
              </h3>

              {result.eligible ? (
                <>
                  <p className="mt-2 text-sm leading-6 text-green-700 dark:text-green-400">
                    Based on the information you provided, you
                    appear to meet the listed eligibility
                    requirements for this event.
                  </p>

                  <div className="mt-4 rounded-xl bg-white/70 p-4 dark:bg-gray-900/50">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Important
                    </p>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      This is only a preliminary eligibility
                      check. The final eligibility decision may
                      be made by the event organizer if manual
                      verification is required.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-400">
                    Based on the information you provided, one
                    or more requirements may not be satisfied.
                  </p>

                  <div className="mt-4 space-y-2">
                    {result.failedRequirements.map(
                      (requirement, index) => (
                        <div
                          key={`${requirement}-${index}`}
                          className="flex items-start gap-2 rounded-lg bg-white/70 p-3 dark:bg-gray-900/50"
                        >
                          <span className="text-red-500">
                            ✕
                          </span>

                          <p className="text-sm text-red-700 dark:text-red-300">
                            {requirement}
                          </p>
                        </div>
                      )
                    )}
                  </div>

                  <p className="mt-4 text-xs leading-5 text-red-600 dark:text-red-400">
                    You can still view the event information.
                    This checker does not block access to the
                    event or make the final registration
                    decision.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ORGANIZER NOTICE
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <span className="text-xl">ℹ️</span>

          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Eligibility Verification Notice
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              The eligibility checker provides an initial
              assessment based on the information entered by the
              participant. When an event requires manual
              verification, the organizer retains the final
              eligibility decision.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventEligibilityChecker;