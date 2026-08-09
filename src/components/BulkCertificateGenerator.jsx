import { useState } from "react";
import { toast } from "react-toastify";
import { generateCertificatePDF } from "./CertificateDownload";

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
      for (let i = 0; i < attendees.length; i++) {
        const attendee = attendees[i];
        const participantName = `${attendee.firstName || ""} ${attendee.lastName || attendee.name || ""}`.trim() || "Participant";
        const doc = generateCertificatePDF({ participantName, eventName, eventDate, eventType, organizerName, template });
        const safeFileName = `${participantName.replace(/[^a-zA-Z0-9]/g, "_")}_${(eventName || "Event").replace(/[^a-zA-Z0-9]/g, "_")}_Certificate.pdf`;
        doc.save(safeFileName);
        setProgress(i + 1);
        toast.update(toastId, { render: `Generating ${i + 1}/${attendees.length} certificates...` });
        await new Promise(r => setTimeout(r, 100));
      }
      toast.update(toastId, { render: `✅ ${attendees.length} certificates generated!`, type: "success", isLoading: false, autoClose: 4000 });
    } catch (err) {
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
            style={{ width: `${(progress / attendees.length) * 100}%` }} />
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