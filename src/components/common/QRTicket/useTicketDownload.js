/**
 * useTicketDownload.js
 * Hook to download a ticket element as PNG or PDF.
 *
 * Usage:
 * const { downloading, downloadPNG, downloadPDF } = useTicketDownload(ticketRef, ticketId);
 */

import { useState, useCallback, useRef, useEffect } from "react";
import toast from 'react-hot-toast';

export function useTicketDownload(ticketRef, ticketId = "ticket") {
  const [downloading, setDownloading] = useState(false);
  
  // Deep Fix 1 & 2: Refs for unmounted leak protection and synchronous concurrency locking
  const isMounted = useRef(true);
  const isProcessingLock = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

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
    // Deep Fix 2: Synchronous lock prevents double-click OOM crashes on mobile
    if (isProcessingLock.current) return;
    
    isProcessingLock.current = true;
    if (isMounted.current) setDownloading(true);
    
    try {
      const canvas = await captureCanvas();
      
      // Use toBlob instead of toDataURL to prevent massive base64 memory allocation
      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Canvas rendering failed");
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `eventra-ticket-${ticketId}.png`;
        link.href = url;
        link.click();
        
        // Deep Fix 3: Defer revocation to prevent WebKit/Safari silent download failures
        setTimeout(() => URL.revokeObjectURL(url), 150);
      }, "image/png");
    } catch (err) {
      console.error("[QRTicket] PNG download failed:", err);
      toast.error("Failed to generate PNG. Please try again.");
    } finally {
      isProcessingLock.current = false;
      // Deep Fix 1: Prevent memory leak if modal was closed during async generation
      if (isMounted.current) setDownloading(false);
    }
  }, [captureCanvas, ticketId]);

  /** Download ticket as PDF */
  const downloadPDF = useCallback(async () => {
    if (isProcessingLock.current) return;
    
    isProcessingLock.current = true;
    if (isMounted.current) setDownloading(true);
    
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
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      isProcessingLock.current = false;
      if (isMounted.current) setDownloading(false);
    }
  }, [captureCanvas, ticketId]);

  return { downloading, downloadPNG, downloadPDF };
}