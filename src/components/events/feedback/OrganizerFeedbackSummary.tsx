import React, { useMemo } from "react";

interface Feedback {
  id: string | number;
  rating: number;
  category?: string;
  comment?: string;
  createdAt: string;
}

interface OrganizerFeedbackSummaryProps {
  eventName: string;
  feedback?: Feedback[];
}

const OrganizerFeedbackSummary: React.FC<
  OrganizerFeedbackSummaryProps
> = ({ eventName, feedback = [] }) => {
  /*
   * Calculate the overall rating.
   */
  const overallRating = useMemo(() => {
    if (feedback.length === 0) {
      return 0;
    }

    const total = feedback.reduce(
      (sum, item) => sum + item.rating,
      0
    );

    return total / feedback.length;
  }, [feedback]);

  /*
   * Calculate rating distribution.
   */
  const ratingDistribution = useMemo(() => {
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    feedback.forEach((item) => {
      const rating = Math.round(item.rating);

      if (rating >= 1 && rating <= 5) {
        distribution[
          rating as keyof typeof distribution
        ]++;
      }
    });

    return distribution;
  }, [feedback]);

  /*
   * Calculate rating percentages.
   */
  const getRatingPercentage = (rating: number) => {
    if (feedback.length === 0) {
      return 0;
    }

    return Math.round(
      ((ratingDistribution[
        rating as keyof typeof ratingDistribution
      ] || 0) /
        feedback.length) *
        100
    );
  };

  /*
   * Calculate common feedback categories.
   */
  const categoryDistribution = useMemo(() => {
    const categories: Record<string, number> = {};

    feedback.forEach((item) => {
      if (!item.category) {
        return;
      }

      categories[item.category] =
        (categories[item.category] || 0) + 1;
    });

    return Object.entries(categories).sort(
      (a, b) => b[1] - a[1]
    );
  }, [feedback]);

  /*
   * Calculate category percentage.
   */
  const getCategoryPercentage = (count: number) => {
    if (feedback.length === 0) {
      return 0;
    }

    return Math.round((count / feedback.length) * 100);
  };

  /*
   * Calculate positive, neutral and negative responses.
   */
  const sentimentSummary = useMemo(() => {
    let positive = 0;
    let neutral = 0;
    let negative = 0;

    feedback.forEach((item) => {
      if (item.rating >= 4) {
        positive++;
      } else if (item.rating === 3) {
        neutral++;
      } else {
        negative++;
      }
    });

    return {
      positive,
      neutral,
      negative,
    };
  }, [feedback]);

  /*
   * Calculate monthly feedback trends.
   */
  const monthlyTrend = useMemo(() => {
    const months: Record<
      string,
      {
        total: number;
        rating: number;
      }
    > = {};

    feedback.forEach((item) => {
      const date = new Date(item.createdAt);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const month = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!months[month]) {
        months[month] = {
          total: 0,
          rating: 0,
        };
      }

      months[month].total++;
      months[month].rating += item.rating;
    });

    return Object.entries(months).map(
      ([month, data]) => ({
        month,
        responses: data.total,
        averageRating:
          data.total > 0
            ? data.rating / data.total
            : 0,
      })
    );
  }, [feedback]);

  /*
   * Format rating.
   */
  const formattedRating = overallRating.toFixed(1);

  /*
   * Empty state.
   */
  if (feedback.length === 0) {
    return (
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl dark:bg-blue-950">
            ⭐
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
            Feedback Summary
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
            There are no submitted reviews for {eventName} yet.
            The feedback summary will appear here once
            participants submit their reviews.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Organizer Dashboard
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              Feedback Summary
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Participant feedback overview for{" "}
              <strong>{eventName}</strong>
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 px-5 py-3 dark:bg-blue-950">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
              Responses
            </p>

            <p className="mt-1 text-xl font-bold text-blue-700 dark:text-blue-300">
              {feedback.length}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          OVERVIEW CARDS
      ====================================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Overall Rating */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Overall Rating
          </p>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              {formattedRating}
            </span>

            <span className="text-2xl text-yellow-400">
              ★
            </span>
          </div>

          <p className="mt-2 text-xs text-gray-400">
            Out of 5.0
          </p>
        </div>

        {/* Total Reviews */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Reviews
          </p>

          <p className="mt-3 text-4xl font-bold text-gray-900 dark:text-white">
            {feedback.length}
          </p>

          <p className="mt-2 text-xs text-gray-400">
            Submitted responses
          </p>
        </div>

        {/* Positive */}
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm dark:border-green-900 dark:bg-green-950">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            Positive
          </p>

          <p className="mt-3 text-4xl font-bold text-green-700 dark:text-green-300">
            {sentimentSummary.positive}
          </p>

          <p className="mt-2 text-xs text-green-600 dark:text-green-400">
            Ratings of 4 or 5
          </p>
        </div>

        {/* Needs Attention */}
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm dark:border-red-900 dark:bg-red-950">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Needs Attention
          </p>

          <p className="mt-3 text-4xl font-bold text-red-700 dark:text-red-300">
            {sentimentSummary.negative}
          </p>

          <p className="mt-2 text-xs text-red-600 dark:text-red-400">
            Ratings below 3
          </p>
        </div>
      </div>

      {/* =====================================================
          RATING DISTRIBUTION
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Rating Distribution
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Breakdown of participant ratings.
          </p>
        </div>

        <div className="space-y-4">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count =
              ratingDistribution[
                rating as keyof typeof ratingDistribution
              ];

            const percentage = getRatingPercentage(rating);

            return (
              <div
                key={rating}
                className="flex items-center gap-4"
              >
                <div className="flex w-20 items-center gap-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {rating}
                  </span>

                  <span className="text-yellow-400">
                    ★
                  </span>
                </div>

                <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-yellow-400 transition-all"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <div className="w-20 text-right">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {count}
                  </span>

                  <span className="ml-1 text-xs text-gray-400">
                    ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =====================================================
          FEEDBACK CATEGORIES
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Common Feedback Categories
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Frequently selected feedback areas.
          </p>
        </div>

        {categoryDistribution.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-8 text-center dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No feedback categories are available.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryDistribution.map(
              ([category, count]) => (
                <div
                  key={category}
                  className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                      {category}
                    </h3>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {count}
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width: `${getCategoryPercentage(
                          count
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    {getCategoryPercentage(count)}% of responses
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          SENTIMENT SUMMARY
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Feedback Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            High-level participant satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-green-50 p-5 dark:bg-green-950">
            <div className="flex items-center justify-between">
              <span className="text-2xl">😊</span>

              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                4–5 Stars
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-green-700 dark:text-green-300">
              {sentimentSummary.positive}
            </p>

            <p className="mt-1 text-sm text-green-600 dark:text-green-400">
              Positive responses
            </p>
          </div>

          <div className="rounded-xl bg-yellow-50 p-5 dark:bg-yellow-950">
            <div className="flex items-center justify-between">
              <span className="text-2xl">😐</span>

              <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                3 Stars
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-yellow-700 dark:text-yellow-300">
              {sentimentSummary.neutral}
            </p>

            <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
              Neutral responses
            </p>
          </div>

          <div className="rounded-xl bg-red-50 p-5 dark:bg-red-950">
            <div className="flex items-center justify-between">
              <span className="text-2xl">☹️</span>

              <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                1–2 Stars
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-red-700 dark:text-red-300">
              {sentimentSummary.negative}
            </p>

            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              Negative responses
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          FEEDBACK TREND
      ====================================================== */}
      {monthlyTrend.length > 1 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Feedback Over Time
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Monthly response and rating trends.
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-3 border-b border-gray-200 pb-3 text-xs font-semibold uppercase text-gray-400 dark:border-gray-700">
                <span>Month</span>
                <span>Responses</span>
                <span>Average Rating</span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {monthlyTrend.map((item) => (
                  <div
                    key={item.month}
                    className="grid grid-cols-3 py-4 text-sm"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {item.month}
                    </span>

                    <span className="text-gray-600 dark:text-gray-400">
                      {item.responses}
                    </span>

                    <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
                      {item.averageRating.toFixed(1)}
                      <span className="text-yellow-400">
                        ★
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PRIVACY NOTICE
      ====================================================== */}
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950">
        <div className="flex items-start gap-3">
          <span className="text-xl">🔒</span>

          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-300">
              Participant Privacy Protected
            </h3>

            <p className="mt-1 text-sm leading-6 text-green-700 dark:text-green-400">
              This dashboard displays only aggregated feedback
              information. Individual participant names, email
              addresses, and personally identifiable information
              are not displayed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrganizerFeedbackSummary;