const RecommendationBanner = () => {
  return (
    <section className="px-4 md:px-8 py-6">

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
        "
      >

        <div className="max-w-3xl">

          {/* Badge */}
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
            "
          >
            ✨ AI Recommendation System
          </div>

          {/* Heading */}
          <h1
            className="
              mt-5
              text-4xl
              md:text-5xl
              font-bold
              leading-tight
              text-slate-900
              dark:text-white
            "
          >
            Find Events Tailored

            <span className="block text-blue-600">
              Just For You
            </span>
          </h1>

          {/* Description */}
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
            Discover personalized hackathons,
            workshops, and tech events based
            on your interests, skills, and
            participation history.
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-3 mt-6">

            {[
              "AI/ML",
              "Frontend",
              "Open Source",
              "Cybersecurity",
              "Hackathons",
              "Beginner Friendly",
            ].map((tag, index) => (

              <span
                key={index}
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
                "
              >
                {tag}
              </span>

            ))}

          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">

            <a
              href="/event-recommendation"
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
              "
            >
              Try Recommendation Assistant
            </a>

            <a
              href="/events"
              className="
                px-6
                py-3
                rounded-2xl
                border
                border-slate-300
                dark:border-slate-700
                hover:bg-slate-100
                dark:hover:bg-slate-800
                text-sm
                font-semibold
                transition-all
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

export default RecommendationBanner;