const RecommendationBanner = () => {
  return (
    <section className="px-4 md:px-8 py-8 overflow-hidden">
      <div className="relative max-w-7xl mx-auto">
        <div aria-hidden className="absolute -left-10 -top-10 w-56 h-56 rounded-full bg-[#D7EAF8] opacity-40 blur-3xl -z-10" />
        <div aria-hidden className="absolute -right-8 top-16 w-44 h-44 rounded-full bg-[#E8F5FB] opacity-35 blur-3xl -z-10" />

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white/70
            backdrop-blur-md
            px-8
            py-10
            md:px-12
            md:py-14
            shadow-[0_18px_40px_rgba(15,23,42,0.06)]
          "
          style={{ background: 'linear-gradient(90deg, rgba(224,233,242,0.55), rgba(255,255,255,0.9))' }}
        >
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 text-sky-700 text-sm font-semibold border border-slate-100 shadow-sm">
              ✨ AI Recommendation System
            </div>

            {/* Heading */}
            <h1 className="mt-5 text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
              Find Events Tailored
              <span className="block text-sky-600">Just For You</span>
            </h1>

            {/* Description */}
            <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600 max-w-2xl">
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
                  className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-slate-700 shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <a
                href="/event-recommendation"
                className="px-6 py-3 rounded-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-shadow shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
              >
                Try Recommendation Assistant
              </a>

              <a
                href="/events"
                className="px-6 py-3 rounded-full border border-slate-300 hover:bg-slate-100 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
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