import { useEffect } from "react";
import { getKeynoteStreamWorkerSource } from "../components/video/KeynoteWorkerStream";

export default function useWorkerStream(active = false) {
  useEffect(() => {
    if (!active || typeof window === "undefined" || typeof Worker === "undefined") return;

    let worker = null;
    let workerUrl = null;
    let channel = null;

    try {
      const code = getKeynoteStreamWorkerSource();
      const blob = new Blob([code], { type: "application/javascript" });
      workerUrl = URL.createObjectURL(blob);
      worker = new Worker(workerUrl);

      channel = new MessageChannel();
      worker.postMessage({ type: "INIT_PORT", port: channel.port2 }, [channel.port2]);

    } catch (e) {
      console.warn("Failed to initiate worker stream:", e);
    }

    return () => {
      // Explicitly cleanup port reference allocations to prevent tab memory leak locks (#16471)
      if (worker) {
        worker.postMessage({ type: "TERMINATE_PORT" });
        worker.terminate();
      }
      if (channel && channel.port1) {
        channel.port1.close();
      }
      if (workerUrl) {
        URL.revokeObjectURL(workerUrl);
      }
    };
  }, [active]);
}
