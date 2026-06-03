import React from "react";
import { Routes, Route } from "react-router-dom";
import { getPublicRoutes } from "./PublicRoutes";
import { getProtectedRoutes } from "./ProtectedRoutes";
import { Layout, LayoutGrid, Eye, Search } from "lucide-react";

/**
 * RouteVisualMapper
 * 
 * A technical utility to map all application routes for visual regression testing.
 * This ensures that automated screenshot tools (like Playwright) can discover
 * and audit every possible view.
 */
const RouteVisualMapper = () => {
  const allRoutes = [...getPublicRoutes(), ...getProtectedRoutes()];

  return (
    <div className="p-12 space-y-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="space-y-4">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <LayoutGrid className="text-indigo-600" size={36} />
          Visual Route Inventory
        </h1>
        <p className="text-xl text-gray-500 max-w-3xl">
          Automated registry for UI consistent checks and visual regression snapshots.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allRoutes.map((route, i) => (
          <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Eye size={20} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Route #{i + 1}</span>
            </div>
            
            <h3 className="font-bold text-lg dark:text-white truncate mb-2">
              {route.props.path || "/"}
            </h3>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Search size={14} />
              <span>Snapshot priority: High</span>
            </div>

            <button className="w-full py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-gray-600 dark:text-gray-300 font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
              Run Visual Audit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteVisualMapper;
