/**
 * Feedback Utilities
 * Handles localStorage-based feedback management for events
 */

import { safeJsonParse } from "./safeJsonParse";
import { sanitizeHtml } from "./sanitizeHtml";
import { API_ENDPOINTS, apiUtils } from "../config/api";

const FEEDBACK_STORAGE_KEY = "eventra_feedback";

export const fetchEventFeedback = async (eventId) => {
  const response = await apiUtils.get(API_ENDPOINTS.FEEDBACK.BY_EVENT(eventId));
  return response.json();
};

export const submitEventFeedback = async ({ eventId, rating, comment, tags = [] }) => {
  const response = await apiUtils.post(API_ENDPOINTS.FEEDBACK.BASE, {
    eventId,
    rating,
    comment,
    tags,
  });
  return response.json();
};

/**
 * Get all feedback for an event
 * @param {string} eventId - Event identifier
 * @returns {Array} Array of feedback objects
 */
export const getEventFeedback = (eventId) => {
  try {
    const allFeedback = safeJsonParse(localStorage.getItem(FEEDBACK_STORAGE_KEY), {});
    const rawFeedback = allFeedback[eventId] || [];
    return rawFeedback.map((f) => ({
      ...f,
      comment: f.comment ? sanitizeHtml(f.comment) : f.comment,
    }));
  } catch {
    //console.error('Error retrieving feedback:', error);
    return [];
  }
};

/**
 * Save feedback for an event
 * @param {string} eventId - Event identifier
 * @param {Object} feedback - Feedback object { rating, comment, userId?, tags?, recommend? }
 * @returns {boolean} Success status
 */
export const saveFeedback = (eventId, feedback) => {
  try {
    const allFeedback = safeJsonParse(localStorage.getItem(FEEDBACK_STORAGE_KEY), {});
    const rawList = allFeedback[eventId] || [];

    // Use a Map for O(1) userId lookups instead of O(N) findIndex
    const feedbackMap = new Map(rawList.map((f) => [f.userId, f]));

    const feedbackObject = {
      ...feedback,
      submittedAt: new Date().toISOString(),
    };

    feedbackMap.set(feedback.userId, feedbackObject);
    allFeedback[eventId] = Array.from(feedbackMap.values());
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(allFeedback));
    return true;
  } catch {
    //console.error('Error saving feedback:', error);
    return false;
  }
};

/**
 * Check if user has submitted feedback for an event
 * @param {string} eventId - Event identifier
 * @param {string} userId - User identifier (optional, uses browser fingerprint)
 * @returns {boolean} Has submitted feedback
 */
export const hasUserSubmittedFeedback = (eventId, userId = null) => {
  try {
    const feedback = getEventFeedback(eventId);
    if (!userId) {
      return feedback.length > 0;
    }
    const userIdSet = new Set(feedback.map((f) => f.userId));
    return userIdSet.has(userId);
  } catch {
    //console.error('Error checking feedback status:', error);
    return false;
  }
};

/**
 * Get user's feedback for an event
 * @param {string} eventId - Event identifier
 * @param {string} userId - User identifier (optional)
 * @returns {Object|null} User's feedback or null
 */
export const getUserFeedback = (eventId, userId = null) => {
  try {
    const feedback = getEventFeedback(eventId);
    if (!userId) return feedback[0] || null;
    const feedbackMap = new Map(feedback.map((f) => [f.userId, f]));
    return feedbackMap.get(userId) || null;
  } catch {
    //console.error('Error retrieving user feedback:', error);
    return null;
  }
};

/**
 * Get average rating for an event
 * @param {string} eventId - Event identifier
 * @returns {Object} { average, count, total }
 */
export const getAverageRating = (eventId) => {
  try {
    const feedback = getEventFeedback(eventId);
    const ratings = feedback.map((f) => f.rating).filter((r) => r);

    if (ratings.length === 0) {
      return { average: 0, count: 0, total: 0 };
    }

    const total = ratings.reduce((sum, rating) => sum + rating, 0);
    const average = (total / ratings.length).toFixed(1);

    return {
      average: parseFloat(average),
      count: ratings.length,
      total,
    };
  } catch {
    //console.error('Error calculating average rating:', error);
    return { average: 0, count: 0, total: 0 };
  }
};

