import { useState } from "react";
import { Link } from "react-router-dom";
const RecommendationBanner = () => {
  const [activeFilter, setActiveFilter] = useState("AI/ML");
  return (
    <section
      className="relative overflow-hidden px-4 md:px-8 py-16 text-text border-t border-border transition-colors duration-300"
      style={{
        background: "linear-gradient(180deg, var(--bg-color, #F8FBFD) 0%, rgba(109, 40, 217, 0.02) 42%, rgba(109, 40, 217, 0.05) 100%)",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-28 bg-linear-to-b from-white/80 dark:from-slate-950/40 to-transparent" />
        <div className="absolute top-10 left-8 h-40 w-40 rounded-full bg-white/35 dark:bg-slate-800/10 blur-3xl" />
        <div className="absolute top-24 right-8 h-52 w-52 rounded-full bg-sky-100/35 dark:bg-brand-violet/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div
          className="
            rounded-[28px]
            border-2
            bg-card-bg
            px-8
            py-10
            md:px-12
            md:py-14
            shadow-premium-lg
            transition-all duration-300
          "
          style={{ borderColor: 'var(--primary-color)' }}
        >
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-800/80 text-primary text-sm font-semibold border border-primary/20 shadow-sm">
              ✨ AI Recommendation System
            </div>

            {/* Heading */}
            <h2 className="mt-5 text-4xl md:text-5xl font-extrabold leading-tight text-text">
              Find Events Tailored
              <span className="block text-primary mt-1">Just For You</span>
            </h2>

            {/* Description */}
            <p className="mt-4 text-base md:text-lg leading-relaxed text-text-light/90 max-w-2xl">
              Discover personalized hackathons, workshops, and tech events curated to your interests, skills, and past participation.
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 mt-6">
              {[
                'AI/ML',
                'Frontend',
                'Open Source',
                'Cybersecurity',
                'Hackathons',
                'Beginner Friendly',
              ].map((tag, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveFilter(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm shadow-sm transition-all duration-300 border ${
                    activeFilter === tag
                      ? "bg-primary text-white border-primary shadow-premium-sm scale-105"
                      : "bg-card-bg border-border text-text hover:border-primary/50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to="/event-recommendation"
                className="
                  px-6 py-3
                  rounded-full
                  bg-primary
                  hover:opacity-90
                  text-white
                  font-semibold
                  shadow-md
                  transition-all
                "
              >
                Try Recommendation Assistant
              </Link>

              <Link
                to="/events"
                className="px-6 py-3 rounded-full border border-border bg-card-bg hover:opacity-90 text-text text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                Explore Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecommendationBanner;