import React from "react";
import { Check } from "lucide-react";

/**
 * CategoryFilter Component
 * Multi-select filter for event categories
 */
const CategoryFilter = ({
  categories,
  selectedCategories,
  onCategoryChange,
}) => {
  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Categories
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {categories.map((category) => (
          <button aria-label="button"
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
              selectedCategories.includes(category.id)
                ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-600"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <div
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                selectedCategories.includes(category.id)
                  ? "bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500"
                  : "border-gray-400 dark:border-gray-500"
              }`}
            >
              {selectedCategories.includes(category.id) && (
                <Check size={12} className="text-white" />
              )}
            </div>
            <span className="flex-1">{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
