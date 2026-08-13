import { useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  Copy,
  FileText,
  CheckCircle2,
} from "lucide-react";

const EvaluationCriteriaTemplate = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Hackathon Standard",
      description: "General-purpose hackathon evaluation criteria.",
      criteria: [
        {
          name: "Innovation",
          range: "1-10",
          weight: 30,
          description: "Originality and creativity of the solution.",
          comments: true,
        },
        {
          name: "Technical Implementation",
          range: "1-10",
          weight: 30,
          description: "Quality and effectiveness of implementation.",
          comments: true,
        },
        {
          name: "Impact",
          range: "1-10",
          weight: 20,
          description: "Potential value and real-world impact.",
          comments: false,
        },
        {
          name: "Presentation",
          range: "1-10",
          weight: 20,
          description: "Clarity and quality of the presentation.",
          comments: true,
        },
      ],
    },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [templateName, setTemplateName] = useState("");

  const [templateDescription, setTemplateDescription] =
    useState("");

  const [criteria, setCriteria] = useState([
    {
      id: Date.now(),
      name: "",
      range: "1-10",
      weight: 25,
      description: "",
      comments: false,
    },
  ]);

  const addCriteria = () => {
    setCriteria((current) => [
      ...current,
      {
        id: Date.now(),
        name: "",
        range: "1-10",
        weight: 0,
        description: "",
        comments: false,
      },
    ]);
  };

  const removeCriteria = (id) => {
    setCriteria((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const updateCriteria = (id, field, value) => {
    setCriteria((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "weight"
                  ? Number(value)
                  : value,
            }
          : item
      )
    );
  };

  const totalWeight = criteria.reduce(
    (sum, item) => sum + Number(item.weight || 0),
    0
  );

  const saveTemplate = () => {
    if (!templateName.trim()) {
      alert("Please enter a template name.");
      return;
    }

    if (criteria.length === 0) {
      alert("Add at least one evaluation criterion.");
      return;
    }

    if (totalWeight !== 100) {
      alert("Criteria weights must total 100%.");
      return;
    }

    const newTemplate = {
      id: Date.now(),
      name: templateName,
      description: templateDescription,
      criteria,
    };

    setTemplates((current) => [...current, newTemplate]);

    setTemplateName("");
    setTemplateDescription("");

    setCriteria([
      {
        id: Date.now(),
        name: "",
        range: "1-10",
        weight: 25,
        description: "",
        comments: false,
      },
    ]);
  };

  const duplicateTemplate = (template) => {
    setTemplates((current) => [
      ...current,
      {
        ...template,
        id: Date.now(),
        name: `${template.name} Copy`,
        criteria: template.criteria.map((item) => ({
          ...item,
          id: Date.now() + Math.random(),
        })),
      },
    ]);
  };

  const useTemplate = (template) => {
    setSelectedTemplate(template);

    setTemplateName(template.name);

    setTemplateDescription(template.description);

    setCriteria(
      template.criteria.map((item) => ({
        ...item,
        id: Date.now() + Math.random(),
      }))
    );
  };

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Evaluation Criteria Templates
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Create reusable judging criteria for competitions
          and hackathons.
        </p>
      </div>

      {/* Existing templates */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                  <FileText size={20} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {template.name}
                  </h3>

                  <p className="text-xs text-slate-500">
                    {template.criteria.length} criteria
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  duplicateTemplate(template)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                title="Duplicate template"
              >
                <Copy size={16} />
              </button>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {template.description ||
                "No template description provided."}
            </p>

            <div className="mt-4 space-y-2">
              {template.criteria.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900"
                >
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {item.name}
                  </span>

                  <span className="text-xs text-slate-500">
                    {item.weight}%
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => useTemplate(template)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
            >
              <CheckCircle2 size={15} />
              Use Template
            </button>
          </div>
        ))}
      </div>

      {/* Template editor */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {selectedTemplate
              ? "Edit Evaluation Template"
              : "Create Evaluation Template"}
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Define criteria, scoring ranges, weights, and
            evaluator instructions.
          </p>
        </div>

        <div className="space-y-6 p-5">
          {/* Template information */}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Template Name
              </label>

              <input
                type="text"
                value={templateName}
                onChange={(e) =>
                  setTemplateName(e.target.value)
                }
                placeholder="e.g. Hackathon Standard"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Description
              </label>

              <input
                type="text"
                value={templateDescription}
                onChange={(e) =>
                  setTemplateDescription(e.target.value)
                }
                placeholder="Describe when this template should be used"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Weight status */}
          <div
            className={`rounded-xl border p-4 ${
              totalWeight === 100
                ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10"
                : "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Total Criteria Weight
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  All criteria weights must add up to 100%.
                </p>
              </div>

              <span
                className={`text-lg font-bold ${
                  totalWeight === 100
                    ? "text-green-600"
                    : "text-amber-600"
                }`}
              >
                {totalWeight}%
              </span>
            </div>
          </div>

          {/* Criteria */}
          <div className="space-y-5">
            {criteria.map((item, index) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Criterion {index + 1}
                  </h3>

                  {criteria.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeCriteria(item.id)
                      }
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-400">
                      Criteria Name
                    </label>

                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        updateCriteria(
                          item.id,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Innovation"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-400">
                      Score Range
                    </label>

                    <select
                      value={item.range}
                      onChange={(e) =>
                        updateCriteria(
                          item.id,
                          "range",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="1-5">1 - 5</option>
                      <option value="1-10">1 - 10</option>
                      <option value="1-20">1 - 20</option>
                      <option value="1-100">1 - 100</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-400">
                      Weight (%)
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.weight}
                      onChange={(e) =>
                        updateCriteria(
                          item.id,
                          "weight",
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-400">
                    Evaluation Description
                  </label>

                  <textarea
                    rows={3}
                    value={item.description}
                    onChange={(e) =>
                      updateCriteria(
                        item.id,
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Explain what judges should consider..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <label className="mt-4 flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.comments}
                    onChange={(e) =>
                      updateCriteria(
                        item.id,
                        "comments",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 rounded"
                  />

                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Require evaluator comments
                  </span>
                </label>
              </div>
            ))}
          </div>

          {/* Add criterion */}
          <button
            type="button"
            onClick={addCriteria}
            className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-xs font-bold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400"
          >
            <Plus size={16} />
            Add Criterion
          </button>

          {/* Save */}
          <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-800">
            <button
              type="button"
              onClick={saveTemplate}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-indigo-700"
            >
              <Save size={16} />
              Save Template
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EvaluationCriteriaTemplate;