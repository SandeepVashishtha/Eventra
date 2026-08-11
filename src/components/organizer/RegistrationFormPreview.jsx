import React, { useState } from 'react';

export const RegistrationFormPreview = ({ eventTitle = 'Event Registration', fields = [] }) => {
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  // Sort fields by displayOrder
  const sortedFields = [...fields].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 flex justify-between items-center">
        <div>
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-full uppercase tracking-wider">
            Organizer Preview Mode
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-2">{eventTitle}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">This is exactly how participants will view and fill out the form.</p>
        </div>
      </div>

      {submitted && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-sm font-medium text-center">
          Preview Test Submitted Successfully! Validation rules passed.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {sortedFields.length === 0 ? (
          <p className="text-center py-8 text-gray-400 italic">No custom fields added to this form yet.</p>
        ) : (
          sortedFields.map((field) => (
            <div key={field.fieldName} className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.fieldType === 'DROPDOWN' ? (
                <select
                  required={field.required}
                  value={formData[field.fieldName] || ''}
                  onChange={(e) => handleChange(field.fieldName, e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="">Select an option...</option>
                  {field.options?.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.fieldType === 'CHECKBOX' ? (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required={field.required}
                    checked={!!formData[field.fieldName]}
                    onChange={(e) => handleChange(field.fieldName, e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
                </label>
              ) : (
                <input
                  type={field.fieldType === 'NUMBER' ? 'number' : 'text'}
                  required={field.required}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  value={formData[field.fieldName] || ''}
                  onChange={(e) => handleChange(field.fieldName, e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              )}
            </div>
          ))
        )}

        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Test Submit Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationFormPreview;
