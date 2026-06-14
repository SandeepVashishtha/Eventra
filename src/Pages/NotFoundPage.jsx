import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Calendar, Search, ArrowLeft, Zap } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useState } from "react";

// ─── Animation variants ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const floatVariants = {
  animate: {
    y: [0, -14, 0],
    transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
  },
};

// ─── Quick-nav links shown below the primary CTA ─────────────────────────────
const quickLinks = [
  { to: "/events",     label: "Browse Events",     Icon: Calendar },
  { to: "/hackathons", label: "Hackathons",         Icon: Zap      },
  { to: "/explore",   label: "Explore",             Icon: Search   },
];

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/events?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>404 – Page Not Found | Eventra</title>
        <meta
          name="description"
          content="The page you're looking for doesn't exist. Looks like this event got cancelled! Head back to the Eventra homepage to find real events."
        />
      </Helmet>

      {/* Full-viewport centred section that matches Eventra's indigo/violet palette */}
      <section
        className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden
                   bg-gradient-to-br from-indigo-950 via-violet-900 to-indigo-800
                   px-4 py-20 text-center"
        aria-labelledby="not-found-heading"
      >
        {/* ── Decorative blurred orbs (purely visual) ── */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-96 w-96
                     rounded-full bg-indigo-500/20 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80
                     rounded-full bg-violet-500/20 blur-3xl"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex max-w-lg flex-col items-center gap-6"
        >
          {/* ── Floating 404 ── */}
          <motion.div variants={floatVariants} animate="animate">
            <motion.h1
              id="not-found-heading"
              variants={itemVariants}
              className="bg-gradient-to-b from-white to-indigo-200 bg-clip-text
                         text-[8rem] font-black leading-none tracking-tight
                         text-transparent sm:text-[10rem]"
            >
              404
            </motion.h1>
          </motion.div>

          {/* ── Ticket/cancelled icon badge ── */}
          <motion.div
            variants={itemVariants}
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-2xl
                       bg-white/10 backdrop-blur-sm ring-1 ring-white/20"
          >
            <span className="text-4xl" role="img" aria-label="cancelled ticket">🎟️</span>
          </motion.div>

          {/* ── Primary message ── */}
          <motion.h2
            variants={itemVariants}
            className="text-2xl font-bold text-white sm:text-3xl"
          >
            Looks like this event got cancelled!
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="max-w-sm text-base leading-relaxed text-indigo-200"
          >
            The page you&apos;re looking for doesn&apos;t exist, may have been
            moved, or the event was called off. Don&apos;t worry — there are
            plenty more events waiting for you.
          </motion.p>

          {/* ── Primary CTA: Go to Homepage ── */}
          <motion.div variants={itemVariants} className="mt-2 w-full">
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl
                         bg-indigo-500 px-6 py-3.5 text-base font-semibold text-white
                         shadow-lg shadow-indigo-900/50 ring-1 ring-indigo-400/40
                         transition-all duration-200
                         hover:bg-indigo-400 hover:shadow-indigo-800/60 hover:scale-[1.02]
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                         focus-visible:outline-indigo-300
                         active:scale-[0.98]"
            >
              <Home className="h-5 w-5" aria-hidden="true" />
              Go to Homepage
            </Link>
          </motion.div>

          {/* ── Secondary quick-nav links ── */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {quickLinks.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                className="inline-flex items-center gap-1.5 rounded-lg
                           bg-white/10 px-4 py-2 text-sm font-medium text-indigo-100
                           backdrop-blur-sm ring-1 ring-white/15
                           transition-all duration-200
                           hover:bg-white/20 hover:text-white hover:scale-105
                           focus-visible:outline focus-visible:outline-2
                           focus-visible:outline-indigo-300
                           active:scale-95"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            ))}

            {/* Go back button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 rounded-lg
                         bg-white/10 px-4 py-2 text-sm font-medium text-indigo-100
                         backdrop-blur-sm ring-1 ring-white/15
                         transition-all duration-200
                         hover:bg-white/20 hover:text-white hover:scale-105
                         focus-visible:outline focus-visible:outline-2
                         focus-visible:outline-indigo-300
                         active:scale-95"
              type="button"
              aria-label="Go back to the previous page"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Go Back
            </button>
          </motion.div>

          {/* ── Inline event search hint ── */}
          <motion.div variants={itemVariants} className="w-full">
            <p className="mb-2 text-sm text-indigo-300">Looking for a specific event?</p>
            <form onSubmit={handleSearch} className="flex gap-2" role="search" aria-label="Search events">
              <label htmlFor="not-found-search" className="sr-only">Search events</label>
              <input
                id="not-found-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. React, AI Hackathon…"
                className="flex-1 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white placeholder-indigo-300
                           backdrop-blur-sm ring-1 ring-white/20 outline-none
                           focus:ring-2 focus:ring-indigo-300 transition"
                aria-describedby="search-hint"
              />
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white
                           hover:bg-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Search events"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Search
              </button>
            </form>
            <p id="search-hint" className="sr-only">Type an event name to be taken to the events page with results filtered.</p>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
};

export default NotFoundPage;
