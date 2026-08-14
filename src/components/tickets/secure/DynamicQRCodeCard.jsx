import React, { useState, useEffect } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";
import { generateDynamicCheckinToken } from "../../../utils/security/qrcode/dynamicTokenGenerator";
import RotationProgressBar from "./RotationProgressBar";

export default function DynamicQRCodeCard({ ticketId = "TKT_9982" }) {
  const [token, setToken] = useState("");
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    const updateToken = () => {
      const freshToken = generateDynamicCheckinToken(ticketId, "master_vector_secret_123", 15);
      setToken(freshToken);
      setTimeLeft(15);
    };

    updateToken();
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          updateToken();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ticketId]);

  return (
    <div className="w-full max-w-sm mx-auto p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white space-y-4 shadow-xl select-none text-center">
      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold justify-center">
        <ShieldAlert className="w-4 h-4" />
        <span>Rotating Security Pass</span>
      </div>

      <div className="mx-auto w-36 h-36 bg-slate-100 dark:bg-slate-950 rounded-2xl flex flex-col items-center justify-center border border-gray-150 dark:border-gray-800 p-2 break-all font-mono text-[9px]">
        {/* Render simulated dynamic barcode text */}
        <span className="text-gray-400 font-bold mb-2">[ QR Code ]</span>
        <span className="text-indigo-600 font-semibold">{token}</span>
      </div>

      <RotationProgressBar duration={15} timeLeft={timeLeft} />
    </div>
  );
}
