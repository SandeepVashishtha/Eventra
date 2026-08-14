import { Download, QrCode, User, Calendar } from "lucide-react";

const EventQRCode = ({
  attendeeName = "Guest User",
  eventName = "Event",
  registrationId = "",
  qrValue = "",
}) => {
  const handleDownload = async () => {
    if (!qrValue) {
      alert("No QR code available to download.");
      return;
    }

    try {
      const link = document.createElement("a");
      if (qrValue.startsWith("data:")) {
        link.href = qrValue;
      } else {
        const response = await fetch(qrValue);
        if (!response.ok) throw new Error(`Download failed (${response.status})`);
        const blob = await response.blob();
        link.href = URL.createObjectURL(blob);
      }
      link.download = `event-qr-${registrationId || "ticket"}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      if (link.href.startsWith("blob:")) {
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      alert("Failed to download QR code. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">

      {/* Header */}
      <div className="bg-indigo-600 text-white px-6 py-4 flex items-center gap-3">
        <QrCode size={24} />
        <h2 className="text-lg font-bold">
          Event Check-in QR
        </h2>
      </div>

      {/* QR Area */}
      <div className="p-6 flex flex-col items-center">

        <div className="w-56 h-56 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-800">

          {qrValue ? (
            <img
              src={qrValue}
              alt="QR Code"
              className="w-52 h-52 object-contain"
            />
          ) : (
            <QrCode
              size={120}
              className="text-slate-400"
            />
          )}

        </div>

        <p className="text-xs text-slate-500 mt-3 break-all text-center">
          {registrationId}
        </p>

      </div>

      {/* Details */}

      <div className="px-6 space-y-3">

        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <User size={18} />
          <span>{attendeeName}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Calendar size={18} />
          <span>{eventName}</span>
        </div>

      </div>

      {/* Footer */}

      <div className="p-6">

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition"
        >
          <Download size={18} />
          Download QR Code
        </button>

      </div>
    </div>
  );
};

export default EventQRCode;