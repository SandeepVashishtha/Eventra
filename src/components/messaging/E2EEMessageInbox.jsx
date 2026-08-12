import React, { useState, useEffect } from "react";
import { ShieldCheck, Lock, Unlock, Clock, FileText } from "lucide-react";
import { decryptE2EEMessage } from "../../utils/security/e2eeManager";

export default function E2EEMessageInbox({
  messages = [
    {
      id: "msg-1",
      sender: "Eventra Organizer Lead",
      ciphertext: "VklQIFpvb20gTWVldGluZyBQYXNzY29kZTogODg0LTEwMi05OTM=",
      iv: "a1b2c3d4e5f6",
      isEncrypted: true,
      timestamp: Date.now() - 3600000,
    },
  ],
}) {
  const [decryptedMap, setDecryptedMap] = useState({});

  useEffect(() => {
    async function decryptAll() {
      const results = {};
      for (const msg of messages) {
        if (msg.isEncrypted) {
          results[msg.id] = await decryptE2EEMessage(msg);
        } else {
          results[msg.id] = msg.content || "";
        }
      }
      setDecryptedMap(results);
    }

    decryptAll();
  }, [messages]);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            E2EE Participant Inbox
          </h2>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> WebCrypto E2EE Active
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Unlock className="w-3.5 h-3.5 text-emerald-500" /> {msg.sender}
              </span>
              <span className="font-mono text-[10px] text-gray-400">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <p className="p-3 rounded-lg bg-white dark:bg-gray-900 font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 leading-relaxed">
              {decryptedMap[msg.id] || "Decrypting..."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
