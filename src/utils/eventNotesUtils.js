/**
 * Event Notes utilities.
 *
 * Notes are private to the user and associated
 * with a specific event.
 */

export const MAX_NOTE_TITLE_LENGTH = 100;
export const MAX_NOTE_CONTENT_LENGTH = 2000;

/**
 * Generate a unique note ID.
 */
export const generateEventNoteId = () => {
  return `event-note-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
};

/**
 * Normalize an ID for reliable comparisons.
 */
export const normalizeNoteId = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};

/**
 * Extract an event ID.
 */
export const getNoteEventId = (
  event = {}
) => {
  if (
    typeof event !== "object" ||
    event === null
  ) {
    return normalizeNoteId(event);
  }

  return normalizeNoteId(
    event.id ??
      event.eventId ??
      event.event_id
  );
};

/**
 * Extract a user ID.
 */
export const getNoteUserId = (
  user = {}
) => {
  if (
    typeof user !== "object" ||
    user === null
  ) {
    return normalizeNoteId(user);
  }

  return normalizeNoteId(
    user.id ??
      user.userId ??
      user.user_id ??
      user.participantId
  );
};

/**
 * Create a new private event note.
 */
export const createEventNote = ({
  eventId,
  userId,
  title = "",
  content = "",
} = {}) => {
  const now =
    new Date().toISOString();

  return {
    id: generateEventNoteId(),
    eventId: normalizeNoteId(
      eventId
    ),
    userId: normalizeNoteId(
      userId
    ),
    title: String(title).trim(),
    content: String(content).trim(),
    createdAt: now,
    updatedAt: now,
    private: true,
  };
};

/**
 * Validate note title and content.
 */
export const validateEventNote = ({
  title = "",
  content = "",
} = {}) => {
  const errors = [];

  const normalizedTitle =
    String(title).trim();

  const normalizedContent =
    String(content).trim();

  if (!normalizedContent) {
    errors.push(
      "Note content cannot be empty."
    );
  }

  if (
    normalizedTitle.length >
    MAX_NOTE_TITLE_LENGTH
  ) {
    errors.push(
      `Note title cannot exceed ${MAX_NOTE_TITLE_LENGTH} characters.`
    );
  }

  if (
    normalizedContent.length >
    MAX_NOTE_CONTENT_LENGTH
  ) {
    errors.push(
      `Note content cannot exceed ${MAX_NOTE_CONTENT_LENGTH} characters.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Check whether a note belongs to
 * a specific event and user.
 */
export const noteBelongsToUserEvent = (
  note,
  eventId,
  userId
) => {
  if (!note) {
    return false;
  }

  return (
    normalizeNoteId(
      note.eventId
    ) === normalizeNoteId(eventId) &&
    normalizeNoteId(
      note.userId
    ) === normalizeNoteId(userId)
  );
};

/**
 * Get notes belonging to a specific
 * event and user.
 *
 * includeAll is useful internally when
 * updating the complete notes collection.
 */
export const getEventNotes = ({
  notes = [],
  eventId,
  userId,
  includeAll = false,
} = {}) => {
  if (!Array.isArray(notes)) {
    return [];
  }

  if (includeAll) {
    return [...notes];
  }

  const normalizedEventId =
    normalizeNoteId(eventId);

  const normalizedUserId =
    normalizeNoteId(userId);

  if (
    !normalizedEventId ||
    !normalizedUserId
  ) {
    return [];
  }

  return notes.filter((note) =>
    noteBelongsToUserEvent(
      note,
      normalizedEventId,
      normalizedUserId
    )
  );
};

/**
 * Find one note by ID.
 */
export const findEventNote = (
  notes = [],
  noteId
) => {
  if (!Array.isArray(notes)) {
    return null;
  }

  const normalizedId =
    normalizeNoteId(noteId);

  return (
    notes.find(
      (note) =>
        normalizeNoteId(
          note.id
        ) === normalizedId
    ) || null
  );
};

/**
 * Add a note to a notes collection.
 */
export const addEventNote = (
  notes = [],
  note
) => {
  if (!note) {
    return Array.isArray(notes)
      ? [...notes]
      : [];
  }

  return [
    ...(Array.isArray(notes)
      ? notes
      : []),
    note,
  ];
};

/**
 * Update an existing note.
 */
export const updateEventNote = (
  notes = [],
  noteId,
  updates = {}
) => {
  if (!Array.isArray(notes)) {
    return [];
  }

  const normalizedId =
    normalizeNoteId(noteId);

  const title =
    updates.title !== undefined
      ? String(
          updates.title
        ).trim()
      : undefined;

  const content =
    updates.content !==
    undefined
      ? String(
          updates.content
        ).trim()
      : undefined;

  const validation =
    validateEventNote({
      title:
        title !== undefined
          ? title
          : findEventNote(
              notes,
              noteId
            )?.title || "",
      content:
        content !== undefined
          ? content
          : findEventNote(
              notes,
              noteId
            )?.content || "",
    });

  if (!validation.valid) {
    return [...notes];
  }

  return notes.map((note) => {
    if (
      normalizeNoteId(
        note.id
      ) !== normalizedId
    ) {
      return note;
    }

    return {
      ...note,
      ...(title !== undefined
        ? { title }
        : {}),
      ...(content !== undefined
        ? { content }
        : {}),
      updatedAt:
        new Date().toISOString(),
      private: true,
    };
  });
};

/**
 * Delete a note by ID.
 */
export const deleteEventNote = (
  notes = [],
  noteId
) => {
  if (!Array.isArray(notes)) {
    return [];
  }

  const normalizedId =
    normalizeNoteId(noteId);

  return notes.filter(
    (note) =>
      normalizeNoteId(
        note.id
      ) !== normalizedId
  );
};

/**
 * Delete all notes belonging to
 * a specific event and user.
 */
export const deleteEventNotesForEvent = (
  notes = [],
  eventId,
  userId
) => {
  if (!Array.isArray(notes)) {
    return [];
  }

  return notes.filter(
    (note) =>
      !noteBelongsToUserEvent(
        note,
        eventId,
        userId
      )
  );
};

/**
 * Sort notes by most recently updated.
 */
export const sortEventNotes = (
  notes = [],
  order = "desc"
) => {
  if (!Array.isArray(notes)) {
    return [];
  }

  return [...notes].sort(
    (first, second) => {
      const firstDate =
        new Date(
          first.updatedAt ||
            first.createdAt ||
            0
        ).getTime();

      const secondDate =
        new Date(
          second.updatedAt ||
            second.createdAt ||
            0
        ).getTime();

      return order === "asc"
        ? firstDate - secondDate
        : secondDate - firstDate;
    }
  );
};

/**
 * Get the most recently updated notes.
 */
export const getRecentEventNotes = (
  notes = [],
  limit = 5
) => {
  const sorted =
    sortEventNotes(
      notes,
      "desc"
    );

  return sorted.slice(
    0,
    Math.max(0, limit)
  );
};

/**
 * Get notes for a particular event,
 * sorted by latest update.
 */
export const getSortedEventNotes = ({
  notes = [],
  eventId,
  userId,
  order = "desc",
} = {}) => {
  return sortEventNotes(
    getEventNotes({
      notes,
      eventId,
      userId,
    }),
    order
  );
};

/**
 * Count notes belonging to an event.
 */
export const getEventNoteCount = ({
  notes = [],
  eventId,
  userId,
} = {}) => {
  return getEventNotes({
    notes,
    eventId,
    userId,
  }).length;
};

/**
 * Check whether a user has notes for
 * a particular event.
 */
export const hasEventNotes = ({
  notes = [],
  eventId,
  userId,
} = {}) => {
  return (
    getEventNoteCount({
      notes,
      eventId,
      userId,
    }) > 0
  );
};

/**
 * Get note completion-style metadata.
 */
export const getEventNotesSummary = ({
  notes = [],
  eventId,
  userId,
} = {}) => {
  const eventNotes =
    getEventNotes({
      notes,
      eventId,
      userId,
    });

  return {
    total:
      eventNotes.length,
    hasNotes:
      eventNotes.length > 0,
    latestNote:
      sortEventNotes(
        eventNotes,
        "desc"
      )[0] || null,
  };
};

/**
 * Sanitize note text.
 *
 * Removes control characters while preserving
 * normal whitespace and line breaks.
 */
export const sanitizeNoteText = (
  value = ""
) => {
  return String(value)
    .replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
      ""
    )
    .trim();
};

