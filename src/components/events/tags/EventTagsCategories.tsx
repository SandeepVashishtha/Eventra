import React, { useMemo, useState } from "react";

interface EventTagsCategoriesProps {
  initialCategory?: string;
  initialTags?: string[];
  editable?: boolean;
  onChange?: (data: {
    category: string;
    tags: string[];
  }) => void;
}

const EVENT_CATEGORIES = [
  "Technology",
  "Business",
  "Education",
  "Workshop",
  "Conference",
  "Hackathon",
  "Competition",
  "Cultural",
  "Sports",
  "Entertainment",
  "Networking",
  "Community",
  "Other",
];

const EVENT_TAGS = [
  "AI",
  "Machine Learning",
  "Web Development",
  "App Development",
  "Data Science",
  "Cybersecurity",
  "Cloud",
  "Blockchain",
  "Open Source",
  "Career",
  "Students",
  "Beginner Friendly",
  "Advanced",
  "Online",
  "In Person",
  "Free",
  "Certification",
  "Team Event",
  "Networking",
];

const MAX_TAGS = 8;

const EventTagsCategories: React.FC<
  EventTagsCategoriesProps
> = ({
  initialCategory = "",
  initialTags = [],
  editable = true,
  onChange,
}) => {
  const [category, setCategory] =
    useState(initialCategory);

  const [selectedTags, setSelectedTags] =
    useState<string[]>(initialTags);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [customTag, setCustomTag] =
    useState("");

  const [error, setError] =
    useState("");

  const filteredTags = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    if (!query) {
      return EVENT_TAGS;
    }

    return EVENT_TAGS.filter((tag) =>
      tag.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const updateSelection = (
    nextCategory: string,
    nextTags: string[]
  ) => {
    onChange?.({
      category: nextCategory,
      tags: nextTags,
    });
  };

  const handleCategoryChange = (
    value: string
  ) => {
    setCategory(value);
    setError("");

    updateSelection(
      value,
      selectedTags
    );
  };

  const toggleTag = (tag: string) => {
    setError("");

    if (selectedTags.includes(tag)) {
      const nextTags =
        selectedTags.filter(
          (item) => item !== tag
        );

      setSelectedTags(nextTags);

      updateSelection(
        category,
        nextTags
      );

      return;
    }

    if (selectedTags.length >= MAX_TAGS) {
      setError(
        `You can select up to ${MAX_TAGS} tags.`
      );
      return;
    }

    const nextTags = [
      ...selectedTags,
      tag,
    ];

    setSelectedTags(nextTags);

    updateSelection(
      category,
      nextTags
    );
  };

  const addCustomTag = () => {
    const tag =
      customTag.trim();

    if (!tag) {
      setError(
        "Please enter a tag before adding it."
      );
      return;
    }

    if (tag.length > 30) {
      setError(
        "Custom tags must be 30 characters or less."
      );
      return;
    }

    const alreadySelected =
      selectedTags.some(
        (item) =>
          item.toLowerCase() ===
          tag.toLowerCase()
      );

    if (alreadySelected) {
      setError(
        "This tag has already been selected."
      );
      return;
    }

    if (selectedTags.length >= MAX_TAGS) {
      setError(
        `You can select up to ${MAX_TAGS} tags.`
      );
      return;
    }

    const nextTags = [
      ...selectedTags,
      tag,
    ];

    setSelectedTags(nextTags);
    setCustomTag("");
    setError("");

    updateSelection(
      category,
      nextTags
    );
  };

  const removeTag = (tag: string) => {
    const nextTags =
      selectedTags.filter(
        (item) => item !== tag
      );

    setSelectedTags(nextTags);
    setError("");

    updateSelection(
      category,
      nextTags
    );
  };

  const clearAll = () => {
    setCategory("");
    setSelectedTags([]);
    setSearchQuery("");
    setCustomTag("");
    setError("");

    updateSelection("", []);
  };

  if (!editable) {
    return (
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl dark:bg-blue-950">
            🏷️
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Event Classification
            </p>

            <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
              Category & Tags
            </h2>

            {category && (
              <div className="mt-3">
                <span className="inline-flex rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {category}
                </span>
              </div>
            )}

            {selectedTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {!category &&
              selectedTags.length === 0 && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No category or tags have been
                  added to this event.
                </p>
              )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 dark:border-gray-700 dark:from-blue-950/40 dark:via-gray-900 dark:to-purple-950/40 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
            🏷️
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Event Classification
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              Category & Tags
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Help participants quickly understand
              what your event is about.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Category */}
        <div>
          <label
            htmlFor="event-category"
            className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-200"
          >
            Event Category
          </label>

          <p className="mb-3 text-xs leading-5 text-gray-500 dark:text-gray-400">
            Select the category that best describes
            your event.
          </p>

          <select
            id="event-category"
            value={category}
            onChange={(event) =>
              handleCategoryChange(
                event.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-950"
          >
            <option value="">
              Select a category
            </option>

            {EVENT_CATEGORIES.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>
        </div>

        {/* Tags */}
        <div className="mt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">
                Event Tags
              </label>

              <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                Choose tags that help users discover
                your event.
              </p>
            </div>

            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {selectedTags.length}/{MAX_TAGS} selected
            </span>
          </div>

          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                Selected Tags
              </p>

              <div className="flex flex-wrap gap-2">
                {selectedTags.map(
                  (tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        removeTag(tag)
                      }
                      className="group inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                      title={`Remove ${tag}`}
                    >
                      <span>
                        #{tag}
                      </span>

                      <span className="opacity-80 group-hover:opacity-100">
                        ×
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative mt-4">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔎
            </span>

            <input
              type="text"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              placeholder="Search predefined tags..."
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-950"
            />
          </div>

          {/* Predefined tags */}
          <div className="mt-4">
            {filteredTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {filteredTags.map(
                  (tag) => {
                    const selected =
                      selectedTags.includes(
                        tag
                      );

                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          toggleTag(tag)
                        }
                        className={`rounded-full border px-3 py-2 text-xs font-medium transition ${
                          selected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:bg-blue-950"
                        }`}
                      >
                        {selected
                          ? "✓ "
                          : "+ "}
                        {tag}
                      </button>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No predefined tags match your
                  search.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Custom tag */}
        <div className="mt-8">
          <label
            htmlFor="custom-event-tag"
            className="mb-2 block text-sm font-bold text-gray-800 dark:text-gray-200"
          >
            Add Custom Tag
          </label>

          <p className="mb-3 text-xs leading-5 text-gray-500 dark:text-gray-400">
            Add a relevant tag that is not available
            in the predefined list.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="custom-event-tag"
              type="text"
              value={customTag}
              onChange={(event) => {
                setCustomTag(
                  event.target.value
                );
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addCustomTag();
                }
              }}
              maxLength={30}
              placeholder="e.g. Generative AI"
              className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-950"
            />

            <button
              type="button"
              onClick={addCustomTag}
              className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Add Tag
            </button>
          </div>

          <p className="mt-2 text-right text-xs text-gray-400">
            {customTag.length}/30
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            ⚠️ {error}
          </div>
        )}

        {/* Preview */}
        <div className="mt-8">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
              Event Card Preview
            </h3>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This is how the category and tags can
              appear to participants.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
            {category ? (
              <span className="inline-flex rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {category}
              </span>
            ) : (
              <span className="text-xs text-gray-400">
                No category selected
              </span>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedTags.length > 0 ? (
                selectedTags.map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-300"
                    >
                      #{tag}
                    </span>
                  )
                )
              ) : (
                <span className="text-xs text-gray-400">
                  No tags selected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Clear */}
        {(category ||
          selectedTags.length > 0) && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={clearAll}
              className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Clear Category & Tags
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <span className="text-lg">
            💡
          </span>

          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Make your event easier to discover
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
              Use a clear category and relevant tags so
              participants can quickly understand the
              type and theme of your event.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventTagsCategories;