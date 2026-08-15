/**
 * Predictive ML Attendance & No-Show Probability Engine (#13906)
 * Calculates registrant turnout probabilities using weighted feature vectors.
 */

/**
 * Feature Vector Weights
 */
const WEIGHTS = {
  pastAttendanceRatio: 0.45,
  daysRegisteredBeforeEvent: 0.20,
  profileCompleteness: 0.15,
  badgeCount: 0.10,
  isLocalResident: 0.10,
};

/**
 * Predict no-show probability for an individual attendee (0.0 = 100% turnout, 1.0 = 100% no-show).
 */
export function calculateAttendeeNoShowProbability(attendee = {}) {
  const pastRatio = typeof attendee.pastAttendanceRatio === "number" ? attendee.pastAttendanceRatio : 0.7;
  const daysBefore = Math.min(30, attendee.daysRegisteredBeforeEvent || 7) / 30.0;
  const profileScore = (attendee.profileCompleteness || 80) / 100.0;
  const badgeScore = Math.min(5, attendee.badgeCount || 2) / 5.0;
  const isLocalScore = attendee.isLocalResident ? 1.0 : 0.6;

  const showScore =
    pastRatio * WEIGHTS.pastAttendanceRatio +
    daysBefore * WEIGHTS.daysRegisteredBeforeEvent +
    profileScore * WEIGHTS.profileCompleteness +
    badgeScore * WEIGHTS.badgeCount +
    isLocalScore * WEIGHTS.isLocalResident;

  const clampedShow = Math.max(0.1, Math.min(0.95, showScore));
  const noShowProb = 1.0 - clampedShow;

  return Math.round(noShowProb * 100) / 100;
}

/**
 * Predict total turnout metrics for an entire event registration list.
 */
export function predictEventTurnout(registrations = [], eventCapacity = 0) {
  if (!Array.isArray(registrations) || registrations.length === 0) {
    return {
      totalRegistered: 0,
      predictedTurnout: 0,
      predictedNoShows: 0,
      turnoutPercentage: 0,
      recommendedOverbookingCapacity: 0,
      recommendedWaitlistPromotions: 0,
    };
  }

  let totalNoShowProb = 0;
  registrations.forEach((reg) => {
    totalNoShowProb += calculateAttendeeNoShowProbability(reg);
  });

  const totalRegistered = registrations.length;
  const predictedNoShows = Math.round(totalNoShowProb);
  const predictedTurnout = totalRegistered - predictedNoShows;
  const turnoutPercentage = Math.round((predictedTurnout / totalRegistered) * 100);

  // Over-booking multiplier (e.g. if 25% no-show expected, allow 1.25x waitlist over-booking)
  const noShowRate = predictedNoShows / totalRegistered;
  const recommendedOverbookingCapacity = Math.round(totalRegistered * (1 + noShowRate * 0.8));

  // Only recommend waitlist promotions if event has valid positive capacity
  const expectedNoShowSeats = predictedNoShows;
  const recommendedWaitlistPromotions = eventCapacity > 0
    ? Math.min(expectedNoShowSeats, Math.max(0, eventCapacity - totalRegistered + expectedNoShowSeats))
    : 0;

  return {
    totalRegistered,
    predictedTurnout,
    predictedNoShows,
    turnoutPercentage,
    recommendedOverbookingCapacity,
    recommendedWaitlistPromotions,
  };
}

/**
 * Predict average attendance rate percentage from historical event records.
 * Filters out invalid entries (e.g. non-numeric values, zero or missing capacity)
 * and safely handles empty history arrays to avoid division by zero or NaN results.
 *
 * @param {Array<{attended?: number, capacity?: number, maxAttendees?: number}>} history - Event history list
 * @param {number} [defaultRate=0] - Fallback percentage if history is empty or invalid
 * @returns {number} Average attendance percentage (0 to 100)
 */
export function predictAttendanceRate(history = [], defaultRate = 0) {
  if (!Array.isArray(history) || history.length === 0) {
    return defaultRate;
  }

  const validEntries = history.filter((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const capacity = Number(entry.capacity ?? entry.maxAttendees);
    const attended = Number(entry.attended ?? entry.attendeesCount);

    return (
      Number.isFinite(capacity) &&
      capacity > 0 &&
      Number.isFinite(attended) &&
      attended >= 0
    );
  });

  if (validEntries.length === 0) {
    return defaultRate;
  }

  const totalRatio = validEntries.reduce((sum, entry) => {
    const capacity = Number(entry.capacity ?? entry.maxAttendees);
    const attended = Number(entry.attended ?? entry.attendeesCount);
    const ratio = Math.min(Math.max(attended / capacity, 0), 1);
    return sum + ratio;
  }, 0);

  const averageRatio = totalRatio / validEntries.length;
  return Math.round(averageRatio * 100);
}