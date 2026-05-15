import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.2, duration: 0.6, ease: "easeOut" },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardItem = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const stats = [
  { value: "75+", label: "Events Organized" },
  { value: "1500+", label: "Developers Joined" },
  { value: "30+", label: "Partners & Sponsors" },
  { value: "Global", label: "Community Reach" },
];

const features = [
  {
    title: "Event Creation & Management",
    desc: "Create, publish, and manage events of any scale from college fests to global hackathons with a clean, intuitive dashboard.",
  },
  {
    title: "Hackathon Platform",
    desc: "Host full hackathons with team registration, project submissions, judging panels, and prize tracking all in one place.",
  },
  {
    title: "Project Showcase",
    desc: "Participants can publish their projects for the community to discover, upvote, and collaborate on after the event.",
  },
  {
    title: "Community Hub",
    desc: "Build lasting communities around your events. Members connect, share updates, and grow their networks organically.",
  },
  {
    title: "Analytics & Insights",
    desc: "Track registrations, attendance, engagement, and growth with real-time dashboards built for organizers.",
  },
  {
    title: "Fully Open Source",
    desc: "Every line of code is public. Fork it, extend it, contribute to it. Eventra belongs to the community.",
  },
];

const values = [
  {
    title: "Open by Default",
    desc: "Transparency is our foundation. Everything we build is open for the world to inspect, improve, and own.",
    color: "bg-indigo-50 dark:bg-indigo-900/30",
    border: "border-indigo-100 dark:border-indigo-800",
  },
  {
    title: "Community First",
    desc: "Every decision starts with one question: does this help our communities grow? Real people, real events, real impact.",
    color: "bg-pink-50 dark:bg-pink-900/30",
    border: "border-pink-100 dark:border-pink-800",
  },
  {
    title: "Built to Empower",
    desc: "We believe anyone, a student, a startup, a college club, should have access to world-class event tools for free.",
    color: "bg-yellow-50 dark:bg-yellow-900/30",
    border: "border-yellow-100 dark:border-yellow-800",
  },
  {
    title: "Always Improving",
    desc: "Eventra is never finished. With every contributor and every event, the platform gets smarter, faster, and better.",
    color: "bg-green-50 dark:bg-green-900/30",
    border: "border-green-100 dark:border-green-800",
  },
];

const timeline = [
  {
    year: "2024",
    title: "Eventra is born",
    desc: "Sandeep Vashishtha started Eventra to solve a real problem — managing college events was painfully fragmented.",
  },
  {
    year: "2024",
    title: "Open-sourced on GitHub",
    desc: "The codebase went public and the first wave of contributors joined from colleges across India.",
  },
  {
    year: "2025",
    title: "Hackathon module launched",
    desc: "A dedicated hackathon platform shipped with team formation, judging, and project submission built in.",
  },
  {
    year: "2026",
    title: "1500+ Developers Joined",
    desc: "Communities, colleges, and orgs worldwide now use Eventra to run events that matter.",
  },
];

const techStack = [
  { category: "Frontend", items: ["React 18.2", "React Router", "Tailwind CSS", "Framer Motion"] },
  { category: "Backend", items: ["Spring Boot 3.3.1", "Java 17", "Spring Security & JWT", "MySQL & H2"] },
  { category: "DevOps", items: ["Git & GitHub", "Vercel", "Azure App Service", "OpenAPI 3.0"] },
];

const team = [
  {
    initials: "SV",
    name: "Sandeep Vashishtha",
    role: "Co-founder & Lead",
    color: "bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-100",
  },
  {
    initials: "OS",
    name: "Open Source Community",
    role: "Contributors worldwide",
    color: "bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100",
  },
];

