import { MapPin, Globe, Calendar, Link2 } from "lucide-react";

// Deep Fix 1: Hardened FormField with strict htmlFor and ARIA alert roles
const FormField = ({ htmlFor, label, icon: Icon, error, children, required, hint }) => {
  const errorId = `${htmlFor}-error`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {Icon && <Icon className="mr-2 inline-block h-5 w-5 text-indigo-500" aria-hidden="true" />}
        {label}
        {required && (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (Required)</span>}
      </label>
      {children}
      {hint && (
        <p id={`${htmlFor}-hint`} className="text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-center gap-1 text-sm text-red-500" role="alert">
          <span role="img" aria-hidden="true">
            ⚠️
          </span>
          {error}
        </p>
      )}
    </div>
  );
};

const EventLocationSection = ({
  formData,
  handleInputChange,
  handleNestedChange,
  handleFieldBlur,
  errors,
}) => {
  // Today's date in YYYY-MM-DD — used as the `min` attribute on date pickers
  // so the browser's native date-picker UI also blocks past dates.
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-8">
      {/* Type Switcher */}
      <div
        className="flex max-w-sm rounded-xl bg-gray-100 p-1 dark:bg-gray-800"
        role="group"
        aria-label="Event Type Selection"
      >
        <button
          type="button"
          // Deep Fix 3: Added aria-pressed for screen reader state context
          aria-pressed={!formData.isVirtual}
          onClick={() =>
            handleInputChange({
              target: { name: "isVirtual", value: false, type: "checkbox", checked: false },
            })
          }
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            !formData.isVirtual
              ? "bg-white text-indigo-600 shadow-sm dark:bg-gray-700"
              : "text-gray-500"
          }`}
        >
          <MapPin className="h-4 w-4" aria-hidden="true" /> In-Person
        </button>
        <button
          type="button"
          aria-pressed={formData.isVirtual}
          onClick={() =>
            handleInputChange({
              target: { name: "isVirtual", value: true, type: "checkbox", checked: true },
            })
          }
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            formData.isVirtual
              ? "bg-white text-indigo-600 shadow-sm dark:bg-gray-700"
              : "text-gray-500"
          }`}
        >
          <Globe className="h-4 w-4" aria-hidden="true" /> Virtual
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {formData.isVirtual ? (
          <FormField
            htmlFor="virtual-link-input"
            label="Meeting Link"
            icon={Link2}
            error={errors.virtualLink}
            required
          >
            <input
              id="virtual-link-input"
              name="virtualLink"
              value={formData.virtualLink}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              aria-invalid={!!errors.virtualLink}
              aria-describedby={errors.virtualLink ? "virtual-link-input-error" : undefined}
              placeholder="https://zoom.us/j/..."
              className={`w-full rounded-lg border bg-white p-3 transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 ${
                errors.virtualLink ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
          </FormField>
        ) : (
          <>
            <FormField
              htmlFor="venue-name-input"
              label="Venue Name"
              icon={MapPin}
              error={errors.location}
              required
            >
              <input
                type="text"
                id="venue-name-input"
                name="location"
                value={formData.location?.name || ""}
                onChange={(e) => handleNestedChange("location", "name", e.target.value)}
                onBlur={handleFieldBlur}
                aria-invalid={!!errors.location}
                aria-describedby={errors.location ? "venue-name-input-error" : undefined}
                placeholder="e.g., Grand Ballroom, Hotel Plaza"
                className={`w-full rounded-lg border bg-white p-3 transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 ${
                  errors.location ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              />
            </FormField>
            <FormField htmlFor="city-input" label="City" icon={MapPin}>
              <input
                type="text"
                id="city-input"
                value={formData.location?.city || ""}
                onChange={(e) => handleNestedChange("location", "city", e.target.value)}
                placeholder="e.g., Mumbai"
                className="w-full rounded-lg border border-gray-300 bg-white p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700"
              />
            </FormField>
          </>
        )}
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
            className={`w-full rounded-lg border bg-white p-3 transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 ${
              errors.date ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            }`}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            htmlFor="start-time-input"
            label="Start Time"
            error={errors.startTime}
            required
          >
            <input
              type="time"
              id="start-time-input"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              aria-invalid={!!errors.startTime}
              aria-describedby={errors.startTime ? "start-time-input-error" : undefined}
              className={`w-full rounded-lg border bg-white p-3 transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 ${
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
              className={`w-full rounded-lg border bg-white p-3 transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:bg-gray-700 ${
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
