import React from "react";
import { motion } from "framer-motion";
import { MapPin, Globe, Navigation, Compass } from "lucide-react";

export default function LocationFields({ formData, handleInputChange, errors, prefersReducedMotion }) {
  const dur = prefersReducedMotion ? 0 : 0.5;
  const delay = prefersReducedMotion ? 0 : 0.1;

  if (formData.isVirtual) {
    return (
      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <label htmlFor="virtual-link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Virtual Event Link <span className="text-red-600">*</span>
        </label>
        <input
          type="url"
          id="virtual-link"
          name="virtualLink"
          value={formData.virtualLink}
          onChange={handleInputChange}
          aria-invalid={!!errors.virtualLink}
          aria-describedby={errors.virtualLink ? "v-link-err" : undefined}
          placeholder="https://zoom.us/j/..."
          className={`w-full border ${errors.virtualLink ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg p-3 bg-white dark:bg-gray-700 focus:ring-1 focus:ring-indigo-500`}
        />
        {errors.virtualLink && <span id="v-link-err" className="text-red-500 text-sm mt-1">{errors.virtualLink}</span>}
      </motion.div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <label htmlFor="loc-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <MapPin className="w-5 h-5 text-indigo-500 inline-block mr-2" aria-hidden="true" />
          Location Name <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="loc-name"
          name="location.name"
          value={formData.location.name}
          onChange={handleInputChange}
          aria-invalid={!!errors.location}
          placeholder="Convention Center, Community Hall, etc."
          className={`w-full border ${errors.location ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg p-3 bg-white dark:bg-gray-700`}
        />
        {errors.location && <span className="text-red-500 text-sm mt-1">{errors.location}</span>}
      </motion.div>

      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: dur, delay }}>
        <label htmlFor="addr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Map className="w-5 h-5 text-indigo-500 inline-block mr-2" aria-hidden="true" />
          Address
        </label>
        <input
          type="text"
          id="addr"
          name="location.address"
          value={formData.location.address}
          onChange={handleInputChange}
          placeholder="123 Main St, City, State ZIP"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700"
        />
      </motion.div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
        <div>
          <label htmlFor="lat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Navigation className="w-5 h-5 text-indigo-500 inline-block mr-2" aria-hidden="true" />
            Latitude (optional)
          </label>
          <input
            type="text"
            id="lat"
            name="location.coordinates.latitude"
            value={formData.location.coordinates.latitude}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.-]/g, '');
              handleInputChange({ target: { name: e.target.name, value: val } });
            }}
            placeholder="40.7128"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700"
          />
        </div>
        <div>
          <label htmlFor="long" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Compass className="w-5 h-5 text-indigo-500 inline-block mr-2" aria-hidden="true" />
            Longitude (optional)
          </label>
          <input
            type="text"
            id="long"
            name="location.coordinates.longitude"
            value={formData.location.coordinates.longitude}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.-]/g, '');
              handleInputChange({ target: { name: e.target.name, value: val } });
            }}
            placeholder="-74.0060"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700"
          />
        </div>
      </motion.div>
    </>
  );
}