export default function ModernAbout() {
  return (
    <div className="bg-white dark:bg-gray-950 overflow-x-hidden">

      {/* Hero */}
      <section className="relative min-h-[82vh] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900 overflow-hidden py-16 px-4">
        <motion.div
          className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-100 dark:bg-indigo-900/50 rounded-full filter blur-3xl opacity-40"
          animate={{ scale: [1, 1.3, 1], rotate: [0, 45, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/3 w-96 h-96 bg-pink-100 dark:bg-pink-900/50 rounded-full filter blur-3xl opacity-30"
          animate={{ scale: [1, 1.2, 1], rotate: [0, -45, 0] }}
          transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 left-10 w-40 h-40 bg-purple-200 dark:bg-purple-800/40 rounded-full filter blur-2xl opacity-20"
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 bg-blue-200 dark:bg-blue-800/40 rounded-full filter blur-2xl opacity-25"
          animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        />

        <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-transparent to-yellow-50 dark:from-blue-900/20 dark:via-transparent dark:to-yellow-900/20 opacity-40 animate-pulse" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(147,197,253,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(250,204,21,0.2)_1px,transparent_1px),linear-gradient(45deg,rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(-45deg,rgba(250,204,21,0.08)_1px,transparent_1px)] bg-[size:40px_40px,40px_40px,80px_80px,80px_80px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/30 to-white dark:from-transparent dark:to-gray-900" />
        </div>

        <div className="max-w-4xl w-full text-center z-10 -mt-8 md:-mt-12">
          <motion.p
            variants={item}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4"
          >
            Open-source, community-driven, free forever
          </motion.p>

          <motion.h1
            variants={item}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-black dark:text-white mb-6"
            style={{ fontFamily: '"Anton", sans-serif' }}
          >
            About Us
          </motion.h1>

          <motion.p
            variants={item}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-16 max-w-2xl mx-auto leading-relaxed"
          >
            Eventra is a comprehensive open-source platform that empowers
            communities, colleges, and organizations worldwide to create, manage,
            and track events effortlessly. Transform the way you plan, execute,
            and experience events with ease.
          </motion.p>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          >
            {stats.map((s) => (
              <motion.div
                key={s.label}
                variants={cardItem}
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100 dark:shadow-indigo-900/50 p-4 sm:p-5 hover:scale-105 hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-black dark:text-white text-xl sm:text-2xl font-bold mb-1">{s.value}</h3>
                <p className="text-black dark:text-gray-300 text-xs">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <motion.div
              variants={item}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Why we exist</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-black dark:text-white mb-5" style={{ fontFamily: '"Anton", sans-serif' }}>
                Our Mission & Vision
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-5">
                We started Eventra because we were tired of watching college clubs and
                communities struggle with tools that were either too expensive or too complicated.
                There had to be something better.
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                We want a world where any club, any community, any group of people with an
                idea can run an event without needing a budget or a technical team behind them.
                That is what we are building toward.
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {values.map((v) => (
                <motion.div
                  key={v.title}
                  variants={cardItem}
                  className={`rounded-2xl border p-5 ${v.color} ${v.border}`}
                >
                  <h4 className="font-bold text-sm text-black dark:text-white mb-2">{v.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            variants={item}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">How it started</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black dark:text-white mb-3" style={{ fontFamily: '"Anton", sans-serif' }}>
              Our Story
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
              Eventra did not start in a boardroom. It started with a frustrated college
              organizer and a blank GitHub repo.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative pl-7 sm:pl-8 border-l-2 border-gray-200 dark:border-gray-700 space-y-8 sm:space-y-10"
          >
            {timeline.map((t, i) => (
              <motion.div
                key={`${t.year}-${t.title}`}
                variants={item}
                className="relative"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 400, damping: 15, delay: i * 0.1 }}
                  className="absolute -left-[37px] sm:-left-[41px] top-1 w-4 h-4 rounded-full bg-black dark:bg-white border-2 border-white dark:border-gray-900 shadow"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-mono">{t.year}</p>
                <h4 className="font-bold text-sm sm:text-base text-black dark:text-white mb-1">{t.title}</h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            variants={item}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">What we offer</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black dark:text-white mb-3" style={{ fontFamily: '"Anton", sans-serif' }}>
              Everything you need to run great events
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
              From a small meetup to a global hackathon, Eventra has the tools to make it happen.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={cardItem}
                className="border border-gray-100 dark:border-gray-800 rounded-2xl p-5 sm:p-6 bg-white dark:bg-gray-900 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
              >
                <h3 className="font-bold text-sm text-black dark:text-white mb-2">{f.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <motion.div
              variants={item}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Open source</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-black dark:text-white mb-5" style={{ fontFamily: '"Anton", sans-serif' }}>
                Built in the open, for everyone
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-5">
                Eventra's entire codebase lives on GitHub. No hidden features, no paywalled
                roadmap, no surprises. Every bug fix, every feature, every design decision
                happens where anyone can see it.
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-8">
                Whether you are here to contribute code, request a feature, or just see
                how a real product is built, you are welcome.
              </p>
              <a
                href="https://github.com/SandeepVashishtha/Eventra"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black text-sm font-semibold px-6 py-3 rounded-full hover:opacity-80 hover:scale-[1.02] transition-all duration-300"
              >
                Star us on GitHub
              </a>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4"
            >
              {techStack.map((cat) => (
                <motion.div
                  key={cat.category}
                  variants={item}
                  className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">{cat.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((tech) => (
                      <span key={tech} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            variants={item}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">The people</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black dark:text-white mb-3" style={{ fontFamily: '"Anton", sans-serif' }}>
              Meet the team
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl leading-relaxed">
              Built and grown by a worldwide community of contributors.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center sm:items-stretch max-w-2xl mx-auto"
          >
            {team.map((member) => (
              <motion.div
                key={member.name}
                variants={cardItem}
                className="w-full sm:w-64 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-900 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-base font-bold mb-4 ${member.color}`}>
                  {member.initials}
                </div>
                <h4 className="font-bold text-sm text-black dark:text-white mb-1">{member.name}</h4>
                <p className="text-xs text-gray-400 dark:text-gray-500">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            variants={item}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="rounded-3xl bg-black dark:bg-white p-8 sm:p-10 md:p-14 text-center relative overflow-hidden"
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full filter blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500/20 rounded-full filter blur-3xl" />
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-4 relative z-10">Join the movement</p>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-white dark:text-black mb-4 relative z-10"
              style={{ fontFamily: '"Anton", sans-serif' }}
            >
              Become a contributor
            </h2>
            <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed relative z-10">
              Help us build the future of event management. Fix bugs, ship features, write
              docs, or just spread the word.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
              <a
                href="https://github.com/SandeepVashishtha/Eventra"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-black text-black dark:text-white text-sm font-semibold px-7 py-3 rounded-full hover:opacity-80 hover:scale-[1.02] transition-all duration-300"
              >
                View on GitHub
              </a>
              <a
                href="https://github.com/SandeepVashishtha/Eventra/blob/master/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-gray-600 dark:border-gray-400 text-white dark:text-black text-sm font-semibold px-7 py-3 rounded-full hover:bg-white/20 dark:hover:bg-black/20 hover:scale-[1.02] transition-all duration-300"
              >
                Contributors Guide
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
