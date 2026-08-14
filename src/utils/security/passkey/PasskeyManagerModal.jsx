import React, { useState } from "react";
import { Key, Shield, User } from "lucide-react";
import { createPasskeyCredentials } from "./webauthnClient";

export default function PasskeyManagerModal({ isOpen = false, onClose = () => {} }) {
  const [registering, setRegistering] = useState(false);

  const startRegistration = async () => {
    setRegistering(true);
    const mockChallenge = "Y2hhbGxlbmdlX3ZlY3Rvcl8xMjM="; // challenge_vector_123 in base64
    const result = await createPasskeyCredentials(mockChallenge, "user_registration_john");
    setRegistering(false);

    if (result.success) {
      alert("Passkey registered successfully!");
    } else {
      console.warn("Passkey error fallback: ", result.error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md text-xs select-none">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl space-y-4 text-white">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-base">Register FIDO2 Passkey</h3>
        </div>
        <p className="text-slate-400">
          Simplify venue check-ins. Authenticate instantly using biometric face scan or fingerprint touch.
        </p>
        <button
          onClick={startRegistration}
          disabled={registering}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex justify-center items-center gap-1.5"
        >
          <Key className="w-4 h-4" /> {registering ? "Registering passkey..." : "Configure biometrics"}
        </button>
      </div>
    </div>
  );
}
