import { useState } from "react";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const CertificateDownload = ({ eventName, eventDate, eventType }) => {
  const { user } = useAuth();
  
  // 🔥 FIX: Added state to prevent spam-clicking and memory overload
  const [isGenerating, setIsGenerating] = useState(false);

  if (!user) {
    return (
      <span className="inline-flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
        {"🔒"} Login to Download Certificate
      </span>
    );
  }

  // 🔥 FIX: Made async to allow React to paint the loading state before locking the thread
  const generateCertificate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    const toastId = toast.loading("Generating your certificate...", { className: "custom-toast" });

    try {
      // Yield to the event loop so the UI updates to "Generating..."
      await new Promise(resolve => setTimeout(resolve, 50));

      const doc = new jsPDF("landscape", "mm", "a4");
      doc.setFillColor(10, 15, 30);
      doc.rect(0, 0, 297, 210, "F");
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(2);
      doc.rect(10, 10, 277, 190);
      doc.setTextColor(99, 102, 241);
      doc.setFontSize(28);
      doc.text("Certificate of Participation", 148, 45, { align: "center", maxWidth: 240 });
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.text("This is proudly presented to", 148, 70, { align: "center", maxWidth: 240 });

      const sanitizeText = (text, maxLength) => {
        const clean = String(text ?? "")
          .replace(/[\u200B-\u200D\uFEFF\u202A-\u202E]/g, "")
          .trim();
        return clean.length > maxLength ? clean.substring(0, maxLength) + "..." : clean;
      };

      const firstName = user.firstName || "";
      const lastName = user.lastName || "";
      const participantName = sanitizeText(`${firstName} ${lastName}`.trim() || "Guest Participant", 40);

      doc.setFontSize(26);
      doc.setTextColor(99, 102, 241);
      doc.text(participantName, 148, 90, { align: "center", maxWidth: 240 });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.text("for active participation in the event", 148, 112, { align: "center", maxWidth: 240 });
      doc.setFontSize(24);
      doc.setTextColor(99, 102, 241);
      doc.text(sanitizeText(eventName, 50), 148, 130, { align: "center", maxWidth: 240 });
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(`Event Type: ${eventType}`, 148, 150, { align: "center", maxWidth: 240 });
      doc.text(`Date: ${eventDate}`, 148, 164, { align: "center", maxWidth: 240 });
      doc.setFontSize(11);
      doc.setTextColor(150, 150, 150);
      doc.text("Eventra - Event Management Platform", 148, 190, { align: "center", maxWidth: 240 });

      // 🔥 FIX: Strip illegal OS characters (/, \, :, *, ?, ", <, >, |) to prevent download crashes
      const safeFileName = `${sanitizeText(eventName || "Event", 30).replace(/[^a-zA-Z0-9]/g, "_")}_Certificate.pdf`;
      doc.save(safeFileName);

      toast.update(toastId, { render: "Certificate downloaded!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (error) {
      console.error("Certificate generation failed:", error);
      toast.update(toastId, { render: "Failed to generate certificate.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button 
      onClick={generateCertificate} 
      disabled={isGenerating}
      aria-label="Download participation certificate"
      // 🔥 FIX: Added proper disabled states and basic Tailwind to match app UI
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isGenerating ? "⏳ Generating..." : "📜 Download Certificate"}
    </button>
  );
};

export default CertificateDownload;