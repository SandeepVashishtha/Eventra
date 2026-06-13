import { useRef, useState, useEffect } from "react";
import { X, Download, ShieldCheck, Calendar, MapPin, Clock, User, Mail, Award, Loader2, RefreshCw, FileText, Sparkles, Map } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import QRCode from "react-qr-code";
import toast from 'react-hot-toast';
import "./EventTicket.css";
import { useMyEvents } from "../../context/MyEventsContext";
import SpatialSeatSelector from "../events/SpatialSeatSelector";
import { AnimatePresence } from "framer-motion";
import { apiUtils } from "../../config/api";
import { useOfflineStatus } from "../../hooks/useOfflineStatus";

const EventTicket = ({ event, user, onClose }) => {
  const ticketRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50 });
  const [showSeatMap, setShowSeatMap] = useState(false);
  const isOffline = useOfflineStatus();

  const { myEvents } = useMyEvents();
  const registration = myEvents.find((r) => r.eventId === event.id);
  const selectedSeat = registration?.formData?.selectedSeat;

  const [qrToken, setQrToken] = useState(registration?.qrToken || "");
  const [loadingToken, setLoadingToken] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  // Generate a mock ticket serial code based on event and user details
  const generateSerial = () => {
    const eventPart = (event?.title || "EVT").slice(0, 3).toUpperCase();
    const userPart = (user?.firstName || user?.username || "USR").slice(0, 3).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${eventPart}-${userPart}-${randomPart}`;
  };

  const [serialNumber] = useState(() => registration?.registrationId || generateSerial());

  useEffect(() => {
    // If the token is already present (cached from registration session) skip fetching.
    if (qrToken) return;
    // When offline, skip the network call entirely — use the registration ID as fallback.
    if (isOffline) return;

    const regId = registration?.registrationId || serialNumber;
    setLoadingToken(true);
    setTokenError(false);

    apiUtils.post("/api/tickets/token", {
      registrationId: regId,
      eventId: event.id
    })
    .then((res) => {
      if (res.data?.token) {
        setQrToken(res.data.token);
      } else {
        setTokenError(true);
      }
    })
    .catch((err) => {
      console.error("[EventTicket] Failed to load secure ticket token:", err);
      setTokenError(true);
    })
    .finally(() => {
      setLoadingToken(false);
    });
  }, [registration, event.id, qrToken, serialNumber, isOffline]);

  // Dynamic category themes
  const getThemeColors = () => {
    const type = (event?.type || event?.category || "Event").toLowerCase();
    if (type.includes("hackathon")) {
      return {
        badge: "HACKATHON PASS",
        primary: "from-pink-500 via-purple-600 to-indigo-700",
        glow: "rgba(236, 72, 153, 0.25)",
        accent: "#ec4899"
      };
    }
    if (type.includes("workshop") || type.includes("meetup") || type.includes("tech")) {
      return {
        badge: "WORKSHOP PASS",
        primary: "from-emerald-400 via-teal-500 to-cyan-600",
        glow: "rgba(16, 185, 129, 0.25)",
        accent: "#10b981"
      };
    }
    return {
      badge: "OFFICIAL PASS",
      primary: "from-indigo-500 via-purple-600 to-pink-500",
      glow: "rgba(99, 102, 241, 0.25)",
      accent: "#6366f1"
    };
  };

  const theme = getThemeColors();

  // 3D Mouse Tilt & Holographic Reflection logic
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;

    // Constrain rotation between -12 and 12 degrees
    const rotateX = -(y - yc) / (rect.height / 10);
    const rotateY = (x - xc) / (rect.width / 10);

    setRotate({ x: rotateX, y: rotateY });
    setShine({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setShine({ x: 50, y: 50 });
  };

  const handleDownload = async (format = "png") => {
    if (!ticketRef.current) return;
    setDownloading(true);
    toast(`Generating your high-resolution ticket ${format.toUpperCase()}...`);

    try {
      // Force temporary state to front-side without rotation to capture cleanly
      const originalFlip = isFlipped;
      setIsFlipped(false);
      setRotate({ x: 0, y: 0 });
      
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(ticketRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedTicket = clonedDoc.querySelector("[data-ticket-root]");
          if (clonedTicket) {
            clonedTicket.style.boxShadow = "none";
            clonedTicket.style.transform = "none";
            clonedTicket.style.transition = "none";
          }
        }
      });

      // Restore original state
      setIsFlipped(originalFlip);

      const imgData = canvas.toDataURL("image/png");
      const cleanTitle = (event?.title || "ticket").toLowerCase().replace(/[^a-z0-9]+/g, "-");

      if (format === "pdf") {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [380, 580]
        });
        pdf.addImage(imgData, "PNG", 0, 0, 380, 580);
        pdf.save(`eventra-ticket-${cleanTitle}.pdf`);
        toast.success("PDF Ticket downloaded successfully!");
      } else {
        const link = document.createElement("a");
        link.download = `eventra-ticket-${cleanTitle}.png`;
        link.href = imgData;
        link.click();
        toast.success("PNG Ticket downloaded successfully!");
      }
    } catch (error) {
      console.error("Ticket export error:", error);
      toast.error("Failed to generate ticket. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (!event) return null;

  return (
    <div className="ud-ticket-modal-overlay">
      <div className="ud-ticket-modal-container">
        {/* Modal Header Actions */}
        <div className="ud-ticket-modal-actions">
          <div className="flex gap-2 flex-1">
            <button 
              onClick={() => handleDownload("png")} 
              disabled={downloading}
              className="ud-ticket-action-btn download-btn"
              title="Download PNG Ticket"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>PNG</span>
            </button>
            <button 
              onClick={() => handleDownload("pdf")} 
              disabled={downloading}
              className="ud-ticket-action-btn pdf-btn"
              title="Download PDF Ticket"
            >
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
          
          <button 
            onClick={() => setIsFlipped(!isFlipped)} 
            className="ud-ticket-action-btn flip-btn"
            title="Flip Ticket"
          >
            <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${isFlipped ? "rotate-180" : ""}`} />
            <span>Info</span>
          </button>

          <button 
            onClick={onClose} 
            className="ud-ticket-action-btn close-btn"
            title="Close Ticket"
           aria-label="button">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Outer frame containing the interactive 3D card layout */}
        <div className="ud-ticket-capture-frame">
          <div 
            className={`ud-ticket-card-wrapper ${isFlipped ? "flipped" : ""}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1200px) rotateX(${rotate.x}deg) rotateY(${rotate.y + (isFlipped ? 180 : 0)}deg)`,
              boxShadow: `0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 50px ${theme.glow}`
            }}
            ref={ticketRef}
            data-ticket-root
          >
            {/* Front of Card */}
            <div className="ud-ticket-card-face ud-ticket-card-front">
              {/* Holographic light sheen overlay */}
              <div 
                className="ud-ticket-holo-overlay" 
                style={{
                  background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 60%), linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)`
                }}
              />

              {/* Header Banner */}
              <div className={`ud-ticket-header bg-linear-to-r ${theme.primary}`}>
                {event.image && (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="ud-ticket-header-img"
                    loading="lazy"
                    crossOrigin="anonymous"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="ud-ticket-header-gradient" />
                <div className="ud-ticket-logo-overlay">
                  <span className="ud-ticket-logo-dot" />
                  <span className="ud-ticket-logo-text">Eventra</span>
                </div>
                <div className="ud-ticket-category" style={{ borderColor: theme.accent, background: `${theme.accent}33` }}>
                  <Award size={12} className="mr-1" style={{ color: theme.accent }} />
                  <span>{theme.badge}</span>
                </div>
              </div>

              {/* Event Body */}
              <div className="ud-ticket-body">
                <h2 className="ud-ticket-title">{event.title}</h2>
                
                <div className="ud-ticket-grid">
                  <div className="ud-ticket-info-item">
                    <span className="ud-ticket-info-label">DATE</span>
                    <span className="ud-ticket-info-value flex items-center gap-1.5">
                      <Calendar size={13} style={{ color: theme.accent }} />
                      {event.date ? new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      }) : "TBA"}
                    </span>
                  </div>
                  
                  <div className="ud-ticket-info-item">
                    <span className="ud-ticket-info-label">TIME</span>
                    <span className="ud-ticket-info-value flex items-center gap-1.5">
                      <Clock size={13} style={{ color: theme.accent }} />
                      {event.time || "TBA"}
                    </span>
                  </div>

                  <div className="ud-ticket-info-item">
                    <span className="ud-ticket-info-label">VENUE</span>
                    <span className="ud-ticket-info-value flex items-center gap-1.5">
                      <MapPin size={13} style={{ color: theme.accent }} />
                      {event.location || "Online"}
                    </span>
                  </div>

                  <div className="ud-ticket-info-item">
                    <span className="ud-ticket-info-label">GATE / ENTRY</span>
                    <span className="ud-ticket-info-value">GENERAL</span>
                  </div>

                  {selectedSeat && (
                    <div className="ud-ticket-info-item">
                      <span className="ud-ticket-info-label">SEAT</span>
                      <span className="ud-ticket-info-value flex items-center gap-1" style={{ color: "#fbbf24", fontWeight: "bold" }}>
                        {selectedSeat.seatLabel.split(" - ").pop()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Attendee Details */}
                <div className="ud-ticket-attendee">
                  <div className="ud-ticket-info-item">
                    <span className="ud-ticket-info-label">ATTENDEE</span>
                    <span className="ud-ticket-info-value flex items-center gap-1.5 font-semibold text-white">
                      <User size={13} style={{ color: theme.accent }} />
                      {user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Eventra Guest"}
                    </span>
                  </div>
                  
                  <div className="ud-ticket-info-item">
                    <span className="ud-ticket-info-label">EMAIL</span>
                    <span className="ud-ticket-info-value flex items-center gap-1.5 text-xs text-zinc-300">
                      <Mail size={12} style={{ color: theme.accent }} />
                      {user?.email || "guest@eventra.com"}
                    </span>
                  </div>
                </div>

                {selectedSeat && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSeatMap(true);
                    }}
                    className="mt-4 w-full py-2 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                    style={{ marginTop: "1rem", cursor: "pointer" }}
                  >
                    <Map size={14} className="text-amber-400 animate-pulse" />
                    <span>View Seat Location</span>
                  </button>
                )}
              </div>

              {/* Perforation Divider */}
              <div className="ud-ticket-divider-container">
                <div className="ud-ticket-notch notch-left" />
                <div className="ud-ticket-perforation" />
                <div className="ud-ticket-notch notch-right" />
              </div>

              {/* QR Stub Footer */}
              <div className="ud-ticket-footer">
                <div className="ud-ticket-qr-wrap">
                  <div className="ud-ticket-qr-border flex items-center justify-center bg-zinc-950/20 dark:bg-white/5 rounded-xl border border-white/10" style={{ width: 110, height: 110 }}>
                    {loadingToken ? (
                      <Loader2 className="w-6 h-6 animate-spin text-white opacity-70" />
                    ) : isOffline && !qrToken ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                        <QRCode
                          value={registration?.registrationId || serialNumber}
                          size={80}
                          bgColor="transparent"
                          fgColor="#ffffff"
                          className="ud-ticket-qr"
                        />
                      </div>
                    ) : tokenError ? (
                      <div className="text-[10px] text-rose-500 dark:text-rose-400 font-bold text-center px-1">
                        Secure QR Unavailable
                      </div>
                    ) : (
                      <QRCode 
                        value={qrToken || registration?.qrToken || registration?.registrationId || serialNumber} 
                        size={90} 
                        bgColor="transparent" 
                        fgColor="#ffffff"
                        className="ud-ticket-qr"
                      />
                    )}
                  </div>
                </div>
                
                <div className="ud-ticket-stub-details">
                  <div className="ud-ticket-serial">{serialNumber}</div>
                  <div className="ud-ticket-status">
                    <ShieldCheck size={14} className={isOffline ? "text-amber-400 animate-pulse" : "text-emerald-400 animate-pulse"} />
                    <span>{isOffline ? "CACHED TICKET" : "SECURE VALID PASS"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back of Card (Schedule, Guidelines, Interactive Map) */}
            <div className="ud-ticket-card-face ud-ticket-card-back">
              <div className={`ud-ticket-back-header bg-linear-to-r ${theme.primary}`}>
                <div className="ud-ticket-logo-overlay">
                  <span className="ud-ticket-logo-dot" />
                  <span className="ud-ticket-logo-text">Eventra Info</span>
                </div>
                <div className="ud-ticket-back-title">SCHEDULE & INFO</div>
              </div>

              <div className="ud-ticket-body flex-1 justify-between">
                <div className="space-y-4">
                  <div className="ud-ticket-info-item">
                    <span className="ud-ticket-info-label flex items-center gap-1">
                      <Sparkles size={11} style={{ color: theme.accent }} />
                      EVENT AGENDA
                    </span>
                    <ul className="ud-ticket-agenda-list mt-1 space-y-2 text-xs text-zinc-300">
                      <li className="flex justify-between items-center border-b border-white/5 pb-1">
                        <span>1. Welcome & Keynote</span>
                        <span className="text-zinc-400 font-semibold">10:00 AM</span>
                      </li>
                      <li className="flex justify-between items-center border-b border-white/5 pb-1">
                        <span>2. Technical Deep-Dive</span>
                        <span className="text-zinc-400 font-semibold">11:30 AM</span>
                      </li>
                      <li className="flex justify-between items-center border-b border-white/5 pb-1">
                        <span>3. Interactive Q&A</span>
                        <span className="text-zinc-400 font-semibold">02:00 PM</span>
                      </li>
                    </ul>
                  </div>

                  <div className="ud-ticket-info-item">
                    <span className="ud-ticket-info-label flex items-center gap-1">
                      <Map size={11} style={{ color: theme.accent }} />
                      DIRECTIONS
                    </span>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                      {event.location ? `Join offline at ${event.location}. Please arrive 15 minutes early for check-in.` : "This is a virtual event. Check-in online using the unique QR code."}
                    </p>
                  </div>
                </div>

                <div className="ud-ticket-back-footer mt-auto pt-4 border-t border-white/5 flex flex-col items-center gap-2">
                  <div className="ud-ticket-serial text-center text-xs opacity-75">{serialNumber}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest text-center">
                    Powered by Eventra Engine
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seating Map Modal Popup */}
      <AnimatePresence>
        {showSeatMap && selectedSeat && (
          <div 
            className="ud-ticket-modal-overlay"
            style={{ 
              zIndex: 1000, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              position: "fixed", 
              inset: 0, 
              background: "rgba(0,0,0,0.85)", 
              backdropFilter: "blur(8px)" 
            }}
            onClick={() => setShowSeatMap(false)}
          >
            <div 
              className="relative max-w-xl w-full mx-4 bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
              style={{ padding: "1.5rem" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "16px" }}>
                    <MapPin size={18} className="text-amber-400" />
                    Venue Seat Location
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5" style={{ fontSize: "11px", color: "#a1a1aa", marginTop: "2px" }}>Your exact allocated seat is pulsing in a glowing golden radar overlay</p>
                </div>
                <button 
                  onClick={() => setShowSeatMap(false)}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  style={{ cursor: "pointer", background: "#18181b", border: "1px solid #27272a", borderRadius: "8px", padding: "6px", color: "#a1a1aa" }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ background: "#05050a", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                <SpatialSeatSelector
                  eventId={event.id}
                  selectedSeat={selectedSeat}
                  readOnly={true}
                />
              </div>

              <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-3 text-xs text-amber-400" style={{ marginTop: "1rem", padding: "1rem", borderRadius: "12px", background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.15)", display: "flex", gap: "0.75rem", fontSize: "12px", color: "#fbbf24" }}>
                <Sparkles size={16} className="shrink-0" />
                <div>
                  <span className="font-bold">Allocated Seat: </span>
                  {selectedSeat.seatLabel} ({selectedSeat.tier})
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventTicket;
