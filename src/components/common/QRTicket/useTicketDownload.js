/**
 * useTicketDownload.js
 * Hook to download a ticket element as PNG or PDF.
 *
 * Usage:
 *   const { downloading, downloadPNG, downloadPDF } = useTicketDownload(ticketRef, ticketId);
 */

import { useState, useCallback } from "react";

export function useTicketDownload(ticketRef, ticketId = "ticket") {
  const [downloading, setDownloading] = useState(false);

  /** Captures the DOM node to a canvas via html2canvas */
  const captureCanvas = useCallback(async () => {
    const html2canvas = (await import("html2canvas")).default;
    const node = ticketRef.current;
    if (!node) throw new Error("Ticket ref not attached");

    return html2canvas(node, {
      scale: 3,           // 3× for crisp hi-DPI output
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });
  }, [ticketRef]);

  /** Download ticket as PNG */
  const downloadPNG = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const canvas = await captureCanvas();
      
      // Use toBlob instead of toDataURL to prevent massive base64 memory allocation
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `eventra-ticket-${ticketId}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (err) {
      console.error("[QRTicket] PNG download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [captureCanvas, downloading, ticketId]);

  /** Download ticket as PDF */
  const downloadPDF = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const canvas = await captureCanvas();
      const { jsPDF } = await import("jspdf");

      // Ticket dimensions in mm (340px wide at 96dpi ≈ 90mm)
      const pxToMm = (px) => (px * 25.4) / 96;
      const widthMm = pxToMm(canvas.width / 3);   // divide by scale
      const heightMm = pxToMm(canvas.height / 3);

      const pdf = new jsPDF({
        orientation: widthMm > heightMm ? "landscape" : "portrait",
        unit: "mm",
        format: [widthMm, heightMm],
      });

      // Pass the canvas directly to jsPDF instead of generating a massive base64 string
      pdf.addImage(canvas, "PNG", 0, 0, widthMm, heightMm);
      pdf.save(`eventra-ticket-${ticketId}.pdf`);
    } catch (err) {
      console.error("[QRTicket] PDF download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [captureCanvas, downloading, ticketId]);

  return { downloading, downloadPNG, downloadPDF };
}
