const STORAGE_KEY = "eventra_discussions";

/**
 * Get all discussions
 */
export const getDiscussions = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load discussions:", error);
    return [];
  }
};

/**
 * Save discussions
 */
export const saveDiscussions = (discussions) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(discussions)
    );
  } catch (error) {
    console.error("Failed to save discussions:", error);
  }
};

/**
 * Add discussion
 */
export const addDiscussion = (discussion) => {
  const discussions = getDiscussions();

  const newDiscussion = {
    id: Date.now() + "-" + Math.random().toString(36).slice(2, 9),
    author: discussion.author || "Anonymous",
    content: discussion.content || "",
    eventId: discussion.eventId,
    isOrganizer: discussion.isOrganizer || false,
    pinned: false,
    upvotes: 0,
    replies: [],
    createdAt: new Date().toISOString(),
  };

  discussions.unshift(newDiscussion);

  saveDiscussions(discussions);

  return newDiscussion;
};

/**
 * Delete discussion
 */
export const deleteDiscussion = (discussionId) => {
  const updated = getDiscussions().filter(
    (discussion) => discussion.id !== discussionId
  );

  saveDiscussions(updated);

  return updated;
};

/**
 * Update discussion
 */
export const updateDiscussion = (
  discussionId,
  updates
) => {
  const updated = getDiscussions().map((discussion) =>
    discussion.id === discussionId
      ? {
          ...discussion,
          ...updates,
        }
      : discussion
  );

  saveDiscussions(updated);

  return updated;
};

/**
 * Toggle upvote
 */
export const toggleUpvote = (discussionId) => {
  const updated = getDiscussions().map((discussion) =>
    discussion.id === discussionId
      ? {
          ...discussion,
          upvotes: discussion.upvotes + 1,
        }
      : discussion
  );

  saveDiscussions(updated);

  return updated;
};

/**
 * Pin / Unpin discussion
 */
export const pinDiscussion = (discussionId) => {
  const updated = getDiscussions().map((discussion) =>
    discussion.id === discussionId
      ? {
          ...discussion,
          pinned: !discussion.pinned,
        }
      : discussion
  );

  saveDiscussions(updated);

  return updated;
};

/**
 * Add reply
 */
export const addReply = (
  discussionId,
  reply
) => {
  const updated = getDiscussions().map((discussion) => {
    if (discussion.id !== discussionId)
      return discussion;

    return {
      ...discussion,
      replies: [
        ...discussion.replies,
        {
          id: Date.now() + "-" + Math.random().toString(36).slice(2, 9),
          author: reply.author || "Anonymous",
          content: reply.content,
          isOrganizer:
            reply.isOrganizer || false,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  });

  saveDiscussions(updated);

  return updated;
};

/**
 * Search discussions
 */
export const searchDiscussions = (
  discussions,
  query
) => {
  if (!query) return discussions;

  const keyword = query.toLowerCase();

  return discussions.filter(
    (discussion) =>
      discussion.content
        ?.toLowerCase()
        .includes(keyword) ||
      discussion.author
        ?.toLowerCase()
        .includes(keyword)
  );
};

/**
 * Get pinned discussions
 */
export const getPinnedDiscussions = (
  discussions
) => {
  return discussions.filter(
    (discussion) => discussion.pinned
  );
};

/**
 * Sort discussions
 */
export const sortDiscussions = (
  discussions
) => {
  return [...discussions].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    return (
      new Date(b.createdAt) -
      new Date(a.createdAt)
    );
  });
};

/**
 * Format relative time
 */
export const formatPostedTime = (
  dateString
) => {
  if (!dateString) return "Date not available";
  const timeParsed = new Date(dateString).getTime();
  if (isNaN(timeParsed)) return "Date not available";
  const diff = Date.now() - timeParsed;

  const minutes = Math.floor(
    diff / (1000 * 60)
  );

  if (minutes < 1) return "Just now";

  if (minutes < 60)
    return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24)
    return `${hours} hr ago`;

  const days = Math.floor(hours / 24);

  return `${days} day${days > 1 ? "s" : ""} ago`;
};

/**
 * Get discussions for a specific event
 */
export const getEventDiscussions = (
  eventId
) => {
  return getDiscussions().filter(
    (discussion) =>
      discussion.eventId === eventId
  );
};