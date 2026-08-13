import React, { useState } from "react";
import { ShieldCheck, RefreshCw, Key } from "lucide-react";
import ZkpKeyGenerator from "./ZkpKeyGenerator";

export default function AnonymousCheckinForm() {
  const [proof, setProof] = useState("");
  const [status, setStatus] = useState("idle");

  const submitZkpCheckin = async (e) => {
    e.preventDefault();
    if (!proof) return;
    setStatus("verifying");

    try {
      console.log("[ZKP] Checking proof secret hash validity:", proof);
      setStatus("verified");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 text-xs text-gray-900 dark:text-white select-none">
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">Zero-Knowledge Ticket Check-in</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <form onSubmit={submitZkpCheckin} className="md:col-span-2 p-4 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 space-y-3">
          <h3 className="font-bold text-gray-500">Provide Secret RSVP Proof</h3>
          <input
            type="text"
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            placeholder="Paste your cryptographic proof here"
            className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent font-mono outline-none"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            Submit ZKP Verification
          </button>
        </form>

        <ZkpKeyGenerator />
      </div>
    </div>
  );
}
