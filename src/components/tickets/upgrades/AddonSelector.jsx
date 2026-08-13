import React, { useState } from "react";
import { Plus, Coffee } from "lucide-react";

export default function AddonSelector({ initialAddons = [
  { name: "Catering Meal Voucher", price: 15, key: "MEAL_VOUCHER" },
  { name: "Sponsor Swag Pack", price: 10, key: "SWAG_PACK" }
] }) {
  const [selectedAddons, setSelectedAddons] = useState([]);

  const toggleAddon = (addonKey) => {
    setSelectedAddons((prev) =>
      prev.includes(addonKey) ? prev.filter((k) => k !== addonKey) : [...prev, addonKey]
    );
  };

  return (
    <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 space-y-3">
      <h4 className="font-bold text-gray-500">Event Add-on Packages</h4>
      <div className="space-y-2">
        {initialAddons.map((addon) => {
          const isSelected = selectedAddons.includes(addon.key);
          return (
            <div key={addon.key} className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-800 text-gray-900 dark:text-white">
              <span className="font-semibold flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-indigo-400" /> {addon.name}
              </span>
              <button
                onClick={() => toggleAddon(addon.key)}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-semibold border ${
                  isSelected
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <Plus className="w-3 h-3" /> {isSelected ? "Added" : `$${addon.price}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
