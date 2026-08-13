/**
 * Keynote background Web Worker containing frame stream worker mappings (#16471)
 */

export function getKeynoteStreamWorkerSource() {
  return `
    let streamPort = null;

    self.onmessage = function(e) {
      const { type, port } = e.data;
      
      if (type === "INIT_PORT") {
        streamPort = port;
        streamPort.onmessage = function(event) {
          // Process raw frame data safely
          streamPort.postMessage({ type: "FRAME_PROCESSED" });
        };
      }

      if (type === "TERMINATE_PORT") {
        if (streamPort) {
          streamPort.onmessage = null;
          streamPort.close();
          streamPort = null;
        }
      }
    };
  `;
}
