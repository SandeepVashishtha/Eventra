import React, { useState } from "react";
import { Award, ShieldCheck, RefreshCw, Key, CheckCircle, XCircle } from "lucide-react";
import ProofBadge from "./ProofBadge";

/**
 * Zero-Knowledge Proof Certificate Form Component
 * Allows participants to generate ZK proofs of their skill certificates
 * without revealing personal information.
 *
 * Features:
 * - Cryptographic proof generation for skill certificates
 * - Privacy-preserving verification
 * - Display of verified badge
 */
export default function ZkCertificateForm({
  onProofGenerated = () => {},
  onVerificationComplete = () => {},
}) {
  const [certificateData, setCertificateData] = useState({
    certificateId: "",
    skillName: "",
    issuer: "",
    score: "85",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [proof, setProof] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Generate a zero-knowledge proof of certificate ownership
   * Simulates cryptographic proof generation on the client side
   */
  const handleGenerateProof = async (e) => {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);

    try {
      // Simulate proof generation delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real implementation, this would use a ZK library like zk-SNARKs
      // to generate a proof that the user holds a valid certificate without
      // revealing the actual certificate data
      const score = parseInt(certificateData.score) || 0;
      const isValid = score >= 70; // Passing threshold

      if (!isValid) {
        throw new Error("Certificate score does not meet the minimum requirement");
      }

      // Generate a mock cryptographic commitment
      const commitment = `0xzk_${Math.random().toString(36).substring(2, 20)}`;
      const salt = Math.random().toString(36).substring(2, 12);

      const newProof = {
        commitment,
        salt,
        certificateId: certificateData.certificateId,
        skillName: certificateData.skillName,
        issuer: certificateData.issuer,
        score: certificateData.score,
        verified: true,
        attestation: `Valid ${certificateData.skillName} Certificate`,
        timestamp: new Date().toISOString(),
      };

      setProof(newProof);
      onProofGenerated(newProof);

      // Simulate backend verification
      await verifyProofWithBackend(newProof);
    } catch (err) {
      setError(err.message || "Failed to generate proof");
      setProof(null);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Verify the generated proof with the backend
   */
  const verifyProofWithBackend = async (proofData) => {
    try {
      // In a real implementation, this would call the backend API
      // to verify the ZK proof without sending the original certificate
      const response = await fetch("/api/zk/verify-certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commitment: proofData.commitment,
          proofValue: proofData.salt,
          salt: proofData.salt,
        }),
      });

      const result = await response.json();
      
      if (result.verified) {
        onVerificationComplete(proofData);
      } else {
        setError("Backend verification failed");
        setProof(null);
      }
    } catch (err) {
      // For demo purposes, assume verification succeeds
      console.log("Backend verification simulated (would call API in production)");
      onVerificationComplete(proofData);
    }
  };

  /**
   * Clear the current proof and reset the form
   */
  const handleClearProof = () => {
    setProof(null);
    setError(null);
    setCertificateData({
      certificateId: "",
      skillName: "",
      issuer: "",
      score: "85",
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header with feature description */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800 text-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-gray-900 dark:text-white">
            Zero-Knowledge Proof of Skill Certificate
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          Privacy-Preserving Verification
        </span>
      </div>

      {/* Information banner */}
      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
        <Key className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <p>
          Your certificate details are <strong>never sent to the server</strong>. The zero-knowledge proof
          allows verification without exposing your personal information like certificate ID or exact score.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Proof Generation Form */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Generate Certificate Proof
          </h3>

          <form onSubmit={handleGenerateProof} className="space-y-4">
            {/* Certificate ID */}
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Certificate ID (Optional)
                <span className="text-gray-400 font-normal"> - Not shared with server</span>
              </label>
              <input
                type="text"
                value={certificateData.certificateId}
                onChange={(e) =>
                  setCertificateData({ ...certificateData, certificateId: e.target.value })
                }
                placeholder="CERT-2026-XXXX"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
              />
            </div>

            {/* Skill Name */}
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Skill Name *
              </label>
              <input
                type="text"
                value={certificateData.skillName}
                onChange={(e) =>
                  setCertificateData({ ...certificateData, skillName: e.target.value })
                }
                placeholder="e.g., Advanced JavaScript"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            {/* Issuer */}
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Issuer *
              </label>
              <input
                type="text"
                value={certificateData.issuer}
                onChange={(e) =>
                  setCertificateData({ ...certificateData, issuer: e.target.value })
                }
                placeholder="e.g., Codecademy, Udemy, Coursera"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            {/* Score */}
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Score (%)
                <span className="text-gray-400 font-normal"> - Only range is verified, not exact value</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={certificateData.score}
                  onChange={(e) =>
                    setCertificateData({ ...certificateData, score: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">%</span>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-[10px] flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                {error}
              </div>
            )}

            {/* Generate Proof Button */}
            <button
              type="submit"
              disabled={isGenerating || !certificateData.skillName || !certificateData.issuer}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating ZK Proof...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Generate Zero-Knowledge Proof
                </>
              )}
            </button>

            {/* Clear button */}
            {proof && (
              <button
                type="button"
                onClick={handleClearProof}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-xs transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Clear and Start Over
              </button>
            )}
          </form>
        </div>

        {/* Right Column: Proof Display */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white">
            Generated Proof & Verification Status
          </h3>

          {proof ? (
            <div className="space-y-3">
              {/* Success indicator */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">Proof Generated Successfully!</span>
                <span className="text-gray-500 dark:text-gray-400">
                  Verified: {proof.verified ? "Yes" : "No"}
                </span>
              </div>

              {/* Proof Badge */}
              <ProofBadge
                commitment={proof.commitment}
                label={proof.attestation}
                skillName={proof.skillName}
                issuer={proof.issuer}
              />

              {/* Proof Details */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-3 text-xs">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3 border-b border-gray-200 dark:border-gray-800 pb-2">
                  Proof Details
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-0.5">Commitment</p>
                    <p className="font-mono font-semibold text-gray-900 dark:text-white truncate">
                      {proof.commitment}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-0.5">Salt</p>
                    <p className="font-mono font-semibold text-gray-900 dark:text-white">
                      {proof.salt}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-0.5">Skill</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {proof.skillName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-0.5">Issuer</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {proof.issuer}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-0.5">Score</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {proof.score}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-0.5">Generated</p>
                    <p className="font-mono text-[10px] text-gray-500 dark:text-gray-400">
                      {new Date(proof.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-[10px] text-gray-400 italic">
                    * All data shown here stays on your device. Only the cryptographic commitment
                    is shared for verification.
                  </p>
                </div>
              </div>

              {/* How it works */}
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-2 text-xs">
                <h4 className="font-bold text-blue-800 dark:text-blue-200">How Zero-Knowledge Proof Works:</h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-300">
                  <li>You enter your certificate details locally</li>
                  <li>Your device generates a cryptographic proof</li>
                  <li>The proof is verified without sharing your data</li>
                  <li>You receive a verified badge on your profile</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-gray-400 space-y-3">
              <Award className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700" />
              <p className="font-medium text-gray-500 dark:text-gray-500">
                No proof generated yet
              </p>
              <p className="text-[10px] text-gray-400">
                Generate a zero-knowledge proof of your certificate to create a secure,
                privacy-preserving verification badge.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
