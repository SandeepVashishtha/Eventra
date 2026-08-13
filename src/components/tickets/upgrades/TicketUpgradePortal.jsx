import React, { useState } from "react";
import { Sparkles, ArrowUpCircle, Ticket } from "lucide-react";
import AddonSelector from "./AddonSelector";

export default function TicketUpgradePortal({ initialTier = "GENERAL", basePrice = 50 }) {
  const [tier, setTier] = useState(initialTier);
  const [upgraded, setUpgraded] = useState(false);

  const processUpgrade = () => {
    setTier("VIP");
    setUpgraded(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">Event Pass Upgrade Center</span>
        </div>
        <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
          Current Pass: {tier}
        </span>
      </div>

      <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-gray-950/40 border border-gray-150 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h4 className="font-semibold">Upgrade to VIP Pass</h4>
          <p className="text-[10px] text-gray-400">Access VIP lounge, priority check-in, and exclusive panels.</p>
        </div>
        <button
          onClick={processUpgrade}
          disabled={upgraded}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
        >
          <ArrowUpCircle className="w-3.5 h-3.5" />
          {upgraded ? "Upgraded" : `Upgrade for $${basePrice}`}
        </button>
      </div>

      <AddonSelector />
    </div>
  );
}
