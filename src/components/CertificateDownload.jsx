import jsPDF from 'jspdf';

const CertificateDownload = ({ eventName, eventDate, eventType }) => {

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
    doc.text('Certificate of Participation', 148, 50, { align: 'center' });

    // Subtitle
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('This certifies participation in', 148, 80, { align: 'center' });

    // Event Name
    doc.setFontSize(26);
    doc.setTextColor(99, 102, 241);
    doc.text(eventName, 148, 105, { align: 'center' });

    // Event Type & Date
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(`Event Type: ${eventType}`, 148, 130, { align: 'center' });
    doc.text(`Date: ${eventDate}`, 148, 148, { align: 'center' });

    // Footer
    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    doc.text('Eventra - Event Management Platform', 148, 185, { align: 'center' });

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