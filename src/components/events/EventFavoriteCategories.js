import {
  Check,
  Heart,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_CATEGORIES = [
  {
    id: "hackathons",
    name: "Hackathons",
    description: "Build projects and solve real-world challenges.",
    emoji: "💻",
  },
  {
    id: "workshops",
    name: "Workshops",
    description: "Learn practical skills through hands-on sessions.",
    emoji: "🛠️",
  },
  {
    id: "conferences",
    name: "Conferences",
    description: "Explore talks, ideas, and industry insights.",
    emoji: "🎤",
  },
  {
    id: "competitions",
    name: "Competitions",
    description: "Compete with others and showcase your skills.",
    emoji: "🏆",
  },
  {
    id: "webinars",
    name: "Webinars",
    description: "Join online learning and expert sessions.",
    emoji: "🌐",
  },
  {
    id: "meetups",
    name: "Meetups",
    description: "Connect with people and grow your network.",
    emoji: "🤝",
  },
];

const STORAGE_KEY = "eventra-favorite-categories";

const EventFavoriteCategories = ({
  categories = DEFAULT_CATEGORIES,
  initialSelected = [],
  storageKey = STORAGE_KEY,
  maxSelections,
  onSave,
  onChange,
  className = "",
}) => {
  const availableCategories = useMemo(
    () =>
      Array.isArray(categories)
        ? categories.map(normalizeCategory)
        : DEFAULT_CATEGORIES,
    [categories]
  );

  const [selectedCategories, setSelectedCategories] =
    useState(() => {
      const saved = loadPreferences(storageKey);

      if (saved.length > 0) {
        return new Set(saved);
      }

      return new Set(
        initialSelected.map(String)
      );
    });

  const [saved, setSaved] = useState(() => {
    return loadPreferences(storageKey).length > 0;
  });

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    const validIds = new Set(
      availableCategories.map(
        (category) => category.id
      )
    );

    setSelectedCategories((current) => {
      const filtered = new Set(
        [...current].filter((id) =>
          validIds.has(id)
        )
      );

      return filtered;
    });
  }, [availableCategories]);

  const selectedCount =
    selectedCategories.size;

  const toggleCategory = (categoryId) => {
    setMessage("");

    setSelectedCategories((current) => {
      const next = new Set(current);

      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        if (
          maxSelections &&
          next.size >= maxSelections
        ) {
          setMessage(
            `You can select up to ${maxSelections} categories.`
          );

          return current;
        }

        next.add(categoryId);
      }

      onChange?.(
        Array.from(next)
      );

      return next;
    });

    setSaved(false);
  };

  const savePreferences = () => {
    const values =
      Array.from(selectedCategories);

    saveToStorage(
      storageKey,
      values
    );

    setSaved(true);
    setMessage(
      values.length > 0
        ? "Your favorite categories have been saved."
        : "Your favorite categories have been cleared."
    );

    onSave?.(values);
  };

  const resetPreferences = () => {
    setSelectedCategories(
      new Set()
    );

    removeFromStorage(
      storageKey
    );

    setSaved(false);
    setMessage(
      "Favorite categories have been reset."
    );

    onChange?.([]);
    onSave?.([]);
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-900/30">
            <Heart
              size={20}
              className="text-pink-600 dark:text-pink-400"
              fill="currentColor"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
              Personalize Discovery
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Favorite Event Categories
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Choose the types of events you enjoy.
              Your preferences can be used to prioritize
              relevant events in discovery.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-slate-900">
          <Heart
            size={14}
            className="text-pink-500"
            fill={
              selectedCount > 0
                ? "currentColor"
                : "none"
            }
          />

          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            {selectedCount}
          </span>

          <span className="text-[9px] font-semibold text-slate-400">
            selected
          </span>
        </div>
      </div>

      {/* Personalization hint */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <Sparkles
          size={17}
          className="mt-0.5 shrink-0 text-indigo-500"
        />

        <div>
          <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
            Personalize your event discovery
          </p>

          <p className="mt-1 text-[10px] leading-4 text-indigo-700 dark:text-indigo-300">
            Select categories that match your interests.
            Event recommendations can then prioritize these
            categories for you.
          </p>
        </div>
      </div>

      {/* Category grid */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {availableCategories.map(
          (category) => {
            const isSelected =
              selectedCategories.has(
                category.id
              );

            return (
              <CategoryCard
                key={category.id}
                category={category}
                selected={isSelected}
                disabled={
                  Boolean(
                    maxSelections
                  ) &&
                  !isSelected &&
                  selectedCount >=
                    maxSelections
                }
                onClick={() =>
                  toggleCategory(
                    category.id
                  )
                }
              />
            );
          }
        )}
      </div>

      {/* Selection limit */}
      {maxSelections && (
        <p className="mt-4 text-[9px] font-medium text-slate-400">
          Select up to{" "}
          <span className="font-bold">
            {maxSelections}
          </span>{" "}
          categories.
        </p>
      )}

      {/* Status message */}
      {message && (
        <div
          className={`mt-4 rounded-xl border p-3 text-xs font-medium ${
            message.includes(
              "up to"
            )
              ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-400"
              : "border-green-200 bg-green-50 text-green-700 dark:border-green-900/40 dark:bg-green-900/10 dark:text-green-400"
          }`}
        >
          {message}
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-2 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          {saved ? (
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
              <Check size={12} />
              Preferences saved
            </p>
          ) : (
            <p className="text-[10px] text-slate-400">
              {selectedCount === 0
                ? "No favorite categories selected."
                : `${selectedCount} category${
                    selectedCount === 1
                      ? ""
                      : "ies"
                  } selected.`}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetPreferences}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:flex-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <RotateCcw size={13} />
            Reset
          </button>

          <button
            type="button"
            onClick={savePreferences}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-pink-700 sm:flex-none"
          >
            <Save size={13} />
            Save Preferences
          </button>
        </div>
      </div>
    </section>
  );
};

/* ----------------------------------
   Category card
----------------------------------- */

const CategoryCard = ({
  category,
  selected,
  disabled,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`group relative flex min-h-[145px] flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200 ${
        selected
          ? "border-pink-300 bg-pink-50 shadow-sm dark:border-pink-700 dark:bg-pink-900/10"
          : disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-50 dark:border-slate-800 dark:bg-slate-900"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-pink-800"
      }`}
    >
      {/* Selected indicator */}
      <span
        className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full transition ${
          selected
            ? "bg-pink-600 text-white"
            : "border border-slate-200 bg-white text-transparent dark:border-slate-700 dark:bg-slate-900"
        }`}
      >
        <Check size={12} />
      </span>

      {/* Icon */}
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl transition ${
          selected
            ? "bg-white shadow-sm dark:bg-slate-900"
            : "bg-slate-100 dark:bg-slate-800"
        }`}
      >
        {category.emoji}
      </span>

      {/* Content */}
      <div className="mt-4 pr-7">
        <h3
          className={`text-sm font-bold ${
            selected
              ? "text-pink-700 dark:text-pink-300"
              : "text-slate-800 dark:text-slate-100"
          }`}
        >
          {category.name}
        </h3>

        {category.description && (
          <p className="mt-1 text-[10px] leading-4 text-slate-400">
            {category.description}
          </p>
        )}
      </div>

      {/* Selected label */}
      {selected && (
        <span className="mt-auto pt-3 text-[8px] font-bold uppercase tracking-wide text-pink-500">
          Favorite category
        </span>
      )}
    </button>
  );
};

/* ----------------------------------
   Category normalization
----------------------------------- */

const normalizeCategory = (
  category
) => {
  if (
    typeof category ===
    "string"
  ) {
    return {
      id: slugify(category),
      name: category,
      description: "",
      emoji: "📅",
    };
  }

  return {
    ...category,
    id:
      category.id ||
      slugify(
        category.name ||
          category.title ||
          "category"
      ),
    name:
      category.name ||
      category.title ||
      "Event Category",
    description:
      category.description ||
      "",
    emoji:
      category.emoji ||
      category.icon ||
      "📅",
  };
};

/* ----------------------------------
   Storage helpers
----------------------------------- */

const loadPreferences = (
  storageKey
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const stored =
      window.localStorage.getItem(
        storageKey
      );

    const parsed = stored
      ? JSON.parse(stored)
      : [];

    return Array.isArray(parsed)
      ? parsed.map(String)
      : [];
  } catch {
    return [];
  }
};

const saveToStorage = (
  storageKey,
  values
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(values)
    );
  } catch {
    // Ignore localStorage failures.
  }
};

const removeFromStorage = (
  storageKey
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.removeItem(
      storageKey
    );
  } catch {
    // Ignore localStorage failures.
  }
};

/* ----------------------------------
   Slug helper
----------------------------------- */

const slugify = (
  value
) => {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
};

export default EventFavoriteCategories;