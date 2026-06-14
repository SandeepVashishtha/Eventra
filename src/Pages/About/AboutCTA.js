import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Mail, Users, Globe, ArrowRight, Sparkles } from "lucide-react";

const bubbles = [
  {
    size: 180,
    color: "bg-blue-500/10",
    top: "15%",
    left: "8%",
    delay: 0,
    duration: 8,
  },
  {
    size: 220,
    color: "bg-indigo-500/10",
    top: "60%",
    left: "75%",
    delay: 1,
    duration: 10,
  },
  {
    size: 140,
    color: "bg-purple-500/10",
    top: "30%",
    left: "85%",
    delay: 2,
    duration: 9,
  },
];

const AboutCTA = () => {
  return (
    <motion.section
      className="relative overflow-hidden rounded-3xl mx-4 md:mx-8 my-16 border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7 }}
    >
      {/* Background Glow Orbs */}
      {bubbles.map((bubble, idx) => (
        <motion.div
          key={idx}
          className={`absolute rounded-full blur-3xl ${bubble.color}`}
          style={{
            width: bubble.size,
            height: bubble.size,
            top: bubble.top,
            left: bubble.left,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-20 text-center">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Sparkles size={16} />
          Join the Eventra Community
        </motion.div>

        {/* Heading */}
        <motion.h2
          className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Build, Collaborate & Grow
          <span className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Together with Eventra
          </span>
        </motion.h2>

        {/* Description */}
        <motion.p
          className="max-w-3xl mx-auto text-lg md:text-xl text-slate-300 leading-relaxed mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Eventra empowers students, developers, organizers, and communities to discover
          opportunities, collaborate on meaningful projects, and create impact through
          technology-driven events.
        </motion.p>

        {/* Social Proof */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 mb-12 text-sm text-slate-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-400" />
            Growing Community
          </div>

          <div className="flex items-center gap-2">
            <Globe size={16} className="text-indigo-400" />
            Open Source Driven
          </div>

          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-purple-400" />
            Learning & Collaboration
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link
            to="/signup"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
          >
            <Users size={20} />
            Get Started Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/documentation"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold border border-slate-700 bg-slate-800/60 backdrop-blur-sm text-slate-200 hover:border-blue-500 hover:text-blue-400 transition-all duration-300"
          >
            <BookOpen size={20} />
            Documentation
          </Link>

          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold border border-slate-700 bg-slate-800/60 backdrop-blur-sm text-slate-200 hover:border-blue-500 hover:text-blue-400 transition-all duration-300"
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
