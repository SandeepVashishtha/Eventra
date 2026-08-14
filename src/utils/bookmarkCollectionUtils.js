/**
 * Create a new bookmark collection
 */
export const createCollection = (
  collections = [],
  name
) => {
  if (typeof name !== "string" || !name.trim()) {
    return collections;
  }
  const cleanName = name.trim();
  if (collections.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) {
    return collections;
  }
  return [
    ...collections,
    {
      id: Date.now().toString(),
      name: cleanName,
      events: [],
      createdAt: new Date().toISOString(),
    },
  ];
};

/**
 * Rename a collection
 */
export const renameCollection = (
  collections = [],
  collectionId,
  newName
) => {
  return collections.map((collection) =>
    collection.id === collectionId
      ? {
          ...collection,
          name: newName,
        }
      : collection
  );
};

/**
 * Delete a collection
 */
export const deleteCollection = (
  collections = [],
  collectionId
) => {
  return collections.filter(
    (collection) => collection.id !== collectionId
  );
};

/**
 * Add an event to a collection
 */
export const addEventToCollection = (
  collections = [],
  collectionId,
  event
) => {
  return collections.map((collection) => {
    if (collection.id !== collectionId) {
      return collection;
    }

    const exists = collection.events.some(
      (item) => item.id === event.id
    );

    if (exists) {
      return collection;
    }

    return {
      ...collection,
      events: [...collection.events, event],
    };
  });
};

/**
 * Remove an event from a collection
 */
export const removeEventFromCollection = (
  collections = [],
  collectionId,
  eventId
) => {
  return collections.map((collection) =>
    collection.id === collectionId
      ? {
          ...collection,
          events: collection.events.filter(
            (event) => event.id !== eventId
          ),
        }
      : collection
  );
};

/**
 * Search collections
 */
export const searchCollections = (
  collections = [],
  query = ""
) => {
  if (!query.trim()) return collections;

  const keyword = query.toLowerCase();

  return collections.filter((collection) =>
    collection.name.toLowerCase().includes(keyword)
  );
};

/**
 * Sort collections alphabetically
 */
export const sortCollections = (
  collections = []
) => {
  return [...collections].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};

/**
 * Get collection by ID
 */
export const getCollectionById = (
  collections = [],
  collectionId
) => {
  return (
    collections.find(
      (collection) => collection.id === collectionId
    ) || null
  );
};

/**
 * Get total bookmarked events
 */
export const getTotalBookmarkedEvents = (
  collections = []
) => {
  return collections.reduce(
    (total, collection) =>
      total + collection.events.length,
    0
  );
};

/**
 * Get all bookmarked events
 */
export const getAllBookmarkedEvents = (
  collections = []
) => {
  return collections.flatMap(
    (collection) => collection.events
  );
};