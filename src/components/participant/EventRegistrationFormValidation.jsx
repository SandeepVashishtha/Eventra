import React, { useState } from 'react';

export const EventRegistrationFormValidation = ({ onSubmitRegistration }) => {
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    teamName: '',
  });
  
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = 'Email is required.';
      else if (!emailRegex.test(value)) error = 'Invalid email format.';
    } else if (name === 'phoneNumber') {
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!value) error = 'Phone number is required.';
      else if (!phoneRegex.test(value)) error = 'Invalid phone number format.';
    } else if (name === 'teamName') {
      if (!value.trim()) error = 'Team name is required for team registration.';
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(selectedFile.type)) {
        setErrors((prev) => ({ ...prev, file: 'Invalid file type. Only PDF, JPEG, and PNG are allowed.' }));
      } else if (selectedFile.size > maxSize) {
        setErrors((prev) => ({ ...prev, file: 'File size exceeds the 5MB limit.' }));
      } else {
        setErrors((prev) => ({ ...prev, file: '' }));
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0 || errors.file) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    setSubmitted(true);
    if (onSubmitRegistration) {
      onSubmitRegistration({ ...formData, file });
    }
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          Event Registration
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please fill out the details accurately with inline validation checks.
        </p>
      </div>

      {submitted && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500 text-emerald-700 dark:text-emerald-300 rounded-lg">
          Registration submitted successfully! All validations passed.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="name@example.com"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          {touched.email && errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Phone Number *
          </label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="+1234567890"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          {touched.phoneNumber && errors.phoneNumber && (
            <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Team Name *
          </label>
          <input
            type="text"
            name="teamName"
            value={formData.teamName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter team name"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          {touched.teamName && errors.teamName && (
            <p className="text-xs text-red-500 mt-1">{errors.teamName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Verification Document / Submission (PDF, PNG, JPG up to 5MB)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {errors.file && (
            <p className="text-xs text-red-500 mt-1">{errors.file}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          Submit Registration
        </button>
      </form>
    </div>
  );
};

export default EventRegistrationFormValidation;
