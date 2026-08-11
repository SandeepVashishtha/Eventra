import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ShieldCheck, ShieldAlert, Search, CheckCircle2, Award } from "lucide-react";
import { verifyCertificateHash } from "../../utils/certificateGenerator";

export default function VerifyCertificatePage() {
  const [searchParams] = useSearchParams();
  const initialHash = searchParams.get("hash") || "";

  const [inputHash, setInputHash] = useState(initialHash);
  const [attendeeName, setAttendeeName] = useState("Alex Rivera");
  const [eventId, setEventId] = useState("evt-2026-global");
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (initialHash) {
      handleVerify(initialHash);
    }
  }, [initialHash]);

  const handleVerify = async (hashToTest) => {
    setIsVerifying(true);
    try {
      const isValid = await verifyCertificateHash(attendeeName, eventId, hashToTest || inputHash);
      setVerificationResult({
        isValid,
        hash: hashToTest || inputHash,
        attendeeName,
        eventName: "Global Open Source Summit 2026",
        issuedAt: "2026-08-11",
      });
    } catch {
      setVerificationResult({ isValid: false });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-xl p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 inline-block">
            <Award className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">Eventra Certificate Portal</h1>
          <p className="text-xs text-slate-400">
            Verify SHA-256 Cryptographic Signatures for Eventra Completion Certificates
          </p>
        </div>

        {/* Verification Form */}
        <div className="flex gap-2 text-xs">
          <input
            type="text"
            placeholder="Paste Certificate SHA-256 Hash or scan QR..."
            value={inputHash}
            onChange={(e) => setInputHash(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleVerify(inputHash)}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold flex items-center gap-1.5 transition-all"
          >
            <Search className="w-4 h-4" /> Verify
          </button>
        </div>

        {/* Verification Result Display */}
        {verificationResult && (
          <div
            className={`p-6 rounded-2xl border space-y-3 text-xs ${
              verificationResult.isValid
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-200"
                : "bg-rose-950/40 border-rose-800 text-rose-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {verificationResult.isValid ? (
                <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
              )}
              <div>
                <h3 className="font-bold text-sm">
                  {verificationResult.isValid ? "Certificate Authenticity Verified" : "Invalid Certificate Hash"}
                </h3>
                <p className="text-[11px] opacity-80">
                  {verificationResult.isValid
                    ? "Mathematical signature matches server issuance logs."
                    : "The hash provided does not match any valid certificate."}
                </p>
              </div>
            </div>

            {verificationResult.isValid && (
              <div className="pt-3 border-t border-emerald-800/60 font-mono space-y-1 text-[11px]">
                <div>Recipient: <span className="font-sans font-bold">{verificationResult.attendeeName}</span></div>
                <div>Event: <span className="font-sans font-bold">{verificationResult.eventName}</span></div>
                <div>Issued: <span>{verificationResult.issuedAt}</span></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
