import React, { useState } from "react";
import { FileText, Cpu, Download } from "lucide-react";
import { getPdfWorkerCode } from "../../../utils/pdf/pdfWorkerCompiler";
import TemplateSelector from "./TemplateSelector";

export default function ReportExportPanel() {
  const [compiling, setCompiling] = useState(false);
  const [template, setTemplate] = useState("classic");

  const compilePdfReport = () => {
    setCompiling(true);

    try {
      const code = getPdfWorkerCode();
      const blob = new Blob([code], { type: "application/javascript" });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);

      worker.onmessage = (e) => {
        setCompiling(false);
        alert("WASM Offscreen compiler finished! Bytes downloaded: " + e.data.bytes.length);
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
      };

      worker.postMessage({
        reportData: { totalRevenue: 15400, registrations: 340 },
        templateName: template,
      });
    } catch (e) {
      console.error(e);
      setCompiling(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">WASM PDF Report Exporter</span>
        </div>
        <button
          onClick={compilePdfReport}
          disabled={compiling}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
        >
          <Cpu className="w-3.5 h-3.5" />
          {compiling ? "Compiling PDF..." : "Compile Report"}
        </button>
      </div>

      <TemplateSelector template={template} setTemplate={setTemplate} />
    </div>
  );
}
