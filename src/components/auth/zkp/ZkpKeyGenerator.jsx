import React, { useState } from "react";
import { Key } from "lucide-react";

export default function ZkpKeyGenerator() {
  const [generatedKey, setGeneratedKey] = useState("");

  const triggerKeyGen = () => {
    // Generate mock seed string for ZKP commitment checks
    const bytes = new Uint8Array(16);
    if (typeof window !== "undefined" && window.crypto) {
      window.crypto.getRandomValues(bytes);
    }
    const seed = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    setGeneratedKey("zkp_" + seed);
  };

  return (
    <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 space-y-3 flex flex-col justify-center text-center">
      <div className="mx-auto p-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
        <Key className="w-5 h-5" />
      </div>
      <h4 className="font-bold text-gray-500">ZKP Key Generator</h4>
      <button
        onClick={triggerKeyGen}
        className="w-full py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-semibold"
      >
        Generate Key Seed
      </button>
      {generatedKey && (
        <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-950/30 text-[9px] font-mono break-all text-indigo-600">
          {generatedKey}
        </div>
      )}
    </div>
  );
}
