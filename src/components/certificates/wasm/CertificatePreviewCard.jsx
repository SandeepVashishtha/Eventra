import React, { useState } from "react";
import { Award, Cpu } from "lucide-react";
import { getWasmPdfWorkerSource } from "../../../utils/pdf/wasmPdfWorker";
import GeneratorStatusIndicator from "./GeneratorStatusIndicator";

export default function CertificatePreviewCard({ name = "John Doe", eventName = "Web3 Hackfest 2026" }) {
  const [progress, setProgress] = useState(0);
  const [generating, setGenerating] = useState(false);

  const startPdfGeneration = () => {
    setGenerating(true);
    setProgress(0);

    try {
      const code = getWasmPdfWorkerSource();
      const blob = new Blob([code], { type: "application/javascript" });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);

      worker.onmessage = (e) => {
        if (e.data.type === "PROGRESS") {
          setProgress(e.data.progress);
        } else if (e.data.type === "COMPLETED") {
          setGenerating(false);
          alert("Certificate compiled successfully! Download size: " + e.data.bytes.length + " bytes");
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
        }
      };

      worker.postMessage({ attendeeName: name, courseTitle: eventName });
    } catch (e) {
      console.error(e);
      setGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white space-y-4 select-none">
      <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-3">
        <span className="font-bold flex items-center gap-1.5">
          <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Certificate Center
        </span>
        <button
          onClick={startPdfGeneration}
          disabled={generating}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
        >
          <Cpu className="w-3.5 h-3.5" /> {generating ? "Generating..." : "Compile Certificate"}
        </button>
      </div>

      <div className="relative aspect-[4/3] rounded-3xl bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center text-center p-6 border border-dashed border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-widest mb-1">Certificate of Completion</h2>
        <p className="text-[10px] text-gray-400">proudly presented to</p>
        <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 my-2">{name}</div>
        <p className="text-[10px] text-gray-400">for active participation and completion of</p>
        <div className="font-bold my-1 text-gray-700 dark:text-gray-200">{eventName}</div>
      </div>

      {generating && <GeneratorStatusIndicator progress={progress} />}
    </div>
  );
}
