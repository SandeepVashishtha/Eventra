import { motion } from "framer-motion";
import { CalendarPlus, CalendarX } from "lucide-react";

export default function RegistrationDatesFields({ formData, handleInputChange, errors }) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <CalendarPlus className="w-5 h-5 text-indigo-500 inline-block mr-2" />
          Registration Start
        </label>
        <input
          type="datetime-local"
          name="registrationStart"
          value={formData.registrationStart}
          onChange={handleInputChange}
          className={`w-full border ${errors.registrationStart ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
        />
        {errors.registrationStart && <span className="text-red-500 text-sm mt-1">{errors.registrationStart}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <CalendarX className="w-5 h-5 text-indigo-500 inline-block mr-2" />
          Registration End
        </label>
        <input
          type="datetime-local"
          name="registrationEnd"
          value={formData.registrationEnd}
          onChange={handleInputChange}
          className={`w-full border ${errors.registrationEnd ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
        />
        {errors.registrationEnd && <span className="text-red-500 text-sm mt-1">{errors.registrationEnd}</span>}
      </div>
    </motion.div>
  );
}
