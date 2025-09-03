import { motion } from "framer-motion";
import { FaBullseye, FaStar } from "react-icons/fa";

const item = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const iconVariants = {
  initial: { scale: 1, y: 0 },
  hover: { scale: 1.3, y: -8, transition: { type: "spring", stiffness: 300 } },
};

export default function MissionVision() {
  return (
    <section className="relative py-28 bg-gradient-to-br from-indigo-100 to-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 lg:px-12 relative z-10 space-y-20">
        {/* Mission */}
        <motion.div
          variants={item}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover="hover" // parent hover state
          className="group relative rounded-3xl bg-white shadow-xl p-12 flex flex-col md:flex-row items-start gap-8 hover:shadow-2xl transition duration-500"
        >
          {/* Icon Badge */}
          <motion.div
            variants={iconVariants}
            initial="initial"
            animate="initial"
            whileHover="hover"
            className="flex-shrink-0 w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center shadow-md transition"
          >
            <FaBullseye className="text-indigo-600 text-3xl" />
          </motion.div>

          {/* Text */}
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Our Mission
            </h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              To democratize event management by providing powerful, accessible
              tools that enable any community to create meaningful connections
              and memorable experiences. We believe that great events shouldn't
              require expensive software or technical expertise – just passion
              and the right platform.
            </p>
          </div>
        </motion.div>

        {/* Vision */}
        <motion.div
          variants={item}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover="hover"
          className="group relative rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-xl p-12 flex flex-col md:flex-row items-start gap-8 hover:shadow-2xl transition duration-500"
        >
          {/* Icon Badge */}
          <motion.div
            variants={iconVariants}
            initial="initial"
            animate="initial"
            whileHover="hover"
            className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md transition"
          >
            <FaStar className="text-white text-3xl" />
          </motion.div>

          {/* Text */}
          <div>
            <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
            <p className="text-indigo-100 leading-relaxed text-lg">
              A world where every community, regardless of size or budget, has
              access to professional-grade event management tools. We envision
              thriving local ecosystems where organizations can focus on what
              matters most: bringing people together and creating lasting
              impact.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Background Blobs */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-30"
        animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200 rounded-full filter blur-3xl opacity-25"
        animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
      />
    </section>
  );
}
