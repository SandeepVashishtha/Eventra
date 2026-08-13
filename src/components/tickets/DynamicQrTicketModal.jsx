import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Ticket, AlertCircle } from "lucide-react";
import QRCode from "react-qr-code";
import { buildTicketQrPayload, buildTicketQrValue } from "../../utils/ticketQrPayload";
import QrCountdownTimer from "./QrCountdownTimer";

export default function DynamicQrTicketModal({
  registration = { registrationId: "REG-2026-99" },
  eventTitle = "Global Open Source Summit 2026",
  user = { fullName: "Alex Rivera" },
  onClose = () => {},
}) {
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [qrPayload, setQrPayload] = useState(() => buildTicketQrPayload({ registration }));

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setQrPayload(buildTicketQrPayload({ registration }));
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [registration]);

  const qrValue = buildTicketQrValue(qrPayload);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-md rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden space-y-4 p-6">
        {/* Anti-Screenshot Watermark Noise Layer */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Dynamic Anti-Screenshot Ticket
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event & User Details */}
        <div className="text-center space-y-1">
          <h4 className="font-bold text-base text-gray-900 dark:text-white">{eventTitle}</h4>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            Pass Holder: {user.fullName}
          </p>
        </div>

        {/* QR Code Frame */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 relative">
          <div className="p-3 bg-white rounded-xl shadow-inner border-4 border-indigo-500">
            {qrValue ? (
              <QRCode value={qrValue} size={180} />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-xs text-gray-400">
                Invalid Ticket
              </div>
            )}
          </div>

          <QrCountdownTimer secondsLeft={secondsLeft} maxSeconds={15} />
        </div>

        {/* Anti-Screenshot Warning */}
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Screenshots are disabled. Tickets carry an opaque server-issued token and are verified at the door.</span>
        </div>
      </div>
    </div>
  );
}
