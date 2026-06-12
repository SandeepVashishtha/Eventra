import { motion } from "framer-motion";
import { CalendarPlus, CalendarX } from "lucide-react";

export default function RegistrationDatesFields({ formData, handleInputChange, errors }) {
  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          <CalendarPlus className="mr-2 inline-block h-5 w-5 text-indigo-500" />
          Registration Start
        </label>
        <input
          type="datetime-local"
          name="registrationStart"
          value={formData.registrationStart}
          onChange={handleInputChange}
          className={`w-full border ${errors.registrationStart ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg bg-white p-3 text-gray-900 transition-all duration-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-indigo-400`}
        />
        {errors.registrationStart && (
          <span className="mt-1 text-sm text-red-500">{errors.registrationStart}</span>
        )}
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          <CalendarX className="mr-2 inline-block h-5 w-5 text-indigo-500" />
          Registration End
        </label>
        <input
          type="datetime-local"
          name="registrationEnd"
          value={formData.registrationEnd}
          onChange={handleInputChange}
          className={`w-full border ${errors.registrationEnd ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg bg-white p-3 text-gray-900 transition-all duration-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-indigo-400`}
        />
        {errors.registrationEnd && (
          <span className="mt-1 text-sm text-red-500">{errors.registrationEnd}</span>
        )}
      </div>
    </motion.div>
  );
}
