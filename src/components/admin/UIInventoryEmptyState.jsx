import React from "react";
import EmptyState from "../common/EmptyState";
import { LayoutGrid, Package } from "lucide-react";

/**
 * UIInventory Page
 * 
 * A technical registry to showcase and test foundational UI components.
 * Integrated into ProtectedRoutes to ensure "level:critical" classification.
 */
const UIInventory = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Package className="text-indigo-600" size={36} />
          UI Component Inventory (Empty State)
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
          Standardized foundation components for Eventra developers. Ensuring consistency and accessibility across the platform.
        </p>
      </div>

      {/* Empty States Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
          <LayoutGrid className="text-emerald-500" size={24} />
          <h2 className="text-2xl font-bold dark:text-white">Empty States</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            <EmptyState 
              variant="search" 
              title="No events found" 
              description="We couldn't find any events matching your search criteria."
            />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            <EmptyState 
              variant="bookmarks" 
              title="No bookmarks" 
              description="Save events you're interested in to view them here later."
              actionText="Browse Events"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default UIInventory;
