import { useMemo, useState } from "react";
import {
  GripVertical,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
} from "lucide-react";

const availableTieBreakers = [
  {
    id: "technical",
    label: "Higher Technical Score",
    description: "Team with the higher technical score ranks first.",
  },
  {
    id: "innovation",
    label: "Higher Innovation Score",
    description: "Team with the higher innovation score ranks first.",
  },
  {
    id: "presentation",
    label: "Higher Presentation Score",
    description: "Team with the higher presentation score ranks first.",
  },
  {
    id: "submission",
    label: "Earlier Valid Submission",
    description: "Team with the earlier valid submission ranks first.",
  },
];

const TieBreakerConfiguration = ({
  onSave,
}) => {
  const [rules, setRules] = useState([
    "technical",
    "innovation",
    "presentation",
    "submission",
  ]);

  const [saved, setSaved] = useState(false);

  const selectedRules = useMemo(
    () =>
      rules
        .map((ruleId) =>
          availableTieBreakers.find(
            (rule) => rule.id === ruleId
          )
        )
        .filter(Boolean),
    [rules]
  );

  const unusedRules = availableTieBreakers.filter(
    (rule) => !rules.includes(rule.id)
  );

  const addRule = (ruleId) => {
    if (!rules.includes(ruleId)) {
      setRules((current) => [...current, ruleId]);
      setSaved(false);
    }
  };

  const removeRule = (ruleId) => {
    setRules((current) =>
      current.filter((id) => id !== ruleId)
    );

    setSaved(false);
  };

  const moveRule = (index, direction) => {
    const newIndex = index + direction;

    if (
      newIndex < 0 ||
      newIndex >= rules.length
    ) {
      return;
    }

    setRules((current) => {
      const updated = [...current];

      [
        updated[index],
        updated[newIndex],
      ] = [
        updated[newIndex],
        updated[index],
      ];

      return updated;
    });

    setSaved(false);
  };

  const saveConfiguration = () => {
    if (onSave) {
      onSave(rules);
    }

    setSaved(true);
  };

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Tie-Breaker Configuration
        </h1>

        <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Define the order of rules used when teams have
          identical final scores.
        </p>
      </div>

      {/* Explanation */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/40 dark:bg-indigo-900/10">
        <h2 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">
          How tie-breaking works
        </h2>

        <p className="mt-2 text-xs leading-5 text-indigo-700 dark:text-indigo-400">
          Rules are evaluated from top to bottom. The first
          rule that produces a difference determines the
          ranking. If teams are still tied, the next rule is
          applied.
        </p>
      </div>

      {/* Selected rules */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              Ranking Priority
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Drag or reorder rules to change their priority.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {selectedRules.length} rules
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {selectedRules.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-500">
                No tie-breaker rules configured.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Add a rule below to configure ranking ties.
              </p>
            </div>
          ) : (
            selectedRules.map((rule, index) => (
              <div
                key={rule.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <GripVertical
                    size={18}
                    className="text-slate-400"
                  />

                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                    {index + 1}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {rule.label}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {rule.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() =>
                      moveRule(index, -1)
                    }
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    disabled={
                      index === selectedRules.length - 1
                    }
                    onClick={() =>
                      moveRule(index, 1)
                    }
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    ↓
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      removeRule(rule.id)
                    }
                    className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/10"
                    aria-label={`Remove ${rule.label}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add rules */}
      {unusedRules.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="font-bold text-slate-900 dark:text-white">
            Available Tie-Breakers
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {unusedRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="min-w-0 pr-3">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {rule.label}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {rule.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => addRule(rule.id)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={saveConfiguration}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
        >
          {saved ? (
            <CheckCircle2 size={17} />
          ) : (
            <Save size={17} />
          )}

          {saved
            ? "Configuration Saved"
            : "Save Configuration"}
        </button>
      </div>
    </section>
  );
};

export default TieBreakerConfiguration;