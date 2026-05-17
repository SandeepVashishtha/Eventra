import { motion } from "framer-motion";

// Framer Motion Variants
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

<<<<<<< HEAD
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

      {/* Main Content */}
      <div 
        className="max-w-4xl text-center px-4 sm:px-6 lg:px-8 z-10 -mt-8 md:-mt-12"
        // AOS Implementation on main content container
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-once="true"
      >
        <motion.h1
          variants={item}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          // UPDATED: Text colors
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-black dark:text-white mb-6"
          style={{ fontFamily: '"Anton", sans-serif' }}
          data-aos="zoom-in"
          data-aos-delay="100"
        >
          About <span className="text-black dark:text-white">Us</span>
        </motion.h1>

        <motion.p
          variants={item}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          // UPDATED: Text color
          className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-16"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          Eventra is a comprehensive open-source platform that empowers
          communities, colleges, and organizations worldwide to create, manage,
          and track events effortlessly. Transform the way you plan, execute,
          and experience events with ease.
        </motion.p>

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroSection({ anim, prefersReducedMotion }) {
=======
export default function ModernAbout() {
>>>>>>> 481cbb0f9c46982337d082d5f25e87471f5c281a
  return (
    <section className="relative min-h-[82vh] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900 overflow-hidden py-20 px-4">
      <motion.div aria-hidden="true" className="absolute top-0 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-indigo-100 dark:bg-indigo-900/50 rounded-full blur-3xl opacity-40 will-change-transform" animate={prefersReducedMotion ? {} : { scale: [1, 1.3, 1], rotate: [0, 45, 0] }} transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }} />
      <motion.div aria-hidden="true" className="absolute bottom-0 right-1/3 w-64 sm:w-96 h-64 sm:h-96 bg-pink-100 dark:bg-pink-900/50 rounded-full blur-3xl opacity-30 will-change-transform" animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], rotate: [0, -45, 0] }} transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }} />
      <motion.div aria-hidden="true" className="absolute top-1/3 left-4 sm:left-10 w-28 sm:w-40 h-28 sm:h-40 bg-purple-200 dark:bg-purple-800/40 rounded-full blur-2xl opacity-20 will-change-transform" animate={prefersReducedMotion ? {} : { y: [0, -30, 0], x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} />
      <motion.div aria-hidden="true" className="absolute bottom-20 right-4 sm:right-10 w-24 sm:w-32 h-24 sm:h-32 bg-yellow-200 dark:bg-yellow-800/40 rounded-full blur-2xl opacity-25 will-change-transform" animate={prefersReducedMotion ? {} : { y: [0, 25, 0], x: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }} />
      <div aria-hidden="true" className="absolute inset-0 dark:hidden bg-[linear-gradient(to_right,rgba(147,197,253,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(250,204,21,0.2)_1px,transparent_1px),linear-gradient(45deg,rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(-45deg,rgba(250,204,21,0.08)_1px,transparent_1px)] bg-[size:40px_40px,40px_40px,80px_80px,80px_80px]" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/30 to-white dark:from-transparent dark:to-gray-950" />

      <div className="max-w-4xl md:my-24 my-16 w-full text-center z-10">
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
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-black dark:text-white mb-6"
          style={{ fontFamily: '"Anton", sans-serif' }}
          data-aos="zoom-in"
          data-aos-delay="100"
        >
          About Us
        </motion.h1>

        <motion.p
          variants={item}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-base sm:text-lg text-black dark:text-gray-300 mb-16"
          data-aos="fade-up"
          data-aos-delay="200"
        >
<<<<<<< HEAD
          <motion.div
            variants={cardItem}
            // UPDATED: Card background and shadow
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100 dark:shadow-indigo-900/50 p-6 hover:scale-105 transition-transform duration-500"
=======
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
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <motion.div
            variants={cardItem}
            // UPDATED: Card background and shadow
            className="bg-gradient-to-b from-white via-white to-slate-50 border border-slate-100 shadow-xl shadow-slate-100/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100 dark:shadow-indigo-900/50 p-6 hover:scale-105 transition-transform duration-500"
>>>>>>> 481cbb0f9c46982337d082d5f25e87471f5c281a
            data-aos="zoom-in"
            data-aos-delay="300"
          >
            {/* UPDATED: Card text */}
<<<<<<< HEAD
            <h3 className="text-black dark:text-white text-2xl font-bold mb-2">100+</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">Events Managed</p>
          </motion.div>
=======
            <h3 className="text-black text-2xl font-bold mb-2">100+</h3>
            <p className="text-black text-sm">Events Managed</p>
          </motion.div>
          {stats.map((s) => (
            <motion.div key={s.label} variants={scaleIn} whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100 dark:shadow-indigo-900/50 p-4 sm:p-5 cursor-default">
              <h3 className="text-black dark:text-white text-xl sm:text-2xl font-bold mb-1">{s.value}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
>>>>>>> 481cbb0f9c46982337d082d5f25e87471f5c281a

function MissionSection({ anim, prefersReducedMotion }) {
  return (
    <section className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <motion.div {...anim(fadeUp)}>
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

            variants={cardItem}
            // UPDATED: Card background and shadow
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 backdrop-blur-sm rounded-2xl transition-transform duration-500"
            data-aos="zoom-in"
            data-aos-delay="400"
            {...(prefersReducedMotion ? {} : { variants: staggerContainer, initial: "hidden", whileInView: "visible", viewport: { once: true } })}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
<<<<<<< HEAD
            {/* UPDATED: Card text */}
            <h3 className="text-black dark:text-white text-2xl font-bold mb-2">500+</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">Active Users</p>
=======
            {values.map((v) => (
              <motion.div key={v.title} variants={staggerItem} whileHover={prefersReducedMotion ? {} : { y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className={`rounded-2xl border p-5 cursor-default bg-gradient-to-b from-white via-white to-slate-50 border border-slate-100 shadow-xl shadow-slate-100/70 dark:bg-gray-800/50 transition-transform duration-300 ${v.color} ${v.border}`}>
                <h4 className="font-bold text-sm text-black dark:text-white mb-2">{v.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
>>>>>>> 481cbb0f9c46982337d082d5f25e87471f5c281a
          </motion.div>

          <motion.div
          
            variants={cardItem}
            // UPDATED: Card background and shadow
            className="bg-gradient-to-b from-white via-white to-slate-50 border border-slate-100 shadow-xl shadow-slate-100/70 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100 dark:shadow-indigo-900/50 p-6 hover:scale-105 transition-transform duration-500"
            data-aos="zoom-in"
            data-aos-delay="500"
            {...(prefersReducedMotion ? {} : { variants: staggerContainer, initial: "hidden", whileInView: "visible", viewport: { once: true } })}
            className="space-y-4"
          >
<<<<<<< HEAD
            {/* UPDATED: Card text */}
            <h3 className="text-black dark:text-white text-2xl font-bold mb-2">Global</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">Community Reach</p>
=======
            <h3 className="text-black dark:text-white text-2xl font-bold mb-2">500+</h3>
            <p className="text-black dark:text-gray-300 text-sm">Active Users</p>
>>>>>>> 481cbb0f9c46982337d082d5f25e87471f5c281a
          </motion.div>

          <motion.div
            variants={cardItem}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100 dark:shadow-indigo-900/50 p-6 hover:scale-105 transition-transform duration-500"
            data-aos="zoom-in"
            data-aos-delay="500"
          >
            <h3 className="text-black dark:text-white text-2xl font-bold mb-2">Global</h3>
            <p className="text-black dark:text-gray-300 text-sm">Community Reach</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
<<<<<<< HEAD
}

function CTASection({ anim, prefersReducedMotion }) {
  return (
    <section className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div {...anim(fadeUp)} className="rounded-3xl bg-black dark:bg-white p-8 sm:p-10 md:p-14 text-center relative overflow-hidden">
          <motion.div aria-hidden="true" className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" animate={prefersReducedMotion ? {} : { scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} />
          <motion.div aria-hidden="true" className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" animate={prefersReducedMotion ? {} : { scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} />
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-4 relative z-10">Join the movement</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white dark:text-black mb-4 relative z-10" style={{ fontFamily: '"Anton", sans-serif' }}>
            Become a contributor
          </h2>
          <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed relative z-10">
            Help us build the future of event management. Fix bugs, ship features, write docs, or just spread the word.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
            <motion.a href="https://github.com/SandeepVashishtha/Eventra" target="_blank" rel="noopener noreferrer" aria-label="View Eventra on GitHub (opens in new tab)" whileHover={prefersReducedMotion ? {} : { scale: 1.03 }} whileTap={prefersReducedMotion ? {} : { scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className="group inline-flex items-center justify-center gap-2 bg-white dark:bg-black text-black dark:text-white text-sm font-semibold px-7 py-3 rounded-full hover:opacity-80 transition-opacity">
              View on GitHub
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.a>
            <motion.a href="https://github.com/SandeepVashishtha/Eventra/blob/master/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" aria-label="View the contributors guide (opens in new tab)" whileHover={prefersReducedMotion ? {} : { scale: 1.03 }} whileTap={prefersReducedMotion ? {} : { scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className="group inline-flex items-center justify-center gap-2 border border-gray-600 dark:border-gray-400 text-white dark:text-black text-sm font-semibold px-7 py-3 rounded-full hover:bg-white/10 dark:hover:bg-black/10 transition-colors">
              Contributors Guide
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
=======
}
>>>>>>> 481cbb0f9c46982337d082d5f25e87471f5c281a
