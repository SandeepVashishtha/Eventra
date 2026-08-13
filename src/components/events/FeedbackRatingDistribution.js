import { Star } from "lucide-react";

const FeedbackRatingDistribution = ({
  distribution = {},
  totalResponses = 0,
}) => {
  const ratings = [5, 4, 3, 2, 1];

  return (
    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
      <div className="mb-6 flex items-center gap-2">
        <Star
          size={20}
          className="fill-yellow-400 text-yellow-400"
        />

        <h3 className="font-semibold text-slate-800 dark:text-white">
          Rating Distribution
        </h3>
      </div>

      <div className="space-y-4">
        {ratings.map((rating) => {
          const count = Number(
            distribution[rating] ||
              distribution[String(rating)] ||
              0
          );

          const percentage =
            totalResponses > 0
              ? Math.round(
                  (count / totalResponses) * 100
                )
              : 0;

          return (
            <div key={rating}>
              <div className="mb-2 flex items-center gap-3">
                {/* Rating */}
                <div className="flex w-16 items-center gap-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {rating}
                  </span>

                  <Star
                    size={14}
                    className="fill-yellow-400 text-yellow-400"
                  />
                </div>

                {/* Progress */}
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                {/* Count */}
                <span className="w-12 text-right text-sm text-slate-500 dark:text-slate-400">
                  {count}
                </span>
              </div>

              <p className="ml-16 text-xs text-slate-400">
                {percentage}% of responses
              </p>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Total Responses
          </span>

          <span className="font-semibold text-slate-800 dark:text-white">
            {totalResponses}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FeedbackRatingDistribution;