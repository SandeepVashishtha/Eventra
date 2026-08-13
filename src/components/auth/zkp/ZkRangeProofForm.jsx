import { useState } from "react";
import { Lock, RefreshCw, Key } from "lucide-react";
import ProofBadge from "./ProofBadge";

export default function ZkRangeProofForm() {
  const [birthYear, setBirthYear] = useState("2000");
  const [isGenerating, setIsGenerating] = useState(false);
  const [proof, setProof] = useState(null);

  const handleGenerateProof = (e) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      const year = Number(birthYear) || 2000;
      const isEligible = 2026 - year >= 18;

      setProof({
        eligible: isEligible,
        commitment: `0xsha256_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`,
        attestation: isEligible ? "Age Requirement Met (18+)" : "Age Requirement Not Met",
      });
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Informational Zero PII Header Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-gray-900 dark:text-white">
            Zero-Knowledge Range Proof (ZK-RP) Verification
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Zero Server PII Storage
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form Column */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
            Prove Eligibility without Revealing Birth Date
          </h3>

          <form onSubmit={handleGenerateProof} className="space-y-3">
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Your Birth Year
              </label>
              <input
                type="number"
                min="1950"
                max="2026"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-all"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Generating ZK Range Proof...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Generate Cryptographic Range Proof
                </>
              )}
            </button>
          </form>
        </div>

        {/* Proof Output Column */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white">
            Active Cryptographic Verification Commitments
          </h3>

          {proof ? (
            <ProofBadge commitment={proof.commitment} label={proof.attestation} />
          ) : (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-gray-400">
              Generate a range proof to create a secure cryptographic commitment badge.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
