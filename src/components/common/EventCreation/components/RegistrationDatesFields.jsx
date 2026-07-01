import { motion } from "framer-motion";
import { CalendarPlus, CalendarX } from "lucide-react";
import { useMemo } from "react";

export default function RegistrationDatesFields({ formData, handleInputChange, errors }) {
  // Deep Fix 1: Temporal locks to prevent past registration dates and chronological paradoxes
  const minStartDateTime = useMemo(() => new Date().toISOString().slice(0, 16), []);
  const minEndDateTime = useMemo(() => formData.registrationStart || minStartDateTime, [formData.registrationStart, minStartDateTime]);

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <div>
        <label htmlFor="reg-start" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 cursor-pointer">
          {/* Deep Fix 2: Hide decorative icons from screen readers */}
          <CalendarPlus className="w-5 h-5 text-indigo-500 inline-block mr-2" aria-hidden="true" />
          Registration Start
        </label>
        <input
          type="datetime-local"
          id="reg-start"
          name="registrationStart"
          value={formData.registrationStart}
          onChange={handleInputChange}
          min={minStartDateTime} // Deep Fix 1 applied
          aria-invalid={!!errors.registrationStart}
          aria-describedby={errors.registrationStart ? "reg-start-error" : undefined}
          className={`w-full border ${errors.registrationStart ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
        />
        {/* Deep Fix 3: Added id and role alert for screen reader error announcements */}
        {errors.registrationStart && <span id="reg-start-error" role="alert" className="text-red-500 text-sm mt-1 block">{errors.registrationStart}</span>}
      </div>
      <div>
        <label htmlFor="reg-end" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 cursor-pointer">
          <CalendarX className="w-5 h-5 text-indigo-500 inline-block mr-2" aria-hidden="true" />
          Registration End
        </label>
        <input
          type="datetime-local"
          id="reg-end"
          name="registrationEnd"
          value={formData.registrationEnd}
          onChange={handleInputChange}
          min={minEndDateTime} // Deep Fix 1 applied
          aria-invalid={!!errors.registrationEnd}
          aria-describedby={errors.registrationEnd ? "reg-end-error" : undefined}
          className={`w-full border ${errors.registrationEnd ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
        />
        {errors.registrationEnd && <span id="reg-end-error" role="alert" className="text-red-500 text-sm mt-1 block">{errors.registrationEnd}</span>}
      </div>
    </motion.div>
  );
}