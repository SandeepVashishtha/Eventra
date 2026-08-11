import RecommendationCard from "./RecommendationCard";
import { getRecommendedEvents } from "../../utils/recommendationUtils";
import { Sparkles } from "lucide-react";

const RecommendedEvents = ({
  events = [],
  user = {},
  registeredEvents = [],
}) => {
  const recommendations = getRecommendedEvents(
    events,
    user,
    registeredEvents
  );

  if (!recommendations.length) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 p-8 text-center">
        <Sparkles
          size={42}
          className="mx-auto text-indigo-500 mb-4"
        />

        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          No Recommendations Available
        </h2>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Register for more events to receive personalized recommendations.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-10">

      <div className="flex items-center gap-2 mb-6">

        <Sparkles
          className="text-indigo-500"
          size={24}
        />

        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Recommended For You
        </h2>

      </div>

      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Personalized recommendations based on your interests,
        previous registrations, and trending events.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {recommendations.map((event) => (
          <RecommendationCard
            key={event.id}
            event={event}
            reason={
              event.reason ||
              "Recommended based on your interests"
            }
          />
        ))}

      </div>

    </section>
  );
};

export default RecommendedEvents;