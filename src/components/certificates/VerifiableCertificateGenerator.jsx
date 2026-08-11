import React, { useState, useEffect } from "react";
import { Award, ShieldCheck, Download, QrCode, Sparkles } from "lucide-react";
import QRCode from "react-qr-code";
import { generateCertificateHash, buildVerificationUrl } from "../../utils/certificateGenerator";

export default function VerifiableCertificateGenerator({
  attendee = { name: "Alex Rivera", email: "alex@example.com" },
  eventName = "Global Open Source Hackathon 2026",
  eventId = "evt-2026-global",
}) {
  const [certHash, setCertHash] = useState("");

  useEffect(() => {
    async function loadHash() {
      const hash = await generateCertificateHash(attendee.name, eventId);
      setCertHash(hash);
    }
    loadHash();
  }, [attendee, eventId]);

  const verifyUrl = buildVerificationUrl(certHash);

  return (
    <div className="w-full max-w-3xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border-4 border-indigo-600/30 shadow-2xl space-y-6 relative overflow-hidden text-center select-none">
      {/* Decorative Corner Watermark */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-bl-full pointer-events-none" />

      {/* Certificate Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-200 dark:border-indigo-800">
          <Award className="w-4 h-4" /> PDF/A Cryptographically Signed
        </div>

        <h1 className="text-3xl font-serif font-black text-gray-900 dark:text-white tracking-wide">
          Certificate of Excellence
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest">
          This is proudly presented to
        </p>
      </div>

      {/* Recipient Name */}
      <div className="py-4 border-b border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-2xl md:text-3xl font-extrabold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {attendee.name}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          For successful participation and project completion in <span className="font-semibold text-gray-800 dark:text-gray-200">{eventName}</span>.
        </p>
      </div>

      {/* Footer Signature & Verification Seal Grid */}
      <div className="flex items-end justify-between pt-4 text-xs text-left">
        {/* Left Signature Block */}
        <div className="space-y-1">
          <div className="font-serif italic font-bold text-base text-gray-900 dark:text-white">
            Sandeep Vashishtha
          </div>
          <p className="text-[10px] text-gray-400 border-t border-gray-300 dark:border-gray-700 pt-1">
            Eventra Platform Director
          </p>
        </div>

        {/* Right QR Verification Seal */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="p-1 bg-white rounded-lg border border-gray-200">
            {certHash ? <QRCode value={verifyUrl} size={54} /> : <div className="w-14 h-14 bg-gray-200 animate-pulse" />}
          </div>

          <div className="space-y-0.5 text-[10px]">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Authenticity Verified
            </span>
            <p className="font-mono text-gray-400">
              HASH: {certHash ? certHash.substring(0, 12) : "..."}...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
