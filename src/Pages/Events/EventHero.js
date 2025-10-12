import { motion } from "framer-motion";
import { Search, X, Rocket, Users, Award, Code2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EventHero({
  searchQuery,
  handleSearch,
  filteredEvents,
  scrollToCard,
}) {
  // Floating circles config (responsive)
  const floatingCircles = [
    { size: 50, x: 50, y: 200, color: "#4f46e5", delay: 0 },
    { size: 70, x: 300, y: 380, color: "#4338ca", delay: 1 },
    { size: 40, x: 600, y: 150, color: "#6366f1", delay: 0.5 },
    { size: 60, x: 700, y: 300, color: "#8b5cf6", delay: 1.2 },
    { size: 50, x: 100, y: 30, color: "#a78bfa", delay: 0.8 },
  ];

  const navigate = useNavigate();

  return (
    <div
      className="relative bg-gradient-to-l from-indigo-200 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 py-24"
      data-aos="fade-down"
      data-aos-once="true"
      data-aos-duration="1000"
    >
      <div className="absolute inset-0 z-0 pointer-events-none overflow-visible">
        {floatingCircles.map((circle, idx) => (
          <motion.div
            key={idx}
            className="absolute rounded-full"
            style={{
              width: circle.size,
              height: circle.size,
              top: circle.y,
              left: circle.x,
              backgroundColor: circle.color,
              opacity: 0.2,
            }}
            animate={{
              y: [circle.y, circle.y - 30, circle.y],
              x: [circle.x, circle.x + 20, circle.x],
              scale: [0.9, 1.1, 1],
            }}
            transition={{
              duration: 12 + idx * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: circle.delay,
            }}
          />
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative max-w-6xl mx-auto px-6 text-center z-10">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-6xl font-extrabold leading-tight"
        >
          Discover{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-gradient">
            Amazing Events
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          "Discover exciting events, compete with talented participants, learn
          new skills, and{" "}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            win amazing rewards 🚀
          </span>
          "
        </motion.p>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full max-w-3xl mx-auto mt-12"
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center z-10 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
            </div>

            <input
              type="text"
              placeholder="Search events by name, location, or tags..."
              className="block w-full pl-12 pr-12 py-4 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300 shadow-lg hover:shadow-xl"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />

            {searchQuery && (
              <motion.button
                whileHover={{ scale: 1.1}}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSearch("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </div>

          {/* Tags + Count */}
          <div className="mt-4 flex items-center justify-between flex-wrap gap-3 px-2">
            <div className="flex gap-2 flex-wrap">
              {[
                "AI",
                "Blockchain",
                "Web",
                "DevOps",
                "React",
                "UX",
                "Development",
              ].map((tag, idx) => (
                <motion.span
                  key={idx}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleSearch(tag)}
                  className="px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/50 rounded-full cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
            <span className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1 ? "event" : "events"} found
            </span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-12 flex justify-center gap-5 flex-wrap"
        >
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
            className="relative px-7 py-3.5 rounded-xl font-semibold text-white shadow-lg overflow-hidden group"
            onClick={scrollToCard}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-800 group-hover:from-indigo-500 group-hover:to-indigo-600 transition-all duration-500" />
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
            <span className="relative flex items-center">
              <Rocket className="inline-block w-5 h-5 mr-2" />
              Explore Events
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/create-event")}
            className="relative px-7 py-3.5 rounded-xl font-medium text-gray-800 dark:text-gray-200 shadow-md backdrop-blur-md border border-gray-300 dark:border-gray-600 hover:border-indigo-400 transition-all duration-300 bg-white/70 dark:bg-gray-800/70"
          >
            <span className="relative flex items-center">
              <Users className="inline-block w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Host an Event
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="relative max-w-6xl mx-auto px-6 mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Events Hosted", value: "120+", icon: Rocket },
          { label: "Active Participants", value: "50k+", icon: Users },
          { label: "Projects Created", value: "8k+", icon: Code2 },
          { label: "Total Prizes", value: "$1M+", icon: Award },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.1 + idx * 0.1,
              duration: 0.5,
              ease: "easeOut",
            }}
            whileHover={{ scale: 1.05 }}
            data-aos="zoom-in"
            data-aos-delay={200 + idx * 150}
            className="relative group bg-white dark:bg-gray-900 rounded-2xl shadow-md shadow-blue-200/40 dark:shadow-indigo-900/80 p-5 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300"
          >
            <motion.div
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="mb-3 flex items-center justify-center h-14 w-14 rounded-full bg-blue-50 dark:bg-indigo-900/50 text-blue-500 dark:text-indigo-400"
            >
              <stat.icon className="h-7 w-7" />
            </motion.div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
