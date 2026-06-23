import { motion } from "framer-motion";
import { MapPin, Map, Navigation, Compass } from "lucide-react";

export default function LocationFields({ formData, handleInputChange, errors, prefersReducedMotion }) {
  if (formData.isVirtual) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Virtual Event Link <span className="text-red-600">*</span>
        </label>
        <input
          type="url"
          name="virtualLink"
          value={formData.virtualLink}
          onChange={handleInputChange}
          placeholder="https://zoom.us/j/..."
          className={`w-full border ${errors.virtualLink ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
        />
        {errors.virtualLink && <span className="mt-1 text-sm text-red-500">{errors.virtualLink}</span>}
      </motion.div>
    );
  }

  const dur = prefersReducedMotion ? 0 : 0.5;
  const delay = prefersReducedMotion ? 0 : 0.1;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          <MapPin className="mr-2 inline-block h-5 w-5 text-indigo-500" />
          Location Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          name="location.name"
          value={formData.location.name}
          onChange={handleInputChange}
          placeholder="Convention Center, Community Hall, etc."
          className={`w-full border ${errors.location ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
        />
        {errors.location && <span className="mt-1 text-sm text-red-500">{errors.location}</span>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: dur, delay }}
      >
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          <Map className="mr-2 inline-block h-5 w-5 text-indigo-500" />
          Address
        </label>
        <input
          type="text"
          name="location.address"
          value={formData.location.address}
          onChange={handleInputChange}
          placeholder="123 Main St, City, State ZIP"
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 transition-all duration-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-indigo-400"
        />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            <Navigation className="mr-2 inline-block h-5 w-5 text-indigo-500" />
            Latitude (optional)
          </label>
          <input
            type="number"
            name="location.coordinates.latitude"
            value={formData.location.coordinates.latitude}
            onChange={handleInputChange}
            placeholder="40.7128"
            step="any"
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 transition-all duration-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            <Compass className="mr-2 inline-block h-5 w-5 text-indigo-500" />
            Longitude (optional)
          </label>
          <input
            type="number"
            name="location.coordinates.longitude"
            value={formData.location.coordinates.longitude}
            onChange={handleInputChange}
            placeholder="-74.0060"
            step="any"
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 transition-all duration-300 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-indigo-400"
          />
        </div>
      </motion.div>
    </>
  );
}
