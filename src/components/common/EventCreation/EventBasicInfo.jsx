
import { motion } from "framer-motion";
import { FileText, Tag, Users } from "lucide-react";
import { categories } from "../../../constants/eventDefaults";
import CharacterCounter from "../CharacterCounter";

const FormField = ({ label, icon: Icon, error, children, required, hint }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {Icon && <Icon className="mr-2 inline-block h-5 w-5 text-indigo-500" />}
      {label}
      {required && <span className="ml-1 text-red-600">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    {error && (
      <motion.p 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1 text-sm text-red-500"
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
          id="title-input"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          maxLength={200}
          aria-describedby="title-counter"
          placeholder="Give your event a catchy title"
          className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                   text-gray-900 dark:text-gray-100 focus:outline-none 
                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                   transition-all duration-200 ${
                     errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                   }`}
        />
        <div className="mt-1 flex justify-end">
          <CharacterCounter id="title-counter" value={formData.title} maxLength={200} />
        </div>
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
          id="description-input"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={5}
          maxLength={500}
          aria-describedby="description-counter"
          placeholder="Tell people what your event is about..."
          className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                   text-gray-900 dark:text-gray-100 focus:outline-none 
                   focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                   transition-all duration-200 resize-none ${
                     errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                   }`}
        />
        <div className="mt-1 flex justify-end">
          <CharacterCounter id="description-counter" value={formData.description} maxLength={500} />
        </div>
      </FormField>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField label="Capacity" icon={Users} error={errors.capacity}>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleInputChange}
            placeholder="Unlimited"
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </FormField>
      </div>
    </div>
  );
};

export default EventBasicInfo;
