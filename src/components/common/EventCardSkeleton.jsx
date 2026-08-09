import React from "react";

const EventCardSkeleton = () => {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
      <div className="h-48 bg-gray-300 dark:bg-gray-700" />

      <div className="p-6 space-y-4">
        <div className="h-6 w-2/3 rounded bg-gray-300 dark:bg-gray-700" />

        <div className="space-y-2">
          <div className="h-4 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
        </div>

        <div className="flex gap-3 pt-4">
          <div className="h-11 flex-1 rounded-2xl bg-gray-300 dark:bg-gray-700" />
          <div className="h-11 flex-1 rounded-2xl bg-gray-300 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;