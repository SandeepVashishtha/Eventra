/**
 * Normalize a language value for consistent comparison.
 */
export const normalizeLanguage = (language) => {
  if (!language) {
    return "";
  }

  return String(language)
    .trim()
    .toLowerCase();
};

/**
 * Get languages from an event.
 *
 * Supports:
 * - language: "English"
 * - languages: ["English", "Hindi"]
 * - language: ["English", "Gujarati"]
 */
export const getEventLanguages = (event = {}) => {
  const value =
    event.languages ??
    event.language ??
    event.eventLanguages ??
    [];

  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map((language) =>
        String(language).trim()
      );
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((language) => language.trim())
      .filter(Boolean);
  }

  return [];
};

/**
 * Get normalized languages from an event.
 */
export const getNormalizedEventLanguages = (
  event = {}
) => {
  return getEventLanguages(event).map(
    normalizeLanguage
  );
};

/**
 * Check whether an event is available in
 * a selected language.
 *
 * An event matches if at least one of its
 * languages matches the selected language.
 */
export const eventMatchesLanguage = (
  event,
  selectedLanguage
) => {
  const normalizedSelectedLanguage =
    normalizeLanguage(selectedLanguage);

  if (
    !normalizedSelectedLanguage ||
    normalizedSelectedLanguage === "all"
  ) {
    return true;
  }

  return getNormalizedEventLanguages(
    event
  ).includes(normalizedSelectedLanguage);
};

/**
 * Filter events by one language.
 */
export const filterEventsByLanguage = (
  events = [],
  selectedLanguage = "All"
) => {
  if (!Array.isArray(events)) {
    return [];
  }

  if (
    !selectedLanguage ||
    normalizeLanguage(selectedLanguage) ===
      "all"
  ) {
    return events;
  }

  return events.filter((event) =>
    eventMatchesLanguage(
      event,
      selectedLanguage
    )
  );
};

/**
 * Check whether an event matches any of the
 * selected languages.
 *
 * Useful for multi-select filters.
 */
export const eventMatchesAnyLanguage = (
  event,
  selectedLanguages = []
) => {
  if (
    !Array.isArray(selectedLanguages) ||
    selectedLanguages.length === 0
  ) {
    return true;
  }

  return selectedLanguages.some(
    (language) =>
      eventMatchesLanguage(
        event,
        language
      )
  );
};

/**
 * Filter events using multiple languages.
 */
export const filterEventsByLanguages = (
  events = [],
  selectedLanguages = []
) => {
  if (!Array.isArray(events)) {
    return [];
  }

  if (
    !Array.isArray(selectedLanguages) ||
    selectedLanguages.length === 0
  ) {
    return events;
  }

  return events.filter((event) =>
    eventMatchesAnyLanguage(
      event,
      selectedLanguages
    )
  );
};

/**
 * Apply language filtering together with
 * other optional filters.
 */
export const filterEvents = (
  events = [],
  {
    languages = [],
    language = "All",
  } = {}
) => {
  if (!Array.isArray(events)) {
    return [];
  }

  if (
    Array.isArray(languages) &&
    languages.length > 0
  ) {
    return filterEventsByLanguages(
      events,
      languages
    );
  }

  return filterEventsByLanguage(
    events,
    language
  );
};

/**
 * Get every unique language available
 * across a collection of events.
 */
export const getAvailableLanguages = (
  events = []
) => {
  if (!Array.isArray(events)) {
    return [];
  }

  const languageMap = new Map();

  events.forEach((event) => {
    getEventLanguages(event).forEach(
      (language) => {
        const normalized =
          normalizeLanguage(language);

        if (
          normalized &&
          !languageMap.has(normalized)
        ) {
          languageMap.set(
            normalized,
            language
          );
        }
      }
    );
  });

  return Array.from(
    languageMap.values()
  ).sort((a, b) =>
    a.localeCompare(b)
  );
};

/**
 * Check whether an event has multiple
 * languages.
 */
export const isMultilingualEvent = (
  event
) => {
  return (
    getEventLanguages(event).length > 1
  );
};

/**
 * Get the number of languages supported
 * by an event.
 */
export const getLanguageCount = (
  event
) => {
  return getEventLanguages(event).length;
};

/**
 * Get a display label for an event's
 * languages.
 */
export const getLanguageLabel = (
  event
) => {
  const languages =
    getEventLanguages(event);

  if (languages.length === 0) {
    return "Language not specified";
  }

  return languages.join(", ");
};

/**
 * Check whether the event language data
 * is valid.
 */
export const validateEventLanguages = (
  languages
) => {
  if (
    languages === undefined ||
    languages === null
  ) {
    return {
      valid: false,
      errors: [
        "At least one event language is required.",
      ],
    };
  }

  const normalizedLanguages =
    Array.isArray(languages)
      ? languages
      : [languages];

  const cleanedLanguages =
    normalizedLanguages
      .map((language) =>
        String(language).trim()
      )
      .filter(Boolean);

  if (cleanedLanguages.length === 0) {
    return {
      valid: false,
      errors: [
        "At least one event language is required.",
      ],
    };
  }

  const duplicates =
    cleanedLanguages.filter(
      (language, index) =>
        cleanedLanguages.findIndex(
          (item) =>
            normalizeLanguage(item) ===
            normalizeLanguage(language)
        ) !== index
    );

  return {
    valid: duplicates.length === 0,
    errors:
      duplicates.length > 0
        ? [
            "Duplicate languages are not allowed.",
          ]
        : [],
    languages: [
      ...new Map(
        cleanedLanguages.map(
          (language) => [
            normalizeLanguage(language),
            language,
          ]
        )
      ).values(),
    ],
  };
};

/**
 * Get common languages for the filter UI.
 */
export const DEFAULT_EVENT_LANGUAGES = [
  "English",
  "Hindi",
  "Gujarati",
  "Marathi",
  "Tamil",
  "Telugu",
  "Bengali",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Urdu",
];

/**
 * Merge default languages with languages
 * discovered from existing events.
 */
export const getFilterLanguages = (
  events = []
) => {
  const availableLanguages =
    getAvailableLanguages(events);

  const merged = new Map();

  [
    ...DEFAULT_EVENT_LANGUAGES,
    ...availableLanguages,
  ].forEach((language) => {
    const normalized =
      normalizeLanguage(language);

    if (!merged.has(normalized)) {
      merged.set(
        normalized,
        language
      );
    }
  });

  return Array.from(
    merged.values()
  ).sort((a, b) =>
    a.localeCompare(b)
  );
};

/**
 * Toggle a language in a multi-select
 * language filter.
 */
export const toggleLanguage = (
  selectedLanguages = [],
  language
) => {
  const current =
    Array.isArray(selectedLanguages)
      ? selectedLanguages
      : [];

  const normalized =
    normalizeLanguage(language);

  const exists = current.some(
    (item) =>
      normalizeLanguage(item) ===
      normalized
  );

  if (exists) {
    return current.filter(
      (item) =>
        normalizeLanguage(item) !==
        normalized
    );
  }

  return [...current, language];
};

/**
 * Clear all selected language filters.
 */
export const clearLanguageFilters = () => {
  return [];
};