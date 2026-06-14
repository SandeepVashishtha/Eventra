
import { MapPin, Globe, Calendar, Link2 } from "lucide-react";

// Deep Fix 1: Hardened FormField with strict htmlFor and ARIA alert roles
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
        <p id={errorId} className="text-red-500 text-sm flex items-center gap-1" role="alert">
          <span role="img" aria-hidden="true">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
};

const EventLocationSection = ({ formData, handleInputChange, handleNestedChange, handleFieldBlur, errors }) => {
  // Today's date in YYYY-MM-DD — used as the `min` attribute on date pickers
  // so the browser's native date-picker UI also blocks past dates.
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      {/* Type Switcher */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl max-w-sm" role="group" aria-label="Event Type Selection">
        <button
          type="button"
          // Deep Fix 3: Added aria-pressed for screen reader state context
          aria-pressed={!formData.isVirtual}
          onClick={() => handleInputChange({ target: { name: "isVirtual", value: false, type: "checkbox", checked: false } })}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            !formData.isVirtual ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600" : "text-gray-500"
          }`}
        >
          <MapPin className="w-4 h-4" aria-hidden="true" /> In-Person
        </button>
        <button
          type="button"
          aria-pressed={formData.isVirtual}
          onClick={() => handleInputChange({ target: { name: "isVirtual", value: true, type: "checkbox", checked: true } })}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            formData.isVirtual ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600" : "text-gray-500"
          }`}
        >
          <Globe className="w-4 h-4" aria-hidden="true" /> Virtual
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formData.isVirtual ? (
          <FormField htmlFor="virtual-link-input" label="Meeting Link" icon={Link2} error={errors.virtualLink} required>
            <input
              id="virtual-link-input"
              name="virtualLink"
              value={formData.virtualLink}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              aria-invalid={!!errors.virtualLink}
              aria-describedby={errors.virtualLink ? "virtual-link-input-error" : undefined}
              placeholder="https://zoom.us/j/..."
              className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                errors.virtualLink ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
          </FormField>
        ) : (
          <>
            <FormField htmlFor="venue-name-input" label="Venue Name" icon={MapPin} error={errors.location} required>
              <input
                type="text"
                id="venue-name-input"
                name="location"
                value={formData.location.name}
                onChange={(e) => handleNestedChange("location", "name", e.target.value)}
                onBlur={handleFieldBlur}
                aria-invalid={!!errors.location}
                aria-describedby={errors.location ? "venue-name-input-error" : undefined}
                placeholder="e.g., Grand Ballroom, Hotel Plaza"
                className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  errors.location ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              />
            </FormField>
            <FormField htmlFor="city-input" label="City" icon={MapPin}>
              <input
                type="text"
                id="city-input"
                value={formData.location.city}
                onChange={(e) => handleNestedChange("location", "city", e.target.value)}
                placeholder="e.g., Mumbai"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </FormField>
          </>
        )}
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField htmlFor="date-input" label="Date" icon={Calendar} error={errors.date} required>
          <input
            type="date"
            id="date-input"
            name="date"
            value={formData.date}
            min={todayStr}
            onChange={handleInputChange}
            onBlur={handleFieldBlur}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? "date-input-error" : undefined}
            className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
              errors.date ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            }`}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField htmlFor="start-time-input" label="Start Time" error={errors.startTime} required>
            <input
              type="time"
              id="start-time-input"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              aria-invalid={!!errors.startTime}
              aria-describedby={errors.startTime ? "start-time-input-error" : undefined}
              className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                errors.startTime ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
          </FormField>
          <FormField htmlFor="end-time-input" label="End Time" error={errors.endTime} required>
            <input
              type="time"
              id="end-time-input"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              aria-invalid={!!errors.endTime}
              aria-describedby={errors.endTime ? "end-time-input-error" : undefined}
              className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                errors.endTime ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
};

export default EventLocationSection;