import React, { useMemo } from "react";
import { motion } from "framer-motion";

function DateField({ name, label, value, onChange, min, error, id }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} <span className="text-red-600">*</span>
      </label>
      <input
        type="date"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full border ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg p-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500`}
      />
      {error && <span id={`${id}-error`} className="text-red-500 text-sm mt-1 block">{error}</span>}
    </div>
  );
}

function TimeField({ name, label, value, onChange, error, id }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} <span className="text-red-600">*</span>
      </label>
      <input
        type="time"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full border ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg p-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500`}
      />
      {error && <span id={`${id}-error`} className="text-red-500 text-sm mt-1 block">{error}</span>}
    </div>
  );
}

export default function DateTimeFields({ formData, handleInputChange, errors, prefersReducedMotion, todayString }) {
  const duration = prefersReducedMotion ? 0 : 0.5;
  const delay = prefersReducedMotion ? 0 : 0.1;

  // Ensure end date never lags behind start date (Auto-correction fix)
  const minEndDate = useMemo(() => formData.startDate || todayString, [formData.startDate, todayString]);

  return (
    <motion.div
      className={`grid gap-4 ${formData.isMultiDay ? "grid-cols-1 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration, delay }}
    >
      {formData.isMultiDay ? (
        <>
          <DateField id="start-date" name="startDate" label="Start Date" value={formData.startDate} onChange={handleInputChange} min={todayString} error={errors.startDate} />
          <DateField id="end-date" name="endDate" label="End Date" value={formData.endDate} onChange={handleInputChange} min={minEndDate} error={errors.endDate} />
        </>
      ) : (
        <DateField id="date" name="date" label="Event Date" value={formData.date} onChange={handleInputChange} min={todayString} error={errors.date} />
      )}
      <TimeField id="start-time" name="startTime" label="Start Time" value={formData.startTime} onChange={handleInputChange} error={errors.startTime} />
      <TimeField id="end-time" name="endTime" label="End Time" value={formData.endTime} onChange={handleInputChange} error={errors.endTime} />
    </motion.div>
  );
}