import { motion } from "framer-motion";
import CountUp from "react-countup";

const HeroStatsCard = ({ stat, variants }) => {
  const Icon = stat.icon;

  return (
    <motion.div
      variants={variants}
      whileHover={{
        y: -12,
        scale: 1.04,
        rotateX: 4,
        rotateY: -4,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 18,
      }}
      className="group relative overflow-hidden rounded-2xl p-[1px]"
    >
      {/* Animated Border */}
      <div
        className="
          absolute inset-0 rounded-2xl
          bg-gradient-to-r
          from-blue-500
          via-purple-500
          to-pink-500
          opacity-0
          group-hover:opacity-100
          transition-all
          duration-500
        "
      />

      {/* Card */}
      <div
        className="
          relative h-full
          rounded-2xl
          bg-white/90
          dark:bg-gray-800/90
          backdrop-blur-xl
          border border-blue-100
          dark:border-gray-700
          p-6
          overflow-hidden
          transition-all
          duration-500
          group-hover:border-transparent
          group-hover:shadow-[0_20px_60px_rgba(59,130,246,0.35)]
        "
      >
        {/* Glow */}
        <div
          className="
            absolute
            -right-20
            -bottom-20
            w-48
            h-48
            rounded-full
            bg-blue-500/20
            blur-3xl
            opacity-0
            group-hover:opacity-100
            transition-all
            duration-500
          "
        />

        {/* Icon */}
        <motion.div
          whileHover={{
            rotate: -8,
            scale: 1.2,
          }}
          transition={{ type: "spring" }}
          className="
            relative
            mx-auto
            mb-5
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-xl
            bg-blue-500/10
            text-blue-500
            group-hover:bg-gradient-to-r
            group-hover:from-blue-500
            group-hover:to-purple-500
            group-hover:text-white
          "
        >
          <Icon size={28} />
        </motion.div>

        {/* Number */}
        <motion.p
          whileHover={{ scale: 1.08 }}
          className="relative text-3xl font-bold mb-2 text-gray-900 dark:text-white"
        >
          <CountUp
            start={0}
            end={stat.value}
            duration={2.5}
            suffix={stat.suffix}
            enableScrollSpy
            scrollSpyOnce
          />
        </motion.p>

        {/* Label */}
        <p
          className="
            relative
            text-sm
            text-gray-500
            dark:text-gray-300
            transition-all
            duration-300
            group-hover:text-blue-600
            dark:group-hover:text-blue-400
          "
        >
          {stat.label}
        </p>
      </div>
    </motion.div>
  );
};

export default HeroStatsCard;