import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export default function EventDurationSelector({ isMultiDay, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <Calendar className="w-5 h-5 text-indigo-500 inline-block mr-2" />
        Event Duration
      </label>
      <div className="flex gap-6">
        <label className="flex items-center text-gray-700 dark:text-white gap-2">
          <input
            type="radio"
            name="eventType"
            checked={!isMultiDay}
            onChange={() => onChange(false)}
          />
          Single-day Event
        </label>
        <label className="flex items-center text-gray-700 dark:text-white gap-2">
          <input
            type="radio"
            name="eventType"
            checked={isMultiDay}
            onChange={() => onChange(true)}
          />
          Multi-day Event
        </label>
      </div>
    </motion.div>
  );
}
