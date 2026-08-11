/**
 * TicketQRCode.jsx
 *
 * Renders a QR code for an event ticket.
 * The QR encodes only the opaque ticket token — no PII is embedded.
 *
 * Props:
 *   qrToken       {string}  - Signed JWT or plain UUID to encode in the QR
 *   ticketId      {string}  - Human-readable ticket ID (display only)
 *   eventName     {string}  - Event title (display only)
 *   eventDate     {string}  - ISO date string or formatted date (display only)
 *   status        {string}  - e.g. "Confirmed", "Waitlisted" (display only)
 *   size          {number}  - QR code size in px (default: 200)
 *   className     {string}  - Optional extra class for the wrapper
 *   showDetails   {boolean} - Whether to render the ticket-detail block (default: true)
 */

import { useState, useCallback } from "react";
import QRCode from "react-qr-code";
import { CheckCircle, Clock, Download } from "lucide-react";

const statusConfig = {
  Confirmed: {
    label: "Confirmed",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40",
    icon: CheckCircle,
  },
  Waitlisted: {
    label: "Waitlisted",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40",
    icon: Clock,
  },
};

/**
 * Triggers a browser download of the QR code as an SVG file.
 *
 * @param {string} svgId - The DOM id of the SVG element to download
 * @param {string} filename - Suggested filename without extension
 */
function downloadQRCodeSVG(svgId, filename = "ticket-qr") {
  const svgEl = document.getElementById(svgId);
  if (!svgEl) return;
  const serialised = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([serialised], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function TicketQRCode({
  qrToken,
  ticketId,
  eventName,
  eventDate,
  status = "Confirmed",
  size = 200,
  className = "",
  showDetails = true,
}) {
  const [copied, setCopied] = useState(false);

  const svgId = `qr-svg-${ticketId ?? "ticket"}`;

  const handleCopyToken = useCallback(async () => {
    if (!qrToken) return;
    try {
      await navigator.clipboard.writeText(qrToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available — silently ignore
    }
  }, [qrToken]);

  const handleDownload = useCallback(() => {
    downloadQRCodeSVG(svgId, `eventra-ticket-${ticketId ?? "qr"}`);
  }, [svgId, ticketId]);

  const cfg = statusConfig[status] ?? statusConfig.Confirmed;
  const StatusIcon = cfg.icon;

  // Nothing to render without a token
  if (!qrToken) {
    return (
      <div
        className={`flex flex-col items-center gap-3 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 text-sm ${className}`}
        role="status"
        aria-label="Ticket QR code unavailable"
      >
        <div className="w-[200px] h-[200px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
          <span className="text-xs text-center px-4">QR code not available</span>
        </div>
        <p className="text-xs">No ticket token found</p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center gap-4 ${className}`}
      role="region"
      aria-label={`QR code ticket for ${eventName ?? "event"}`}
    >
      {/* QR Code */}
      <div
        className="p-4 bg-white dark:bg-white rounded-2xl shadow-md border border-gray-100 dark:border-gray-200"
        aria-label="Scan this QR code to check in"
      >
        <QRCode
          id={svgId}
          value={qrToken}
          size={size}
          level="M"
          // Explicit background/foreground for dark-mode safety (QR must always be light-bg)
          bgColor="#FFFFFF"
          fgColor="#0F172A"
          aria-label={`QR code for ticket ${ticketId ?? ""}`}
        />
      </div>

      {/* Ticket Details Block */}
      {showDetails && (
        <div className="w-full max-w-xs space-y-2 text-sm">
          {eventName && (
            <p className="font-semibold text-slate-800 dark:text-slate-100 text-center leading-snug">
              {eventName}
            </p>
          )}

          {eventDate && (
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              {eventDate}
            </p>
          )}

          {ticketId && (
            <p className="text-xs text-center font-mono text-gray-400 dark:text-gray-500 truncate" title={ticketId}>
              ID: {ticketId.length > 16 ? `${ticketId.slice(0, 8)}…${ticketId.slice(-6)}` : ticketId}
            </p>
          )}

          {/* Status Badge */}
          <div className="flex justify-center pt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.color}`}
              role="status"
              aria-label={`Ticket status: ${cfg.label}`}
            >
              <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
              {cfg.label}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Download QR code as SVG"
          title="Download QR code"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          Download
        </button>

        <button
          type="button"
          onClick={handleCopyToken}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          aria-label={copied ? "Token copied" : "Copy ticket token to clipboard"}
          title="Copy token"
        >
          {copied ? "Copied!" : "Copy token"}
        </button>
      </div>
    </div>
  );
}
