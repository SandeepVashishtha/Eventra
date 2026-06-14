import { Target, Star, Users, Globe, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
    },
  },
};

const iconVariants = {
  hover: {
    scale: 1.1,
    y: -4,
    transition: {
      type: "spring",
      stiffness: 300,
    },
  },
};

export default function MissionVision() {
  return (
    <section className="relative py-28 bg-slate-950 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.h2
            variants={cardVariants}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Building the Future of Community Events
          </motion.h2>

          <motion.p variants={cardVariants} className="max-w-3xl mx-auto text-lg text-slate-400">
            Eventra exists to empower communities, students, developers, organizers, and innovators
            with accessible tools that make collaboration and event management effortless.
          </motion.p>
        </motion.div>

        {/* Mission & Vision Grid */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-8"
        >
          {/* Mission */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6 }}
            className="group bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-3xl p-10"
          >
            <motion.div
              variants={iconVariants}
              whileHover="hover"
              className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6"
            >
              <Target className="w-8 h-8 text-blue-400" />
            </motion.div>

            <h3 className="text-3xl font-bold text-white mb-4">Our Mission</h3>

            <p className="text-slate-400 leading-relaxed text-lg mb-8">
              To democratize event management by providing powerful, open-source, and accessible
              tools that help communities create meaningful experiences, foster collaboration, and
              build stronger connections without technical barriers.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-300">
                <Users className="w-5 h-5 text-blue-400" />
                Community-driven development
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <HeartHandshake className="w-5 h-5 text-blue-400" />
                Accessible for everyone
              </div>
            </div>
          </motion.div>

          {/* Vision */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6 }}
            className="group bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-900/40 rounded-3xl p-10"
          >
            <motion.div
              variants={iconVariants}
              whileHover="hover"
              className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6"
            >
              <Star className="w-8 h-8 text-indigo-400" />
            </motion.div>

            <h3 className="text-3xl font-bold text-white mb-4">Our Vision</h3>

            <p className="text-slate-400 leading-relaxed text-lg mb-8">
              A world where every community, organization, educational institution, and open-source
              initiative has access to professional-grade event management tools that inspire
              growth, learning, and meaningful impact.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-300">
                <Globe className="w-5 h-5 text-indigo-400" />
                Global accessibility
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <Star className="w-5 h-5 text-indigo-400" />
                Innovation through collaboration
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
