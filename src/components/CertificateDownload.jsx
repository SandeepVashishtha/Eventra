import React from 'react';
import jsPDF from 'jspdf';
import { useAuth } from '../context/AuthContext';

const CertificateDownload = ({ eventName, eventDate, eventType }) => {
  const { user } = useAuth();

  // Guard Clause: Prevent execution and handle null/undefined user safely
  if (!user) {
    return (
      <button
        disabled
        className="w-full py-2 px-4 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg font-semibold text-center cursor-not-allowed"
      >
        🔒 Login to Download Certificate
      </button>
    );
  }

  const generateCertificate = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4');

    // Background
    doc.setFillColor(10, 15, 30);
    doc.rect(0, 0, 297, 210, 'F');

    // Border
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);

    // Title
    doc.setTextColor(99, 102, 241);
    doc.setFontSize(28);
    doc.text('Certificate of Participation', 148, 45, { align: 'center' });

    // Subtitle 1
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.text('This is proudly presented to', 148, 70, { align: 'center' });

    // Participant Name (Safe from crashes due to the guard clause above)
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const participantName = `${firstName} ${lastName}`.trim() || 'Guest Participant';
    doc.setFontSize(26);
    doc.setTextColor(99, 102, 241);
    doc.text(participantName, 148, 90, { align: 'center' });

    // Subtitle 2
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.text('for active participation in the event', 148, 112, { align: 'center' });

    // Event Name
    doc.setFontSize(24);
    doc.setTextColor(99, 102, 241);
    doc.text(eventName, 148, 130, { align: 'center' });

    // Event Type & Date
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(`Event Type: ${eventType}`, 148, 150, { align: 'center' });
    doc.text(`Date: ${eventDate}`, 148, 164, { align: 'center' });

    // Footer
    doc.setFontSize(11);
    doc.setTextColor(150, 150, 150);
    doc.text('Eventra - Event Management Platform', 148, 190, { align: 'center' });

    doc.save(`${eventName}_Certificate.pdf`);
  };

  return (
    <button
      onClick={generateCertificate}
      className="w-full py-2 px-4 flex items-center justify-center gap-2 border border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg font-semibold text-center cursor-pointer transition-all duration-300"
    >
      📜 Download Certificate
    </button>
  );
};

export default CertificateDownload;