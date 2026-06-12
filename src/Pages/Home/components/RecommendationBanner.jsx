const RecommendationBanner = () => {
  return (
    <section
      className="relative overflow-hidden border-t border-slate-200/60 px-4 py-16 text-slate-900 transition-colors duration-300 md:px-8 dark:border-slate-800/60 dark:text-white"
      /* MODIFIED: Re-applied the identical matching background gradient flow from the events carousel */
      style={{
        background:
          "linear-gradient(180deg, var(--bg-color, #F8FBFD) 0%, rgba(109, 40, 217, 0.02) 42%, rgba(109, 40, 217, 0.05) 100%)",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-28 bg-gradient-to-b from-white/80 to-transparent dark:from-slate-950/40" />
        <div className="absolute top-10 left-8 h-40 w-40 rounded-full bg-white/35 blur-3xl dark:bg-slate-800/10" />
        <div className="dark:bg-brand-violet/5 absolute top-24 right-8 h-52 w-52 rounded-full bg-sky-100/35 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* MODIFIED: Inner container is now a transparent glass overlay to let the section gradient shine through cleanly */}
        <div
          className="border-brand-violet/30 rounded-[28px] border-2 bg-white/40 px-8 py-10 shadow-[0_20px_60px_rgba(109,40,217,0.04)] backdrop-blur-md md:px-12 md:py-14 dark:bg-slate-900/30 dark:shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
          style={{ borderColor: "rgba(139, 92, 246, 0.35)" }}
        >
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="text-brand-violet border-brand-violet/10 inline-flex items-center gap-2 rounded-full border bg-white/80 px-4 py-2 text-sm font-semibold shadow-sm dark:bg-slate-800/80">
              ✨ AI Recommendation System
            </div>

            {/* Heading */}
            <h2 className="mt-5 text-4xl leading-tight font-extrabold text-slate-900 md:text-5xl dark:text-white">
              Find Events Tailored
              <span className="text-brand-violet mt-1 block">Just For You</span>
            </h2>

            {/* Description */}
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg dark:text-slate-300">
              Discover personalized hackathons, workshops, and tech events curated to your
              interests, skills, and past participation.
            </p>

            {/* Tags */}
            <div className="mt-6 flex flex-wrap gap-3">
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
                  className="hover:border-brand-violet/50 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm transition-colors duration-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/event-recommendation"
                className="bg-brand-violet hover:bg-brand-violet/90 focus-visible:ring-brand-violet/50 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition-all focus:outline-none focus-visible:ring-2"
              >
                Try Recommendation Assistant
              </a>

              <a
                href="/events"
                className="rounded-full border border-slate-300 bg-white/40 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800"
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
