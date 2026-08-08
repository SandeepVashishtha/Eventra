import { motion } from "framer-motion";
import { CalendarIcon, UsersIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const STATS = [
  { number: "10k+", label: "Events Created", icon: CalendarIcon },
  { number: "500k+", label: "Attendees", icon: UsersIcon },
  { number: "98%", label: "Success Rate", icon: CheckCircleIcon },
];

export default function StatsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mt-12"
    >
      {STATS.map((stat, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.08, rotate: 1 }}
          className="bg-white dark:bg-gray-800 border border-indigo-200 dark:border-gray-700 rounded-2xl shadow-md p-6 text-center flex flex-col items-center"
        >
          <stat.icon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-3 animate-bounce" />
          <h3 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">
            {stat.number}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
