import { Check } from "lucide-react";

/**
 * CategoryFilter Component
 * Multi-select filter for event categories
 */
const CategoryFilter = ({ categories, selectedCategories, onCategoryChange }) => {
  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Categories</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all ${
              selectedCategories.includes(category.id)
                ? "border border-indigo-300 bg-indigo-100 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300"
                : "border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <div
              className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-all ${
                selectedCategories.includes(category.id)
                  ? "border-indigo-600 bg-indigo-600 dark:border-indigo-500 dark:bg-indigo-500"
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
