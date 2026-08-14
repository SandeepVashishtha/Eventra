import { logger } from "./logger.js";
import { jsPDF } from "jspdf";

export const exportTicketToPdf = async (event, userData) => {
  if (!event || typeof event !== "object") {
    logger.error("exportTicketToPdf called with invalid event object");
    return false;
  }

  logger.log("Generating PDF Ticket for:", event?.title);

  const doc = new jsPDF();

  const title = String(event.title || "Unknown Event").slice(0, 80);
  const attendee = String(userData?.name || userData?.email || "Guest").slice(0, 60);
  const location = String(event.location || "Virtual").slice(0, 60);

  let eventDate;
  if (event.date) {
    const parsed = new Date(event.date);
    eventDate = !Number.isNaN(parsed.getTime())
      ? parsed.toLocaleDateString()
      : String(event.date);
  } else {
    eventDate = "TBD";
  }

  const ticketId = String(event.id || Date.now());

  doc.setFontSize(22);
  doc.text("Eventra Event Ticket", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Event: ${title}`, 20, 50);
  doc.text(`Attendee: ${attendee}`, 20, 65);
  doc.text(`Location: ${location}`, 20, 80);
  doc.text(`Date: ${eventDate}`, 20, 95);

  doc.setFontSize(10);
  doc.text("Present this ticket at the entry scanner. Thank you for using Eventra!", 105, 120, { align: "center" });

  doc.save(`Eventra_Ticket_${ticketId}.pdf`);

  return true;
};
