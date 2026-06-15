import { logger } from "./logger.js";
import { jsPDF } from "jspdf";

export const exportTicketToPdf = async (event, userData) => {
  logger.log("Generating PDF Ticket for:", event?.title);

  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("Eventra Ticket", 105, 20, { align: "center" });

  doc.setFontSize(14);
  doc.text(`Event: ${event?.title || "Unknown Event"}`, 20, 50);
  doc.text(`Attendee: ${userData?.name || "Guest"}`, 20, 65);
  doc.text(`Location: ${event?.location || "Virtual"}`, 20, 80);
  doc.text(`Date: ${event?.date || new Date().toLocaleDateString()}`, 20, 95);

  doc.setFontSize(10);
  doc.text("Thank you for registering with Eventra!", 105, 120, { align: "center" });

  doc.save(`Eventra_Ticket_${event?.id || "event"}.pdf`);

  return true;
};
