/**
 * QRTicket.jsx
 * Eventra — QR Code Ticket Card Component
 *
 * Usage:
 * <QRTicket ticket={ticketData} ref={ticketRef} />
 *
 * ticketData shape:
 * {
 * eventName: string,
 * eventOrganizer: string,
 * date: string,
 * time: string,
 * venue: string,
 * seat: string,
 * holderName: string,
 * ticketId: string,
 * ticketType: 'General' | 'VIP' | 'Speaker',
 * qrValue: string,       // unique URL or ID encoded in QR
 * }
 */

import { forwardRef } from "react";
import QRCode from "react-qr-code";

// Ticket type visual config
const TYPE_CONFIG = {
  General: {
    accent: "#7c3aed",
    accentLight: "rgba(124,58,237,0.18)",
    badgeClass:
      "bg-purple-500/20 text-purple-300 print:bg-white print:text-purple-700 print:border print:border-purple-300",
    label: "GENERAL",
  },
  VIP: {
    accent: "#eab308",
    accentLight: "rgba(234,179,8,0.18)",
    badgeClass:
      "bg-yellow-500/20 text-yellow-300 print:bg-white print:text-yellow-700 print:border print:border-yellow-300",
    label: "VIP ACCESS",
  },
  Speaker: {
    accent: "#10b981",
    accentLight: "rgba(16,185,129,0.18)",
    badgeClass:
      "bg-emerald-500/20 text-emerald-300 print:bg-white print:text-emerald-700 print:border print:border-emerald-300",
    label: "SPEAKER",
  },
};

const QRTicket = forwardRef(function QRTicket({ ticket }, ref) {
  const {
    eventName = "Open Source Summit",
    eventOrganizer = "GirlScript Foundation",
    date = "Aug 15, 2025",
    time = "10:00 AM IST",
    venue = "Bangalore, India",
    seat = "A-12",
    holderName = "Attendee",
    ticketId = "EVT-0000",
    ticketType = "General",
    qrValue = "https://eventra.app/verify/EVT-0000",
  } = ticket || {};

  const config = TYPE_CONFIG[ticketType] || TYPE_CONFIG.General;

  return (
    <div
      ref={ref}
      // Removed anti-pattern select-none to allow users to copy their ticket details
      className="w-[340px] print:mx-auto print:w-full print:max-w-md"
      style={{ fontFamily: "'Syne', 'Inter', sans-serif" }}
    >
      {/* ── Top body ── */}
      <div
        className="relative overflow-hidden rounded-t-2xl px-5 pt-5 pb-4 print:rounded-t-xl print:border-t print:border-r print:border-l print:border-gray-300 print:bg-white"
        style={{ background: "#1a1a2e" }}
      >
        {/* Decorative blobs (Hidden on print to save ink) */}
        <div
          className="pointer-events-none absolute -top-5 -right-5 h-28 w-28 rounded-full print:hidden"
          style={{ background: config.accentLight }}
        />
        <div
          className="pointer-events-none absolute bottom-2 -left-8 h-20 w-20 rounded-full print:hidden"
          style={{ background: config.accentLight, opacity: 0.6 }}
        />

        {/* Event badge */}
        <span
          className={`relative z-10 mb-3 inline-block rounded-full px-3 py-0.5 text-[10px] font-bold tracking-widest uppercase ${config.badgeClass}`}
        >
          {config.label}
        </span>

        {/* Event name */}
        <h2
          className="relative z-10 mb-1 text-xl leading-tight font-extrabold text-white print:text-black"
          style={{ letterSpacing: "-0.3px" }}
        >
          {eventName}
        </h2>
        <p className="relative z-10 mb-4 text-xs text-white/40 print:text-gray-500">
          {eventOrganizer}
        </p>

        {/* Meta grid */}
        <div className="relative z-10 mb-4 grid grid-cols-2 gap-y-3">
          {[
            { label: "Date", value: date },
            { label: "Time", value: time },
            { label: "Venue", value: venue },
            { label: "Seat", value: seat },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="mb-0.5 text-[9px] tracking-widest text-white/35 uppercase print:text-gray-400">
                {label}
              </p>
              <p className="text-[13px] font-medium text-white print:text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Tear line */}
        <div className="-mx-5 flex items-center print:mx-0">
          <div className="h-4 w-4 flex-shrink-0 rounded-full bg-gray-900 print:border print:border-gray-300 print:bg-white" />
          <div
            className="flex-1 border-t border-dashed print:border-gray-300"
            style={{ borderColor: "rgba(255,255,255,0.12)" }}
          />
          <div className="h-4 w-4 flex-shrink-0 rounded-full bg-gray-900 print:border print:border-gray-300 print:bg-white" />
        </div>
      </div>

      {/* ── Bottom foot ── */}
      <div
        className="flex items-center gap-4 rounded-b-2xl px-5 py-4 print:rounded-b-xl print:border-r print:border-b print:border-l print:border-gray-300 print:bg-white"
        style={{ background: "#12112a" }}
      >
        {/* QR code */}
        <div className="flex-shrink-0 rounded-lg bg-white p-1.5 print:border print:border-gray-200">
          <QRCode
            value={qrValue}
            size={72}
            bgColor="#ffffff"
            fgColor="#1a1a2e"
            level="M"
            aria-label={`QR Code for Ticket Verification: ${ticketId}`}
          />
        </div>

        {/* Holder info */}
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-[9px] tracking-widest text-white/35 uppercase print:text-gray-400">
            Ticket Holder
          </p>
          <p className="truncate text-sm font-bold text-white print:text-black">{holderName}</p>
          <p
            className="mt-0.5 truncate text-[10px] print:text-gray-600"
            style={{
              fontFamily: "'DM Mono', 'Courier New', monospace",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            {ticketId}
          </p>
          <span
            className={`mt-1.5 inline-block rounded px-2 py-0.5 text-[10px] font-bold ${config.badgeClass}`}
          >
            {ticketType}
          </span>
        </div>
      </div>
    </div>
  );
});

// React DevTools Best Practice for forwardRef components
QRTicket.displayName = "QRTicket";

export default QRTicket;
