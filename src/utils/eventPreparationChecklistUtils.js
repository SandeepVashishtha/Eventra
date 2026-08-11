/**
 * Default preparation checklist items.
 */
export const PREPARATION_CHECKLIST_ITEMS = [
  {
    id: "complete-registration",
    title: "Complete registration",
    description:
      "Make sure your event registration is completed successfully.",
    required: true,
  },
  {
    id: "join-community",
    title: "Join event community",
    description:
      "Join the event's official community or communication channel.",
    required: false,
  },
  {
    id: "complete-profile",
    title: "Complete profile",
    description:
      "Make sure your participant profile contains all required information.",
    required: true,
  },
  {
    id: "submit-documents",
    title: "Submit required documents",
    description:
      "Upload any documents required by the event organizer.",
    required: false,
  },
  {
    id: "join-team",
    title: "Join team",
    description:
      "Join or create a team if the event requires team participation.",
    required: false,
  },
  {
    id: "read-event-rules",
    title: "Read event rules",
    description:
      "Review the event rules, guidelines, and participation requirements.",
    required: true,
  },
];

/**
 * Get checklist items configured for an event.
 *
 * If the event provides its own checklist,
 * use it; otherwise use the default checklist.
 */
export const getChecklistItems = (
  event = {}
) => {
  if (
    Array.isArray(event.preparationChecklist) &&
    event.preparationChecklist.length > 0
  ) {
    return event.preparationChecklist.map(
      (item, index) => ({
        id:
          item.id ||
          `checklist-item-${index + 1}`,
        title:
          item.title ||
          item.label ||
          "Preparation item",
        description:
          item.description || "",
        required:
          item.required === true,
      })
    );
  }

  return PREPARATION_CHECKLIST_ITEMS.map(
    (item) => ({
      ...item,
    })
  );
};

/**
 * Create a checklist state with all items
 * initially marked as incomplete.
 */
export const createChecklistState = (
  event = {},
  completedItems = []
) => {
  const items =
    getChecklistItems(event);

  const completedIds =
    new Set(
      Array.isArray(completedItems)
        ? completedItems
        : []
    );

  return items.map((item) => ({
    ...item,
    completed:
      completedIds.has(item.id),
  }));
};

/**
 * Mark or unmark a checklist item.
 */
export const toggleChecklistItem = (
  checklist = [],
  itemId,
  completed
) => {
  if (!Array.isArray(checklist)) {
    return [];
  }

  return checklist.map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    return {
      ...item,
      completed:
        typeof completed === "boolean"
          ? completed
          : !item.completed,
    };
  });
};

/**
 * Mark a checklist item as completed.
 */
export const completeChecklistItem = (
  checklist = [],
  itemId
) => {
  return toggleChecklistItem(
    checklist,
    itemId,
    true
  );
};

/**
 * Mark a checklist item as incomplete.
 */
export const incompleteChecklistItem = (
  checklist = [],
  itemId
) => {
  return toggleChecklistItem(
    checklist,
    itemId,
    false
  );
};

/**
 * Get the number of completed checklist items.
 */
export const getCompletedItemCount = (
  checklist = []
) => {
  if (!Array.isArray(checklist)) {
    return 0;
  }

  return checklist.filter(
    (item) => item.completed === true
  ).length;
};

/**
 * Get the total number of checklist items.
 */
export const getTotalItemCount = (
  checklist = []
) => {
  return Array.isArray(checklist)
    ? checklist.length
    : 0;
};

/**
 * Calculate checklist completion percentage.
 */
export const getChecklistCompletionPercentage = (
  checklist = []
) => {
  const total =
    getTotalItemCount(checklist);

  if (total === 0) {
    return 0;
  }

  const completed =
    getCompletedItemCount(
      checklist
    );

  return Math.round(
    (completed / total) * 100
  );
};

/**
 * Get a checklist completion summary.
 */
export const getChecklistSummary = (
  checklist = []
) => {
  const completed =
    getCompletedItemCount(
      checklist
    );

  const total =
    getTotalItemCount(checklist);

  const percentage =
    getChecklistCompletionPercentage(
      checklist
    );

  return {
    completed,
    total,
    remaining:
      Math.max(0, total - completed),
    percentage,
    isComplete:
      total > 0 &&
      completed === total,
  };
};

/**
 * Get required checklist items.
 */
export const getRequiredChecklistItems = (
  checklist = []
) => {
  if (!Array.isArray(checklist)) {
    return [];
  }

  return checklist.filter(
    (item) => item.required === true
  );
};

/**
 * Get incomplete required items.
 */
export const getIncompleteRequiredItems = (
  checklist = []
) => {
  return getRequiredChecklistItems(
    checklist
  ).filter(
    (item) => item.completed !== true
  );
};

/**
 * Check whether all required items
 * have been completed.
 */
export const areRequiredItemsComplete = (
  checklist = []
) => {
  const requiredItems =
    getRequiredChecklistItems(
      checklist
    );

  return requiredItems.every(
    (item) =>
      item.completed === true
  );
};