/**
 * Normalize a note before persistence.
 */
export const normalizeEventNote = (
  note = {}
) => {
  const normalized = {
    ...note,
    id:
      normalizeNoteId(
        note.id
      ) ||
      generateEventNoteId(),
    eventId:
      normalizeNoteId(
        note.eventId
      ),
    userId:
      normalizeNoteId(
        note.userId
      ),
    title:
      sanitizeNoteText(
        note.title || ""
      ).slice(
        0,
        MAX_NOTE_TITLE_LENGTH
      ),
    content:
      sanitizeNoteText(
        note.content || ""
      ).slice(
        0,
        MAX_NOTE_CONTENT_LENGTH
      ),
    private: true,
  };

  if (!normalized.createdAt) {
    normalized.createdAt =
      new Date().toISOString();
  }

  normalized.updatedAt =
    normalized.updatedAt ||
    normalized.createdAt;

  return normalized;
};

/**
 * Normalize an entire notes collection.
 */
export const normalizeEventNotes = (
  notes = []
) => {
  if (!Array.isArray(notes)) {
    return [];
  }

  return notes
    .map(normalizeEventNote)
    .filter(
      (note) =>
        Boolean(
          note.eventId &&
            note.userId &&
            note.content
        )
    );
};

/**
 * Remove duplicate note IDs.
 */
