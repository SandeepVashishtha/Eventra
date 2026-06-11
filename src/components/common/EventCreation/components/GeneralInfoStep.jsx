import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Image, Upload, ClipboardList, Layers, X } from "lucide-react";
import CharacterCounter from "../../CharacterCounter";

const GeneralInfoStep = ({
  formData,
  setFormData,
  errors,
  handleInputChange,
  handleImageUpload,
  prefersReducedMotion,
  categories,
}) => {
  return (
    <>
      {/* Event Title */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
      >
        <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          <FileText className="mr-2 inline-block h-5 w-5 text-indigo-500" aria-hidden="true" />
          Event Title <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="React Summit 2026 / AI Hackathon Gujarat / Open Source Meetup"
          maxLength={200}
          aria-invalid={!!errors.title}
          aria-describedby="title-counter title-error"
          className={`w-full border ${errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg p-3 bg-white dark:bg-gray-700 focus:ring-1 focus:ring-indigo-500 transition-all`}
        />
        <div className="mt-1 flex items-start justify-between">
          <div id="title-error" className="flex-1">
            {errors.title && <span className="text-sm text-red-500">{errors.title}</span>}
          </div>
          <CharacterCounter id="title-counter" value={formData.title} maxLength={200} />
        </div>
      </motion.div>

      {/* Event Banner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.1 }}
      >
        <label className="mb-4 block text-sm font-medium text-gray-700 dark:text-gray-300">
          <Image className="mr-2 inline-block h-5 w-5 text-indigo-500" aria-hidden="true" />
          Event Banner (Max 5MB)
        </label>

        <div className="relative flex flex-col items-start gap-3">
          <input type="file" id="bannerUpload" accept="image/*" onChange={handleImageUpload} className="hidden" />
          {!formData.banner && (
            <label htmlFor="bannerUpload" className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-black px-4 py-2 text-sm text-white shadow-md transition-all hover:bg-zinc-800">
              <Upload className="h-4 w-4" aria-hidden="true" /> Choose File
            </label>
          )}

          {formData.banner && (
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, banner: null, bannerPreview: null }))} className="flex items-center gap-2 text-sm text-red-500" aria-label="Remove uploaded banner">
              <X className="h-4 w-4" aria-hidden="true" /> Remove Banner
            </button>
          )}

          {formData.bannerPreview && (
            <div className="overflow-hidden rounded-lg border border-indigo-200 shadow-md">
              <img
                loading="lazy"
                decoding="async" // Performance: Async decoding prevents UI stutter
                src={formData.bannerPreview}
                alt="Banner preview"
                className="h-48 w-full rounded-xl object-cover sm:h-64"
              />
            </div>
          )}
          {errors.banner && <span className="text-sm text-red-500">{errors.banner}</span>}
        </div>
      </motion.div>

      {/* Description */}
      <motion.div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          <ClipboardList className="mr-2 inline-block h-5 w-5 text-indigo-500" aria-hidden="true" />
          Description <span className="text-red-600">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          maxLength={500}
          aria-invalid={!!errors.description}
          aria-describedby="description-counter description-error"
          className={`w-full border ${errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg p-3 bg-white dark:bg-gray-700 resize-none`}
        />
        <div id="description-error" className="mt-1 flex items-start justify-between">
          {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
          <CharacterCounter id="description-counter" value={formData.description} maxLength={500} />
        </div>
      </motion.div>

      {/* Category */}
      <motion.div>
        <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          <Layers className="mr-2 inline-block h-5 w-5 text-indigo-500" aria-hidden="true" />
          Category <span className="text-red-600">*</span>
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          aria-invalid={!!errors.category}
          aria-describedby={errors.category ? "category-error" : undefined}
          className={`w-full border ${errors.category ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg p-3 bg-white dark:bg-gray-700`}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        {errors.category && <span id="category-error" className="mt-1 text-sm text-red-500">{errors.category}</span>}
      </motion.div>
    </>
  );
};

export default GeneralInfoStep;