/**
 * Get recommendation percentage
 * @param {string} eventId - Event identifier
 * @returns {number} Percentage (0-100)
 */
export const getRecommendationPercentage = (eventId) => {
  const stats = getRecommendationStats(eventId);
  return stats.percentage;
};

/**
 * Get rating breakdown
 * @param {string} eventId - Event identifier
 * @returns {Object} Count of each rating { 1, 2, 3, 4, 5 }
 */
export const getRatingBreakdown = (eventId) => {
  try {
    const feedback = getEventFeedback(eventId);
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    feedback.forEach((f) => {
      if (f.rating && breakdown[f.rating] !== undefined) {
        breakdown[f.rating]++;
      }
    });

    return breakdown;
  } catch {
    //console.error('Error calculating rating breakdown:', error);
    return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  }
};

/**
 * Get top feedback tags
 * @param {string} eventId - Event identifier
 * @param {number} limit - Max tags to return
 * @returns {Array} Array of tag strings
 */
export const getTopFeedbackTags = (eventId, limit = 5) => {
  const tagStats = getTagStats(eventId);
  return Object.entries(tagStats)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
};

/**
 * Get recommendation stats
 * @param {string} eventId - Event identifier
 * @returns {Object} { recommendCount, notRecommendCount, percentage }
 */
export const getRecommendationStats = (eventId) => {
  try {
    const feedback = getEventFeedback(eventId);
    const { recommendCount, notRecommendCount, total } = feedback.reduce(
      (acc, f) => {
        if (f.recommend === true) acc.recommendCount++;
        else if (f.recommend === false) acc.notRecommendCount++;
        if (f.recommend !== undefined) acc.total++;
        return acc;
      },
      { recommendCount: 0, notRecommendCount: 0, total: 0 }
    );

    const percentage = total > 0 ? Math.round((recommendCount / total) * 100) : 0;

    return {
      recommendCount,
      notRecommendCount,
      total,
      percentage,
    };
  } catch {
    //console.error('Error calculating recommendation stats:', error);
    return { recommendCount: 0, notRecommendCount: 0, total: 0, percentage: 0 };
  }
};

/**
 * Get tag frequency
 * @param {string} eventId - Event identifier
 * @returns {Object} Tag counts
 */
export const getTagStats = (eventId) => {
  try {
    const feedback = getEventFeedback(eventId);
    const tagCounts = {};

    feedback.forEach((f) => {
      if (f.tags && Array.isArray(f.tags)) {
        f.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    return tagCounts;
  } catch {
    //console.error('Error calculating tag stats:', error);
    return {};
  }
};

/**
 * Delete feedback
 * @param {string} eventId - Event identifier
 * @param {string} userId - User identifier
 * @returns {boolean} Success status
 */
export const deleteFeedback = (eventId, userId = null) => {
  try {
    const allFeedback = safeJsonParse(localStorage.getItem(FEEDBACK_STORAGE_KEY), {});
    const eventFeedback = allFeedback[eventId] || [];

    if (userId) {
      allFeedback[eventId] = eventFeedback.filter((f) => f.userId !== userId);
    } else {
      delete allFeedback[eventId];
    }

    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(allFeedback));
    return true;
  } catch {
    //console.error('Error deleting feedback:', error);
    return false;
  }
};

/**
 * Export feedback as CSV
 * @param {string} eventId - Event identifier
 * @returns {string} CSV string
 */
export const exportFeedbackAsCSV = (eventId) => {
  try {
    const feedback = getEventFeedback(eventId);

    if (feedback.length === 0) {
      return "";
    }

    const headers = ["Rating", "Comment", "Tags", "Recommend", "Submitted At"];
    const rows = feedback.map((f) => [
      f.rating || "",
      `"${(f.comment || "").replace(/"/g, '""')}"`,
      (f.tags || []).join(";"),
      f.recommend !== undefined ? (f.recommend ? "Yes" : "No") : "",
      new Date(f.submittedAt).toLocaleString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    return csv;
  } catch {
    //console.error('Error exporting feedback:', error);
    return "";
  }
};

/**
 * Clear all feedback (for testing)
 */
export const clearAllFeedback = () => {
  try {
    localStorage.removeItem(FEEDBACK_STORAGE_KEY);
    return true;
  } catch {
    //console.error('Error clearing feedback:', error);
    return false;
  }
};
