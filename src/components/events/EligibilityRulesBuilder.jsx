import {
  Check,
  ChevronDown,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const RULE_TYPES = [
  {
    value: "age",
    label: "Age Range",
  },
  {
    value: "status",
    label: "Student / Professional Status",
  },
  {
    value: "location",
    label: "Location",
  },
  {
    value: "skills",
    label: "Required Skills",
  },
  {
    value: "teamSize",
    label: "Team Size",
  },
  {
    value: "experience",
    label: "Experience Level",
  },
  {
    value: "custom",
    label: "Custom Condition",
  },
];

const STATUS_OPTIONS = [
  "Student",
  "Professional",
  "Both",
];

const EXPERIENCE_OPTIONS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];

const createRule = (type) => ({
  id: `${type}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`,
  type,
  enabled: true,
  minAge: 18,
  maxAge: 60,
  status: "Both",
  location: "",
  skills: [],
  teamMin: 1,
  teamMax: 5,
  experience: "Beginner",
  field: "",
  operator: "equals",
  value: "",
});

const EligibilityRulesBuilder = ({
  initialRules = [],
  onSave,
  className = "",
}) => {
  const [rules, setRules] = useState(
    initialRules
  );

  const [selectedType, setSelectedType] =
    useState("age");

  const [skillInput, setSkillInput] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const enabledRules = useMemo(
    () =>
      rules.filter(
        (rule) => rule.enabled
      ),
    [rules]
  );

  const addRule = () => {
    const exists = rules.some(
      (rule) =>
        rule.type === selectedType &&
        selectedType !== "custom"
    );

    if (exists) {
      setMessage(
        "This eligibility rule has already been added."
      );
      return;
    }

    setRules((current) => [
      ...current,
      createRule(selectedType),
    ]);

    setMessage("");
  };

  const updateRule = (
    ruleId,
    changes
  ) => {
    setRules((current) =>
      current.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              ...changes,
            }
          : rule
      )
    );
  };

  const removeRule = (ruleId) => {
    setRules((current) =>
      current.filter(
        (rule) => rule.id !== ruleId
      )
    );

    setMessage("");
  };

  const toggleRule = (ruleId) => {
    setRules((current) =>
      current.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              enabled: !rule.enabled,
            }
          : rule
      )
    );
  };

  const addSkill = (rule) => {
    const skill =
      skillInput.trim();

    if (!skill) {
      return;
    }

    if (
      rule.skills.some(
        (item) =>
          item.toLowerCase() ===
          skill.toLowerCase()
      )
    ) {
      setSkillInput("");
      return;
    }

    updateRule(rule.id, {
      skills: [
        ...rule.skills,
        skill,
      ],
    });

    setSkillInput("");
  };

  const removeSkill = (
    rule,
    skill
  ) => {
    updateRule(rule.id, {
      skills: rule.skills.filter(
        (item) => item !== skill
      ),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      await onSave?.(enabledRules);

      setMessage(
        "Eligibility rules saved successfully."
      );
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to save eligibility rules."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Event Registration
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            Eligibility Rules Builder
          </h2>

          <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
            Define the participation requirements that
            applicants must meet before registering.
          </p>
        </div>

        <div className="rounded-xl bg-white px-4 py-2 text-center shadow-sm dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wider text-slate-400">
            Active Rules
          </p>

          <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
            {enabledRules.length}
          </p>
        </div>
      </div>

      {/* Rule selector */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
              Add Eligibility Rule
            </label>

            <div className="relative mt-2">
              <select
                value={selectedType}
                onChange={(event) =>
                  setSelectedType(
                    event.target.value
                  )
                }
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {RULE_TYPES.map(
                  (type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={addRule}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white transition hover:bg-indigo-700"
          >
            <Plus size={14} />
            Add Rule
          </button>
        </div>
      </div>

      {/* Rules */}
      <div className="mt-6 space-y-4">
        {rules.length === 0 ? (
          <EmptyState />
        ) : (
          rules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              skillInput={skillInput}
              setSkillInput={
                setSkillInput
              }
              onUpdate={
                updateRule
              }
              onRemove={
                removeRule
              }
              onToggle={
                toggleRule
              }
              onAddSkill={
                addSkill
              }
              onRemoveSkill={
                removeSkill
              }
            />
          ))
        )}
      </div>

      {/* Participant Preview */}
      <EligibilityPreview
        rules={enabledRules}
      />

      {/* Save */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {message && (
            <p className="flex items-center gap-2 text-[8px] font-semibold text-green-600 dark:text-green-400">
              <Check size={13} />
              {message}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save size={14} />

          {saving
            ? "Saving..."
            : "Save Eligibility Rules"}
        </button>
      </div>
    </section>
  );
};

/* --------------------------------
   Rule Card
--------------------------------- */

const RuleCard = ({
  rule,
  skillInput,
  setSkillInput,
  onUpdate,
  onRemove,
  onToggle,
  onAddSkill,
  onRemoveSkill,
}) => {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 transition dark:bg-slate-900 ${
        rule.enabled
          ? "border-slate-200 dark:border-slate-700"
          : "border-slate-200 opacity-60 dark:border-slate-700"
      }`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold text-slate-800 dark:text-white">
            {getRuleLabel(
              rule.type
            )}
          </p>

          <p className="mt-1 text-[7px] text-slate-400">
            {getRuleDescription(
              rule.type
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onToggle(rule.id)
            }
            className={`relative h-6 w-11 rounded-full transition ${
              rule.enabled
                ? "bg-indigo-600"
                : "bg-slate-300 dark:bg-slate-700"
            }`}
            aria-label={
              rule.enabled
                ? "Disable rule"
                : "Enable rule"
            }
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                rule.enabled
                  ? "left-6"
                  : "left-1"
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() =>
              onRemove(rule.id)
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/10"
            aria-label="Remove rule"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="mt-5">
        {rule.type === "age" && (
          <AgeRule
            rule={rule}
            onUpdate={onUpdate}
          />
        )}

        {rule.type === "status" && (
          <StatusRule
            rule={rule}
            onUpdate={onUpdate}
          />
        )}

        {rule.type ===
          "location" && (
          <LocationRule
            rule={rule}
            onUpdate={onUpdate}
          />
        )}

        {rule.type === "skills" && (
          <SkillsRule
            rule={rule}
            skillInput={skillInput}
            setSkillInput={
              setSkillInput
            }
            onUpdate={onUpdate}
            onAddSkill={onAddSkill}
            onRemoveSkill={
              onRemoveSkill
            }
          />
        )}

        {rule.type ===
          "teamSize" && (
          <TeamSizeRule
            rule={rule}
            onUpdate={onUpdate}
          />
        )}

        {rule.type ===
          "experience" && (
          <ExperienceRule
            rule={rule}
            onUpdate={onUpdate}
          />
        )}

        {rule.type ===
          "custom" && (
          <CustomRule
            rule={rule}
            onUpdate={onUpdate}
          />
        )}
      </div>
    </div>
  );
};

/* --------------------------------
   Age Rule
--------------------------------- */

const AgeRule = ({
  rule,
  onUpdate,
}) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <NumberField
        label="Minimum Age"
        value={rule.minAge}
        min={0}
        max={120}
        onChange={(value) =>
          onUpdate(rule.id, {
            minAge: value,
          })
        }
      />

      <NumberField
        label="Maximum Age"
        value={rule.maxAge}
        min={0}
        max={120}
        onChange={(value) =>
          onUpdate(rule.id, {
            maxAge: value,
          })
        }
      />
    </div>
  );
};

/* --------------------------------
   Status Rule
--------------------------------- */

const StatusRule = ({
  rule,
  onUpdate,
}) => {
  return (
    <SelectField
      label="Participant Status"
      value={rule.status}
      options={STATUS_OPTIONS}
      onChange={(value) =>
        onUpdate(rule.id, {
          status: value,
        })
      }
    />
  );
};

/* --------------------------------
   Location Rule
--------------------------------- */

const LocationRule = ({
  rule,
  onUpdate,
}) => {
  return (
    <TextField
      label="Allowed Location"
      value={rule.location}
      placeholder="e.g. India, Gujarat, Rajkot"
      onChange={(value) =>
        onUpdate(rule.id, {
          location: value,
        })
      }
    />
  );
};

/* --------------------------------
   Skills Rule
--------------------------------- */

const SkillsRule = ({
  rule,
  skillInput,
  setSkillInput,
  onUpdate,
  onAddSkill,
  onRemoveSkill,
}) => {
  return (
    <div>
      <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
        Required Skills
      </label>

      <div className="mt-2 flex gap-2">
        <input
          value={skillInput}
          onChange={(event) =>
            setSkillInput(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter"
            ) {
              event.preventDefault();
              onAddSkill(rule);
            }
          }}
          placeholder="e.g. Python"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />

        <button
          type="button"
          onClick={() =>
            onAddSkill(rule)
          }
          className="rounded-xl bg-indigo-600 px-4 text-white hover:bg-indigo-700"
        >
          <Plus size={14} />
        </button>
      </div>

      {rule.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {rule.skills.map(
            (skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-[7px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
              >
                {skill}

                <button
                  type="button"
                  onClick={() =>
                    onRemoveSkill(
                      rule,
                      skill
                    )
                  }
                >
                  <X size={11} />
                </button>
              </span>
            )
          )}
        </div>
      )}

      <p className="mt-2 text-[7px] text-slate-400">
        Add all skills that participants must have.
      </p>
    </div>
  );
};

/* --------------------------------
   Team Size
--------------------------------- */

const TeamSizeRule = ({
  rule,
  onUpdate,
}) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <NumberField
        label="Minimum Team Size"
        value={rule.teamMin}
        min={1}
        max={100}
        onChange={(value) =>
          onUpdate(rule.id, {
            teamMin: value,
          })
        }
      />

      <NumberField
        label="Maximum Team Size"
        value={rule.teamMax}
        min={1}
        max={100}
        onChange={(value) =>
          onUpdate(rule.id, {
            teamMax: value,
          })
        }
      />
    </div>
  );
};

/* --------------------------------
   Experience
--------------------------------- */

const ExperienceRule = ({
  rule,
  onUpdate,
}) => {
  return (
    <SelectField
      label="Required Experience Level"
      value={rule.experience}
      options={EXPERIENCE_OPTIONS}
      onChange={(value) =>
        onUpdate(rule.id, {
          experience: value,
        })
      }
    />
  );
};

/* --------------------------------
   Custom Rule
--------------------------------- */

const CustomRule = ({
  rule,
  onUpdate,
}) => {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <TextField
        label="Field"
        value={rule.field}
        placeholder="e.g. Department"
        onChange={(value) =>
          onUpdate(rule.id, {
            field: value,
          })
        }
      />

      <SelectField
        label="Condition"
        value={rule.operator}
        options={[
          "equals",
          "not equals",
          "contains",
          "greater than",
          "less than",
        ]}
        onChange={(value) =>
          onUpdate(rule.id, {
            operator: value,
          })
        }
      />

      <TextField
        label="Value"
        value={rule.value}
        placeholder="Enter required value"
        onChange={(value) =>
          onUpdate(rule.id, {
            value,
          })
        }
      />
    </div>
  );
};

/* --------------------------------
   Preview
--------------------------------- */

const EligibilityPreview = ({
  rules,
}) => {
  if (rules.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          <Check size={15} />
        </div>

        <div>
          <p className="text-[9px] font-bold text-indigo-700 dark:text-indigo-400">
            Participant-Facing Eligibility
          </p>

          <p className="mt-1 text-[7px] leading-4 text-indigo-700/70 dark:text-indigo-400/70">
            These requirements can be displayed before a
            participant starts registration.
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {rules.map((rule) => (
          <li
            key={rule.id}
            className="flex items-start gap-2 text-[8px] font-semibold text-indigo-800 dark:text-indigo-300"
          >
            <Check
              size={12}
              className="mt-0.5 shrink-0"
            />

            <span>
              {getRuleSummary(rule)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* --------------------------------
   Form Components
--------------------------------- */

const TextField = ({
  label,
  value,
  placeholder,
  onChange,
}) => {
  return (
    <div>
      <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />
    </div>
  );
};

const NumberField = ({
  label,
  value,
  min,
  max,
  onChange,
}) => {
  return (
    <div>
      <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) =>
          onChange(
            Number(event.target.value)
          )
        }
        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />
    </div>
  );
};

const SelectField = ({
  label,
  value,
  options,
  onChange,
}) => {
  return (
    <div>
      <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="relative mt-2">
        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          {options.map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            )
          )}
        </select>

        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = () => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
      <Plus
        size={26}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-300">
        No eligibility rules added
      </p>

      <p className="mx-auto mt-1 max-w-sm text-[7px] leading-4 text-slate-400">
        Select a rule type above and click Add Rule to define
        participation requirements.
      </p>
    </div>
  );
};

/* --------------------------------
   Helpers
--------------------------------- */

const getRuleLabel = (
  type
) => {
  return (
    RULE_TYPES.find(
      (rule) =>
        rule.value === type
    )?.label || "Eligibility Rule"
  );
};

const getRuleDescription = (
  type
) => {
  const descriptions = {
    age: "Restrict registrations based on participant age.",
    status:
      "Specify whether students, professionals, or both can participate.",
    location:
      "Restrict participation to a specific location.",
    skills:
      "Require participants to have specific skills.",
    teamSize:
      "Define minimum and maximum team size.",
    experience:
      "Set the minimum required experience level.",
    custom:
      "Create a custom eligibility condition.",
  };

  return (
    descriptions[type] ||
    "Configure an eligibility requirement."
  );
};

const getRuleSummary = (
  rule
) => {
  switch (rule.type) {
    case "age":
      return `Participants must be between ${rule.minAge} and ${rule.maxAge} years old.`;

    case "status":
      if (
        rule.status ===
        "Both"
      ) {
        return "Both students and professionals are eligible.";
      }

      return `Only ${rule.status.toLowerCase()}s are eligible.`;

    case "location":
      return `Participants must be located in ${rule.location || "the specified location"}.`;

    case "skills":
      return `Required skills: ${
        rule.skills.length
          ? rule.skills.join(", ")
          : "None specified"
      }.`;

    case "teamSize":
      return `Teams must contain ${rule.teamMin} to ${rule.teamMax} members.`;

    case "experience":
      return `Minimum experience level: ${rule.experience}.`;

    case "custom":
      return `${rule.field || "Field"} ${rule.operator} ${
        rule.value || "specified value"
      }.`;

    default:
      return "Eligibility requirement configured.";
  }
};

export default EligibilityRulesBuilder;