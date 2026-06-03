import React, { useState } from "react";
import { useMFA } from "../../hooks/useMFA";
import { ShieldCheck, ShieldAlert, Key, Clipboard, Download } from "lucide-react";
import { motion } from "framer-motion";

const MFASetup = () => {
  const { qrCode, isEnrolling, backupCodes, startEnrollment, verifyAndEnable } = useMFA();
  const [code, setCode] = useState("");

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex p-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-3xl">
          <ShieldCheck size={48} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white">Multi-Factor Auth</h1>
        <p className="text-gray-500 max-w-md mx-auto">Add an extra layer of security to your Eventra account by requiring a code from your phone.</p>
      </div>

      {!qrCode ? (
        <button 
          onClick={startEnrollment}
          disabled={isEnrolling}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl transition-all"
        >
          {isEnrolling ? "Generating Secret..." : "Begin MFA Setup"}
        </button>
      ) : backupCodes.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl space-y-8">
          <div className="flex flex-col items-center gap-6">
            <div className="p-3 bg-white rounded-2xl border-2 border-indigo-100">
              <img src={qrCode} alt="Scan me" className="w-48 h-48" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-bold text-gray-900 dark:text-white">Scan this QR Code</h3>
              <p className="text-sm text-gray-500">Use Google Authenticator or Authy to scan the code above.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Enter 6-digit Verification Code</label>
            <div className="flex gap-4">
              <input 
                type="text" 
                maxLength={6} 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                className="flex-1 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border-none text-center text-2xl font-black tracking-[0.5em] focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                onClick={() => verifyAndEnable(code)}
                className="px-8 bg-indigo-600 text-white font-bold rounded-2xl"
              >
                Verify
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-3xl border border-emerald-100 dark:border-emerald-800/30 space-y-6">
          <div className="flex items-center gap-4 text-emerald-700 dark:text-emerald-400">
            <ShieldCheck size={32} />
            <h3 className="text-xl font-bold">MFA Enabled Successfully</h3>
          </div>
          
          <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-emerald-200">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-gray-900 dark:text-white">Backup Recovery Codes</h4>
              <button className="p-2 text-gray-400 hover:text-indigo-600"><Download size={18} /></button>
            </div>
            <p className="text-xs text-gray-500 mb-4">Save these codes in a safe place. They can be used to access your account if you lose your phone.</p>
            <div className="grid grid-cols-1 gap-2">
              {backupCodes.map(c => (
                <div key={c} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl font-mono text-sm text-gray-700 dark:text-gray-300 flex justify-between items-center">
                  {c}
                  <Clipboard size={14} className="opacity-40" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MFASetup;
