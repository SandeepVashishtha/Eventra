import React from "react";
import { motion } from "framer-motion";
import { Calendar, FileText, Tag, Users } from "lucide-react";
import { categories } from "../../../constants/eventDefaults";
import CharacterCounter from "../CharacterCounter";

const FormField = ({ label, icon: Icon, error, children, required, hint }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {Icon && <Icon className="w-5 h-5 text-indigo-500 inline-block mr-2" />}
      {label}
      {required && <span className="text-red-600 ml-1">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    {error && (
      <motion.p 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-500 text-sm flex items-center gap-1"
      >
        <span role="img" aria-label="error">⚠️</span>
        {error}
      </motion.p>
    )}
  </div>
);

const EventBasicInfo = ({ formData, handleInputChange, errors }) => {
  return (
    <div className="space-y-6">
      <FormField label="Event Title" icon={FileText} error={errors.title} required>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Give your event a catchy title"
          className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                   text-gray-900 dark:text-gray-100 focus:outline-none 
                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                   transition-all duration-200 ${
                     errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                   }`}
        />
      </FormField>

      <FormField label="Category" icon={Tag} error={errors.category} required>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                   text-gray-900 dark:text-gray-100 focus:outline-none 
                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                   transition-all duration-200 ${
                     errors.category ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                   }`}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Description" icon={FileText} error={errors.description} required>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={5}
          placeholder="Tell people what your event is about..."
          className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                   text-gray-900 dark:text-gray-100 focus:outline-none 
                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                   transition-all duration-200 resize-none ${
                     errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                   }`}
        />
        <div className="flex justify-end">
          <CharacterCounter current={formData.description.length} max={500} />
        </div>
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Capacity" icon={Users} error={errors.capacity}>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleInputChange}
            placeholder="Unlimited"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </FormField>
      </div>
    </div>
  );
};

export default EventBasicInfo;
