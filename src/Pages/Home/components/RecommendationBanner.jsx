import React, { memo } from "react";

/**
 * 🎯 HELPER SUB-COMPONENT: RecommendationBadge
 * Rendered explicitly to isolate styling logic and increase file modularity.
 */
const RecommendationBadge = memo(() => {
  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        px-4
        py-2
        rounded-full
        bg-blue-100
        dark:bg-blue-900/30
        text-blue-700
        dark:text-blue-300
        text-sm
        font-medium
        select-none
      "
    >
      <span>✨</span>
      <span>AI Recommendation System</span>
    </div>
  );
});

RecommendationBadge.displayName = "RecommendationBadge";

/**
 * 🏷️ HELPER SUB-COMPONENT: InterestTag
 * Provides an accessible, styled wrapper around static tag elements.
 */
const InterestTag = memo(({ label }) => {
  return (
    <span
      className="
        px-4
        py-2
        rounded-full
        bg-white
        dark:bg-slate-800
        border
        border-slate-200
        dark:border-slate-700
        text-sm
        text-slate-700
        dark:text-slate-300
        transition-colors
        duration-200
        hover:bg-slate-50
        dark:hover:bg-slate-750
      "
    >
      {label}
    </span>
  );
});

InterestTag.displayName = "InterestTag";

/**
 * 🚀 MAIN COMPONENT: RecommendationBanner
 * Features comprehensive a11y focus indicators across light and dark frames.
 */
const RecommendationBanner = () => {
  // Mock data array extracted into variable bounds to optimize component processing loops
  const coreRecommendationTags = [
    "AI/ML",
    "Frontend",
    "Open Source",
    "Cybersecurity",
    "Hackathons",
    "Beginner Friendly",
  ];

  return (
    <section 
      className="px-4 md:px-8 py-6 unique-recommendation-wrapper"
      aria-label="Personalized Event Recommendations Section"
    >
      <div
        className="
          max-w-7xl
          mx-auto
          rounded-3xl
          border
          border-slate-200
          dark:border-slate-800
          bg-gradient-to-r
          from-slate-50
          to-blue-50
          dark:from-slate-900
          dark:to-slate-950
          px-8
          py-10
          md:px-12
          md:py-12
          shadow-sm
          transition-all
          duration-300
        "
      >
        <div className="max-w-3xl structural-content-container">
          
          {/* Badge Sub-Module Insertion */}
          <RecommendationBadge />

          {/* Heading Component Grid */}
          <h1
            className="
              mt-5
              text-4xl
              md:text-5xl
              font-bold
              leading-tight
              text-slate-900
              dark:text-white
              tracking-tight
            "
          >
            Find Events Tailored
            <span className="block text-blue-600 mt-1">
              Just For You
            </span>
          </h1>

          {/* Description Text Layout */}
          <p
            className="
              mt-5
              text-base
              md:text-lg
              leading-relaxed
              text-slate-600
              dark:text-slate-400
              max-w-2xl
            "
          >
            Discover personalized hackathons, workshops, and tech events based
            on your interests, skills, and participation history. Let our predictive 
            engine curate the ideal learning path for your career framework.
          </p>

          {/* Mapping Interests Array */}
          <div className="flex flex-wrap gap-3 mt-6 tags-flex-wrapper">
            {coreRecommendationTags.map((tag, index) => (
              <InterestTag 
                key={`rec-tag-${index}`} 
                label={tag} 
              />
            ))}
          </div>

          {/* Interactive Button Anchor Targets with Custom Focus Indicators */}
          <div className="flex flex-wrap gap-4 mt-8 actionable-buttons-grid">
            
            <a
              href="/event-recommendation"
              aria-label="Launch the interactive AI Recommendation Assistant"
              className="
                px-6
                py-3
                rounded-2xl
                bg-blue-600
                hover:bg-blue-700
                text-white
                text-sm
                font-semibold
                transition-all
                duration-200
                shadow-sm
                hover:shadow
                
                /* 🎯 Accessibility Fixes: Focus Ring Configurations */
                outline-none
                focus:outline-none
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-offset-2
                focus-visible:ring-blue-500
                dark:focus-visible:ring-blue-400
                dark:focus-visible:ring-offset-slate-900
              "
            >
              Try Recommendation Assistant
            </a>

            <a
              href="/events"
              aria-label="Explore the general events discovery platform catalog"
              className="
                px-6
                py-3
                rounded-2xl
                border
                border-slate-300
                dark:border-slate-700
                hover:bg-slate-100
                dark:hover:bg-slate-800
                text-slate-700
                dark:text-slate-300
                text-sm
                font-semibold
                transition-all
                duration-200
                
                /* 🎯 Accessibility Fixes: Focus Ring Configurations */
                outline-none
                focus:outline-none
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-offset-2
                focus-visible:ring-blue-500
                dark:focus-visible:ring-blue-400
                dark:focus-visible:ring-offset-slate-900
              "
            >
              Explore Events
            </a>

          </div>

        </div>
      </div>
    </section>
  );
};

