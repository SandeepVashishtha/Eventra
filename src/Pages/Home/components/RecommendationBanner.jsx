const RecommendationBanner = () => {
  return (
    <section 
      className="relative overflow-hidden px-4 md:px-8 py-16 text-slate-900 dark:text-white border-t border-slate-200/60 dark:border-slate-800/60 transition-colors duration-300"
      /* MODIFIED: Re-applied the identical matching background gradient flow from the events carousel */
      style={{
        background: "linear-gradient(180deg, var(--bg-color, #F8FBFD) 0%, rgba(109, 40, 217, 0.02) 42%, rgba(109, 40, 217, 0.05) 100%)",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-white/80 dark:from-slate-950/40 to-transparent" />
        <div className="absolute top-10 left-8 h-40 w-40 rounded-full bg-white/35 dark:bg-slate-800/10 blur-3xl" />
        <div className="absolute top-24 right-8 h-52 w-52 rounded-full bg-sky-100/35 dark:bg-brand-violet/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* MODIFIED: Inner container is now a transparent glass overlay to let the section gradient shine through cleanly */}
        <div
          className="
            rounded-[28px]
            border-2
            border-brand-violet/30
            bg-white/40
            dark:bg-slate-900/30
            backdrop-blur-md
            px-8
            py-10
            md:px-12
            md:py-14
            shadow-[0_20px_60px_rgba(109,40,217,0.04)]
            dark:shadow-[0_20px_60px_rgba(0,0,0,0.2)]
          "
          style={{ borderColor: 'rgba(139, 92, 246, 0.35)' }}
        >
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 text-brand-violet text-sm font-semibold border border-brand-violet/10 shadow-sm">
              ✨ AI Recommendation System
            </div>

            {/* Heading */}
            <h2 className="mt-5 text-4xl md:text-5xl font-extrabold leading-tight text-slate-900 dark:text-white">
              Find Events Tailored
              <span className="block text-brand-violet mt-1">Just For You</span>
            </h2>

            {/* Description */}
            <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">
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
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 shadow-sm hover:border-brand-violet/50 transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <a
                href="/event-recommendation"
                className="px-6 py-3 rounded-full bg-brand-violet hover:bg-brand-violet/90 text-white text-sm font-semibold transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet/50"
              >
                Try Recommendation Assistant
              </a>

              <a
                href="/events"
                className="px-6 py-3 rounded-full border border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
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