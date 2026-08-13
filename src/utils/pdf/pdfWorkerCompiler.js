/**
 * PDF compilation offscreen worker helper (#16278)
 */

export function getPdfWorkerCode() {
  return `
    self.onmessage = function(e) {
      const { reportData, templateName } = e.data;
      if (!reportData) {
        self.postMessage({ success: false, error: "No data payload provided." });
        return;
      }

      // Simulate generating PDF byte arrays
      const headerBytes = [0x25, 0x50, 0x44, 0x46]; // %PDF
      const mockPdfBytes = new Uint8Array([...headerBytes, ...new TextEncoder().encode(JSON.stringify(reportData))]);
      
      self.postMessage({ success: true, pdfBlobUrl: "mock_pdf_blob_uri_123", bytes: mockPdfBytes });
    };
  `;
}
