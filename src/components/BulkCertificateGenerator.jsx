import { useState } from "react";
import { toast } from "react-toastify";
import { generateCertificatePDF } from "./CertificateDownload";

const TEMPLATES = ["classic", "elegant", "modern"];

const BulkCertificateGenerator = ({
  eventName,
  eventDate,
  eventType,
  organizerName,
  attendees = [],
}) => {
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
        const participantName =
          `${attendee.firstName || ""} ${attendee.lastName || attendee.name || ""}`.trim() ||
          "Participant";
        const doc = generateCertificatePDF({
          participantName,
          eventName,
          eventDate,
          eventType,
          organizerName,
          template,
        });
        const safeFileName = `${participantName.replace(/[^a-zA-Z0-9]/g, "_")}_${(eventName || "Event").replace(/[^a-zA-Z0-9]/g, "_")}_Certificate.pdf`;
        doc.save(safeFileName);
        setProgress(i + 1);
        toast.update(toastId, {
          render: `Generating ${i + 1}/${attendees.length} certificates...`,
        });
        await new Promise((r) => setTimeout(r, 100));
      }
      toast.update(toastId, {
        render: `✅ ${attendees.length} certificates generated!`,
        type: "success",
        isLoading: false,
        autoClose: 4000,
      });
    } catch (err) {
      toast.update(toastId, {
        render: "Bulk generation failed.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Bulk Certificate Generation
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {attendees.length} attendees selected
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Template:</label>
        <div className="flex gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t}
              onClick={() => setTemplate(t)}
              className={`rounded-lg border px-3 py-1 text-xs font-medium capitalize transition-all ${
                template === t
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-gray-300 bg-white text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {isGenerating && (
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${(progress / attendees.length) * 100}%` }}
          />
        </div>
      )}

      <button
        onClick={handleBulkGenerate}
        disabled={isGenerating}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating
          ? `⏳ Generating ${progress}/${attendees.length}...`
          : `📜 Generate All ${attendees.length} Certificates`}
      </button>
    </div>
  );
};

export default BulkCertificateGenerator;
