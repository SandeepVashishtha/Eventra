import { useState } from "react";
import {
  ScanLine,
  CheckCircle,
  XCircle,
  Camera,
} from "lucide-react";
import {
  validateQRCode,
  markAttendance,
  hasCheckedIn,
} from "../../utils/qrCheckInUtils";

const QRScannerPanel = () => {
  const [qrInput, setQrInput] = useState("");
  const [result, setResult] = useState(null);

  const handleScan = () => {
    if (!qrInput.trim()) {
      setResult({
        success: false,
        message: "Please enter a QR code.",
      });
      return;
    }

    const valid = validateQRCode(qrInput);

    if (!valid) {
      setResult({
        success: false,
        message: "Invalid QR Code.",
      });
      return;
    }

    if (hasCheckedIn(qrInput)) {
      setResult({
        success: false,
        message: "Attendee already checked in.",
      });
      return;
    }

    markAttendance(qrInput);

    setResult({
      success: true,
      message: "Attendance marked successfully!",
    });

    setQrInput("");
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">

      {/* Header */}

      <div className="bg-emerald-600 text-white p-5 rounded-t-2xl flex items-center gap-3">
        <ScanLine size={24} />
        <h2 className="text-xl font-bold">
          QR Check-in Scanner
        </h2>
      </div>

      {/* Body */}

      <div className="p-6">

        <label className="block text-sm font-medium mb-2">
          QR Code Data
        </label>

        <input
          type="text"
          value={qrInput}
          onChange={(e) => setQrInput(e.target.value)}
          placeholder="Paste or scan QR code value..."
          className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <button
          onClick={handleScan}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition"
        >
          <Camera size={18} />
          Scan QR Code
        </button>

        {/* Result */}

        {result && (
          <div
            className={`mt-6 rounded-xl p-4 flex items-center gap-3 ${
              result.success
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
            }`}
          >
            {result.success ? (
              <CheckCircle size={22} />
            ) : (
              <XCircle size={22} />
            )}

            <span>{result.message}</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default QRScannerPanel;