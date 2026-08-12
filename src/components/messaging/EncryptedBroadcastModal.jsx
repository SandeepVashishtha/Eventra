import React, { useState } from "react";
import { Lock, ShieldCheck, Send, Clock, X, Sparkles } from "lucide-react";
import { encryptE2EEMessage } from "../../utils/security/e2eeManager";

export default function EncryptedBroadcastModal({
  recipientName = "Alex Rivera (Hackathon Winner)",
  recipientPublicKey = "pub-key-alex-101",
  isOpen = false,
  onClose = () => {},
  onSendEncrypted = () => {},
}) {
  const [plaintext, setPlaintext] = useState("");
  const [expirationHours, setExpirationHours] = useState("1");
  const [isEncrypting, setIsEncrypting] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!plaintext.trim()) return;

    setIsEncrypting(true);
    try {
      const encryptedBlob = await encryptE2EEMessage(plaintext.trim(), recipientPublicKey);
      onSendEncrypted({
        ...encryptedBlob,
        recipientName,
        expirationHours,
      });
      onClose();
    } catch (err) {
      console.error("Encryption failed:", err);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-gray-900 dark:text-white select-none">
      <div className="relative w-full max-w-lg rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">E2EE Private Announcement</h3>
              <p className="text-xs text-gray-500">To: {recipientName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* E2EE Lock Banner */}
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Zero-Knowledge Encryption: Message is encrypted in browser using AES-GCM-256 before upload.</span>
        </div>

        <form onSubmit={handleSend} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Private Message Content
            </label>
            <textarea
              rows="4"
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="Enter VIP passcode, private Zoom link, or winner prize claim instructions..."
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> Self-Destruct Timer
            </label>
            <select
              value={expirationHours}
              onChange={(e) => setExpirationHours(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="1">Expire 1 Hour After Event Start</option>
              <option value="24">Expire in 24 Hours</option>
              <option value="never">Never Expire</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isEncrypting || !plaintext.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition-all disabled:opacity-50"
          >
            {isEncrypting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" /> Encrypting Payload...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Send Encrypted Broadcast
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
