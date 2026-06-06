
import { MapPin, Globe, Calendar, Link2 } from "lucide-react";

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
      <p className="text-red-500 text-sm flex items-center gap-1">
        <span role="img" aria-label="error">⚠️</span>
        {error}
      </p>
    )}
  </div>
);

const EventLocationSection = ({ formData, handleInputChange, handleNestedChange, errors }) => {
  return (
    <div className="space-y-8">
      {/* Type Switcher */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl max-w-sm">
        <button
          type="button"
          onClick={() => handleInputChange({ target: { name: "isVirtual", value: false, type: "checkbox", checked: false } })}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            !formData.isVirtual ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600" : "text-gray-500"
          }`}
        >
          <MapPin className="w-4 h-4" /> In-Person
        </button>
        <button
          type="button"
          onClick={() => handleInputChange({ target: { name: "isVirtual", value: true, type: "checkbox", checked: true } })}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            formData.isVirtual ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600" : "text-gray-500"
          }`}
        >
          <Globe className="w-4 h-4" /> Virtual
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formData.isVirtual ? (
          <FormField label="Meeting Link" icon={Link2} error={errors.virtualLink} required>
            <input
              type="url"
              name="virtualLink"
              value={formData.virtualLink}
              onChange={handleInputChange}
              placeholder="https://zoom.us/j/..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700"
            />
          </FormField>
        ) : (
          <>
            <FormField label="Venue Name" icon={MapPin} error={errors.location} required>
              <input
                type="text"
                value={formData.location.name}
                onChange={(e) => handleNestedChange("location", "name", e.target.value)}
                placeholder="e.g., Grand Ballroom, Hotel Plaza"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700"
              />
            </FormField>
            <FormField label="City" icon={MapPin}>
              <input
                type="text"
                value={formData.location.city}
                onChange={(e) => handleNestedChange("location", "city", e.target.value)}
                placeholder="e.g., Mumbai"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700"
              />
            </FormField>
          </>
        )}
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Date" icon={Calendar} error={errors.date} required>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700"
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Start Time" error={errors.startTime} required>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700"
            />
          </FormField>
          <FormField label="End Time" error={errors.endTime} required>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
};

export default EventLocationSection;
