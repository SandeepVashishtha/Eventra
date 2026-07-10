// src/components/common/EventCardSkeleton.jsx
//
// Skeleton loading placeholder for event cards.
// Shown while event data is being fetched from the Spring Boot backend API.
// Matches the dimensions of the real EventCard component to prevent layout shift.

import React from 'react';

/**
 * EventCardSkeleton
 *
 * A shimmer placeholder that mirrors the structure of a real event card.
 * Prevents Cumulative Layout Shift (CLS) by occupying the same space as
 * the actual card before data arrives.
 *
 * Usage:
 *   {isLoading && (
 *     Array(6).fill(0).map((_, i) => <EventCardSkeleton key={i} />)
 *   )}
 */
const EventCardSkeleton = () => {
  return (
    <div 
      className="animate-pulse bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800"
      aria-hidden="true" 
      role="presentation"
    >
      {/* Image placeholder */}
      <div className="h-48 bg-gray-300 dark:bg-gray-700 skeleton-image" />

      {/* Card body */}
      <div className="p-6 space-y-4">
        {/* Event title */}
        <div className="h-6 w-2/3 rounded bg-gray-300 dark:bg-gray-700 skeleton-title" />

        {/* Event date and location */}
        <div className="space-y-2">
          <div className="h-4 rounded bg-gray-200 dark:bg-gray-800 skeleton-subtitle" />
          <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-800 skeleton-text" />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <div className="h-11 flex-1 rounded-2xl bg-gray-300 dark:bg-gray-700 skeleton-btn" />
          <div className="h-11 flex-1 rounded-2xl bg-gray-300 dark:bg-gray-700 skeleton-btn" />
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;