const RecommendationBanner = () => {
  return (
    <section className="px-4 md:px-8 py-8 overflow-hidden">
      <div className="relative max-w-7xl mx-auto">
        {/* Decorative blobs — light mode same, dark mode slightly different opacity */}
        <div aria-hidden className="absolute -left-10 -top-10 w-56 h-56 rounded-full bg-[#D7EAF8] opacity-40 blur-3xl -z-10 dark:bg-blue-900 dark:opacity-20" />
        <div aria-hidden className="absolute -right-8 top-16 w-44 h-44 rounded-full bg-[#E8F5FB] opacity-35 blur-3xl -z-10 dark:bg-blue-800 dark:opacity-15" />

        <div
          className="
            rounded-2xl
            border
            px-8 py-10
            md:px-12 md:py-14
            backdrop-blur-md
            shadow-[0_18px_40px_rgba(15,23,42,0.06)]
            border-slate-200 bg-white/70
            [background:linear-gradient(90deg,rgba(224,233,242,0.55),rgba(255,255,255,0.9))]
            dark:border-slate-700 dark:bg-slate-800/80
            dark:[background:linear-gradient(90deg,rgba(15,23,42,0.85),rgba(30,41,59,0.95))]
            dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)]
          "
        >
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-sm
              bg-white/60 text-sky-700 border border-slate-100
              dark:bg-slate-700 dark:text-sky-300 dark:border-slate-600"
            >
              ✨ AI Recommendation System
            </div>

            {/* Heading */}
            <h1 className="mt-5 text-4xl md:text-5xl font-extrabold leading-tight
              text-slate-900 dark:text-slate-100"
            >
              Find Events Tailored
              <span className="block text-sky-600 dark:text-sky-400">Just For You</span>
            </h1>

            {/* Description */}
            <p className="mt-4 text-base md:text-lg leading-relaxed max-w-2xl
              text-slate-600 dark:text-slate-400"
            >
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
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-full text-sm shadow-sm
                    bg-white border border-slate-200 text-slate-700
                    dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <a
                href="/event-recommendation"
                className="px-6 py-3 rounded-full text-white text-sm font-semibold transition-shadow shadow-md focus:outline-none focus-visible:ring-2
                  bg-sky-600 hover:bg-sky-700 focus-visible:ring-sky-200
                  dark:bg-sky-500 dark:hover:bg-sky-400 dark:focus-visible:ring-sky-400"
              >
                Try Recommendation Assistant
              </a>

              <a
                href="/events"
                className="px-6 py-3 rounded-full text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2
                  border border-slate-300 text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-200
                  dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus-visible:ring-slate-500"
              >
                Explore Events
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecommendationBanner;