import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Mail, Users, Star, Globe } from "lucide-react";

// 1. Bubbles ko component ke bahar move kiya taaki har render par recreate na ho
// 2. Math.random() hata kar static values use kiye (React mein render ke andar random use karna bug cause karta hai)
// 3. blur-2xl add kiya taaki bubbles soft glowing orbs jaisi dikhein
const bubbles = [
  { size: 120, color: "bg-blue-500/20", top: "10%", left: "5%", delay: 0, duration: 6, repeatDelay: 3 },
  { size: 80, color: "bg-indigo-500/20", top: "70%", left: "15%", delay: 0.5, duration: 7, repeatDelay: 4 },
  { size: 150, color: "bg-purple-500/20", top: "20%", left: "80%", delay: 1, duration: 8, repeatDelay: 2 },
  { size: 90, color: "bg-blue-600/20", top: "60%", left: "90%", delay: 1.5, duration: 6.5, repeatDelay: 3.5 },
  { size: 60, color: "bg-indigo-600/20", top: "40%", left: "50%", delay: 2, duration: 7.5, repeatDelay: 2.5 },
  { size: 100, color: "bg-violet-500/20", top: "80%", left: "70%", delay: 2.5, duration: 8.5, repeatDelay: 4.5 },
];

const AboutCTA = () => {
  return (
    <motion.section 
      className="relative py-16 px-8 md:px-12 mt-4 mb-12 mx-4 md:mx-8 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl text-center overflow-hidden"
      // AOS ki jagah Framer Motion ka whileInView use kiya for consistency
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Animated Glowing Bubbles */}
      {bubbles.map((bubble, idx) => (
        <motion.div
          key={idx}
          className={`absolute rounded-full blur-2xl ${bubble.color}`}
          style={{
            width: bubble.size,
            height: bubble.size,
            top: bubble.top,
            left: bubble.left,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            delay: bubble.delay,
            duration: bubble.duration,
            repeat: Infinity,
            repeatDelay: bubble.repeatDelay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 flex justify-center items-center gap-3 flex-wrap">
            <Star className="text-yellow-500" size={32} fill="currentColor" /> 
            <span>Empower Your Ideas</span> 
            <Globe className="text-blue-500" size={32} />
          </h2>
        </motion.div>

        <motion.p
          className="text-gray-600 dark:text-gray-300 text-lg md:text-xl mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          Explore, innovate, and connect with a community of creators. Our
          platform helps you showcase your projects, collaborate with others, and
          gain real-world experience.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <Link
            to="/signup"
            className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
          >
            <Users size={20} className="group-hover:rotate-12 transition-transform duration-300" /> 
            Get Started Free
          </Link>

          <Link
            to="/documentation"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-gray-200 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
          >
            <BookOpen size={20} /> 
            View Documentation
          </Link>

          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-gray-200 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
          >
            <Mail size={20} /> 
            Contact Us
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default AboutCTA;