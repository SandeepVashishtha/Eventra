import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, AlertCircle } from "lucide-react";
import { apiUtils } from "config/api.js";
import { toast } from "react-toastify";

const ReAuthModal = ({ onSuccess }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
// WebAuthn Mock Logic for Frontend Completeness
const handleWebAuthn = async () => {
  try {
    toast.info("Awaiting biometric scan...");
    
    // Simulate fetching challenge from backend
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    
    // Call the native browser WebAuthn API
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge: challenge,
        rpId: window.location.hostname,
        userVerification: "required",
        timeout: 60000,
      }
    });

    if (credential) {
      toast.success("Biometric verification successful!");
      onSuccess();
    }
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      setError("Biometric prompt cancelled.");
    } else if (err.name === 'NotSupportedError') {
      setError("WebAuthn is not supported or configured on this device.");
    } else {
      setError("Failed to verify biometrics. Please use your password.");
      console.error(err);
    }
  }
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiUtils.post("/auth/reauth", { password }, { skipAuth: true });
      if (res.ok) {
        toast.success("Session verified successfully");
        onSuccess();
      } else {
        setError(res.data?.error || "Incorrect password");
      }
    } catch (err) {
      if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(err.message || "Failed to verify session");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>

        <div className="text-center mb-6">
          <div className="mx-auto bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verify Your Session
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            For your security, we need to verify your identity. Your session has been flagged due to inactivity or a security rule.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="reauth-password"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              id="reauth-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              disabled={loading}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors text-gray-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Verify Identity"
            )}
          </button>
        </form>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={handleWebAuthn} className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 flex justify-center items-center gap-2">
              <Lock className="w-4 h-4" /> Use Biometrics (FaceID/TouchID)
            </button>
          </div>
      </motion.div>
    </div>
  );
};

export default ReAuthModal;
