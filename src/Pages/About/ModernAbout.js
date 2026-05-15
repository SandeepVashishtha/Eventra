import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.2, duration: 0.6, ease: "easeOut" },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardItem = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const animatedBackgroundLayers = [
  {
    className:
      "absolute top-0 left-1/4 w-72 h-72 bg-indigo-100 dark:bg-indigo-900/50 rounded-full filter blur-3xl opacity-40",
    animate: { scale: [1, 1.3, 1], rotate: [0, 45, 0] },
    transition: { repeat: Infinity, duration: 12, ease: "easeInOut" },
  },
  {
    className:
      "absolute bottom-0 right-1/3 w-96 h-96 bg-pink-100 dark:bg-pink-900/50 rounded-full filter blur-3xl opacity-30",
    animate: { scale: [1, 1.2, 1], rotate: [0, -45, 0] },
    transition: { repeat: Infinity, duration: 14, ease: "easeInOut" },
  },
  {
    className:
      "absolute top-1/3 left-10 w-40 h-40 bg-purple-200 dark:bg-purple-800/40 rounded-full filter blur-2xl opacity-20",
    animate: { y: [0, -30, 0], x: [0, 20, 0] },
    transition: { repeat: Infinity, duration: 10, ease: "easeInOut" },
  },
  {
    className:
      "absolute bottom-20 right-10 w-32 h-32 bg-blue-200 dark:bg-blue-800/40 rounded-full filter blur-2xl opacity-25",
    animate: { y: [0, 25, 0], x: [0, -15, 0] },
    transition: { repeat: Infinity, duration: 12, ease: "easeInOut" },
  },
];

const highlightCards = [
  { value: "100+", label: "Events Managed", delay: 300 },
  { value: "500+", label: "Active Users", delay: 400 },
  { value: "Global", label: "Community Reach", delay: 500 },
];

function AnimatedBackground() {
  return (
    <>
      {animatedBackgroundLayers.map((layer) => (
        <motion.div
          key={layer.className}
          className={layer.className}
          animate={layer.animate}
          transition={layer.transition}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 via-transparent to-yellow-50 dark:from-blue-900/20 dark:via-transparent dark:to-yellow-900/20 opacity-40 animate-pulse" />

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(147,197,253,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(250,204,21,0.2)_1px,transparent_1px),linear-gradient(45deg,rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(-45deg,rgba(250,204,21,0.08)_1px,transparent_1px)] bg-[size:40px_40px,40px_40px,80px_80px,80px_80px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/30 to-white dark:from-transparent dark:to-gray-900" />
      </div>
    </>
  );
}

function HighlightCard({ value, label, delay }) {
  return (
    <motion.div
      variants={cardItem}
      className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100 dark:shadow-indigo-900/50 p-6 hover:scale-105 transition-transform duration-500"
      data-aos="zoom-in"
      data-aos-delay={delay}
    >
      <h3 className="text-black dark:text-white text-2xl font-bold mb-2">
        {value}
      </h3>
      <p className="text-black dark:text-gray-300 text-sm">{label}</p>
    </motion.div>
  );
}

function HighlightCards() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-6"
    >
      {highlightCards.map((card) => (
        <HighlightCard
          key={card.label}
          value={card.value}
          label={card.label}
          delay={card.delay}
        />
      ))}
    </motion.div>
  );
}

export default function ModernAbout() {
  return (
    <section className="relative min-h-[82vh] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900 overflow-hidden py-16">
      <AnimatedBackground />

      <div
        className="max-w-4xl text-center px-4 sm:px-6 lg:px-8 z-10 -mt-8 md:-mt-12"
        data-aos="fade-up"
        data-aos-duration="1000"
        data-aos-once="true"
      >
        <motion.h1
          variants={item}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-black dark:text-white mb-6"
          style={{ fontFamily: '"Anton", sans-serif' }}
          data-aos="zoom-in"
          data-aos-delay="100"
        >
          About <span className="text-black dark:text-white">Us</span>
        </motion.h1>

        <motion.p
          variants={item}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-base sm:text-lg text-black dark:text-gray-300 mb-16"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          Eventra is a comprehensive open-source platform that empowers
          communities, colleges, and organizations worldwide to create, manage,
          and track events effortlessly. Transform the way you plan, execute,
          and experience events with ease.
        </motion.p>

        <HighlightCards />
      </div>
    </section>
  );
}
