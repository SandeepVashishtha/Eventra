import { useMemo, useState } from "react";
import {
  CheckCircle,
  ClipboardCheck,
  UserCheck,
} from "lucide-react";
import EligibilityResult from "./EligibilityResult";
import {
  checkEventEligibility,
} from "../../utils/eventEligibilityUtils";

const EventEligibilityChecker = ({
  eventRequirements = {},
  initialProfile = {},
  onEligibilityChange,
}) => {
  const [profile, setProfile] =
    useState({
      age: initialProfile.age || "",
      education:
        initialProfile.education || "",
      location:
        initialProfile.location || "",
      skills:
        initialProfile.skills || [],
      teamSize:
        initialProfile.teamSize || "",
      category:
        initialProfile.category || "",
    });

  const [skillInput, setSkillInput] =
    useState("");

  const [hasChecked, setHasChecked] =
    useState(false);

  const eligibilityResult = useMemo(
    () =>
      checkEventEligibility(
        profile,
        eventRequirements
      ),
    [profile, eventRequirements]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setHasChecked(false);
  };

  const handleAddSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;

    const exists = profile.skills.some(
      (item) =>
        item.toLowerCase() ===
        skill.toLowerCase()
    );

    if (!exists) {
      setProfile((previous) => ({
        ...previous,
        skills: [
          ...previous.skills,
          skill,
        ],
      }));
    }

    setSkillInput("");
    setHasChecked(false);
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile((previous) => ({
      ...previous,
      skills: previous.skills.filter(
        (skill) =>
          skill !== skillToRemove
      ),
    }));

    setHasChecked(false);
  };

  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddSkill();
    }
  };

  const handleCheckEligibility = () => {
    setHasChecked(true);

    onEligibilityChange?.(
      eligibilityResult
    );
  };

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <ClipboardCheck
            size={25}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Event Eligibility Checker
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Check whether you meet the participation
            requirements before registering.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="mt-8 space-y-5">
        {/* Age */}
        <FormField label="Age">
          <input
            type="number"
            name="age"
            min="1"
            value={profile.age}
            onChange={handleChange}
            placeholder="Enter your age"
            className={inputClass}
          />
        </FormField>

        {/* Education */}
        <FormField label="Education Level">
          <select
            name="education"
            value={profile.education}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">
              Select education level
            </option>
            <option value="School">
              School
            </option>
            <option value="Student">
              Student
            </option>
            <option value="Graduate">
              Graduate
            </option>
            <option value="Postgraduate">
              Postgraduate
            </option>
            <option value="Professional">
              Professional
            </option>
          </select>
        </FormField>

        {/* Location */}
        <FormField label="Location">
          <input
            type="text"
            name="location"
            value={profile.location}
            onChange={handleChange}
            placeholder="Enter your country or location"
            className={inputClass}
          />
        </FormField>

        {/* Skills */}
        <FormField label="Skills">
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(event) =>
                setSkillInput(
                  event.target.value
                )
              }
              onKeyDown={
                handleSkillKeyDown
              }
              placeholder="Enter a skill"
              className={inputClass}
            />

            <button
              type="button"
              onClick={handleAddSkill}
              className="shrink-0 rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Add
            </button>
          </div>

          {profile.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.skills.map(
                (skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() =>
                      handleRemoveSkill(
                        skill
                      )
                    }
                    className="rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300"
                    title={`Remove ${skill}`}
                  >
                    {skill} ×
                  </button>
                )
              )}
            </div>
          )}
        </FormField>

        {/* Team Size */}
        <FormField label="Team Size">
          <input
            type="number"
            name="teamSize"
            min="1"
            value={profile.teamSize}
            onChange={handleChange}
            placeholder="Number of team members"
            className={inputClass}
          />
        </FormField>

        {/* Participant Category */}
        <FormField label="Participant Category">
          <select
            name="category"
            value={profile.category}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">
              Select participant category
            </option>
            <option value="Student">
              Student
            </option>
            <option value="Professional">
              Professional
            </option>
            <option value="Researcher">
              Researcher
            </option>
            <option value="Educator">
              Educator
            </option>
            <option value="Other">
              Other
            </option>
          </select>
        </FormField>
      </div>

      {/* Check button */}
      <button
        type="button"
        onClick={handleCheckEligibility}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700"
      >
        <UserCheck size={19} />
        Check Eligibility
      </button>

      {/* Result */}
      {hasChecked && (
        <div className="mt-6">
          <EligibilityResult
            result={eligibilityResult}
          />
        </div>
      )}
    </section>
  );
};

const FormField = ({
  label,
  children,
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
    </label>

    {children}
  </div>
);

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

export default EventEligibilityChecker;