import { useState, useEffect } from 'react';
import { Star, Users, BarChart3 } from 'lucide-react';
import {
  getAverageRating,
  getRecommendationStats,
  getTagStats,
  getRatingBreakdown,
} from '../../utils/feedbackUtils';

/**
 * FeedbackSummary Component
 * Display event feedback statistics and ratings
 */
const FeedbackSummary = ({ eventId, compact = false }) => {
  const [averageRating, setAverageRating] = useState(null);
  const [recommendationStats, setRecommendationStats] = useState(null);
  const [tagStats, setTagStats] = useState(null);
  const [ratingBreakdown, setRatingBreakdown] = useState(null);

  useEffect(() => {
    if (eventId) {
      setAverageRating(getAverageRating(eventId));
      setRecommendationStats(getRecommendationStats(eventId));
      setTagStats(getTagStats(eventId));
      setRatingBreakdown(getRatingBreakdown(eventId));
    }
  }, [eventId]);

  if (!averageRating || averageRating.count === 0) {
    return null;
  }

  // Compact view (for event cards)
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
          <span className="font-semibold text-gray-900 dark:text-white">
            {averageRating.average}
          </span>
          <span className="text-gray-500 dark:text-gray-400">({averageRating.count})</span>
        </div>
      </div>
    );
  }

  // Full view (for event details page)
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6 space-y-6">
      {/* Rating Section */}
      <div className="border-b border-indigo-200 dark:border-indigo-800 pb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Event Feedback
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {averageRating.average}
            </div>
            <div className="flex gap-1 justify-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(averageRating.average)
                      ? 'fill-yellow-400 text-yellow-500'
                      : 'fill-gray-300 text-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Based on {averageRating.count} review{averageRating.count !== 1 ? 's' : ''}
            </p>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingBreakdown ? ratingBreakdown[stars] : 0;
                const percentage = averageRating.count > 0
                  ? Math.round((count / averageRating.count) * 100)
                  : 0;

                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-8">
                      {stars}★
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Section */}
      {recommendationStats && recommendationStats.total > 0 && (
        <div className="border-b border-indigo-200 dark:border-indigo-800 pb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Would Recommend
          </h4>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${recommendationStats.percentage}%` }}
              />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {recommendationStats.percentage}%
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {recommendationStats.recommendCount} of {recommendationStats.total}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tags Section */}
      {tagStats && Object.keys(tagStats).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Popular Mentions
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(tagStats)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([tag, count]) => (
                <div
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 text-xs font-medium text-gray-700 dark:text-gray-300"
                >
                  {tag}
                  <span className="ml-1.5 text-indigo-600 dark:text-indigo-400">×{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackSummary;
