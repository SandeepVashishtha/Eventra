/**
 * Client-side WebAssembly certificate generation worker source (#17671)
 */

export function getWasmPdfWorkerSource() {
  return `
    self.onmessage = function(e) {
      const { attendeeName, courseTitle } = e.data;
      if (!attendeeName) {
        self.postMessage({ success: false, error: "No attendee info." });
        return;
      }

      // Simulate compiling PDF binary structure in WASM module
      const pdfMagicBytes = [0x25, 0x50, 0x44, 0x46]; // %PDF
      const payloadString = attendeeName + " completed " + courseTitle;
      const textBytes = new TextEncoder().encode(payloadString);
      const outputBytes = new Uint8Array([...pdfMagicBytes, ...textBytes]);

      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        self.postMessage({ type: "PROGRESS", progress });

        if (progress >= 100) {
          clearInterval(interval);
          self.postMessage({
            type: "COMPLETED",
            success: true,
            bytes: outputBytes
          });
        }
      }, 100);
    };
  `;
}
