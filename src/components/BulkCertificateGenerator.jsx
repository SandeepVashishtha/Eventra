import { useState } from "react";
import { toast } from "react-toastify";
import { generateCertificatePDF } from "./CertificateDownload";
import JSZip from "jszip";

const TEMPLATES = ["classic", "elegant", "modern"];

const BulkCertificateGenerator = ({ eventName, eventDate, eventType, organizerName, attendees = [] }) => {
  const [template, setTemplate] = useState("classic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!attendees.length) return null;

  const handleBulkGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setProgress(0);
    const toastId = toast.loading(`Generating 0/${attendees.length} certificates...`);

    try {
      const zip = new JSZip();
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < attendees.length; i++) {
        try {
          const attendee = attendees[i] || {};
          const participantName = `${attendee.firstName || ""} ${attendee.lastName || attendee.name || ""}`.trim() || "Participant";
          const doc = generateCertificatePDF({ participantName, eventName, eventDate, eventType, organizerName, template });
          const baseName = participantName.replace(/[^a-zA-Z0-9]/g, "_");
          const safeEventName = (eventName || "Event").replace(/[^a-zA-Z0-9]/g, "_");
          let safeFileName = `${baseName}_${safeEventName}_Certificate.pdf`;
          
          let counter = 1;
          while (zip.file(safeFileName)) {
            safeFileName = `${baseName}_${safeEventName}_Certificate_${counter}.pdf`;
            counter++;
          }
          
          const pdfBlob = doc.output("blob");
          zip.file(safeFileName, pdfBlob);
          successCount++;
        } catch (err) {
          console.error(`Failed to generate certificate for attendee at index ${i}:`, err);
          failureCount++;
        }

        setProgress(i + 1);
        toast.update(toastId, { render: `Generating ${i + 1}/${attendees.length} certificates...` });
        await new Promise(r => setTimeout(r, 50));
      }

      if (successCount === 0) {
        toast.update(toastId, { render: "❌ Failed to generate any certificates.", type: "error", isLoading: false, autoClose: 4000 });
        return;
      }

      toast.update(toastId, { render: "Packaging certificates into ZIP..." });
      const zipContent = await zip.generateAsync({ type: "blob" });
      const safeEventName = (eventName || "Event").replace(/[^a-zA-Z0-9]/g, "_");
      const zipFileName = `${safeEventName}_Certificates.zip`;

      const url = URL.createObjectURL(zipContent);
      const link = document.createElement("a");
      link.href = url;
      link.download = zipFileName;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(url), 100);

      const statusMsg = failureCount > 0
        ? `⚠️ Generated ${successCount}/${attendees.length} certificates (${failureCount} failed)`
        : `✅ ${attendees.length} certificates generated and downloaded!`;

      toast.update(toastId, { render: statusMsg, type: failureCount > 0 ? "warning" : "success", isLoading: false, autoClose: 4000 });
    } catch (error) {
      console.error(error);
      toast.update(toastId, { render: "Bulk generation failed.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bulk Certificate Generation</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{attendees.length} attendees selected</p>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Template:</label>
        <div className="flex gap-2">
          {TEMPLATES.map(t => (
            <button key={t} onClick={() => setTemplate(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize border transition-all ${
                template === t
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {isGenerating && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${attendees.length > 0 ? (progress / attendees.length) * 100 : 0}%` }} />
        </div>
      )}

      <button onClick={handleBulkGenerate} disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
        {isGenerating ? `⏳ Generating ${progress}/${attendees.length}...` : `📜 Generate All ${attendees.length} Certificates`}
      </button>
    </div>
  );
};

export default BulkCertificateGenerator;