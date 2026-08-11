/**
 * Calculate the average rating.
 */
export const calculateAverageRating = (feedback = []) => {
  const ratings = feedback
    .map((item) => Number(item.rating))
    .filter((rating) => rating >= 1 && rating <= 5);

  if (ratings.length === 0) return 0;

  const total = ratings.reduce(
    (sum, rating) => sum + rating,
    0
  );

  return Number((total / ratings.length).toFixed(1));
};

/**
 * Get the total number of feedback responses.
 */
export const getResponseCount = (feedback = []) => {
  return feedback.length;
};

/**
 * Get the distribution of 1-5 star ratings.
 */
export const getRatingDistribution = (
  feedback = []
) => {
  const distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  feedback.forEach((item) => {
    const rating = Number(item.rating);

    if (rating >= 1 && rating <= 5) {
      distribution[rating] += 1;
    }
  });

  return distribution;
};

/**
 * Get positive feedback.
 *
 * Looks for feedback marked as positive or
 * feedback associated with a high rating.
 */
export const getPositiveFeedback = (
  feedback = []
) => {
  const positive = feedback.filter((item) => {
    const rating = Number(item.rating);

    return (
      item.sentiment === "positive" ||
      item.type === "positive" ||
      rating >= 4
    );
  });

  return positive
    .map(
      (item) =>
        item.comment ||
        item.feedback ||
        item.text ||
        ""
    )
    .filter(Boolean);
};

/**
 * Get common improvement areas.
 */
export const getImprovementAreas = (
  feedback = []
) => {
  const areas = feedback
    .filter((item) => {
      const rating = Number(item.rating);

      return (
        item.sentiment === "negative" ||
        item.type === "improvement" ||
        item.type === "negative" ||
        rating <= 3
      );
    })
    .map(
      (item) =>
        item.improvementArea ||
        item.category ||
        item.comment ||
        item.feedback ||
        item.text ||
        ""
    )
    .filter(Boolean);

  return getMostCommonItems(areas);
};

/**
 * Get feedback trends.
 */
export const getFeedbackTrends = (
  feedback = []
) => {
  const grouped = {};

  feedback.forEach((item) => {
    const date =
      item.createdAt ||
      item.date ||
      item.submittedAt;

    if (!date) return;

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return;

    const label = parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
      }
    );

    if (!grouped[label]) {
      grouped[label] = {
        total: 0,
        ratingTotal: 0,
      };
    }

    const rating = Number(item.rating);

    if (rating >= 1 && rating <= 5) {
      grouped[label].ratingTotal += rating;
      grouped[label].total += 1;
    }
  });

  return Object.entries(grouped).map(
    ([label, data]) => ({
      label,
      rating:
        data.total > 0
          ? Number(
              (
                data.ratingTotal / data.total
              ).toFixed(1)
            )
          : 0,
    })
  );
};

/**
 * Calculate the overall feedback trend.
 */
export const calculateFeedbackTrend = (
  feedback = []
) => {
  const trends = getFeedbackTrends(feedback);

  if (trends.length < 2) {
    return "Stable";
  }

  const first = trends[0].rating;
  const last =
    trends[trends.length - 1].rating;

  if (last > first + 0.2) {
    return "Improving";
  }

  if (last < first - 0.2) {
    return "Declining";
  }

  return "Stable";
};

/**
 * Get complete feedback summary.
 */
export const getFeedbackSummary = (
  feedback = []
) => {
  return {
    averageRating:
      calculateAverageRating(feedback),

    responseCount:
      getResponseCount(feedback),

    ratingDistribution:
      getRatingDistribution(feedback),

    trend:
      calculateFeedbackTrend(feedback),
  };
};

/**
 * Find the most common items in an array.
 */
const getMostCommonItems = (
  items = []
) => {
  const counts = {};

  items.forEach((item) => {
    const value = String(item).trim();

    if (!value) return;

    counts[value] = (counts[value] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([value]) => value);
};