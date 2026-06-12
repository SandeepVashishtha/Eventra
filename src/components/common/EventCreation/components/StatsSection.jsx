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
      className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3"
    >
      {STATS.map((stat, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.08, rotate: 1 }}
          className="flex flex-col items-center rounded-2xl border border-indigo-200 bg-white p-6 text-center shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <stat.icon className="mb-3 h-10 w-10 animate-bounce text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">{stat.number}</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
