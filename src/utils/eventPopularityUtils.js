/**
 * Popularity thresholds.
 *
 * These values are intentionally kept configurable so
 * the project can adjust what "popular" and "trending"
 * mean later.
 */
export const POPULARITY_THRESHOLDS = {
  TRENDING_SCORE: 70,
  POPULAR_SCORE: 50,
  HIGH_REGISTRATION_RATE: 75,
};

/**
 * Safely convert a value to a non-negative number.
 */
export const toSafeNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, number);
};

/**
 * Get the registration count from an event.
 */
export const getRegistrationCount = (
  event = {}
) => {
  return toSafeNumber(
    event.registrationCount ??
      event.registrationsCount ??
      event.registeredUsers ??
      event.participantCount ??
      event.registrations
  );
};

/**
 * Get the number of interested users.
 */
export const getInterestedCount = (
  event = {}
) => {
  return toSafeNumber(
    event.interestedCount ??
      event.interestedUsers ??
      event.interests ??
      event.likes
  );
};

/**
 * Get the event view count.
 */
export const getViewCount = (
  event = {}
) => {
  return toSafeNumber(
    event.viewCount ??
      event.views ??
      event.eventViews
  );
};

/**
 * Get the maximum number of seats.
 */
export const getCapacity = (
  event = {}
) => {
  return toSafeNumber(
    event.capacity ??
      event.maxParticipants ??
      event.maxAttendees ??
      event.seatCapacity ??
      event.totalSeats
  );
};

/**
 * Get remaining seats.
 *
 * If the event already provides remainingSeats,
 * use that value. Otherwise calculate it from
 * capacity - registrations.
 */
export const getRemainingSeats = (
  event = {}
) => {
  if (
    event.remainingSeats !==
      undefined &&
    event.remainingSeats !== null
  ) {
    return toSafeNumber(
      event.remainingSeats
    );
  }

  const capacity =
    getCapacity(event);

  if (capacity === 0) {
    return 0;
  }

  return Math.max(
    0,
    capacity -
      getRegistrationCount(event)
  );
};

/**
 * Calculate registration rate as a percentage.
 */
export const getRegistrationRate = (
  event = {}
) => {
  const capacity =
    getCapacity(event);

  if (capacity <= 0) {
    return 0;
  }

  const registrations =
    getRegistrationCount(event);

  return Math.min(
    100,
    Math.round(
      (registrations / capacity) *
        100
    )
  );
};

/**
 * Calculate an interest rate relative to
 * registrations.
 */
export const getInterestRate = (
  event = {}
) => {
  const registrations =
    getRegistrationCount(event);

  const interested =
    getInterestedCount(event);

  if (registrations <= 0) {
    return interested > 0 ? 100 : 0;
  }

  return Math.min(
    100,
    Math.round(
      (interested / registrations) *
        100
    )
  );
};

/**
 * Calculate a popularity score from 0-100.
 *
 * The score considers:
 * - registration rate
 * - interested users
 * - views
 * - remaining seat pressure
 */
export const calculatePopularityScore = (
  event = {}
) => {
  const registrations =
    getRegistrationCount(event);

  const interested =
    getInterestedCount(event);

  const views =
    getViewCount(event);

  const capacity =
    getCapacity(event);

  const registrationRate =
    getRegistrationRate(event);

  /*
   * Registration component:
   * Up to 50 points based on capacity usage.
   */
  const registrationScore =
    registrationRate * 0.5;

  /*
   * Interest component:
   * Interested users receive up to 20 points.
   * 100 interested users reaches the maximum.
   */
  const interestScore = Math.min(
    20,
    interested * 0.2
  );

  /*
   * View component:
   * 1,000 views reaches the maximum.
   */
  const viewScore = Math.min(
    15,
    views * 0.015
  );

  /*
   * Engagement component:
   * Additional points when registrations
   * are already significant.
   */
  const engagementScore = Math.min(
    15,
    registrations * 0.15
  );

  const score = Math.round(
    registrationScore +
      interestScore +
      viewScore +
      engagementScore
  );

  /*
   * Keep capacity referenced so the calculation
   * remains safe even when no capacity exists.
   */
  if (capacity <= 0 && registrations === 0) {
    return Math.min(
      100,
      Math.round(
        interestScore +
          viewScore
      )
    );
  }

  return Math.min(100, score);
};

/**
 * Get a popularity level.
 */
export const getPopularityLevel = (
  score
) => {
  const safeScore = Math.max(
    0,
    Math.min(100, toSafeNumber(score))
  );

  if (
    safeScore >=
    POPULARITY_THRESHOLDS.TRENDING_SCORE
  ) {
    return "trending";
  }

  if (
    safeScore >=
    POPULARITY_THRESHOLDS.POPULAR_SCORE
  ) {
    return "popular";
  }

  return "normal";
};

/**
 * Check whether an event should display
 * the Trending badge.
 */
export const isTrendingEvent = (
  event = {}
) => {
  /*
   * Respect an explicitly supplied trending
   * value when the backend already provides it.
   */
  if (
    typeof event.isTrending ===
    "boolean"
  ) {
    return event.isTrending;
  }

  if (event.trending === true) {
    return true;
  }

  return (
    calculatePopularityScore(event) >=
    POPULARITY_THRESHOLDS.TRENDING_SCORE
  );
};

/**
 * Get a human-readable popularity label.
 */
