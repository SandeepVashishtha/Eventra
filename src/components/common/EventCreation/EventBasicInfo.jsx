import React from "react";
import { motion } from "framer-motion";
// Removed unused Calendar import to clean up dead code
import { FileText, Tag, Users } from "lucide-react";
import { categories } from "../../../constants/eventDefaults";
import CharacterCounter from "../CharacterCounter";

// Deep Fix 1: Added htmlFor prop to properly bind labels to inputs for screen readers
const FormField = ({ htmlFor, label, icon: Icon, error, children, required, hint }) => {
  const errorId = `${htmlFor}-error`;
  
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
        {Icon && <Icon className="w-5 h-5 text-indigo-500 inline-block mr-2" aria-hidden="true" />}
        {label}
        {required && <span className="text-red-600 ml-1" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (Required)</span>}
      </label>
      
      {children}
      
      {hint && <p id={`${htmlFor}-hint`} className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      
      {error && (
        <motion.p 
          id={errorId}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm flex items-center gap-1"
          role="alert" // Deep Fix 2: Alert role for screen reader announcements
        >
          <span role="img" aria-label="error">⚠️</span>
          {error}
        </motion.p>
      )}
    </div>
  );
};

const EventBasicInfo = ({ formData, handleInputChange, errors }) => {
  return (
    <div className="space-y-6">
      <FormField htmlFor="title-input" label="Event Title" icon={FileText} error={errors.title} required>
        <input
          type="text"
          id="title-input"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          maxLength={200}
          // Deep Fix 3: Proper ARIA invalidation and description mapping
          aria-invalid={!!errors.title}
          aria-describedby={`title-counter ${errors.title ? 'title-input-error' : ''}`.trim()}
          placeholder="Give your event a catchy title"
          className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                   text-gray-900 dark:text-gray-100 focus:outline-none 
                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                   transition-all duration-200 ${
                     errors.title ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
                   }`}
        />
        <div className="flex justify-end mt-1">
          <CharacterCounter id="title-counter" value={formData.title} maxLength={200} />
        </div>
      </FormField>

      <FormField htmlFor="category-input" label="Category" icon={Tag} error={errors.category} required>
        <select
          id="category-input"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          aria-invalid={!!errors.category}
          aria-describedby={errors.category ? "category-input-error" : undefined}
          className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                   text-gray-900 dark:text-gray-100 focus:outline-none 
                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                   transition-all duration-200 ${
                     errors.category ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
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

      <FormField htmlFor="description-input" label="Description" icon={FileText} error={errors.description} required>
        <textarea
          id="description-input"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={5}
          maxLength={500}
          aria-invalid={!!errors.description}
          aria-describedby={`description-counter ${errors.description ? 'description-input-error' : ''}`.trim()}
          placeholder="Tell people what your event is about..."
          className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                   text-gray-900 dark:text-gray-100 focus:outline-none 
                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                   transition-all duration-200 resize-none ${
                     errors.description ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
                   }`}
        />
        <div className="flex justify-end mt-1">
          <CharacterCounter id="description-counter" value={formData.description} maxLength={500} />
        </div>
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField htmlFor="capacity-input" label="Capacity" icon={Users} error={errors.capacity}>
          <input
            type="number"
            id="capacity-input"
            name="capacity"
            value={formData.capacity}
            onChange={handleInputChange}
            placeholder="Unlimited"
            // Deep Fix 4: Data integrity locks (prevents negative capacities and 'e' symbols)
            min="1"
            onKeyDown={(e) => {
              if (['e', 'E', '+', '-'].includes(e.key)) {
                e.preventDefault();
              }
            }}
            aria-invalid={!!errors.capacity}
            aria-describedby={errors.capacity ? "capacity-input-error" : undefined}
            className={`w-full border rounded-lg p-3 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ${
                       errors.capacity ? "border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600"
                     }`}
          />
        </FormField>
      </div>
    </div>
  );
};

export default EventBasicInfo;