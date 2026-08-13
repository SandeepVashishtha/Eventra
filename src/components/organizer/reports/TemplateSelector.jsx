import React from "react";

export default function TemplateSelector({ template = "classic", setTemplate = () => {} }) {
  const options = ["classic", "modern", "minimalist"];
  return (
    <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 space-y-2">
      <h4 className="font-bold text-gray-500">Select Compilation Stylesheet</h4>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => setTemplate(opt)}
            className={`py-2 rounded-xl border text-center font-semibold transition-all ${
              template === opt
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            {opt.toUpperCase()} Template
          </button>
        ))}
      </div>
    </div>
  );
}
