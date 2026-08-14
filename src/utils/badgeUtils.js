const STORAGE_KEY = "eventra-user-badges";

/**
 * Default badges
 */
export const DEFAULT_BADGES = [
  {
    id: 1,
    title: "First Registration",
    description: "Completed your first event registration.",
    icon: "🎟️",
    earned: false,
  },
  {
    id: 2,
    title: "Top Contributor",
    description: "Contributed significantly to the community.",
    icon: "⭐",
    earned: false,
  },
  {
    id: 3,
    title: "Hackathon Winner",
    description: "Won a hackathon event.",
    icon: "🏆",
    earned: false,
  },
  {
    id: 4,
    title: "Volunteer",
    description: "Participated as an event volunteer.",
    icon: "🤝",
    earned: false,
  },
  {
    id: 5,
    title: "Speaker",
    description: "Delivered a session at an event.",
    icon: "🎤",
    earned: false,
  },
  {
    id: 6,
    title: "Organizer",
    description: "Successfully organized an event.",
    icon: "📅",
    earned: false,
  },
  {
    id: 7,
    title: "Community Champion",
    description: "Highly active community member.",
    icon: "🌟",
    earned: false,
  },
];

/**
 * Load badges
 */
export const getAllBadges = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(DEFAULT_BADGES)
      );

      return DEFAULT_BADGES;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading badges:", error);
    return DEFAULT_BADGES;
  }
};

/**
 * Save badges
 */
export const saveBadges = (badges) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(badges)
    );
  } catch (error) {
    console.error("Error saving badges:", error);
  }
};

/**
 * Unlock badge
 */
export const unlockBadge = (badgeId) => {
  const badges = getAllBadges();

  const updated = badges.map((badge) =>
    badge.id === badgeId
      ? {
          ...badge,
          earned: true,
          earnedAt: new Date().toISOString(),
        }
      : badge
  );

  saveBadges(updated);

  return updated;
};

/**
 * Check badge
 */
export const hasBadge = (badgeId) => {
  return getAllBadges().some(
    (badge) => badge.id === badgeId && badge.earned
  );
};

/**
 * Earned badges
 */
export const getEarnedBadges = () => {
  return getAllBadges().filter(
    (badge) => badge.earned
  );
};

/**
 * Locked badges
 */
export const getLockedBadges = () => {
  return getAllBadges().filter(
    (badge) => !badge.earned
  );
};

/**
 * Badge progress
 */
export const badgeProgress = () => {
  const badges = getAllBadges();

  const earned = badges.filter(
    (badge) => badge.earned
  ).length;

  return {
    earned,
    total: badges.length,
    percentage: Math.round(
      (earned / badges.length) * 100
    ),
  };
};

/**
 * Sort badges
 */
export const sortBadges = () => {
  return [...getAllBadges()].sort((a, b) => {
    if (a.earned && !b.earned) return -1;
    if (!a.earned && b.earned) return 1;
    return a.title.localeCompare(b.title);
  });
};

/**
 * Reset badges
 */
export const resetBadges = () => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_BADGES)
    );
  } catch (error) {
    console.error("Error resetting badges:", error);
  }
};