export default memo(RecommendationBanner);import React, { memo } from "react";

/**
 * 🎯 HELPER SUB-COMPONENT: RecommendationBadge
 * Rendered explicitly to isolate styling logic and increase file modularity.
 */
const RecommendationBadge = memo(() => {
  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        px-4
        py-2
        rounded-full
        bg-blue-100
        dark:bg-blue-900/30
        text-blue-700
        dark:text-blue-300
        text-sm
        font-medium
        select-none
      "
    >
      <span>✨</span>
      <span>AI Recommendation System</span>
    </div>
  );
});

RecommendationBadge.displayName = "RecommendationBadge";

/**
 * 🏷️ HELPER SUB-COMPONENT: InterestTag
 * Provides an accessible, styled wrapper around static tag elements.
 */
const InterestTag = memo(({ label }) => {
  return (
    <span
      className="
        px-4
        py-2
        rounded-full
        bg-white
        dark:bg-slate-800
        border
        border-slate-200
        dark:border-slate-700
        text-sm
        text-slate-700
        dark:text-slate-300
        transition-colors
        duration-200
        hover:bg-slate-50
        dark:hover:bg-slate-750
      "
    >
      {label}
    </span>
  );
});

InterestTag.displayName = "InterestTag";

/**
 * 🚀 MAIN COMPONENT: RecommendationBanner
 * Features comprehensive a11y focus indicators across light and dark frames.
 */
const RecommendationBanner = () => {
  // Mock data array extracted into variable bounds to optimize component processing loops
  const coreRecommendationTags = [
    "AI/ML",
    "Frontend",
    "Open Source",
    "Cybersecurity",
    "Hackathons",
    "Beginner Friendly",
  ];

  return (
    <section 
      className="px-4 md:px-8 py-6 unique-recommendation-wrapper"
      aria-label="Personalized Event Recommendations Section"
    >
      <div
        className="
          max-w-7xl
          mx-auto
          rounded-3xl
          border
          border-slate-200
          dark:border-slate-800
          bg-gradient-to-r
          from-slate-50
          to-blue-50
          dark:from-slate-900
          dark:to-slate-950
          px-8
          py-10
          md:px-12
          md:py-12
          shadow-sm
          transition-all
          duration-300
        "
      >
        <div className="max-w-3xl structural-content-container">
          
          {/* Badge Sub-Module Insertion */}
          <RecommendationBadge />

          {/* Heading Component Grid */}
          <h1
            className="
              mt-5
              text-4xl
              md:text-5xl
              font-bold
              leading-tight
              text-slate-900
              dark:text-white
              tracking-tight
            "
          >
            Find Events Tailored
            <span className="block text-blue-600 mt-1">
              Just For You
            </span>
          </h1>

          {/* Description Text Layout */}
          <p
            className="
              mt-5
              text-base
              md:text-lg
              leading-relaxed
              text-slate-600
              dark:text-slate-400
              max-w-2xl
            "
          >
            Discover personalized hackathons, workshops, and tech events based
            on your interests, skills, and participation history. Let our predictive 
            engine curate the ideal learning path for your career framework.
          </p>

          {/* Mapping Interests Array */}
          <div className="flex flex-wrap gap-3 mt-6 tags-flex-wrapper">
            {coreRecommendationTags.map((tag, index) => (
              <InterestTag 
                key={`rec-tag-${index}`} 
                label={tag} 
              />
            ))}
          </div>

          {/* Interactive Button Anchor Targets with Custom Focus Indicators */}
          <div className="flex flex-wrap gap-4 mt-8 actionable-buttons-grid">
            
            <a
              href="/event-recommendation"
              aria-label="Launch the interactive AI Recommendation Assistant"
              className="
                px-6
                py-3
                rounded-2xl
                bg-blue-600
                hover:bg-blue-700
                text-white
                text-sm
                font-semibold
                transition-all
                duration-200
                shadow-sm
                hover:shadow
                
                /* 🎯 Accessibility Fixes: Focus Ring Configurations */
                outline-none
                focus:outline-none
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-offset-2
                focus-visible:ring-blue-500
                dark:focus-visible:ring-blue-400
                dark:focus-visible:ring-offset-slate-900
              "
            >
              Try Recommendation Assistant
            </a>

            <a
              href="/events"
              aria-label="Explore the general events discovery platform catalog"
              className="
                px-6
                py-3
                rounded-2xl
                border
                border-slate-300
                dark:border-slate-700
                hover:bg-slate-100
                dark:hover:bg-slate-800
                text-slate-700
                dark:text-slate-300
                text-sm
                font-semibold
                transition-all
                duration-200
                
                /* 🎯 Accessibility Fixes: Focus Ring Configurations */
                outline-none
                focus:outline-none
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-offset-2
                focus-visible:ring-blue-500
                dark:focus-visible:ring-blue-400
                dark:focus-visible:ring-offset-slate-900
              "
            >
              Explore Events
            </a>

          </div>

        </div>
      </div>
    </section>
  );
};

export default memo(RecommendationBanner);