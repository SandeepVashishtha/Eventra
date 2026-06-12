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
    <div className="mx-auto min-h-screen max-w-6xl space-y-16 bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="space-y-4">
        <h1 className="flex items-center gap-3 text-4xl font-black text-gray-900 dark:text-white">
          <Package className="text-indigo-600" size={36} />
          UI Component Inventory
        </h1>
        <p className="max-w-2xl text-xl leading-relaxed text-gray-500">
          Standardized foundation components for Eventra developers. Ensuring consistency and
          accessibility across the platform.
        </p>
      </div>

      {/* Tooltips Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-4 dark:border-gray-800">
          <MessageCircle className="text-indigo-500" size={24} />
          <h2 className="text-2xl font-bold dark:text-white">Tooltips</h2>
        </div>
        <div className="flex flex-wrap items-center gap-12">
          <Tooltip content="Tooltip at the top!" position="top">
            <button className="rounded-xl border border-gray-200 bg-white px-6 py-2 font-bold shadow-sm dark:border-gray-700 dark:bg-gray-800">
              Top Hover
            </button>
          </Tooltip>
          <Tooltip content="Tooltip at the bottom!" position="bottom">
            <button className="rounded-xl border border-gray-200 bg-white px-6 py-2 font-bold shadow-sm dark:border-gray-700 dark:bg-gray-800">
              Bottom Hover
            </button>
          </Tooltip>
          <Tooltip content="Informational context here" position="right">
            <div className="cursor-help rounded-full bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20">
              <Info size={20} />
            </div>
          </Tooltip>
        </div>
      </section>
    </div>
  );
};

export default UIInventory;
