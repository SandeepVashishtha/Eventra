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
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        <Calendar className="mr-2 inline-block h-5 w-5 text-indigo-500" />
        Event Duration
      </label>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-gray-700 dark:text-white">
          <input
            type="radio"
            name="eventType"
            checked={!isMultiDay}
            onChange={() => onChange(false)}
          />
          Single-day Event
        </label>
        <label className="flex items-center gap-2 text-gray-700 dark:text-white">
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
