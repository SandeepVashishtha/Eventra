import { Link } from "react-router-dom";
import { Sparkles, TrendingUp, ChevronRight } from "lucide-react";
import usePersonalizedRecommendations from "../../hooks/usePersonalizedRecommendations";
import RecommendationCard from "./RecommendationCard";
import EmptyState from "../common/EmptyState";

const RecommendedForYou = ({
  title = "Recommended For You",
  subtitle = "Personalized events and hackathons based on your interests and activity.",
  limit = 6,
  compact = false,
  showTrending = true,
  className = "",
}) => {
  const { recommendations, trending, loading, error, refresh } =
    usePersonalizedRecommendations({ limit, trendingLimit: 4 });

  const gridClass = compact
    ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
    : "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className={`py-8 ${className}`}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            AI-Powered
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-indigo-200 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-200"
          >
            Refresh
          </button>
          <Link
            to="/event-recommendation"
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Explore all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className={gridClass}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={Sparkles}
          title="Recommendations unavailable"
          description={error}
        />
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No recommendations yet"
          description="Browse events and update your profile interests to get personalized suggestions."
          actionLabel="Browse events"
          actionPath="/events"
        />
      ) : (
        <div className={gridClass}>
          {recommendations.map((item, index) => (
            <RecommendationCard key={`${item.itemType}-${item.id}`} item={item} index={index} />
          ))}
        </div>
      )}

      {showTrending && trending.length > 0 && (
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Trending near you
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((item) => (
              <Link
                key={`trending-${item.id}`}
                to={`/events/${item.id}`}
                className="rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-orange-200 hover:bg-orange-50/50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-orange-950/20"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {item.location} · {item.trendingScore || item.recommendationScore} pts
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default RecommendedForYou;
