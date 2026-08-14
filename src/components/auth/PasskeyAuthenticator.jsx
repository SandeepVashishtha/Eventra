import React, { useState } from "react";
import { Key, Fingerprint, Shield, ShieldCheck } from "lucide-react";
import "./passkey.css";

export default function PasskeyAuthenticator() {
  const [registeredKeys, setRegisteredKeys] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);

  const startPasskeyRegistration = async () => {
    setIsRegistering(true);
    // Simulate WebAuthn credentials APIs calls
    setTimeout(() => {
      const newKey = {
        id: Date.now(),
        name: `Passkey (Device ${registeredKeys.length + 1})`,
        registeredAt: new Date().toLocaleDateString()
      };
      setRegisteredKeys(prev => [...prev, newKey]);
      setIsRegistering(false);
      alert("Passkey successfully registered on this device!");
    }, 1200);
  };

  return (
    <div className="passkey-authenticator p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-lg max-w-sm mx-auto my-8 flex flex-col items-center">
      <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 rounded-2xl mb-4">
        <Fingerprint className="w-8 h-8" />
      </div>

      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Passwordless Biometrics</h3>
      <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
        Register a passkey to secure your account using fingerprint, face recognition, or security keys.
      </p>

      {registeredKeys.length > 0 && (
        <div className="w-full mb-6">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">Registered Keys</h4>
          <div className="flex flex-col gap-2">
            {registeredKeys.map((key) => (
              <div key={key.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="text-xs font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> {key.name}
                </span>
                <span className="text-[10px] text-slate-450">{key.registeredAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={startPasskeyRegistration}
        disabled={isRegistering}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-indigo-650/20 disabled:opacity-50 text-xs"
      >
        {isRegistering ? "Registering Device..." : "Register Passkey"}
      </button>
    </div>
  );
}
