import { useState } from "react";
import jsPDF from "jspdf";
import toast from 'react-hot-toast';
import { useAuth } from "../context/AuthContext";

const sanitizeText = (text, maxLength) => {
  const clean = String(text ?? "")
    .replace(/[\u200B-\u200D\uFEFF\u202A-\u202E]/g, "")
    .trim();
  return clean.length > maxLength ? clean.substring(0, maxLength) + "..." : clean;
};

const TEMPLATES = {
  classic: { bg: [10, 15, 30], accent: [99, 102, 241], text: [255, 255, 255] },
  elegant: { bg: [255, 255, 240], accent: [180, 130, 40], text: [30, 30, 30] },
  modern:  { bg: [15, 23, 42],  accent: [16, 185, 129], text: [255, 255, 255] },
};

export const generateCertificatePDF = ({ participantName, eventName, eventDate, eventType, organizerName, template = 'classic' }) => {
  const t = TEMPLATES[template] || TEMPLATES.classic;
  const doc = new jsPDF("landscape", "mm", "a4");

  doc.setFillColor(...t.bg);
  doc.rect(0, 0, 297, 210, "F");
  doc.setDrawColor(...t.accent);
  doc.setLineWidth(2);
  doc.rect(10, 10, 277, 190);

  doc.setTextColor(...t.accent);
  doc.setFontSize(28);
  doc.text("Certificate of Participation", 148, 45, { align: "center", maxWidth: 240 });

  doc.setTextColor(...t.text);
  doc.setFontSize(15);
  doc.text("This is proudly presented to", 148, 70, { align: "center", maxWidth: 240 });

  doc.setFontSize(26);
  doc.setTextColor(...t.accent);
  doc.text(sanitizeText(participantName || "Guest Participant", 40), 148, 90, { align: "center", maxWidth: 240 });

  doc.setTextColor(...t.text);
  doc.setFontSize(15);
  doc.text("for active participation in the event", 148, 112, { align: "center", maxWidth: 240 });

  doc.setFontSize(24);
  doc.setTextColor(...t.accent);
  doc.text(sanitizeText(eventName, 50), 148, 130, { align: "center", maxWidth: 240 });

  doc.setFontSize(12);
  doc.setTextColor(...t.text);
  doc.text(`Event Type: ${eventType || "Event"}`, 148, 150, { align: "center", maxWidth: 240 });
  doc.text(`Date: ${eventDate || ""}`, 148, 162, { align: "center", maxWidth: 240 });

  if (organizerName) {
    doc.text(`Organized by: ${sanitizeText(organizerName, 40)}`, 148, 174, { align: "center", maxWidth: 240 });
  }

  doc.setFontSize(11);
  doc.setTextColor(150, 150, 150);
  doc.text("Eventra - Event Management Platform", 148, 193, { align: "center", maxWidth: 240 });

  return doc;
};

const CertificateDownload = ({ eventName, eventDate, eventType, organizerName, template = 'classic' }) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!user) {
    return (
      <span className="inline-flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
        🔒 Login to Download Certificate
      </span>
    );
  }

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const toastId = toast.loading("Generating your certificate...");
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      const participantName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Guest Participant";
      const doc = generateCertificatePDF({ participantName, eventName, eventDate, eventType, organizerName, template });
      const safeFileName = `${sanitizeText(eventName || "Event", 30).replace(/[^a-zA-Z0-9]/g, "_")}_Certificate.pdf`;
      doc.save(safeFileName);
      toast.update(toastId, { render: "Certificate downloaded!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (err) {
      toast.update(toastId, { render: "Failed to generate certificate.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={isGenerating}
      aria-label="Download participation certificate"
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isGenerating ? "⏳ Generating..." : "📜 Download Certificate"}
    </button>
  );
};

export default CertificateDownload;