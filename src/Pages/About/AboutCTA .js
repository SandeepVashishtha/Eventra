import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Rocket, BookOpen, Mail, Users, Star, Globe } from "lucide-react";

const AboutCTA = () => {
  // Bubbles with random delays for popping animation
  const bubbles = [
    { size: 14, top: "15%", left: "20%", color: "bg-pink-700/40", delay: 0 },
    {
      size: 16,
      top: "50%",
      left: "10%",
      color: "bg-purple-800/30",
      delay: 0.3,
    },
    {
      size: 12,
      top: "35%",
      left: "70%",
      color: "bg-indigo-900/35",
      delay: 0.6,
    },
    { size: 18, top: "65%", left: "50%", color: "bg-pink-800/25", delay: 0.9 },
    {
      size: 14,
      top: "80%",
      left: "80%",
      color: "bg-purple-900/20",
      delay: 1.2,
    },
    {
      size: 10,
      top: "25%",
      left: "40%",
      color: "bg-indigo-700/30",
      delay: 0.5,
    },
    { size: 12, top: "60%", left: "30%", color: "bg-pink-600/25", delay: 1.0 },
    {
      size: 15,
      top: "10%",
      left: "60%",
      color: "bg-purple-700/35",
      delay: 0.2,
    },
    {
      size: 13,
      top: "45%",
      left: "75%",
      color: "bg-indigo-800/30",
      delay: 0.7,
    },
    { size: 11, top: "70%", left: "20%", color: "bg-pink-700/20", delay: 1.1 },
    {
      size: 16,
      top: "30%",
      left: "85%",
      color: "bg-purple-800/25",
      delay: 0.4,
    },
  ];

  return (
    <section 
      className="relative py-16 px-12 m-8 rounded-3xl bg-gradient-to-r from-black via-purple-950 to-pink-950 text-center overflow-hidden shadow-2xl"
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
        className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10 flex justify-center items-center gap-3"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Star size={30} /> Empower Your Ideas <Globe size={30} />
      </motion.h2>

      <motion.p
        className="text-indigo-300 text-lg md:text-xl mb-12 max-w-3xl mx-auto relative z-10"
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
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          data-aos="zoom-in"
          data-aos-delay="200"
        >
          <Rocket size={20} /> Get Started Free
        </Link>

        <Link
          to="/documentation"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-medium border border-indigo-400/50 text-indigo-200 hover:bg-indigo-500/10 hover:border-indigo-300 transition-all duration-300"
          data-aos="zoom-in"
          data-aos-delay="400"
        >
          <BookOpen size={20} /> View Documentation
        </Link>

        <Link
          to="/contact"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-medium border border-indigo-400/50 text-indigo-200 hover:bg-indigo-500/10 hover:border-indigo-300 transition-all duration-300"
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