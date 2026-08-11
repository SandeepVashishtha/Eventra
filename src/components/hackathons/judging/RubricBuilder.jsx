import React, { useState } from "react";
import { Sliders, Plus, Trash2, CheckCircle } from "lucide-react";

export default function RubricBuilder({ onSaveRubric = () => {} }) {
  const [categories, setCategories] = useState([
    { name: "Innovation & Originality", weight: 30 },
    { name: "Technical Execution & Architecture", weight: 40 },
    { name: "UI/UX & User Experience", weight: 20 },
    { name: "Presentation & Pitch", weight: 10 },
  ]);

  const totalWeight = categories.reduce((acc, curr) => acc + (Number(curr.weight) || 0), 0);

  const handleUpdate = (idx, field, val) => {
    setCategories((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: field === "weight" ? Number(val) : val } : c))
    );
  };

  const handleAddCategory = () => {
    setCategories((prev) => [...prev, { name: "New Criteria", weight: 10 }]);
  };

  const handleRemove = (idx) => {
    setCategories((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
            Hackathon Judging Rubric Builder
          </h3>
        </div>

        <span
          className={`font-mono font-bold px-2.5 py-1 rounded-lg ${
            totalWeight === 100
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
          }`}
        >
          Total Weight: {totalWeight}%
        </span>
      </div>

      <div className="space-y-3">
        {categories.map((cat, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <input
              type="text"
              value={cat.name}
              onChange={(e) => handleUpdate(idx, "name", e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            />
            <div className="flex items-center gap-1 w-24">
              <input
                type="number"
                min="0"
                max="100"
                value={cat.weight}
                onChange={(e) => handleUpdate(idx, "weight", e.target.value)}
                className="w-16 px-2 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-center font-mono font-bold"
              />
              <span className="font-bold text-gray-500">%</span>
            </div>
            <button
              onClick={() => handleRemove(idx)}
              className="p-2 rounded-lg text-gray-400 hover:text-rose-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleAddCategory}
          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          <Plus className="w-4 h-4" /> Add Evaluation Category
        </button>

        <button
          onClick={() => onSaveRubric(categories)}
          disabled={totalWeight !== 100}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          Save Rubric Schema
        </button>
      </div>
    </div>
  );
}
