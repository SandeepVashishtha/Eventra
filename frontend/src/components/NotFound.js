import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const floatingVariants = {
    float: (i) => ({
      y: [0, -20 - i * 3, 0],
      x: [0, 20 + i * 5, 0],
      transition: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" },
    }),
  };

  const suggestions = [
    { name: "Tech Summit 2023", category: "Conference" },
    { name: "Open Source Hackathon", category: "Hackathon" },
    { name: "Developer Meetup", category: "Networking" },
    { name: "AI Expo", category: "Exhibition" },
    { name: "Startup Pitch Night", category: "Startup" },
    { name: "Cloud Computing Workshop", category: "Workshop" },
];


  // Predefined bubble positions along edges (top, bottom, left, right)
  const bubblePositions = [
    { top: "5%", left: "10%" },
    { top: "10%", right: "15%" },
    { bottom: "5%", left: "20%" },
    { bottom: "10%", right: "10%" },
    { top: "50%", left: "2%" },
    { top: "50%", right: "2%" },
  ];

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-black p-6"
    >
      {/* Floating bubbles along edges */}
      {bubblePositions.map((pos, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={floatingVariants}
          animate="float"
          className="absolute rounded-full bg-white/10"
          style={{
            width: `${50 + i * 10}px`,
            height: `${50 + i * 10}px`,
            ...pos,
          }}
        />
      ))}

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="relative z-10 text-center max-w-4xl w-full"
      >
        {/* 404 */}
        <motion.h1
          variants={itemVariants}
          className="text-[8rem] md:text-[10rem] font-extrabold text-white drop-shadow-lg"
        >
          <span className="relative">
            <span className="absolute top-0 left-0 text-blue-400 opacity-70 blur-sm">
              404
            </span>
            <span className="absolute top-0 left-0 text-indigo-400 opacity-70 blur-sm">
              404
            </span>
            <span className="relative">404</span>
          </span>
        </motion.h1>

        {/* Title */}
        <motion.h2
          variants={itemVariants}
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          Lost in the <span className="text-blue-400">Eventra</span> Space
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-white/80 mb-8 md:text-lg"
        >
          The page you’re looking for doesn’t exist. While you’re here, explore some of our popular events.
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <Link
            to="/"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-500 transition"
          >
            Return Home
          </Link>
          <Link
            to="/events"
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-full shadow-lg hover:bg-blue-400 transition"
          >
            Browse Events
          </Link>
        </motion.div>

        {/* Suggestions */}
        <motion.div variants={itemVariants} className="text-left">
          <h3 className="text-2xl font-bold text-white mb-4">Popular Events</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {suggestions.map((event, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white"
              >
                <div className="text-sm text-white/70">{event.category}</div>
                <h4 className="font-semibold text-lg mt-1">{event.name}</h4>
                <Link
                  to="/events"
                  className="mt-2 inline-block text-blue-400 underline font-medium"
                >
                  View Event
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default NotFoundPage;
