import React, { useState } from "react";
import { ShieldAlert, Save, RefreshCw, Key } from "lucide-react";
import { encryptTextGcm } from "../../../utils/security/encrypt/aesGcmCipher";
import DecryptionKeyPrompt from "./DecryptionKeyPrompt";

export default function EncryptedNotesEditor() {
  const [noteText, setNoteText] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [status, setStatus] = useState("idle");

  const saveEncryptedNote = async () => {
    if (!noteText || !passphrase) return;
    setStatus("saving");

    try {
      const payload = await encryptTextGcm(noteText, passphrase);
      console.log("[Notes] Encrypted Payload created:", payload);
      setStatus("saved");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 text-xs text-gray-900 dark:text-white select-none">
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-gray-900 dark:text-white">Zero-Knowledge Encrypted Notes</span>
        </div>
        <button
          onClick={saveEncryptedNote}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
        >
          <Save className="w-3.5 h-3.5" /> Save Note
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Type your secure notes here..."
            className="w-full h-48 p-4 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 outline-none resize-none"
          />
        </div>

        <DecryptionKeyPrompt passphrase={passphrase} setPassphrase={setPassphrase} />
      </div>
    </div>
  );
}
