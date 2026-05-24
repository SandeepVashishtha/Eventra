import React, { useEffect, useState } from "react";
import HackathonCard from "../../Pages/Hackathons/HackathonCard";
import mockHackathons from "../../Pages/Hackathons/hackathonMockData.json";

const RecommendedEvents = () => {
  const [recommendedHackathons, setRecommendedHackathons] = useState([]);

  useEffect(() => {

    // Simulated user interests
    const userInterests = [
        "React",
        "Node.js",
       "Python",
       "Blockchain",
       "Web",
       "TensorFlow",
      ];
// Recommendation logic
    const filtered = mockHackathons.filter((hackathon) => {
      if (!hackathon.techStack) return false;

      return hackathon.techStack.some((tech) =>
        userInterests.some((interest) =>
          tech.toLowerCase().includes(interest.toLowerCase())
        )
      );
    });

    // Show only top 3
    setRecommendedHackathons(filtered.slice(0, 3));

  }, []);

  return (
    <section className="bg-white dark:bg-black py-12 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Recommended For You
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Personalized hackathons based on your interests and activity.
            </p>
          </div>
        </div>

        {recommendedHackathons.length > 0 ? (

           <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {recommendedHackathons.map((hackathon, index) => (
              <HackathonCard
                key={hackathon.id}
                hackathon={hackathon}
                data-aos="flip-up"
                data-aos-delay={index * 100}
              />
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