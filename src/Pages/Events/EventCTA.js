import React, { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Users } from "lucide-react";

const EventCTA = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <section 
      className="relative py-16 px-8 m-8 rounded-3xl bg-gradient-to-tr from-indigo-900 via-purple-800 to-pink-700 text-white shadow-xl overflow-hidden"
      // AOS Implementation
      data-aos="zoom-in-up"
      data-aos-duration="1000"
    >
      {/* Snake-like glowing line */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M0,100 Q150,200 300,100 T600,100 T900,150 T1200,120"
          fill="transparent"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ pathLength: [0, 1, 0] }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut",
          }}
        />
      </svg>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Text */}
        <div className="md:w-1/2 text-center md:text-left">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Stay Updated with Our Events
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            Explore upcoming events, workshops, and webinars. Join the community
            and never miss out on learning opportunities.
          </motion.p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-4">
          <motion.a
            href="/events"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 font-semibold px-8 py-4 rounded-full shadow-lg hover:scale-105 hover:shadow-pink-400/50 transition-transform duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-aos="zoom-in"
            data-aos-delay="200"
          >
            Explore Events <CalendarDays size={20} />
          </motion.a>

          {/* UPDATED: The secondary button needs dark mode styles for when the main page is dark. */}
          <motion.button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-white text-purple-700 dark:bg-gray-200 dark:text-purple-800 font-semibold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-aos="zoom-in"
            data-aos-delay="400"
          >
            <Users size={20} /> Participate
          </motion.button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          {/* UPDATED: Modal card background, border, and text */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md relative text-center dark:border dark:border-gray-700">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Join Our Community</h3>
            <p className="text-gray-700 dark:text-gray-400 text-lg">
              To participate in events, please explore the event cards listed on
              this page.
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

export default EventCTA;