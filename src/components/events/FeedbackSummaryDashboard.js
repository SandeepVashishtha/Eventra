import { useMemo } from "react";
import {
  BarChart3,
  MessageSquare,
  Star,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";
import FeedbackRatingDistribution from "./FeedbackRatingDistribution";
import {
  getFeedbackSummary,
  getPositiveFeedback,
  getImprovementAreas,
  getFeedbackTrends,
} from "../../utils/feedbackSummaryUtils";

const FeedbackSummaryDashboard = ({
  feedback = [],
  eventName = "Event",
}) => {
  const summary = useMemo(
    () => getFeedbackSummary(feedback),
    [feedback]
  );

  const positiveFeedback = useMemo(
    () => getPositiveFeedback(feedback),
    [feedback]
  );

  const improvementAreas = useMemo(
    () => getImprovementAreas(feedback),
    [feedback]
  );

  const feedbackTrends = useMemo(
    () => getFeedbackTrends(feedback),
    [feedback]
  );

  return (
    <section className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="mb-8 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <BarChart3
            size={25}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Feedback Summary
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Feedback analytics for {eventName}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {feedback.length === 0 ? (
        <div className="py-14 text-center">
          <MessageSquare
            size={52}
            className="mx-auto mb-4 text-slate-400"
          />

          <h3 className="text-lg font-semibold text-slate-700 dark:text-white">
            No Feedback Available
          </h3>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Feedback statistics will appear here after participants submit
            their responses.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={<Star size={22} />}
              title="Average Rating"
              value={`${summary.averageRating}/5`}
              description="Overall event rating"
              iconClass="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
            />

            <SummaryCard
              icon={<MessageSquare size={22} />}
              title="Responses"
              value={summary.responseCount}
              description="Participant responses"
              iconClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
            />

            <SummaryCard
              icon={<ThumbsUp size={22} />}
              title="Positive Feedback"
              value={positiveFeedback.length}
              description="Positive responses"
              iconClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
            />

            <SummaryCard
              icon={<TrendingUp size={22} />}
              title="Trend"
              value={summary.trend || "Stable"}
              description="Recent feedback trend"
              iconClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            />
          </div>

          {/* Rating Distribution */}
          <div className="mt-8">
            <FeedbackRatingDistribution
              distribution={summary.ratingDistribution}
              totalResponses={summary.responseCount}
            />
          </div>

          {/* Feedback Insights */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Positive Feedback */}
            <FeedbackList
              title="Most Common Positive Feedback"
              items={positiveFeedback}
              emptyMessage="No positive feedback found."
              type="positive"
            />

            {/* Improvement Areas */}
            <FeedbackList
              title="Common Improvement Areas"
              items={improvementAreas}
              emptyMessage="No improvement areas found."
              type="improvement"
            />
          </div>

          {/* Feedback Trends */}
          <div className="mt-8 rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp
                size={20}
                className="text-indigo-600 dark:text-indigo-400"
              />

              <h3 className="font-semibold text-slate-800 dark:text-white">
                Feedback Trends
              </h3>
            </div>

            {feedbackTrends.length === 0 ? (
              <p className="text-sm text-slate-500">
                No trend data available.
              </p>
            ) : (
              <div className="space-y-4">
                {feedbackTrends.map((trend) => (
                  <div key={trend.label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-300">
                        {trend.label}
                      </span>

                      <span className="font-semibold text-slate-800 dark:text-white">
                        {trend.rating}/5
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all"
                        style={{
                          width: `${Math.min(
                            (Number(trend.rating) / 5) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

const SummaryCard = ({
  icon,
  title,
  value,
  description,
  iconClass,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

const FeedbackList = ({
  title,
  items = [],
  emptyMessage,
  type,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
      <h3 className="mb-4 font-semibold text-slate-800 dark:text-white">
        {title}
      </h3>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">
          {emptyMessage}
        </p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 5).map((item, index) => (
            <div
              key={`${item}-${index}`}
              className={`rounded-xl px-4 py-3 text-sm ${
                type === "positive"
                  ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                  : "bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
              }`}
            >
              {typeof item === "string"
                ? item
                : item.text || item.label || ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackSummaryDashboard;