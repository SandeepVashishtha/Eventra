import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Mail, Users, Star, Globe } from "lucide-react";

const AboutCTA = () => {
  // Bubbles with random delays for popping animation
  const bubbles = [
  { size: 60, color: "bg-blue-200/40", top: "10%", left: "5%", delay: 0 },
  { size: 40, color: "bg-indigo-300/30", top: "70%", left: "15%", delay: 0.5 },
  { size: 80, color: "bg-purple-200/30", top: "20%", left: "80%", delay: 1 },
  { size: 50, color: "bg-blue-300/40", top: "60%", left: "90%", delay: 1.5 },
  { size: 35, color: "bg-indigo-200/50", top: "40%", left: "50%", delay: 2 },
  { size: 45, color: "bg-violet-200/40", top: "80%", left: "70%", delay: 2.5 },
];

  return (
    <section 
      className="relative py-12 px-12 mt-2 mb-8 mx-8 rounded-3xl bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center overflow-hidden"
      // AOS Implementation
      data-aos="zoom-in-up"
      data-aos-duration="1000"
    >
      {/* Animated Bubbles */}
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
            scale: [1, 1.5, 1],
          }}
          transition={{
            delay: bubble.delay,
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 2 + Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.h2
        className="text-4xl md:text-5xl font-bold text-black mb-6 relative z-10 flex justify-center items-center gap-3"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Star size={30} /> Empower Your Ideas <Globe size={30} />
      </motion.h2>

      <motion.p
        className="text-black text-lg md:text-xl mb-12 max-w-3xl mx-auto relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
      >
        Explore, innovate, and connect with a community of creators. Our
        platform helps you showcase your projects, collaborate with others, and
        gain real-world experience.
      </motion.p>

      <div className="flex flex-col md:flex-row justify-center gap-6 relative z-10">
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-white bg-blue-600 shadow-lg hover:shadow-xl hover:scale-105 hover:bg-blue-700 transition-all duration-300"
          data-aos="zoom-in"
          data-aos-delay="200"
        >
          <Users size={20} /> Get Started Free
        </Link>

        <Link
          to="/documentation"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-medium border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800 transition-all duration-300"
          data-aos="zoom-in"
          data-aos-delay="400"
        >
          <BookOpen size={20} /> View Documentation
        </Link>

        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-medium border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 dark:hover:bg-slate-800 transition-all duration-300"
          data-aos="zoom-in"
          data-aos-delay="600"
        >
          <Mail size={20} /> Contact Us
        </Link>
      </div>
    </section>
  );
};

export default AboutCTA;