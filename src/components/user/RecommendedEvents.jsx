import React, { useEffect, useState } from "react";

import HackathonCard from "../../Pages/Hackathons/HackathonCard";

import mockHackathons from "../../Pages/Hackathons/hackathonMockData.json";

import useRecommendations from "../../hooks/useRecommendations";


const RecommendedEvents = () => {

  const [recommendedHackathons, setRecommendedHackathons] = useState([]);

  // Intelligent recommendation engine
  const recommendations =
    useRecommendations(mockHackathons);

  useEffect(() => {

    // Show top 3 recommendations
    setRecommendedHackathons(
      recommendations.slice(0, 3)
    );

  }, [recommendations]);

  return (

    <section className="bg-white dark:bg-black py-12 border-b border-gray-200 dark:border-gray-800">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="flex justify-between items-center mb-8">

          <div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">

              Recommended For You

            </h2>

            <p className="text-gray-600 dark:text-gray-400 mt-2">

              Personalized hackathons based on your interests, activity, and recommendation score.

            </p>

          </div>

        </div>

        {/* Recommendations */}
        {recommendedHackathons.length > 0 ? (

          <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

            {recommendedHackathons.map((hackathon, index) => (

              <div
                key={hackathon.id}
                className="
                  relative
                  rounded-2xl
                  overflow-hidden
                "
              >

                {/* Recommendation Score Badge */}
                <div
                  className="
                    absolute
                    top-4
                    right-4
                    z-20
                    bg-blue-600
                    text-white
                    text-xs
                    font-bold
                    px-3
                    py-1
                    rounded-full
                    shadow-lg
                  "
                >
                  {hackathon.recommendationScore}% Match
                </div>

                {/* Main Card */}
                <HackathonCard
                  hackathon={hackathon}
                  data-aos="flip-up"
                  data-aos-delay={index * 100}
                />

                {/* Recommendation Reasons */}
                <div
                  className="
                    px-4
                    pb-4
                    pt-2
                    flex
                    flex-wrap
                    gap-2
                    bg-white
                    dark:bg-[#050505]
                    border-x
                    border-b
                    border-gray-200
                    dark:border-gray-800
                    rounded-b-2xl
                  "
                >

                  {hackathon.recommendationReasons?.map(
                    (reason, reasonIndex) => (

                      <span
                        key={reasonIndex}
                        className="
                          text-xs
                          bg-blue-100
                          dark:bg-blue-900/30
                          text-blue-700
                          dark:text-blue-300
                          px-3
                          py-1
                          rounded-full
                          font-medium
                        "
                      >
                        {reason}
                      </span>

                    )
                  )}

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="text-center py-10">

            <p className="text-gray-500 dark:text-gray-400">

              No recommendations available right now.

            </p>

          </div>

        )}

      </div>

    </section>

  );

};

export default RecommendedEvents;
// DESIGN UPGRADE: Overhauled grid templates with responsive fluid cards and stagger-staged entry animations.
