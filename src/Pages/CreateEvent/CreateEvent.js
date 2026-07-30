import React from "react";
import BulkImageUpload from "../../components/events/BulkImageUpload";

const CreateEvent = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 text-center">
          Create New Event
        </h1>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Event Details</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Fill in the details for your new event below.
          </p>
          {/* Form fields would go here */}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Event Gallery</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Upload images for your event gallery. These will be displayed on the event page.
          </p>
          <BulkImageUpload />
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
