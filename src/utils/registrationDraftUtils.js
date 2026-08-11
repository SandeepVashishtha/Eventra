/**
 * Registration Form Auto-Save utilities.
 *
 * Supports:
 * - Saving registration drafts locally
 * - Restoring saved drafts
 * - Checking for existing drafts
 * - Clearing drafts after successful registration
 * - Discarding drafts
 * - Draft timestamps
 * - Corrupted-data handling
 * - Event/user-specific storage keys
 */

export const REGISTRATION_DRAFT_PREFIX =
  "eventra_registration_draft";

export const REGISTRATION_DRAFT_VERSION = 1;

export const DEFAULT_DRAFT_TTL_MS =
  7 * 24 * 60 * 60 * 1000;

/**
 * Normalize an identifier.
 */
export const normalizeDraftId = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};

/**
 * Safely normalize form data.
 */
export const normalizeDraftData = (
  data
) => {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return {};
  }

  return {
    ...data,
  };
};

/**
 * Create a unique localStorage key
 * for an event registration draft.
 */
export const getRegistrationDraftKey = ({
  eventId,
  userId = "guest",
} = {}) => {
  const normalizedEventId =
    normalizeDraftId(eventId);

  const normalizedUserId =
    normalizeDraftId(userId) ||
    "guest";

  if (!normalizedEventId) {
    return "";
  }

  return `${REGISTRATION_DRAFT_PREFIX}:${normalizedEventId}:${normalizedUserId}`;
};

/**
 * Check whether localStorage is available.
 */
export const isDraftStorageAvailable = () => {
  if (
    typeof window === "undefined"
  ) {
    return false;
  }

  try {
    const testKey =
      "__eventra_draft_test__";

    window.localStorage.setItem(
      testKey,
      "1"
    );

    window.localStorage.removeItem(
      testKey
    );

    return true;
  } catch {
    return false;
  }
};

/**
 * Create the stored draft object.
 */
export const createRegistrationDraft = ({
  eventId,
  userId = "guest",
  formData = {},
} = {}) => {
  const now =
    new Date().toISOString();

  return {
    version:
      REGISTRATION_DRAFT_VERSION,

    eventId:
      normalizeDraftId(
        eventId
      ),

    userId:
      normalizeDraftId(
        userId
      ) || "guest",

    formData:
      normalizeDraftData(
        formData
      ),

    createdAt: now,

    updatedAt: now,
  };
};

/**
 * Save a registration form draft.
 */
export const saveRegistrationDraft = ({
  eventId,
  userId = "guest",
  formData = {},
} = {}) => {
  if (
    !isDraftStorageAvailable()
  ) {
    return {
      success: false,
      error:
        "Local draft storage is unavailable.",
      draft: null,
    };
  }

  const key =
    getRegistrationDraftKey({
      eventId,
      userId,
    });

  if (!key) {
    return {
      success: false,
      error:
        "Event ID is required to save a draft.",
      draft: null,
    };
  }

  try {
    const existingDraft =
      getRegistrationDraft({
        eventId,
        userId,
        ignoreExpiration: true,
      });

    const now =
      new Date().toISOString();

    const draft = {
      version:
        REGISTRATION_DRAFT_VERSION,

      eventId:
        normalizeDraftId(
          eventId
        ),

      userId:
        normalizeDraftId(
          userId
        ) || "guest",

      formData:
        normalizeDraftData(
          formData
        ),

      createdAt:
        existingDraft?.createdAt ||
        now,

      updatedAt: now,
    };

    window.localStorage.setItem(
      key,
      JSON.stringify(draft)
    );

    return {
      success: true,
      error: null,
      draft,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error?.message ||
        "Unable to save registration draft.",
      draft: null,
    };
  }
};

/**
 * Read and parse a stored draft.
 */
export const getRegistrationDraft = ({
  eventId,
  userId = "guest",
  ignoreExpiration = false,
  ttlMs = DEFAULT_DRAFT_TTL_MS,
} = {}) => {
  if (
    !isDraftStorageAvailable()
  ) {
    return null;
  }

  const key =
    getRegistrationDraftKey({
      eventId,
      userId,
    });

  if (!key) {
    return null;
  }

  try {
    const raw =
      window.localStorage.getItem(
        key
      );

    if (!raw) {
      return null;
    }

    const draft =
      JSON.parse(raw);

    if (
      !draft ||
      typeof draft !==
        "object"
    ) {
      removeRegistrationDraft({
        eventId,
        userId,
      });

      return null;
    }

    if (
      draft.eventId &&
      normalizeDraftId(
        draft.eventId
      ) !==
        normalizeDraftId(
          eventId
        )
    ) {
      return null;
    }

    if (
      !ignoreExpiration &&
      isRegistrationDraftExpired(
        draft,
        ttlMs
      )
    ) {
      removeRegistrationDraft({
        eventId,
        userId,
      });

      return null;
    }

    return {
      ...draft,
      formData:
        normalizeDraftData(
          draft.formData
        ),
    };
  } catch {
    removeRegistrationDraft({
      eventId,
      userId,
    });

    return null;
  }
};

/**
 * Check whether a saved draft exists.
 */
export const hasRegistrationDraft = ({
  eventId,
  userId = "guest",
  ignoreExpiration = false,
  ttlMs = DEFAULT_DRAFT_TTL_MS,
} = {}) => {
  return Boolean(
    getRegistrationDraft({
      eventId,
      userId,
      ignoreExpiration,
      ttlMs,
    })
  );
};

/**
 * Remove a registration draft.
 */
export const removeRegistrationDraft = ({
  eventId,
  userId = "guest",
} = {}) => {
  if (
    !isDraftStorageAvailable()
  ) {
    return false;
  }

  const key =
    getRegistrationDraftKey({
      eventId,
      userId,
    });

  if (!key) {
    return false;
  }

  try {
    window.localStorage.removeItem(
      key
    );

    return true;
  } catch {
    return false;
  }
};

/**
 * Alias for discarding a draft.
 */
export const discardRegistrationDraft =
  removeRegistrationDraft;

/**
 * Clear the draft after successful
 * registration.
 */
export const clearRegistrationDraftAfterSuccess =
  ({
    eventId,
    userId = "guest",
  } = {}) => {
    return removeRegistrationDraft({
      eventId,
      userId,
    });
  };

/**
 * Check whether a draft has expired.
 */
export const isRegistrationDraftExpired = (
  draft,
  ttlMs = DEFAULT_DRAFT_TTL_MS
) => {
  if (
    !draft?.updatedAt
  ) {
    return false;
  }

  const updatedAt =
    new Date(
      draft.updatedAt
    ).getTime();

  if (
    Number.isNaN(
      updatedAt
    )
  ) {
    return false;
  }

  const ttl =
    Number(ttlMs);

  if (
    !Number.isFinite(ttl) ||
    ttl <= 0
  ) {
    return false;
  }

  return (
    Date.now() -
      updatedAt >
    ttl
  );
};

/**
 * Get the age of a draft in milliseconds.
 */
export const getRegistrationDraftAge = (
  draft
) => {
  if (
    !draft?.updatedAt
  ) {
    return 0;
  }

  const updatedAt =
    new Date(
      draft.updatedAt
    ).getTime();

  if (
    Number.isNaN(
      updatedAt
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Date.now() -
      updatedAt
  );
};

/**
 * Get a human-readable draft age.
 */
export const formatDraftAge = (
  draft
) => {
  const age =
    getRegistrationDraftAge(
      draft
    );

  if (age < 60 * 1000) {
    return "Just now";
  }

  const minutes = Math.floor(
    age /
      (60 * 1000)
  );

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1
        ? ""
        : "s"
    } ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours} hour${
      hours === 1
        ? ""
        : "s"
    } ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  return `${days} day${
    days === 1
      ? ""
      : "s"
  } ago`;
};

/**
 * Get the draft updated timestamp.
 */
export const getDraftUpdatedAt = (
  draft
) => {
  return (
    draft?.updatedAt ||
    null
  );
};

/**
 * Get form data from a draft.
 */
export const getDraftFormData = (
  draft
) => {
  return normalizeDraftData(
    draft?.formData
  );
};

/**
 * Merge saved draft data with
 * current form data.
 *
 * Current values take priority.
 */
export const mergeRegistrationDraft = (
  savedDraft,
  currentFormData = {}
) => {
  const draftData =
    getDraftFormData(
      savedDraft
    );

  return {
    ...draftData,
    ...normalizeDraftData(
      currentFormData
    ),
  };
};

/**
 * Check whether form data contains
 * meaningful user input.
 */
