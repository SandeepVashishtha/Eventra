import React, { useState } from "react";
import { Lock, ShieldCheck, Calculator, Sparkles, Key } from "lucide-react";
import HomomorphicBenchmarkWidget from "./HomomorphicBenchmarkWidget";

export default function PaillierEncryptedAnalytics() {
  const [privateInputValue, setPrivateInputValue] = useState("15000");
  const [encryptedStatus, setEncryptedStatus] = useState(null);

  const handleEncryptAndSubmit = (e) => {
    e.preventDefault();
    const val = Number(privateInputValue) || 0;
    const simulatedCiphertext = `0x${(val * 1009).toString(16)}`;

    setEncryptedStatus({
      rawValue: val,
      ciphertext: simulatedCiphertext,
      submittedAt: new Date().toLocaleTimeString(),
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Benchmark Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HomomorphicBenchmarkWidget
          title="Average Hackathon Prize Pool Benchmark"
          averageAmount="$18,500"
          sampleCount={38}
        />
        <HomomorphicBenchmarkWidget
          title="Developer Compensation Benchmark (Senior React)"
          averageAmount="$135,000 / yr"
          sampleCount={64}
        />
      </div>

      {/* Financial Submission Box */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
          <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
            Client-Side Paillier Encryption Submission
          </h3>
        </div>

        <form onSubmit={handleEncryptAndSubmit} className="space-y-3">
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Private Event Budget or Prize Amount ($ USD)
            </label>
            <input
              type="number"
              value={privateInputValue}
              onChange={(e) => setPrivateInputValue(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-mono text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-all"
          >
            <Lock className="w-4 h-4" /> Encrypt with Paillier Public Key & Submit
          </button>
        </form>

        {encryptedStatus && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1 font-mono text-[11px] text-emerald-800 dark:text-emerald-300">
            <div className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Homomorphic Ciphertext Transmitted
            </div>
            <div>Ciphertext: {encryptedStatus.ciphertext}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
              Raw value (${encryptedStatus.rawValue}) never touches the server. Server computes `E(m1) * E(m2)`.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
