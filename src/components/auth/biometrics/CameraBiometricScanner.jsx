import React, { useState } from "react";
import { Camera, RefreshCw, CheckCircle, Shield } from "lucide-react";
import { getFaceMeshWorkerSource } from "../../../utils/wasm/facemesh/meshVerifierWorker";
import FaceMeshOverlay from "./FaceMeshOverlay";

export default function CameraBiometricScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const startFaceScan = () => {
    setScanning(true);
    setResult(null);

    try {
      const code = getFaceMeshWorkerSource();
      const blob = new Blob([code], { type: "application/javascript" });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);

      worker.onmessage = (e) => {
        setResult(e.data);
        setScanning(false);
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
      };

      // Mock coordinates input data simulating camera tracking results
      worker.postMessage({
        baselineMesh: [{ x: 10, y: 15 }, { x: 20, y: 25 }],
        scanMesh: [{ x: 10.5, y: 14.8 }, { x: 19.8, y: 25.2 }],
      });
    } catch (e) {
      console.error(e);
      setScanning(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">Biometric Face Check-in Scanner</span>
        </div>
        <button
          onClick={startFaceScan}
          disabled={scanning}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
        >
          <Camera className="w-3.5 h-3.5" /> {scanning ? "Scanning Frame..." : "Start Camera scan"}
        </button>
      </div>

      <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 flex items-center justify-center border border-gray-150 dark:border-gray-800">
        {scanning && <FaceMeshOverlay />}
        {result && (
          <div className="absolute inset-0 bg-slate-900/90 flex flex-col justify-center items-center space-y-2 z-10 animate-fade-in text-center">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <h3 className="text-sm font-bold">Verification Successful</h3>
            <span className="font-mono text-[10px] text-gray-400">Match score: {result.score.toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