export const hasMeaningfulDraftData = (
  formData
) => {
  if (
    !formData ||
    typeof formData !==
      "object"
  ) {
    return false;
  }

  return Object.values(
    formData
  ).some((value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return false;
    }

    if (
      typeof value ===
      "string"
    ) {
      return value.trim()
        .length > 0;
    }

    if (
      Array.isArray(value)
    ) {
      return value.length > 0;
    }

    if (
      typeof value ===
      "object"
    ) {
      return (
        Object.keys(value)
          .length > 0
      );
    }

    return true;
  });
};

/**
 * Save only when the form contains
 * meaningful data.
 */
export const saveRegistrationDraftIfNeeded =
  ({
    eventId,
    userId = "guest",
    formData = {},
  } = {}) => {
    if (
      !hasMeaningfulDraftData(
        formData
      )
    ) {
      return {
        success: false,
        skipped: true,
        draft: null,
      };
    }

    return {
      ...saveRegistrationDraft({
        eventId,
        userId,
        formData,
      }),
      skipped: false,
    };
  };

/**
 * Restore a draft and indicate whether
 * it was successfully restored.
 */
export const restoreRegistrationDraft = ({
  eventId,
  userId = "guest",
  ttlMs = DEFAULT_DRAFT_TTL_MS,
} = {}) => {
  const draft =
    getRegistrationDraft({
      eventId,
      userId,
      ttlMs,
    });

  if (!draft) {
    return {
      restored: false,
      draft: null,
      formData: {},
    };
  }

  return {
    restored: true,
    draft,
    formData:
      getDraftFormData(
        draft
      ),
  };
};

/**
 * Get all Eventra registration draft
 * storage keys.
 */
export const getRegistrationDraftKeys = () => {
  if (
    !isDraftStorageAvailable()
  ) {
    return [];
  }

  const keys = [];

  try {
    for (
      let index = 0;
      index <
      window.localStorage
        .length;
      index += 1
    ) {
      const key =
        window.localStorage.key(
          index
        );

      if (
        key?.startsWith(
          `${REGISTRATION_DRAFT_PREFIX}:`
        )
      ) {
        keys.push(key);
      }
    }
  } catch {
    return [];
  }

  return keys;
};

/**
 * Remove every Eventra registration
 * draft.
 *
 * Useful for account logout or cleanup.
 */
export const clearAllRegistrationDrafts =
  () => {
    if (
      !isDraftStorageAvailable()
    ) {
      return 0;
    }

    const keys =
      getRegistrationDraftKeys();

    let removed = 0;

    keys.forEach((key) => {
      try {
        window.localStorage.removeItem(
          key
        );

        removed += 1;
      } catch {
        // Ignore individual removal failures.
      }
    });

    return removed;
  };

/**
 * Remove expired registration drafts.
 */
export const clearExpiredRegistrationDrafts =
  (
    ttlMs = DEFAULT_DRAFT_TTL_MS
  ) => {
    if (
      !isDraftStorageAvailable()
    ) {
      return 0;
    }

    const keys =
      getRegistrationDraftKeys();

    let removed = 0;

    keys.forEach((key) => {
      try {
        const raw =
          window.localStorage.getItem(
            key
          );

        if (!raw) {
          return;
        }

        const draft =
          JSON.parse(raw);

        if (
          isRegistrationDraftExpired(
            draft,
            ttlMs
          )
        ) {
          window.localStorage.removeItem(
            key
          );

          removed += 1;
        }
      } catch {
        try {
          window.localStorage.removeItem(
            key
          );

          removed += 1;
        } catch {
          // Ignore cleanup failures.
        }
      }
    });

    return removed;
  };

/**
 * Get the number of stored drafts.
 */
export const getRegistrationDraftCount =
  () => {
    return getRegistrationDraftKeys()
      .length;
  };

/**
 * Create a draft storage snapshot.
 *
 * Useful for debugging or displaying
 * draft information.
 */
export const getRegistrationDraftSnapshot =
  ({
    eventId,
    userId = "guest",
    ttlMs = DEFAULT_DRAFT_TTL_MS,
  } = {}) => {
    const draft =
      getRegistrationDraft({
        eventId,
        userId,
        ttlMs,
      });

    if (!draft) {
      return {
        exists: false,
        expired: false,
        updatedAt: null,
        age: 0,
        formData: {},
      };
    }

    return {
      exists: true,
      expired:
        isRegistrationDraftExpired(
          draft,
          ttlMs
        ),
      updatedAt:
        getDraftUpdatedAt(
          draft
        ),
      age:
        getRegistrationDraftAge(
          draft
        ),
      ageLabel:
        formatDraftAge(
          draft
        ),
      formData:
        getDraftFormData(
          draft
        ),
    };
  };