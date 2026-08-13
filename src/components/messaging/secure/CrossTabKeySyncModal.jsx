import React, { useState, useEffect } from "react";
import { ShieldAlert, RefreshCw, Key } from "lucide-react";
import { CrossoverKeyExchanger } from "../../../utils/security/enclave/crossoverKeyExchanger";
import HistoryDecryptionProgress from "./HistoryDecryptionProgress";

export default function CrossTabKeySyncModal({ isOpen = false, onClose = () => {} }) {
  const [exchanging, setExchanging] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const exchanger = new CrossoverKeyExchanger();
    exchanger.onHandshakeReceived((data) => {
      console.log("[Enclave] Handshake matched from cross-tab:", data);
      setExchanging(true);
      
      let cur = 0;
      const interval = setInterval(() => {
        cur += 25;
        setProgress(cur);
        if (cur >= 100) {
          clearInterval(interval);
          setExchanging(false);
        }
      }, 200);
    });

    return () => {
      exchanger.close();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md text-xs select-none">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl space-y-4 text-white">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-base">Tab-Sync Key Exchange</h3>
        </div>

        <p className="text-slate-400">
          Waiting for active event sessions to exchange cryptographic signature templates...
        </p>

        {exchanging && <HistoryDecryptionProgress progress={progress} />}
      </div>
    </div>
  );
}
