import React from "react";
import { ShieldCheck, Calendar, ShieldAlert } from "lucide-react";
import "./ssl-checker.css";

export default function SSLChecker() {
  const certDetails = {
    valid: true,
    issuer: "Let's Encrypt Authority X3",
    expiryDays: 45,
    keySize: 2048,
    protocol: "TLSv1.3"
  };

  return (
    <div className="ssl-checker-panel p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-lg max-w-sm mx-auto my-8">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-850 pb-4 mb-4">
        <ShieldCheck className="text-emerald-500 w-5 h-5" />
        <h3 className="font-bold text-slate-950 dark:text-white">SSL Handshake Monitor</h3>
      </div>

      <div className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl mb-4">
        <span className="text-xs font-bold text-slate-400">Validity Status</span>
        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-650">
          Secure
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-slate-500 font-semibold">
          <span>Authority Issuer:</span>
          <span className="text-slate-850 dark:text-slate-200">{certDetails.issuer}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500 font-semibold mt-1">
          <span>Key Length:</span>
          <span className="text-slate-850 dark:text-slate-200">{certDetails.keySize} bits</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500 font-semibold mt-1">
          <span>Expiry Warning:</span>
          <span className="text-slate-850 dark:text-slate-200">{certDetails.expiryDays} days remaining</span>
        </div>
      </div>
    </div>
  );
}
