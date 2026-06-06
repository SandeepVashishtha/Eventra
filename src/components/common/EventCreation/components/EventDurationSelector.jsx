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
      <fieldset className="space-y-3">
        {/* Deep Fix: Legend for proper screen reader grouping */}
        <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <Calendar className="w-5 h-5 text-indigo-500 inline-block mr-2" aria-hidden="true" />
          Event Duration
        </legend>
        
        <div className="flex gap-4">
          <label className={`flex-1 flex items-center p-4 border rounded-xl cursor-pointer transition-all ${!isMultiDay ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600" : "border-gray-300 dark:border-gray-600"}`}>
            <input
              type="radio"
              name="eventType"
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              checked={!isMultiDay}
              onChange={() => onChange(false)}
            />
            <span className="ml-3 font-medium text-gray-700 dark:text-gray-300">Single-day Event</span>
          </label>

          <label className={`flex-1 flex items-center p-4 border rounded-xl cursor-pointer transition-all ${isMultiDay ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600" : "border-gray-300 dark:border-gray-600"}`}>
            <input
              type="radio"
              name="eventType"
              className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              checked={isMultiDay}
              onChange={() => onChange(true)}
            />
            <span className="ml-3 font-medium text-gray-700 dark:text-gray-300">Multi-day Event</span>
          </label>
        </div>
      </fieldset>
    </motion.div>
  );
}