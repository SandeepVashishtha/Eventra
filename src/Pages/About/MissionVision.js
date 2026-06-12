import { Target, Star } from "lucide-react";
import { motion } from "framer-motion";

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
    // UPDATED: Section background
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-100 to-white py-28 dark:from-gray-900 dark:to-black">
      <div className="relative z-10 mx-auto max-w-5xl space-y-20 px-6 lg:px-12">
        {/* Mission */}
        <motion.div
          variants={item}
          // Removed initial/whileInView for AOS control
          whileHover="hover"
          // AOS Implementation
          data-aos="fade-right"
          data-aos-duration="1000"
          data-aos-offset="200"
          // UPDATED: Card background and border
          className="group relative flex flex-col items-start gap-8 rounded-3xl border border-transparent bg-white p-12 shadow-xl transition duration-500 hover:shadow-2xl md:flex-row dark:border-gray-700 dark:bg-gray-800"
        >
          {/* Icon Badge */}
          <motion.div
            variants={iconVariants}
            initial="initial"
            animate="initial"
            whileHover="hover"
            // UPDATED: Icon wrapper background
            className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-100 shadow-md transition dark:bg-gray-700"
          >
            {/* UPDATED: Icon color */}
            <Target className="text-3xl text-indigo-600 dark:text-indigo-400" />
          </motion.div>

          {/* Text */}
          <div>
            {/* UPDATED: Text colors */}
            <h3 className="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
              Our Mission
            </h3>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              To democratize event management by providing powerful, accessible tools that enable
              any community to create meaningful connections and memorable experiences. We believe
              that great events shouldn&apos;t require expensive software or technical expertise –
              just passion and the right platform.
            </p>
          </div>
        </motion.div>

        {/* Vision */}
        <motion.div
          variants={item}
          // Removed initial/whileInView for AOS control
          whileHover="hover"
          // AOS Implementation
          data-aos="fade-left"
          data-aos-duration="1000"
          data-aos-offset="200"
          className="group relative flex flex-col items-start gap-8 rounded-3xl bg-black p-12 text-white shadow-xl transition duration-500 hover:shadow-2xl md:flex-row"
        >
          {/* Icon Badge */}
          <motion.div
            variants={iconVariants}
            initial="initial"
            animate="initial"
            whileHover="hover"
            className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-md backdrop-blur-md transition"
          >
            <Star className="text-3xl text-white" />
          </motion.div>

          {/* Text */}
          <div>
            <h3 className="mb-4 text-3xl font-bold">Our Vision</h3>
            <p className="text-lg leading-relaxed text-indigo-100">
              A world where every community, regardless of size or budget, has access to
              professional-grade event management tools. We envision thriving local ecosystems where
              organizations can focus on what matters most: bringing people together and creating
              lasting impact.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Background Blobs */}
      {/* UPDATED: Blob colors */}
      <motion.div
        className="absolute top-0 right-0 h-96 w-96 rounded-full bg-purple-200 opacity-30 blur-3xl filter dark:bg-purple-900/50"
        animate={{ y: [0, 40, 0], x: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-indigo-200 opacity-25 blur-3xl filter dark:bg-indigo-900/50"
        animate={{ y: [0, -40, 0], x: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
      />
    </section>
  );
}