export const getPopularityLabel = (
  event = {}
) => {
  const score =
    calculatePopularityScore(event);

  const level =
    getPopularityLevel(score);

  if (level === "trending") {
    return "Trending";
  }

  if (level === "popular") {
    return "Popular";
  }

  return "Growing";
};

/**
 * Get a complete set of popularity metrics
 * for an event.
 */
export const getEventPopularityMetrics = (
  event = {}
) => {
  const registrations =
    getRegistrationCount(event);

  const interested =
    getInterestedCount(event);

  const views =
    getViewCount(event);

  const capacity =
    getCapacity(event);

  const remainingSeats =
    getRemainingSeats(event);

  const registrationRate =
    getRegistrationRate(event);

  const score =
    calculatePopularityScore(event);

  return {
    registrations,
    interested,
    views,
    capacity,
    remainingSeats,
    registrationRate,
    score,
    level:
      getPopularityLevel(score),
    label:
      getPopularityLabel(event),
    isTrending:
      isTrendingEvent(event),
    isAlmostFull:
      capacity > 0 &&
      remainingSeats > 0 &&
      registrationRate >=
        POPULARITY_THRESHOLDS.HIGH_REGISTRATION_RATE,
    isFull:
      capacity > 0 &&
      remainingSeats === 0,
  };
};

/**
 * Format large numbers for display.
 *
 * Examples:
 * 842 -> "842"
 * 1200 -> "1.2K"
 * 1500000 -> "1.5M"
 */
export const formatPopularityNumber = (
  value
) => {
  const number = toSafeNumber(value);

  if (number < 1000) {
    return String(number);
  }

  if (number < 1000000) {
    return `${(number / 1000)
      .toFixed(
        number >= 10000 ? 0 : 1
      )
      .replace(/\.0$/, "")}K`;
  }

  if (number < 1000000000) {
    return `${(number / 1000000)
      .toFixed(1)
      .replace(/\.0$/, "")}M`;
  }

  return `${(number / 1000000000)
    .toFixed(1)
    .replace(/\.0$/, "")}B`;
};

/**
 * Get a registration summary.
 */
export const getRegistrationSummary = (
  event = {}
) => {
  const registrations =
    getRegistrationCount(event);

  const capacity =
    getCapacity(event);

  const remainingSeats =
    getRemainingSeats(event);

  if (capacity <= 0) {
    return `${formatPopularityNumber(
      registrations
    )} registered`;
  }

  if (remainingSeats === 0) {
    return `${formatPopularityNumber(
      registrations
    )} registered · Full`;
  }

  return `${formatPopularityNumber(
    registrations
  )} registered · ${formatPopularityNumber(
    remainingSeats
  )} seats left`;
};

/**
 * Get the text displayed for remaining seats.
 */
export const getRemainingSeatsLabel = (
  event = {}
) => {
  const capacity =
    getCapacity(event);

  if (capacity <= 0) {
    return null;
  }

  const remaining =
    getRemainingSeats(event);

  if (remaining === 0) {
    return "Sold out";
  }

  if (remaining <= 5) {
    return `${remaining} ${
      remaining === 1
        ? "seat"
        : "seats"
    } left`;
  }

  return `${formatPopularityNumber(
    remaining
  )} seats left`;
};

/**
 * Determine whether an event has enough
 * popularity information to display an
 * indicator.
 */
export const hasPopularityData = (
  event = {}
) => {
  return (
    getRegistrationCount(event) > 0 ||
    getInterestedCount(event) > 0 ||
    getViewCount(event) > 0 ||
    getCapacity(event) > 0
  );
};

/**
 * Filter events by popularity level.
 */
export const filterEventsByPopularity = (
  events = [],
  level = "all"
) => {
  if (!Array.isArray(events)) {
    return [];
  }

  if (!level || level === "all") {
    return events;
  }

  return events.filter((event) => {
    const score =
      calculatePopularityScore(event);

    return (
      getPopularityLevel(score) ===
      level
    );
  });
};

/**
 * Return events ordered by popularity.
 *
 * Highest popularity first by default.
 */
export const sortEventsByPopularity = (
  events = [],
  order = "desc"
) => {
  if (!Array.isArray(events)) {
    return [];
  }

  return [...events].sort(
    (a, b) => {
      const scoreA =
        calculatePopularityScore(a);

      const scoreB =
        calculatePopularityScore(b);

      return order === "asc"
        ? scoreA - scoreB
        : scoreB - scoreA;
    }
  );
};

/**
 * Get only trending events.
 */
export const getTrendingEvents = (
  events = []
) => {
  if (!Array.isArray(events)) {
    return [];
  }

  return events.filter(
    isTrendingEvent
  );
};

/**
 * Create a compact popularity object
 * suitable for event cards.
 */
export const getEventPopularityDisplay = (
  event = {}
) => {
  const metrics =
    getEventPopularityMetrics(event);

  return {
    trending: metrics.isTrending,
    label: metrics.label,
    registrations:
      formatPopularityNumber(
        metrics.registrations
      ),
    interested:
      formatPopularityNumber(
        metrics.interested
      ),
    views:
      formatPopularityNumber(
        metrics.views
      ),
    remainingSeats:
      getRemainingSeatsLabel(event),
    registrationRate:
      metrics.registrationRate,
    score: metrics.score,
    level: metrics.level,
  };
};