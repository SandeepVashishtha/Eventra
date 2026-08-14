import React, { useState } from "react";
import { ShieldCheck, Copy, CheckCircle, RefreshCw } from "lucide-react";
import "./2fa-setup.css";

export default function TwoFactorSetupModal({ isOpen = true, onClose }) {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const secretKey = "KVKH GVSK 7GVK KVKH";

  if (!isOpen) return null;

  const handleVerify = (e) => {
    e.preventDefault();
    if (code.length === 6) {
      setStep(3);
    } else {
      alert("Invalid verification code. Enter 6 digits code.");
    }
  };

  return (
    <div className="setup-2fa-overlay">
      <div className="setup-2fa-card p-6 bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl max-w-sm w-full">
        <div className="flex items-center gap-2 mb-4 text-indigo-400">
          <ShieldCheck className="w-6 h-6" />
          <h3 className="text-base font-bold">Configure Two-Factor Auth</h3>
        </div>

        {step === 1 && (
          <div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Scan this secret setup key in your Google Authenticator or Microsoft Authenticator app:
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center select-all font-mono text-xs tracking-widest text-indigo-400 mb-5">
              {secretKey}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify}>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Enter the 6-digit confirmation code generated in your authenticator app:
            </p>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-850 rounded-xl text-center font-mono text-lg tracking-widest text-indigo-400 mb-4 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Verify Code
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="inline-flex p-2.5 bg-emerald-500/10 text-emerald-500 rounded-full mb-3">
              <CheckCircle className="w-8 h-8 animate-bounce" />
            </div>
            <h4 className="text-sm font-bold mb-1">Two-Factor Enabled</h4>
            <p className="text-xs text-slate-400 mb-5">Your account has been secured successfully.</p>
            <button
              onClick={onClose}
              className="w-full bg-slate-805 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
