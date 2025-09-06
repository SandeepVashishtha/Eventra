import { motion } from "framer-motion";
import { Search, X, Rocket, Users, Award, Code2 } from "lucide-react";

export default function HackathonHero({
  hackathons = [],
  searchQuery,
  setSearchQuery,
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

  return (
    <div className="relative bg-gradient-to-l from-indigo-200 to-white text-gray-900 py-24 overflow-hidden">
      {/* Decorative Blobs */}
      {/* <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-purple-300/40 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div> */}

      {/* Hero Content */}
      <div className="relative max-w-6xl mx-auto px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl sm:text-6xl font-extrabold leading-tight"
        >
          Discover{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
            Amazing Hackathons
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto"
        >
          "Find and join the most exciting hackathons, compete with the best,
          and win amazing prizes 🚀"
        </motion.p>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full max-w-3xl mx-auto mt-12"
        >
          <div className="relative group">
            {/* Permanent Search Icon */}
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center z-10 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>

            {/* Input */}
            <input
              type="text"
              placeholder="Search hackathons by name, location, or tags..."
              className="block w-full pl-12 pr-12 py-4 text-base text-gray-900 placeholder-gray-400 
               bg-white/60 backdrop-blur-xl border border-gray-200 rounded-2xl
               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
               transition-all duration-300 shadow-lg hover:shadow-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Clear Button */}
            {searchQuery && (
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </motion.button>
            )}
          </div>

          {/* Suggestions + Count */}
          <div className="mt-4 flex items-center justify-between flex-wrap gap-3 px-2">
            {/* Chips */}
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
                  className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-full cursor-pointer hover:bg-indigo-100 transition"
                >
                  {tag}
                </motion.span>
              ))}
            </div>

            {/* Result count */}
            <span className="text-sm text-indigo-600 font-semibold">
              {filteredHackathons.length}{" "}
              {filteredHackathons.length === 1 ? "hackathon" : "hackathons"}{" "}
              found
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
          {/* Primary CTA */}
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
            className="relative px-7 py-3.5 rounded-xl font-semibold text-white shadow-lg overflow-hidden group"
          >
            {/* Animated Gradient Background */}
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-800 group-hover:from-indigo-500 group-hover:to-indigo-600 transition-all duration-500" />
            {/* Shiny effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
            <span className="relative flex items-center">
              <Rocket className="inline-block w-5 h-5 mr-2" />
              Explore Hackathons
            </span>
          </motion.button>

          {/* Secondary CTA */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative px-7 py-3.5 rounded-xl font-medium text-gray-800 shadow-md backdrop-blur-md border border-gray-300 hover:border-indigo-400 transition-all duration-300 bg-white/70"
          >
            <span className="relative flex items-center">
              <Users className="inline-block w-5 h-5 mr-2 text-indigo-600" />
              Host a Hackathon
            </span>
            {/* Glow on hover */}
            <span className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-indigo-500 transition-all duration-500"></span>
          </motion.button>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="relative max-w-6xl mx-auto px-6 mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
            className="relative bg-gradient-to-br from-indigo-50 to-white rounded-3xl shadow-lg p-6 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-300"
          >
            {/* Icon Circle with hover animation */}
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="mb-4 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-800 to-indigo-300 shadow-md"
            >
              <stat.icon className="h-7 w-7 text-white" />
            </motion.div>

            {/* Value */}
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {stat.value}
            </p>

            {/* Label */}
            <p className="mt-1 text-sm font-medium text-gray-600">
              {stat.label}
            </p>

            {/* Decorative Indigo Glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 blur-2xl opacity-40 -z-10" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// /* Add these to globals.css if not already */
// @keyframes blob {
//   0%, 100% { transform: translate(0px, 0px) scale(1); }
//   33% { transform: translate(30px, -50px) scale(1.1); }
//   66% { transform: translate(-20px, 20px) scale(0.9); }
// }
// .animate-blob { animation: blob 8s infinite; }
// .animation-delay-2000 { animation-delay: 2s; }
// .animation-delay-4000 { animation-delay: 4s; }
