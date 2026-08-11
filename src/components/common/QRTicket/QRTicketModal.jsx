/**
 * QRTicketModal.jsx
 * Eventra — Full ticket modal with download & share actions.
 */

import { useRef, useEffect } from "react";
import QRTicket from "./QRTicket";
import { useTicketDownload } from "./useTicketDownload";
import { toast } from "react-toastify";
import useClipboard from "hooks/useClipboard";

export default function QRTicketModal({ isOpen, onClose, ticket }) {
  const ticketRef = useRef(null);
  const { downloading, downloadPNG, downloadPDF } = useTicketDownload(
    ticketRef,
    ticket?.ticketId || "ticket"
  );
  const { copy } = useClipboard();
  const modalRef = useRef(null);

  // Deep Fix 1: Global Escape Listener to prevent ghosting
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleGlobalKeyDown);
    }
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, onClose]);

  // Deep Fix 2: Safe Body Scroll Lock (Prevents layout destruction on unmount)
  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  // Deep Fix 3: WCAG Strict Focus Trap for Accessibility
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleFocusTrap = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    const modalElement = modalRef.current;
    modalElement.addEventListener("keydown", handleFocusTrap);
    modalElement.focus();

    return () => {
      modalElement.removeEventListener("keydown", handleFocusTrap);
    };
  }, [isOpen]);

  const handleShare = async () => {
    const shareUrl = ticket?.qrValue || window.location.href;

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ticket for ${ticket?.eventName}`,
          text: `Here's my ticket for ${ticket?.eventName} on ${ticket?.date}`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name === "AbortError") return; // User cancelled
        console.error("Native share failed", err);
      }
    }

    // Fix: Replace 30-line Clipboard API + execCommand fallback with useClipboard
    const success = await copy(shareUrl);
    if (success) toast.success("Ticket link copied to clipboard!");
    else toast.error("Failed to copy link. Please copy manually.");
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Ticket Preview"
    >
      <div className="flex flex-col items-center gap-5 w-full max-w-sm">

        {/* Close button */}
        <button
          onClick={onClose}
          className="self-end text-white/60 hover:text-white transition-colors text-sm flex items-center gap-1"
          aria-label="Close ticket"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
          Close
        </button>

        {/* The ticket itself — this is what html2canvas captures */}
        <div className="drop-shadow-2xl">
          <QRTicket ref={ticketRef} ticket={ticket} />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 w-full max-w-85">
          <button
            onClick={downloadPNG}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ background: "#7c3aed" }}
            aria-label="Save ticket as PNG"
          >
            <DownloadIcon />
            {downloading ? "Saving…" : "Save PNG"}
          </button>

          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            aria-label="Download ticket as PDF"
          >
            <FileIcon />
            {downloading ? "…" : "PDF"}
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            aria-label="Share ticket"
          >
            <ShareIcon />
            Share
          </button>
        </div>

        <p className="text-white/30 text-xs text-center">
          Scan QR at the venue entrance for check-in
        </p>
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 3v13M7 11l5 5 5-5"/><path d="M3 20h18"/>
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  );
}
