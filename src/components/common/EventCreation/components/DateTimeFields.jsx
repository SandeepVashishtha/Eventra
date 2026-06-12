import { motion } from "framer-motion";

function DateField({ name, label, value, onChange, min, error }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} <span className="text-red-600">*</span>
      </label>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        className={`w-full border ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg bg-white p-3 text-gray-700 dark:bg-gray-700 dark:text-white`}
      />
      {error && <span className="mt-1 block text-sm text-red-500">{error}</span>}
    </div>
  );
}

function TimeField({ name, label, value, onChange, error }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} <span className="text-red-600">*</span>
      </label>
      <input
        type="time"
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full border ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg bg-white p-3 text-gray-700 dark:bg-gray-700 dark:text-white`}
      />
      {error && <span className="mt-1 block text-sm text-red-500">{error}</span>}
    </div>
  );
}

export default function DateTimeFields({
  formData,
  handleInputChange,
  errors,
  prefersReducedMotion,
  todayString,
}) {
  const duration = prefersReducedMotion ? 0 : 0.5;
  const delay = prefersReducedMotion ? 0 : 0.1;

  if (formData.isMultiDay) {
    return (
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-4"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration, delay }}
      >
        <DateField
          name="startDate"
          label="Start Date"
          value={formData.startDate}
          onChange={handleInputChange}
          min={todayString}
          error={errors.startDate}
        />
        <DateField
          name="endDate"
          label="End Date"
          value={formData.endDate}
          onChange={handleInputChange}
          min={formData.startDate || todayString}
          error={errors.endDate}
        />
        <TimeField
          name="startTime"
          label="Start Time"
          value={formData.startTime}
          onChange={handleInputChange}
          error={errors.startTime}
        />
        <TimeField
          name="endTime"
          label="End Time"
          value={formData.endTime}
          onChange={handleInputChange}
          error={errors.endTime}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration, delay }}
    >
      <DateField
        name="date"
        label="Event Date"
        value={formData.date}
        onChange={handleInputChange}
        min={todayString}
        error={errors.date}
      />
      <TimeField
        name="startTime"
        label="Start Time"
        value={formData.startTime}
        onChange={handleInputChange}
        error={errors.startTime}
      />
      <TimeField
        name="endTime"
        label="End Time"
        value={formData.endTime}
        onChange={handleInputChange}
        error={errors.endTime}
      />
    </motion.div>
  );
}
