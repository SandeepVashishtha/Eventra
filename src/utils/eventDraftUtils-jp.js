const STORAGE_KEY = "eventra_event_drafts";

/**
 * Get all saved event drafts.
 */
export const getEventDrafts = () => {
  try {
    const storedDrafts =
      localStorage.getItem(STORAGE_KEY);

    if (!storedDrafts) {
      return [];
    }

    const drafts = JSON.parse(storedDrafts);

    return Array.isArray(drafts) ? drafts : [];
  } catch (error) {
    console.error(
      "Failed to load event drafts:",
      error
    );

    return [];
  }
};

/**
 * Save all drafts to localStorage.
 */
const saveEventDrafts = (drafts) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(drafts)
    );

    return drafts;
  } catch (error) {
    console.error(
      "Failed to save event drafts:",
      error
    );

    return drafts;
  }
};

/**
 * Create a new event draft.
 */
export const saveEventDraft = (
  eventData = {}
) => {
  const drafts = getEventDrafts();

  const now = new Date().toISOString();

  const draft = {
    ...eventData,
    id:
      eventData.id ||
      `draft-${Date.now()}`,
    status: "draft",
    createdAt:
      eventData.createdAt || now,
    updatedAt: now,
  };

  const updatedDrafts = [
    draft,
    ...drafts.filter(
      (item) => item.id !== draft.id
    ),
  ];

  return saveEventDrafts(updatedDrafts);
};

/**
 * Update an existing draft.
 */
export const updateEventDraft = (
  draftId,
  eventData = {}
) => {
  if (!draftId) {
    return getEventDrafts();
  }

  const drafts = getEventDrafts();

  const updatedDrafts = drafts.map((draft) =>
    draft.id === draftId
      ? {
          ...draft,
          ...eventData,
          id: draft.id,
          status: "draft",
          updatedAt:
            new Date().toISOString(),
        }
      : draft
  );

  return saveEventDrafts(updatedDrafts);
};

/**
 * Get a single draft by ID.
 */
export const getEventDraft = (draftId) => {
  if (!draftId) return null;

  const drafts = getEventDrafts();

  return (
    drafts.find(
      (draft) => draft.id === draftId
    ) || null
  );
};

/**
 * Delete a draft.
 */
export const deleteEventDraft = (draftId) => {
  if (!draftId) {
    return getEventDrafts();
  }

  const drafts = getEventDrafts();

  const updatedDrafts = drafts.filter(
    (draft) => draft.id !== draftId
  );

  return saveEventDrafts(updatedDrafts);
};

/**
 * Publish a draft.
 *
 * Returns the published event but removes
 * the draft from the draft list.
 */
export const publishEventDraft = (draftId) => {
  const draft = getEventDraft(draftId);

  if (!draft) {
    return null;
  }

  const publishedEvent = {
    ...draft,
    status: "published",
    publishedAt:
      new Date().toISOString(),
  };

  deleteEventDraft(draftId);

  return publishedEvent;
};

/**
 * Check whether an event is a draft.
 */
export const isDraftEvent = (event) => {
  return (
    event?.status?.toLowerCase() === "draft"
  );
};

/**
 * Get the last updated timestamp for a draft.
 */
export const getDraftLastUpdated = (
  draft
) => {
  if (!draft?.updatedAt) {
    return null;
  }

  const date = new Date(draft.updatedAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

/**
 * Format the last updated timestamp.
 */
export const formatDraftUpdatedAt = (
  draft
) => {
  const date = getDraftLastUpdated(draft);

  if (!date) {
    return "Not updated yet";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Clear all saved drafts.
 */
export const clearEventDrafts = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error(
      "Failed to clear event drafts:",
      error
    );
  }

  return [];
};