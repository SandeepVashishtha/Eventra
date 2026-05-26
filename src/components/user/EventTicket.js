import React, { useRef, useState } from "react";
import { X, Download, ShieldCheck, Calendar, MapPin, Clock, User, Mail, Award, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";

const EventTicket = ({ event, user, onClose }) => {
  const ticketRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  // Generate a mock ticket serial code based on event and user details
  const generateSerial = () => {
    const eventPart = (event?.title || "EVT").slice(0, 3).toUpperCase();
    const userPart = (user?.firstName || user?.username || "USR").slice(0, 3).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${eventPart}-${userPart}-${randomPart}`;
  };

  const serialNumber = useRef(generateSerial());

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    toast.info("Generating your high-resolution ticket...");

    try {
      // Small timeout to ensure image rendering and style stability
      await new Promise((resolve) => setTimeout(resolve, 600));

      const canvas = await html2canvas(ticketRef.current, {
        scale: 3, // Premium quality magnification
        useCORS: true, // Handle cross-origin image requests
        allowTaint: true,
        backgroundColor: null, // Keeps background transparency if any
        logging: false,
        onclone: (clonedDoc) => {
          // Adjust specific styles in the cloned element if needed
          const clonedTicket = clonedDoc.querySelector("[data-ticket-root]");
          if (clonedTicket) {
            clonedTicket.style.boxShadow = "none";
            clonedTicket.style.transform = "none";
          }
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const cleanTitle = (event?.title || "ticket").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      
      link.download = `eventra-ticket-${cleanTitle}.png`;
      link.href = imgData;
      link.click();
      
      toast.success("Ticket downloaded successfully!");
    } catch (error) {
      console.error("Ticket download error:", error);
      toast.error("Failed to generate ticket image. Please try again.");
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
          <button 
            onClick={handleDownload} 
            disabled={downloading}
            className="ud-ticket-action-btn download-btn"
            title="Download Ticket"
          >
            {downloading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span>{downloading ? "Exporting..." : "Download"}</span>
          </button>
          
          <button 
            onClick={onClose} 
            className="ud-ticket-action-btn close-btn"
            title="Close Ticket"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Outer frame to capture - encapsulates ticket contents cleanly */}
        <div className="ud-ticket-capture-frame" ref={ticketRef}>
          {/* Main Ticket Layout */}
          <div className="ud-ticket-card" data-ticket-root>
            
            {/* Header / Graphic banner */}
            <div className="ud-ticket-header">
              <div className="ud-ticket-header-gradient" />
              {event.image && (
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="ud-ticket-header-img"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    // Fallback to visual gradient if image fails or CORS blocks
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="ud-ticket-logo-overlay">
                <span className="ud-ticket-logo-dot" />
                <span className="ud-ticket-logo-text">Eventra</span>
              </div>
              <div className="ud-ticket-category">
                <Award size={12} className="mr-1" />
                <span>OFFICIAL PASS</span>
              </div>
            </div>

            {/* Event Details Section */}
            <div className="ud-ticket-body">
              <h2 className="ud-ticket-title">{event.title}</h2>
              
              <div className="ud-ticket-grid">
                <div className="ud-ticket-info-item">
                  <span className="ud-ticket-info-label">DATE</span>
                  <span className="ud-ticket-info-value flex items-center gap-1.5">
                    <Calendar size={13} className="text-indigo-500" />
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
                    <Clock size={13} className="text-indigo-500" />
                    {event.time || "TBA"}
                  </span>
                </div>

                <div className="ud-ticket-info-item">
                  <span className="ud-ticket-info-label">VENUE</span>
                  <span className="ud-ticket-info-value flex items-center gap-1.5">
                    <MapPin size={13} className="text-indigo-500" />
                    {event.location || "Online"}
                  </span>
                </div>

                <div className="ud-ticket-info-item">
                  <span className="ud-ticket-info-label">GATE / ENTRY</span>
                  <span className="ud-ticket-info-value">GENERAL</span>
                </div>
              </div>

              {/* Attendee Details */}
              <div className="ud-ticket-attendee">
                <div className="ud-ticket-info-item">
                  <span className="ud-ticket-info-label">ATTENDEE</span>
                  <span className="ud-ticket-info-value flex items-center gap-1.5 font-semibold text-white">
                    <User size={13} className="text-pink-500" />
                    {user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Eventra Guest"}
                  </span>
                </div>
                
                <div className="ud-ticket-info-item">
                  <span className="ud-ticket-info-label">EMAIL</span>
                  <span className="ud-ticket-info-value flex items-center gap-1.5 text-xs text-zinc-300">
                    <Mail size={12} className="text-pink-500" />
                    {user?.email || "guest@eventra.com"}
                  </span>
                </div>
              </div>
            </div>

            {/* Aesthetic Tear-Off Perforation Divider */}
            <div className="ud-ticket-divider-container">
              <div className="ud-ticket-notch notch-left" />
              <div className="ud-ticket-perforation" />
              <div className="ud-ticket-notch notch-right" />
            </div>

            {/* QR Code / Stub Section */}
            <div className="ud-ticket-footer">
              <div className="ud-ticket-qr-wrap">
                <div className="ud-ticket-qr-border">
                  <QRCode 
                    value={JSON.stringify({
                      ticketId: serialNumber.current,
                      eventId: event.id,
                      eventName: event.title,
                      userId: user?.id || "anonymous",
                      userName: user?.fullName || "Guest"
                    })} 
                    size={110} 
                    bgColor="transparent" 
                    fgColor="currentColor"
                    className="ud-ticket-qr"
                  />
                </div>
              </div>
              
              <div className="ud-ticket-stub-details">
                <div className="ud-ticket-serial">{serialNumber.current}</div>
                <div className="ud-ticket-status">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>SECURE VALID PASS</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventTicket;
