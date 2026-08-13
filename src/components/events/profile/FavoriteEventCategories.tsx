import React, { useState } from "react";

interface FavoriteEventCategoriesProps {
  initialCategories?: string[];
  availableCategories?: string[];
  onChange?: (categories: string[]) => void;
  readOnly?: boolean;
}

const DEFAULT_CATEGORIES = [
  "Technology",
  "AI & Machine Learning",
  "Web Development",
  "Data Science",
  "Cybersecurity",
  "Business",
  "Entrepreneurship",
  "Design",
  "Marketing",
  "Finance",
  "Education",
  "Sports",
  "Music",
  "Arts & Culture",
  "Gaming",
  "Networking",
];

const FavoriteEventCategories: React.FC<
  FavoriteEventCategoriesProps
> = ({
  initialCategories = [],
  availableCategories = DEFAULT_CATEGORIES,
  onChange,
  readOnly = false,
}) => {
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(initialCategories);

  const [search, setSearch] = useState("");

  const [saved, setSaved] = useState(false);

  const filteredCategories =
    availableCategories.filter((category) =>
      category
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const toggleCategory = (
    category: string
  ) => {
    if (readOnly) {
      return;
    }

    setSaved(false);

    const updated =
      selectedCategories.includes(category)
        ? selectedCategories.filter(
            (item) => item !== category
          )
        : [
            ...selectedCategories,
            category,
          ];

    setSelectedCategories(updated);
    onChange?.(updated);
  };

  const removeCategory = (
    category: string
  ) => {
    if (readOnly) {
      return;
    }

    const updated =
      selectedCategories.filter(
        (item) => item !== category
      );

    setSelectedCategories(updated);
    setSaved(false);
    onChange?.(updated);
  };

  const savePreferences = () => {
    onChange?.(selectedCategories);
    setSaved(true);
  };

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 dark:border-gray-700 dark:from-blue-950/40 dark:via-gray-900 dark:to-purple-950/40 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
            ❤️
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Personalization
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              Favorite Event Categories
            </h2>

            <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
              Select the types of events you are most
              interested in to personalize your Eventra
              experience.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Saved message */}
        {saved && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
          >
            ✓ Your favorite categories have been saved.
          </div>
        )}

        {/* Selected categories */}
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Your Favorite Categories
              </h3>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {selectedCategories.length === 0
                  ? "No categories selected yet."
                  : `${selectedCategories.length} ${
                      selectedCategories.length === 1
                        ? "category"
                        : "categories"
                    } selected`}
              </p>
            </div>

            {selectedCategories.length > 0 &&
              !readOnly && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategories([]);
                    setSaved(false);
                    onChange?.([]);
                  }}
                  className="text-left text-xs font-semibold text-red-600 hover:underline dark:text-red-400 sm:text-right"
                >
                  Clear all
                </button>
              )}
          </div>

          {selectedCategories.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCategories.map(
                (category) => (
                  <div
                    key={category}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  >
                    <span>{category}</span>

                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() =>
                          removeCategory(
                            category
                          )
                        }
                        className="flex h-4 w-4 items-center justify-center rounded-full text-blue-600 hover:bg-blue-200 dark:text-blue-300 dark:hover:bg-blue-900"
                        aria-label={`Remove ${category}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-5 text-center dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose categories below to personalize
                your event discovery experience.
              </p>
            </div>
          )}
        </div>

        {/* Search */}
        {!readOnly && (
          <div className="mt-7">
            <label
              htmlFor="category-search"
              className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
            >
              Find Categories
            </label>

            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>

              <input
                id="category-search"
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search categories..."
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:ring-blue-950"
              />
            </div>
          </div>
        )}

        {/* Category list */}
        <div className="mt-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map(
              (category) => {
                const selected =
                  selectedCategories.includes(
                    category
                  );

                return (
                  <button
                    key={category}
                    type="button"
                    disabled={readOnly}
                    onClick={() =>
                      toggleCategory(
                        category
                      )
                    }
                    className={`flex min-h-[58px] items-center gap-3 rounded-xl border p-3 text-left transition ${
                      selected
                        ? "border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/40"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
                    } ${
                      readOnly
                        ? "cursor-default"
                        : "cursor-pointer"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                        selected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 bg-white text-transparent dark:border-gray-600 dark:bg-gray-800"
                      }`}
                    >
                      ✓
                    </span>

                    <span
                      className={`text-sm font-medium ${
                        selected
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {category}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          {filteredCategories.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                No categories found
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Try searching for a different category.
              </p>
            </div>
          )}
        </div>

        {/* Save button */}
        {!readOnly && (
          <div className="mt-7 flex justify-end">
            <button
              type="button"
              onClick={savePreferences}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Save Preferences
            </button>
          </div>
        )}
      </div>

      {/* Information */}
      <div className="border-t border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <span className="text-lg">
            💡
          </span>

          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Personalize your event discovery
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
              Your selected categories can be used by
              Eventra to highlight relevant events while
              keeping the normal experience available when
              no preferences are selected.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FavoriteEventCategories;