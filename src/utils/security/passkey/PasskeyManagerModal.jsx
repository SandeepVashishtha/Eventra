import React, { useState, useEffect } from "react";
import { Fingerprint, ShieldCheck, Smartphone, CheckCircle, X, Sparkles } from "lucide-react";
import { isPasskeySupported, registerPasskeyBiometrics } from "./webauthnClient";

export default function PasskeyManagerModal({
  userEmail = "alex.rivera@example.com",
  isOpen = false,
  onClose = () => {},
}) {
  const [supported, setSupported] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [passkeyResult, setPasskeyResult] = useState(null);

  useEffect(() => {
    async function check() {
      const s = await isPasskeySupported();
      setSupported(s);
    }
    if (isOpen) {
      check();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreatePasskey = async () => {
    setIsRegistering(true);
    try {
      const res = await registerPasskeyBiometrics(userEmail);
      setPasskeyResult(res);
    } catch (err) {
      console.error("Passkey registration failed:", err);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-gray-900 dark:text-white select-none">
      <div className="relative w-full max-w-md rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Passkey & Biometric Check-In</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Biometric Availability Banner */}
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            {supported
              ? "Touch ID / Face ID platform authenticator available on this device."
              : "FIDO2 Passwordless Passkey protocol ready."}
          </span>
        </div>

        {passkeyResult ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-800 text-center space-y-2 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
              Biometric Passkey Registered!
            </h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono">
              Credential ID: {passkeyResult.credentialId.substring(0, 16)}...
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <p className="text-gray-600 dark:text-gray-400">
              Use Touch ID, Face ID, or Windows Hello to check in to event doors in under 1 second without passwords or OTP emails.
            </p>

            <button
              onClick={handleCreatePasskey}
              disabled={isRegistering}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {isRegistering ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" /> Verifying Biometrics...
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" /> Register Device Passkey
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
