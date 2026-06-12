import { useEffect, useState } from "react";

import HackathonCard from "../../Pages/Hackathons/HackathonCard";

import mockHackathons from "../../Pages/Hackathons/hackathonMockData.json";

import useRecommendations from "../../hooks/useRecommendations";

const RecommendedEvents = () => {
  const [recommendedHackathons, setRecommendedHackathons] = useState([]);

  // Intelligent recommendation engine
  const recommendations = useRecommendations(mockHackathons);

  useEffect(() => {
    // Show top 3 recommendations
    setRecommendedHackathons(recommendations.slice(0, 3));
  }, [recommendations]);

  return (
    <section className="bg-bg text-text border-border border-b py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-text text-3xl font-bold">Recommended For You</h2>

            <p className="text-text-light mt-2">
              Personalized hackathons based on your interests, activity, and recommendation score.
            </p>
          </div>
        </div>

        {/* Recommendations */}
        {recommendedHackathons.length > 0 ? (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {recommendedHackathons.map((hackathon, index) => (
              <div key={hackathon.id} className="relative overflow-hidden rounded-2xl">
                {/* Recommendation Score Badge */}
                <div className="bg-primary absolute top-4 right-4 z-20 rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg">
                  {hackathon.recommendationScore}% Match
                </div>

                {/* Main Card */}
                <HackathonCard
                  hackathon={hackathon}
                  data-aos="flip-up"
                  data-aos-delay={index * 100}
                />

                {/* Recommendation Reasons */}
                <div className="bg-card-bg border-border flex flex-wrap gap-2 rounded-b-2xl border-x border-b px-4 pt-2 pb-4">
                  {hackathon.recommendationReasons?.map((reason, reasonIndex) => (
                    <span
                      key={reasonIndex}
                      className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-text-light">No recommendations available right now.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendedEvents;
