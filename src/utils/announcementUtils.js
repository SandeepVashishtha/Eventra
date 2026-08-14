const STORAGE_KEY = "eventra-announcements";

/**
 * Get all announcements
 */
export const getAnnouncements = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load announcements:", error);
    return [];
  }
};

/**
 * Save announcements
 */
export const saveAnnouncements = (announcements) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(announcements)
    );
  } catch (error) {
    console.error("Failed to save announcements:", error);
  }
};

/**
 * Publish a new announcement
 */
export const publishAnnouncement = (announcement) => {
  const announcements = getAnnouncements();

  const newAnnouncement = {
    id: Date.now() + "-" + Math.random().toString(36).slice(2, 9),
    ...announcement,
    isPublished: true,
    createdAt: new Date().toISOString(),
  };

  announcements.unshift(newAnnouncement);

  saveAnnouncements(announcements);

  return announcements;
};

/**
 * Schedule an announcement
 */
export const scheduleAnnouncement = (announcement) => {
  const announcements = getAnnouncements();

  const scheduled = {
    id: Date.now() + "-" + Math.random().toString(36).slice(2, 9),
    ...announcement,
    isPublished: false,
  };

  announcements.unshift(scheduled);

  saveAnnouncements(announcements);

  return announcements;
};

/**
 * Pin / Unpin announcement
 */
export const togglePinAnnouncement = (id) => {
  const announcements = getAnnouncements();

  const updated = announcements.map((item) =>
    item.id === id
      ? {
          ...item,
          isPinned: !item.isPinned,
        }
      : item
  );

  saveAnnouncements(updated);

  return updated;
};

/**
 * Delete announcement
 */
export const deleteAnnouncement = (id) => {
  const updated = getAnnouncements().filter(
    (item) => item.id !== id
  );

  saveAnnouncements(updated);

  return updated;
};

/**
 * Get only published announcements
 */
export const getPublishedAnnouncements = () => {
  return getAnnouncements().filter(
    (item) => item.isPublished
  );
};

/**
 * Get scheduled announcements
 */
export const getScheduledAnnouncements = () => {
  return getAnnouncements().filter(
    (item) => !item.isPublished
  );
};

/**
 * Sort announcements
 * Pinned first, then newest first
 */
export const sortAnnouncements = (announcements) => {
  return [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    return (
      new Date(b.createdAt) -
      new Date(a.createdAt)
    );
  });
};

/**
 * Search announcements
 */
export const searchAnnouncements = (
  announcements,
  query
) => {
  if (!query) return announcements;

  const keyword = query.toLowerCase();

  return announcements.filter(
    (item) =>
      (typeof item.title === "string" && item.title.toLowerCase().includes(keyword)) ||
      (typeof item.message === "string" && item.message.toLowerCase().includes(keyword))
  );
};