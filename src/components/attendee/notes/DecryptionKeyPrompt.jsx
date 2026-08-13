import React from "react";
import { Key } from "lucide-react";

export default function DecryptionKeyPrompt({ passphrase = "", setPassphrase = () => {} }) {
  return (
    <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 space-y-3 flex flex-col justify-center">
      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
        <Key className="w-4 h-4" />
        <span className="font-bold">Passphrase Key</span>
      </div>
      <p className="text-[10px] text-gray-400">
        Your key is never sent to the server. If lost, your notes cannot be decrypted.
      </p>
      <input
        type="password"
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
        placeholder="Enter master password"
        className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-mono text-[11px] outline-none"
      />
    </div>
  );
}