export const removeDuplicateNotes = (
  notes = []
) => {
  if (!Array.isArray(notes)) {
    return [];
  }

  const seen = new Set();

  return notes.filter((note) => {
    const id =
      normalizeNoteId(note.id);

    if (!id) {
      return true;
    }

    if (seen.has(id)) {
      return false;
    }

    seen.add(id);

    return true;
  });
};

/**
 * Prepare notes for localStorage/API
 * persistence.
 */
export const serializeEventNotes = (
  notes = []
) => {
  return JSON.stringify(
    normalizeEventNotes(
      notes
    )
  );
};

/**
 * Restore notes from serialized data.
 */
export const deserializeEventNotes = (
  value
) => {
  if (!value) {
    return [];
  }

  try {
    const parsed =
      typeof value === "string"
        ? JSON.parse(value)
        : value;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return normalizeEventNotes(
      parsed
    );
  } catch {
    return [];
  }
};

/**
 * Save notes to localStorage.
 *
 * Returns false when localStorage is
 * unavailable.
 */
export const saveEventNotesToStorage = (
  storageKey,
  notes = []
) => {
  if (
    typeof window === "undefined" ||
    !window.localStorage ||
    !storageKey
  ) {
    return false;
  }

  try {
    window.localStorage.setItem(
      storageKey,
      serializeEventNotes(
        notes
      )
    );

    return true;
  } catch {
    return false;
  }
};

/**
 * Load notes from localStorage.
 */
export const loadEventNotesFromStorage = (
  storageKey
) => {
  if (
    typeof window === "undefined" ||
    !window.localStorage ||
    !storageKey
  ) {
    return [];
  }

  try {
    const stored =
      window.localStorage.getItem(
        storageKey
      );

    return deserializeEventNotes(
      stored
    );
  } catch {
    return [];
  }
};

/**
 * Create a storage key for a user's
 * event notes.
 */
export const getEventNotesStorageKey = (
  userId
) => {
  const normalizedUserId =
    normalizeNoteId(
      userId
    );

  if (!normalizedUserId) {
    return null;
  }

  return `eventra:event-notes:${normalizedUserId}`;
};

/**
 * Create a filtered storage key for
 * one event.
 */
export const getSingleEventNotesStorageKey = (
  userId,
  eventId
) => {
  const normalizedUserId =
    normalizeNoteId(
      userId
    );

  const normalizedEventId =
    normalizeNoteId(
      eventId
    );

  if (
    !normalizedUserId ||
    !normalizedEventId
  ) {
    return null;
  }

  return `eventra:event-notes:${normalizedUserId}:${normalizedEventId}`;
};

/**
 * Get note statistics.
 */
export const getNoteStatistics = (
  notes = []
) => {
  const normalized =
    normalizeEventNotes(
      notes
    );

  const total =
    normalized.length;

  const withTitles =
    normalized.filter(
      (note) =>
        Boolean(note.title)
    ).length;

  const totalCharacters =
    normalized.reduce(
      (totalLength, note) =>
        totalLength +
        note.content.length,
      0
    );

  return {
    total,
    withTitles,
    withoutTitles:
      total - withTitles,
    totalCharacters,
    averageCharacters:
      total > 0
        ? Math.round(
            totalCharacters /
              total
          )
        : 0,
  };
};