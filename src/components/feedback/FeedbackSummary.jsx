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
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
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
    <div className="space-y-6 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 dark:border-indigo-800 dark:from-indigo-900/20 dark:to-blue-900/20">
      {/* Rating Section */}
      <div className="border-b border-indigo-200 pb-6 dark:border-indigo-800">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Event Feedback
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">
              {averageRating.average}
            </div>
            <div className="mt-2 flex justify-center gap-1">
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
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
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
                    <span className="w-8 text-xs text-gray-600 dark:text-gray-400">
                      {stars}★
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs text-gray-500 dark:text-gray-400">
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
        <div className="border-b border-indigo-200 pb-6 dark:border-indigo-800">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Users className="h-4 w-4" />
            Would Recommend
          </h4>
          <div className="flex items-center gap-4">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
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
          <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            Popular Mentions
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(tagStats)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([tag, count]) => (
                <div
                  key={tag}
                  className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-indigo-700 dark:bg-gray-800 dark:text-gray-300"
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
