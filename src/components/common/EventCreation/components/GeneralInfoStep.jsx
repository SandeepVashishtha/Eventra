import { motion } from "framer-motion";
import { FileText, Image, Upload, ClipboardList, Layers } from "lucide-react";

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
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <FileText className="w-5 h-5 text-indigo-500 inline-block mr-2" />
          Event Title <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="React Summit 2026 / AI Hackathon Gujarat / Open Source Meetup"
          maxLength={200}
          className={`w-full border ${
            errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          } rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300`}
        />
        {errors.title && <span className="text-red-500 text-sm mt-1">{errors.title}</span>}
      </motion.div>

      {/* Event Banner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.1 }}
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          <Image className="w-5 h-5 text-indigo-500 inline-block mr-2" />
          Event Banner (Max 5MB)
        </label>

        <div className="relative flex flex-col items-start gap-3">
          {/* Hidden File Input */}
          <input
            type="file"
            id="bannerUpload"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Show Choose File only if no banner is uploaded */}
          {!formData.banner && (
            <label
              htmlFor="bannerUpload"
              className="
                cursor-pointer
                inline-flex items-center justify-center gap-2
                bg-black
                text-white font-medium
                px-4 py-2 rounded-2xl
                shadow-md hover:shadow-lg
                hover:bg-zinc-800
                transition-all duration-300
                focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400
                transform hover:scale-[1.03] active:scale-[0.97] text-sm
              "
            >
              <Upload className="w-4 h-4" />
              Choose File
            </label>
          )}

          {/* Remove Button (only when uploaded) */}
          {formData.banner && (
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  banner: null,
                  bannerPreview: null,
                }))
              }
              className="
                text-red-500 dark:text-red-400
                font-medium text-sm
                flex items-center gap-2
                hover:text-red-600 dark:hover:text-red-300
                transition-all duration-300
                transform hover:scale-[1.05]
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Remove Banner
            </button>
          )}

          {/* Show file name */}
          {formData.banner && (
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {formData.banner.name}
            </span>
          )}

          {/* Error Message */}
          {errors.banner && <span className="text-red-500 text-sm">{errors.banner}</span>}

          {/* Preview Section */}
          {formData.bannerPreview && (
            <div className="rounded-lg overflow-hidden border border-indigo-200 dark:border-gray-700 shadow-md">
              <img
                loading="lazy"
                decoding="async"
                src={formData.bannerPreview}
                alt="Banner preview"
                className="
                  w-full
                  h-48
                  sm:h-56
                  md:h-64
                  object-cover
                  rounded-xl
                  hover:scale-[1.02]
                  transition-all
                  duration-300
                  bg-slate-200
                  dark:bg-slate-800
                "
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <ClipboardList className="w-5 h-5 text-indigo-500 inline-block mr-2" />
          Description <span className="text-red-600">*</span>
        </label>
        <p
          className={`text-sm text-right mt-1 ${
            formData.description.length > 450
              ? "text-red-500"
              : formData.description.length > 350
              ? "text-yellow-500"
              : "text-gray-400"
          }`}
        >
          {formData.description.length}/500 characters
        </p>

        {/* Character counter + error row */}
        <div className="flex justify-between items-start mt-1">
          <div className="flex-1">
            {errors.description && (
              <span className="text-red-500 text-sm">{errors.description}</span>
            )}
          </div>
          {(() => {
            const len = formData.description.length;
            const max = 500;
            const ratio = len / max;
            const counterColor =
              ratio >= 0.95
                ? "text-red-500"
                : ratio >= 0.8
                ? "text-amber-500"
                : "text-gray-500 dark:text-gray-400";
            return (
              <span
                className={`text-xs font-medium ml-2 tabular-nums ${counterColor}`}
                aria-live="polite"
              >
                {len} / {max}
              </span>
            );
          })()}
        </div>
      </motion.div>

      {/* Category */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Layers className="w-5 h-5 text-indigo-500 inline-block mr-2" />
          Category <span className="text-red-600">*</span>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className={`w-full border ${
            errors.category ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          } rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300`}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <span className="text-red-500 text-sm mt-1">{errors.category}</span>
        )}
      </motion.div>
    </>
  );
};

export default GeneralInfoStep;