/**
 * Check whether the entire checklist
 * has been completed.
 */
export const isChecklistComplete = (
  checklist = []
) => {
  if (
    !Array.isArray(checklist) ||
    checklist.length === 0
  ) {
    return false;
  }

  return checklist.every(
    (item) =>
      item.completed === true
  );
};

/**
 * Get all incomplete checklist items.
 */
export const getIncompleteItems = (
  checklist = []
) => {
  if (!Array.isArray(checklist)) {
    return [];
  }

  return checklist.filter(
    (item) =>
      item.completed !== true
  );
};

/**
 * Get all completed checklist items.
 */
export const getCompletedItems = (
  checklist = []
) => {
  if (!Array.isArray(checklist)) {
    return [];
  }

  return checklist.filter(
    (item) => item.completed === true
  );
};

/**
 * Find a checklist item by ID.
 */
export const findChecklistItem = (
  checklist = [],
  itemId
) => {
  if (!Array.isArray(checklist)) {
    return null;
  }

  return (
    checklist.find(
      (item) => item.id === itemId
    ) || null
  );
};

/**
 * Reset the complete checklist.
 */
export const resetChecklist = (
  checklist = []
) => {
  if (!Array.isArray(checklist)) {
    return [];
  }

  return checklist.map((item) => ({
    ...item,
    completed: false,
  }));
};

/**
 * Mark every checklist item as completed.
 */
export const completeAllChecklistItems = (
  checklist = []
) => {
  if (!Array.isArray(checklist)) {
    return [];
  }

  return checklist.map((item) => ({
    ...item,
    completed: true,
  }));
};

/**
 * Convert checklist state into a simple
 * array of completed item IDs.
 *
 * Useful for localStorage/API persistence.
 */
export const getCompletedItemIds = (
  checklist = []
) => {
  return getCompletedItems(
    checklist
  ).map((item) => item.id);
};

/**
 * Restore checklist completion state
 * from completed item IDs.
 */
export const restoreChecklistState = (
  checklist = [],
  completedItemIds = []
) => {
  if (!Array.isArray(checklist)) {
    return [];
  }

  const completedIds =
    new Set(
      Array.isArray(
        completedItemIds
      )
        ? completedItemIds
        : []
    );

  return checklist.map((item) => ({
    ...item,
    completed:
      completedIds.has(item.id),
  }));
};

/**
 * Add a custom checklist item.
 */
export const addChecklistItem = (
  checklist = [],
  item = {}
) => {
  if (!item) {
    return Array.isArray(checklist)
      ? checklist
      : [];
  }

  const newItem = {
    id:
      item.id ||
      generateChecklistItemId(),
    title:
      item.title ||
      item.label ||
      "Preparation item",
    description:
      item.description || "",
    required:
      item.required === true,
    completed:
      item.completed === true,
  };

  return [
    ...(
      Array.isArray(checklist)
        ? checklist
        : []
    ),
    newItem,
  ];
};

/**
 * Remove a checklist item.
 */
export const removeChecklistItem = (
  checklist = [],
  itemId
) => {
  if (!Array.isArray(checklist)) {
    return [];
  }

  return checklist.filter(
    (item) => item.id !== itemId
  );
};

/**
 * Update a checklist item.
 */
export const updateChecklistItem = (
  checklist = [],
  itemId,
  updates = {}
) => {
  if (!Array.isArray(checklist)) {
    return [];
  }

  return checklist.map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    return {
      ...item,
      ...updates,
      id: item.id,
    };
  });
};

/**
 * Reorder checklist items.
 */
export const reorderChecklistItems = (
  checklist = [],
  fromIndex,
  toIndex
) => {
  if (
    !Array.isArray(checklist) ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= checklist.length ||
    toIndex >= checklist.length
  ) {
    return checklist;
  }

  const result = [...checklist];

  const [movedItem] =
    result.splice(fromIndex, 1);

  result.splice(
    toIndex,
    0,
    movedItem
  );

  return result;
};

/**
 * Get a preparation status label.
 */
export const getPreparationStatus = (
  checklist = []
) => {
  const summary =
    getChecklistSummary(
      checklist
    );

  if (summary.isComplete) {
    return "Ready";
  }

  if (
    areRequiredItemsComplete(
      checklist
    )
  ) {
    return "Almost ready";
  }

  if (summary.completed > 0) {
    return "In progress";
  }

  return "Not started";
};

/**
 * Get a preparation status object.
 */
export const getPreparationStatusInfo = (
  checklist = []
) => {
  const summary =
    getChecklistSummary(
      checklist
    );

  const status =
    getPreparationStatus(
      checklist
    );

  return {
    status,
    ...summary,
    requiredComplete:
      areRequiredItemsComplete(
        checklist
      ),
    incompleteRequired:
      getIncompleteRequiredItems(
        checklist
      ),
  };
};

/**
 * Generate a unique checklist item ID.
 */
const generateChecklistItemId = () => {
  return `checklist-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};