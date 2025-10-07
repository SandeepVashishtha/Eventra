import { motion } from "framer-motion";
import { Search, X, Rocket, Users, Award, Code2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function HackathonHero({
  hackathons = [], // default empty array if no hackathons
  searchQuery, // current search term
  setSearchQuery, // function to update the search input
  scrollToCards, // function to scroll down to hackathon cards
}) {
  const filteredHackathons = hackathons.filter(
    (h) =>
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.techStack.some((tech) =>
        tech.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // React Router hook to navigate programmatically
  const navigate = useNavigate();
  const { user, token } = useAuth();

  return (
    // UPDATED: Main background gradient and base text color
    <div className="bg-gradient-to-l from-indigo-200 to-white dark:from-gray-900 dark:to-black">
      <div className="relative max-w-6xl mx-auto px-8 text-center mt-12">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-6xl font-extrabold leading-tight"
        >
          Discover {/* UPDATED: Text gradient for dark mode */}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-gradient">
            Amazing Hackathons
          </span>
        </motion.h1>

        {/* UPDATED: Subtitle text color */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          "Find and join the most exciting hackathons, compete with the best,
          and win amazing prizes 🚀"
        </motion.p>

        {/* ======================= SEARCH BOX ======================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full max-w-3xl mx-auto mt-12"
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center z-10 pointer-events-none">
              {/* UPDATED: Search icon color */}
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
            </div>

            <input
              type="text"
              placeholder="Search hackathons by name, location, or tags..."
              // UPDATED: Search input styles
              className="block w-full pl-12 pr-12 py-4 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 shadow-lg hover:shadow-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Clear Button (X) - appears only when there's a query */}
            {searchQuery && (
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchQuery("")}
                // UPDATED: Clear button icon color
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </div>

          {/* ======================= TAG FILTERS ======================= */}
          <div className="mt-4 flex items-center justify-between flex-wrap gap-3 px-2">
            {/* Predefined Tags for quick filtering */}
            <div className="flex gap-2 flex-wrap">
              {[
                "AI",
                "Blockchain",
                "Remote",
                "Web",
                "MERN",
                "CyberSecurity",
                "ML",
              ].map((tag, idx) => (
                <motion.span
                  key={idx}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setSearchQuery(tag)}
                  // UPDATED: Tag styles
                  className="px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/50 rounded-full cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
                >
                  {tag}
                </motion.span>
              ))}
            </div>

            {/* UPDATED: Hackathon count text color */}
            <span className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
              {filteredHackathons.length}{" "}
              {filteredHackathons.length === 1 ? "hackathon" : "hackathons"}{" "}
              found
            </span>
          </div>
        </motion.div>

        {/* ======================= CTA BUTTONS ======================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-8 flex justify-center gap-5 flex-wrap"
        >
          {/* Explore Hackathons Button (scrolls to cards section) */}
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToCards}
            className="relative px-7 py-3.5 rounded-xl font-medium text-gray-800 dark:text-gray-200 shadow-md backdrop-blur-md border border-gray-300 dark:border-gray-600 hover:border-indigo-400 transition-all duration-300 bg-white/70 dark:bg-gray-800/70"
          >
            <span className="relative flex items-center">
              {/* UPDATED: Icon color */}
              <Users className="inline-block w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Explore Hackathons
            </span>
          </motion.button>

          {/* Host Hackathon Button (navigates to hosting page) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!user) {
                navigate("/login");
              } else {
                navigate("/host-hackathon");
              }
            }}
            className="relative px-7 py-3.5 rounded-xl font-medium text-gray-800 dark:text-gray-100 shadow-md backdrop-blur-md border border-gray-300 hover:border-indigo-400 transition-all duration-300 bg-white/70 dark:bg-gray-800"
          >
            <span className="relative flex items-center">
              <Users className="inline-block w-5 h-5 mr-2 text-indigo-600" />
              Host a Hackathon
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* ======================= STATS SECTION ======================= */}
      <div 
        className="relative max-w-6xl mx-auto px-6 mt-20 mb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-delay="200"
      >
        {[
          { label: "Hackathons Hosted", value: "120+", icon: Rocket },
          { label: "Participants", value: "50k+", icon: Users },
          { label: "Projects Built", value: "8k+", icon: Code2 },
          { label: "Prizes Awarded", value: "$1M+", icon: Award },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + idx * 0.15, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            // AOS Implementation on individual stats
            data-aos="zoom-in"
            data-aos-delay={200 + idx * 150}
            // UPDATED: Stat card styles
            className="relative bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-3xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300"
          >
            {/* Animated Icon in a circular container */}
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="mb-4 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-800 to-indigo-300 shadow-md"
            >
              <stat.icon className="h-7 w-7 text-white" />
            </motion.div>

            {/* Stat Value (big bold number) */}
            {/* UPDATED: Text colors */}
            <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              {stat.value}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>

            {/* UPDATED: Decorative glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 dark:from-indigo-500/20 dark:to-indigo-600/20 blur-2xl opacity-40 -z-10" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}