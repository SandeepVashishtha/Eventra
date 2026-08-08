/**
 * Calculate registration percentage
 */
export const calculateRegistrationPercentage = (
  registered = 0,
  capacity = 0
) => {
  if (capacity <= 0) return 0;

  return Number(((registered / capacity) * 100).toFixed(1));
};

/**
 * Calculate remaining seats
 */
export const calculateRemainingSeats = (
  registered = 0,
  capacity = 0
) => {
  return Math.max(capacity - registered, 0);
};

/**
 * Calculate waitlist count
 */
export const calculateWaitlistCount = (
  waitlist = []
) => {
  return Array.isArray(waitlist) ? waitlist.length : 0;
};

/**
 * Group participants by category
 */
export const groupParticipantsByCategory = (
  participants = []
) => {
  return participants.reduce((result, participant) => {
    const category = participant.category || "Other";

    result[category] = (result[category] || 0) + 1;

    return result;
  }, {});
};

/**
 * Generate daily registration trend
 */
export const getDailyRegistrationTrend = (
  registrations = []
) => {
  const trend = {};

  registrations.forEach((registration) => {
    const date = new Date(
      registration.createdAt || registration.date
    ).toLocaleDateString();

    trend[date] = (trend[date] || 0) + 1;
  });

  return Object.entries(trend).map(([date, count]) => ({
    date,
    count,
  }));
};

/**
 * Calculate occupancy rate
 */
export const calculateOccupancyRate = (
  registered = 0,
  capacity = 0
) => {
  if (capacity <= 0) return 0;

  return Number(((registered / capacity) * 100).toFixed(2));
};

/**
 * Format registration date
 */
export const formatRegistrationDate = (
  date
) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Get dashboard summary
 */
export const getDashboardSummary = ({
  capacity = 0,
  registrations = [],
  waitlist = [],
  participants = [],
}) => {
  const totalRegistrations = registrations.length;

  return {
    totalRegistrations,
    remainingSeats: calculateRemainingSeats(
      totalRegistrations,
      capacity
    ),
    registrationPercentage:
      calculateRegistrationPercentage(
        totalRegistrations,
        capacity
      ),
    occupancyRate: calculateOccupancyRate(
      totalRegistrations,
      capacity
    ),
    waitlistedUsers:
      calculateWaitlistCount(waitlist),
    categoryDistribution:
      groupParticipantsByCategory(participants),
    registrationTrend:
      getDailyRegistrationTrend(registrations),
  };
};

/**
 * Find peak registration day
 */
export const getPeakRegistrationDay = (
  registrations = []
) => {
  const trend = getDailyRegistrationTrend(registrations);

  if (trend.length === 0) return null;

  return trend.reduce((peak, current) =>
    current.count > peak.count ? current : peak
  );
};

/**
 * Average registrations per day
 */
export const getAverageRegistrationsPerDay = (
  registrations = []
) => {
  const trend = getDailyRegistrationTrend(registrations);

  if (trend.length === 0) return 0;

  const total = trend.reduce(
    (sum, day) => sum + day.count,
    0
  );

  return Number((total / trend.length).toFixed(2));
};