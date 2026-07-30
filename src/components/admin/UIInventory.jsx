
import Tooltip from "../common/Tooltip";
import { Info, Package, MessageCircle } from "lucide-react";

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
          UI Component Inventory
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
          Standardized foundation components for Eventra developers. Ensuring consistency and accessibility across the platform.
        </p>
      </div>

      {/* Tooltips Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
          <MessageCircle className="text-indigo-500" size={24} />
          <h2 className="text-2xl font-bold dark:text-white">Tooltips</h2>
        </div>
        <div className="flex flex-wrap gap-12 items-center">
          <Tooltip content="Tooltip at the top!" position="top">
            <button className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold shadow-sm">Top Hover</button>
          </Tooltip>
          <Tooltip content="Tooltip at the bottom!" position="bottom">
            <button className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold shadow-sm">Bottom Hover</button>
          </Tooltip>
          <Tooltip content="Informational context here" position="right">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full cursor-help">
              <Info size={20} />
            </div>
          </Tooltip>
        </div>
      </section>
    </div>
  );
};

export default UIInventory;
