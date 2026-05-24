import React from "react";
import jsPDF from "jspdf";
import { useAuth } from "../context/AuthContext";

const CertificateDownload = ({ eventName, eventDate, eventType }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <span className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        Login to Download Certificate
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
    doc.text("Certificate of Participation", 148, 45, { align: "center" });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.text("This is proudly presented to", 148, 70, { align: "center" });

    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const participantName = `${firstName} ${lastName}`.trim() || "Guest Participant";

    doc.setFontSize(26);
    doc.setTextColor(99, 102, 241);
    doc.text(participantName, 148, 90, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.text("for active participation in the event", 148, 112, { align: "center" });
    doc.setFontSize(24);
    doc.setTextColor(99, 102, 241);
    doc.text(eventName, 148, 130, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(`Event Type: ${eventType}`, 148, 150, { align: "center" });
    doc.text(`Date: ${eventDate}`, 148, 164, { align: "center" });
    doc.setFontSize(11);
    doc.setTextColor(150, 150, 150);
    doc.text("Eventra - Event Management Platform", 148, 190, { align: "center" });
    doc.save(`${eventName}_Certificate.pdf`);
  };

  return (
    <button
      type="button"
      onClick={generateCertificate}
      className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
    >
      Download Certificate
    </button>
  );
};

export default CertificateDownload;
