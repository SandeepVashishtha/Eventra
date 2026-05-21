import React, { useState } from 'react';
import { toast } from 'react-toastify';

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    designation: '',
    additionalInfo: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registration Data:", formData);
    toast.success("Registration Successful!");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-900 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-800 my-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Register for this Event</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input name="fullName" type="text" placeholder="Enter your full name" className="w-full border p-3 rounded-lg" required onChange={handleChange} />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email Address *</label>
          <input name="email" type="email" placeholder="your.email@example.com" className="w-full border p-3 rounded-lg" required onChange={handleChange} />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number *</label>
          <input name="phone" type="tel" placeholder="+1 (555) 123-4567" className="w-full border p-3 rounded-lg" required onChange={handleChange} />
        </div>

        {/* Organization */}
        <div>
          <label className="block text-sm font-medium mb-1">Organization (Optional)</label>
          <input name="organization" type="text" placeholder="Your company or institution" className="w-full border p-3 rounded-lg" onChange={handleChange} />
        </div>

        {/* Designation */}
        <div>
          <label className="block text-sm font-medium mb-1">Designation (Optional)</label>
          <input name="designation" type="text" placeholder="Your job title or role" className="w-full border p-3 rounded-lg" onChange={handleChange} />
        </div>

        {/* Additional Info */}
        <div>
          <label className="block text-sm font-medium mb-1">Additional Information (Optional)</label>
          <textarea name="additionalInfo" placeholder="Any special requirements or questions?" className="w-full border p-3 rounded-lg h-32" onChange={handleChange} />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button type="button" className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="flex-1 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800">
            Complete Registration
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationPage;