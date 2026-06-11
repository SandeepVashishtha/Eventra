/**
 * QRTicketModal.jsx
 * Eventra — Full ticket modal with download & share actions.
 *
 * Usage (e.g. in EventDetails.js or RegistrationsTab.jsx):
 *
 * import QRTicketModal from "../common/QRTicket/QRTicketModal";
 *
 * const [showTicket, setShowTicket] = useState(false);
 *
 * <button onClick={() => setShowTicket(true)}>View Ticket</button>
 *
 * <QRTicketModal
 * isOpen={showTicket}
 * onClose={() => setShowTicket(false)}
 * ticket={{
 * eventName: registration.eventName,
 * eventOrganizer: "GirlScript Foundation",
 * date: registration.eventDate,
 * time: registration.eventTime,
 * venue: registration.venue,
 * seat: registration.seat || "General",
 * holderName: user.name,
 * ticketId: registration.ticketId,
 * ticketType: registration.ticketTier || "General",
 * qrValue: `https://eventra.app/verify/${registration.ticketId}`,
 * }}
 * />
 */

import { useRef, useEffect } from "react";
import QRTicket from "./QRTicket";
import { useTicketDownload } from "./useTicketDownload";
import { toast } from "react-toastify";

export default function QRTicketModal({ isOpen, onClose, ticket }) {
  const ticketRef = useRef(null);
  const { downloading, downloadPNG, downloadPDF } = useTicketDownload(
    ticketRef,
    ticket?.ticketId || "ticket"
  );

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
    
    // Cache the original style before mutating so we don't destroy parent layout rules
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

    modalRef.current.addEventListener("keydown", handleFocusTrap);
    // Focus the modal automatically
    modalRef.current.focus();

    return () => {
      if (modalRef.current) {
        modalRef.current.removeEventListener("keydown", handleFocusTrap);
      }
    };
  }, [isOpen]);

  const handleShare = async () => {
    const shareUrl = ticket?.qrValue || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ticket for ${ticket?.eventName}`,
          text: `Here's my ticket for ${ticket?.eventName} on ${ticket?.date}`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Native share failed", err);
        } else {
          return; // User intentionally cancelled native share
        }
      }
    }
    
    // Fallback to Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Ticket link copied to clipboard!");
        return;
      } catch (err) {
        console.error("Clipboard API failed", err);
      }
    }

    // Ultimate fallback for insecure contexts (HTTP) or unsupported browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed"; // Avoid scrolling to bottom
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        toast.success("Ticket link copied to clipboard!");
      } else {
        toast.error("Failed to copy link. Please copy manually.");
      }
    } catch (err) {
      console.error("Fallback clipboard failed", err);
      toast.error("Failed to copy link. Please copy manually.");
    }
  };

  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      ref={modalRef}
      tabIndex={-1}
      // Removed inline onKeyDown since we now handle Escape globally and Tab securely
      className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Ticket Preview"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-5">

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex items-center gap-1 self-end text-sm text-white/60 transition-colors hover:text-white"
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
        <div className="flex w-full max-w-[340px] gap-3">
          {/* Download PNG */}
          <button
            onClick={downloadPNG}
            disabled={downloading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ background: "#7c3aed" }}
           aria-label="Save ticket as PNG">
            <DownloadIcon />
            {downloading ? "Saving…" : "Save PNG"}
          </button>

          {/* Download PDF */}
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
           aria-label="Download ticket as PDF">
            <FileIcon />
            {downloading ? "…" : "PDF"}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
           aria-label="Share ticket">
            <ShareIcon />
            Share
          </button>
        </div>

        <p className="text-center text-xs text-white/30">
          Scan QR at the venue entrance for check-in
        </p>
      </div>
    </div>
  );
}

// ── Inline SVG icons (no extra deps needed) ──────────────────

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