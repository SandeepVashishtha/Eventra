import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  const phrases = [
    "Amazing Tech Events",
    "Exciting Hackathons Today",
    "Innovative Dev Workshops",
    "Cutting-Edge Tech Meetups",
  ];

  const [index, setIndex] = useState(0);

  // Change phrase every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const controls = useAnimation();

  useEffect(() => {
    controls.start("show");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [controls]);

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15 } },
  };

  const fadeUp = {
    hidden: { y: 40, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const floatShape = (i) => ({
    y: [0, -20 - i * 5, 0],
    x: [0, 20 + i * 5, 0],
    rotate: [0, 15, -15, 0],
    transition: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" },
  });

  const shapes = [
    {
      size: 60,
      pos: { top: "5%", left: "10%" },
      color: "from-indigo-400 to-blue-400",
    },
    {
      size: 80,
      pos: { top: "15%", right: "15%" },
      color: "from-purple-400 to-pink-400",
    },
    {
      size: 100,
      pos: { bottom: "5%", left: "20%" },
      color: "from-blue-300 to-indigo-300",
    },
    {
      size: 70,
      pos: { bottom: "10%", right: "10%" },
      color: "from-pink-300 to-purple-300",
    },
    {
      size: 50,
      pos: { top: "50%", left: "2%" },
      color: "from-indigo-300 to-blue-200",
    },
  ];

  const stats = [
    { value: "1500+", label: "Developers Joined", color: "text-indigo-500" },
    { value: "75", label: "Events Organized", color: "text-pink-500" },
    { value: "30+", label: "Partners & Sponsors", color: "text-purple-500" },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-indigo-50 via-indigo-100 to-white py-24 lg:py-32">
      {/* Floating Gradient Shapes */}
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          animate={floatShape(i)}
          className={`absolute rounded-full bg-gradient-to-tr ${shape.color} opacity-30`}
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            ...shape.pos,
          }}
        />
      ))}

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center"
          variants={container}
          initial="hidden"
          animate={controls}
        >
          {/* Headline */}
          <motion.h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-snug">
            <motion.span
              className="block text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Discover & Join
            </motion.span>

            <div className="relative h-16 sm:h-20 md:h-24 lg:h-28 overflow-hidden flex justify-center items-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={index}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 via-blue-500 to-purple-700 mb-4"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, ease: "easeOut" },
                  }}
                  exit={{
                    opacity: 0,
                    y: -40,
                    transition: { duration: 0.5, ease: "easeIn" },
                  }}
                >
                  {phrases[index]}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.h1>

          {/* Subtext */}
          <motion.p
  variants={fadeUp}
  className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto mt-2 mb-12"
>
  "Connect with developers, learn new skills, and grow your network at
  the best tech events, hackathons, and workshops in your area."
</motion.p>


          {/* Buttons */}
          <motion.div
            variants={container}
            className="flex flex-col sm:flex-row justify-center gap-6 mb-16"
          >
            {/* Primary Button - Explore Events */}
            <motion.div variants={fadeUp}>
              <Link
                to="/events"
                className="relative inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-bold shadow-lg overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <span className="relative z-10 flex items-center">
                  Explore Events
                  <svg
                    className="ml-3 w-5 h-5 text-white transition-transform duration-300 group-hover:translate-x-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {/* Glow effect */}
                <span className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-30 transition-opacity"></span>
              </Link>
            </motion.div>

            {/* Secondary Button - Join Hackathons */}
            <motion.div variants={fadeUp}>
              <Link
                to="/hackathons"
                className="relative inline-flex items-center px-8 py-4 rounded-full border border-gray-300 bg-white text-gray-700 font-semibold shadow hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Join Hackathons
              </Link>
            </motion.div>

            {/* Optional Tertiary Button - Learn More */}
            <motion.div variants={fadeUp}>
              <Link
                to="/about"
                className="relative inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                Learn More
                <svg
                  className="ml-3 w-5 h-5 text-white transition-transform duration-300 group-hover:translate-x-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </motion.div>
          </motion.div>

          {/* Animated Stats Cards */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/30 backdrop-blur-md rounded-2xl p-6 text-center shadow-lg"
              >
                <p className={`text-3xl font-bold mb-2 ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-gray-700 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
