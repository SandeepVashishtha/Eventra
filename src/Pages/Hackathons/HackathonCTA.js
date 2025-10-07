import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, UserPlus } from "lucide-react";

const HackathonCTA = () => {
  const [showModal, setShowModal] = useState(false);

  // Bubbles data
  const bubbles = [
    { size: 10, top: "10%", left: "15%", color: "bg-purple-300/30" },
    { size: 10, top: "30%", left: "80%", color: "bg-indigo-200/30" },
    { size: 10, top: "60%", left: "25%", color: "bg-white/20" },
    { size: 10, top: "75%", left: "70%", color: "bg-purple-200/25" },
    { size: 10, top: "50%", left: "50%", color: "bg-indigo-300/20" },
    { size: 10, top: "50%", left: "10%", color: "bg-indigo-300/20" },
    { size: 10, top: "30%", left: "50%", color: "bg-indigo-300/20" },
    { size: 10, top: "60%", left: "80%", color: "bg-indigo-300/20" },
  ];

  return (
    <section 
      className="relative py-16 px-8 m-8 rounded-3xl bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 text-center shadow-xl overflow-hidden"
      // AOS Implementation
      data-aos="zoom-in"
      data-aos-duration="1000"
    >
      {/* Floating Bubbles */}
      {bubbles.map((bubble, idx) => (
        <motion.div
          key={idx}
          className={`absolute rounded-full ${bubble.color}`}
          style={{
            width: bubble.size, 
            height: bubble.size,
            top: bubble.top,
            left: bubble.left,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.h2
        className="text-4xl md:text-5xl font-bold text-purple-300 mb-4 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Join Our Hackathon Community
      </motion.h2>

      <motion.p
        className="text-white text-lg md:text-xl mb-8 max-w-2xl mx-auto relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        Participate in exciting hackathons, showcase your skills, and connect
        with innovators around the world.
      </motion.p>

      <div className="flex flex-col md:flex-row justify-center gap-4 relative z-10">
        <motion.a
          href="/hackathons"
          className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg transition-transform duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-aos="zoom-in"
          data-aos-delay="200"
        >
          Explore Hackathons <ArrowRight size={20} />
        </motion.a>

        <motion.button
          onClick={() => setShowModal(true)}
          // UPDATED: The secondary button needs a subtle dark mode style
          className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 dark:bg-gray-200 dark:text-indigo-800 font-semibold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-aos="zoom-in"
          data-aos-delay="400"
        >
          <UserPlus size={20} /> Register
        </motion.button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          {/* UPDATED: Modal card background, border, and text */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md relative text-center dark:border dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Register for Hackathon</h3>
            <p className="text-gray-700 dark:text-gray-400 text-lg">
              To register, please select a hackathon from the cards displayed
              above.
            </p>
            {/* The close button works well in both themes. */}
            <button
              className="mt-6 px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default HackathonCTA;