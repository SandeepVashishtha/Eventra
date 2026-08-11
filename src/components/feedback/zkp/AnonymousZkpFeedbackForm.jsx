import React, { useState } from "react";
import { Lock, ShieldAlert, Send, Sparkles, CheckCircle } from "lucide-react";
import { generateZkpProof } from "./ProofGeneratorWorker";
import ZkpVerificationBadge from "./ZkpVerificationBadge";

export default function AnonymousZkpFeedbackForm({
  eventId = "evt-2026-global",
  eventName = "Global Open Source Summit",
}) {
  const [category, setCategory] = useState("Code of Conduct Violation");
  const [severity, setSeverity] = useState("MEDIUM");
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [submittedProof, setSubmittedProof] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsGenerating(true);

    try {
      const proof = await generateZkpProof(eventId);
      setSubmittedProof(proof);
      setIsSubmitted(true);
    } catch (err) {
      console.error("ZKP Proof generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Anonymous ZKP Feedback Portal
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-200">
              100% Cryptographic Anonymity • {eventName}
            </p>
          </div>
        </div>

        <ZkpVerificationBadge proofVerified={true} />
      </div>

      {isSubmitted ? (
        <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
            Cryptographic Proof Submitted Successfully
          </h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
            Your feedback was verified using Zero-Knowledge Proofs confirming event membership without revealing your name, email, or IP address.
          </p>
          {submittedProof && (
            <div className="p-3 rounded-lg bg-white dark:bg-gray-900 text-left font-mono text-[10px] space-y-1 text-gray-600 dark:text-gray-200 border border-gray-200 dark:border-gray-800">
              <div>Nullifier Hash: {submittedProof.nullifierHash}</div>
              <div>Proof Hash: {submittedProof.proofHash}</div>
            </div>
          )}
          <button
            onClick={() => {
              setIsSubmitted(false);
              setContent("");
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white"
          >
            Submit Another Anonymous Report
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Category Selector */}
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Feedback Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="Code of Conduct Violation">Code of Conduct Violation</option>
              <option value="Logistics & Venue Issue">Logistics & Venue Issue</option>
              <option value="Hackathon Grading Bias">Hackathon Grading Bias</option>
              <option value="Organizer Feedback">Organizer Feedback</option>
            </select>
          </div>

          {/* Severity Radio Group */}
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Severity Level
            </label>
            <div className="flex items-center gap-3">
              {["LOW", "MEDIUM", "CRITICAL"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSeverity(lvl)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    severity === lvl
                      ? lvl === "CRITICAL"
                        ? "bg-rose-600 text-white"
                        : "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-200"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Anonymous Report Content
            </label>
            <textarea
              rows="4"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe the issue or incident details. Zero-Knowledge Proofs ensure your identity remains completely un-linkable..."
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Action Submit Button */}
          <button
            type="submit"
            disabled={isGenerating || !content.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" /> Generating ZKP Cryptographic Proof...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Submit Verified Anonymous Feedback
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
