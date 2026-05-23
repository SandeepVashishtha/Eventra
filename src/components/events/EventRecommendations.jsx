import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  
  ArrowRight
} from "lucide-react";
import mockEvents from "../../Pages/Events/eventsMockData.json";

const EventRecommendations = ({ currentEventId, currentCategory }) => {
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Personalized Interest preferences (mocked or loaded from user settings)
    const userInterests = JSON.parse(localStorage.getItem("user_interests")) || ["Coding", "Tech", "AI", "Development"];

    // 1. Gather all events except the one currently active
    let pool = mockEvents.filter((e) => e.id !== currentEventId);

    // 2. Score events based on personalization matches
    const scoredPool = pool.map((event) => {
      let score = 0;
      
      // Match current event's category (+10 points)
      if (currentCategory && event.category?.toLowerCase() === currentCategory.toLowerCase()) {
        score += 10;
      }
      
      // Match user's stored interest preferences (+5 points per match)
      const categoryTerms = (event.category || "").split(/[\s/&-]+/);
      categoryTerms.forEach((term) => {
        if (userInterests.some((interest) => interest.toLowerCase().includes(term.toLowerCase()))) {
          score += 5;
        }
      });

      return { ...event, recommendationScore: score };
    });

    // 3. Sort pool by recommendation score in descending order
    const sorted = scoredPool.sort((a, b) => b.recommendationScore - a.recommendationScore);
    
    // Take top 6 recommended events
    setRecommendedEvents(sorted.slice(0, 6));
  }, [currentEventId, currentCategory]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1 >= recommendedEvents.length - 2 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, recommendedEvents.length - 3) : prev - 1));
  };

  if (recommendedEvents.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-md">
      
      {/* HEADER CONTROLS */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Sparkles className="w-5 h-5 fill-amber-500/20" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Personalized Recommendations
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Curated hackathons and events handpicked based on your category focus.
            </p>
          </div>
        </div>

        {/* Carousel buttons */}
        {recommendedEvents.length > 3 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevSlide}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
              aria-label="Previous recommendation"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-350" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
              aria-label="Next recommendation"
            >
              <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-355" />
            </button>
          </div>
        )}
      </div>

      {/* RECOMMENDED SLIDES VIEW */}
      <div className="relative overflow-hidden w-full">
        <div
          className="flex transition-transform duration-500 ease-out gap-4"
          style={{
            transform: `translateX(-${currentIndex * (100 / 3)}%)`,
            width: `${Math.max(100, (recommendedEvents.length / 3) * 100)}%`
          }}
        >
          {recommendedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-300 w-[calc(33.333%-12px)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-755 dark:text-indigo-300">
                    {event.category || "General"}
                  </span>
                  {event.recommendationScore > 10 && (
                    <span className="text-[9px] font-bold text-amber-500 flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5 fill-amber-500/20" />
                      Top Match
                    </span>
                  )}
                </div>

                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 mt-3 line-clamp-1">
                  {event.title}
                </h4>
                
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>

                <div className="space-y-1.5 mt-4">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="truncate">{event.location || "Virtual"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">
                  {event.status || "Upcoming"}
                </span>
                <Link
                  to={`/events/${event.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Details
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default EventRecommendations;
