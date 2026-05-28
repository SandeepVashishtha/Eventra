import React from "react";
import jsPDF from "jspdf";
import { useAuth } from "../context/AuthContext";

const CertificateDownload = ({ eventName, eventDate, eventType }) => {
  const { user } = useAuth();

  if (!user) {
    return (
  <span className="inline-flex items-center justify-center">
    {"🔒"} Login to Download Certificate
  </span>
);
  }

  const generateCertificate = () => {
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
    doc.save(`${eventName}_Certificate.pdf`);
  };

  return (
  <button onClick={generateCertificate} aria-label="button">
    📜 Download Certificate
  </button>
);
};

export default CertificateDownload;
