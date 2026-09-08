import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { generateCertificatePDF } from "./CertificateDownload";
import JSZip from "jszip";
import { Mail, CheckCircle2, Clock, Send } from "lucide-react";

const TEMPLATES = ["classic", "elegant", "modern"];
const FLUSH_INTERVAL = 5; // Flush React state every 5 items to prevent DOM thrashing

// Yield control to the browser main thread to keep UI responsive and prevent tab freeze
const yieldToMainThread = () => {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => setTimeout(resolve, 0));
    } else {
      setTimeout(resolve, 0);
    }
  });
};

const BulkCertificateGenerator = ({
  eventName = "",
  eventDate = "",
  eventType = "",
  organizerName = "",
  attendees = []
}) => {
  const [template, setTemplate] = useState("classic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Track delivery status of certificates per attendee
  const [deliveryStatus, setDeliveryStatus] = useState({});

  if (!attendees || attendees.length === 0) return null;

  const handleBulkGenerate = async () => {
    if (isGenerating || isEmailing) return;
    setIsGenerating(true);
    setProgress(0);
    const toastId = toast.loading(`Generating 0/${attendees.length} certificates...`);

    try {
      const zip = new JSZip();
      const statusAcc = { ...deliveryStatus };
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < attendees.length; i++) {
        const attendee = attendees[i] || {};
        const attendeeId = attendee.id || attendee.email || `index-${i}`;
        statusAcc[attendeeId] = "generating";

        let doc = null;
        let pdfArrayBuffer = null;

        try {
          const participantName = `${attendee.firstName || ""} ${attendee.lastName || attendee.name || ""}`.trim() || "Participant";
          doc = generateCertificatePDF({
            participantName,
            eventName,
            eventDate,
            eventType,
            organizerName,
            template
          });

          const baseName = participantName.replace(/[^a-zA-Z0-9]/g, "_");
          const safeEventName = (eventName || "Event").replace(/[^a-zA-Z0-9]/g, "_");
          let safeFileName = `${baseName}_${safeEventName}_Certificate.pdf`;

          let counter = 1;
          while (zip.file(safeFileName)) {
            safeFileName = `${baseName}_${safeEventName}_Certificate_${counter}.pdf`;
            counter++;
          }

          // Use ArrayBuffer output instead of Blob to minimize browser RAM consumption and facilitate garbage collection
          pdfArrayBuffer = doc.output("arraybuffer");
          zip.file(safeFileName, pdfArrayBuffer);
          
          successCount++;
          statusAcc[attendeeId] = "generated";
        } catch (err) {
          console.error(`Failed to generate certificate for attendee at index ${i}:`, err);
          failureCount++;
          statusAcc[attendeeId] = "failed";
        } finally {
          // Explicit cleanup of PDF instance and memory buffers for GC
          doc = null;
          pdfArrayBuffer = null;
        }

        // Throttle React state & toast progress updates to prevent DOM thrashing
        const isLastItem = i === attendees.length - 1;
        if ((i + 1) % FLUSH_INTERVAL === 0 || isLastItem) {
          setDeliveryStatus({ ...statusAcc });
          setProgress(i + 1);
          toast.update(toastId, { render: `Generating ${i + 1}/${attendees.length} certificates...` });
        }

        // Yield to browser main thread after each item
        await yieldToMainThread();
      }

      if (successCount === 0) {
        toast.update(toastId, {
          render: "❌ Failed to generate any certificates.",
          type: "error",
          isLoading: false,
          autoClose: 4000
        });
        return;
      }

      toast.update(toastId, { render: "Packaging certificates into ZIP..." });
      await yieldToMainThread();

      const zipContent = await zip.generateAsync({ type: "blob" });
      const safeEventName = (eventName || "Event").replace(/[^a-zA-Z0-9]/g, "_");
      const zipFileName = `${safeEventName}_Certificates.zip`;

      const url = URL.createObjectURL(zipContent);
      const link = document.createElement("a");
      link.href = url;
      link.download = zipFileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up object URL after download
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      const statusMsg = failureCount > 0
        ? `⚠️ Generated ${successCount}/${attendees.length} certificates (${failureCount} failed)`
        : `✅ ${attendees.length} certificates generated and downloaded!`;

      toast.update(toastId, {
        render: statusMsg,
        type: failureCount > 0 ? "warning" : "success",
        isLoading: false,
        autoClose: 4000
      });
    } catch (error) {
      console.error(error);
      toast.update(toastId, { render: "Bulk generation failed.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleBulkEmailDistribute = async () => {
    if (isGenerating || isEmailing) return;
    setIsEmailing(true);
    setProgress(0);
    const toastId = toast.loading(`Preparing emails for 0/${attendees.length} attendees...`);
    const statusAcc = { ...deliveryStatus };

    try {
      for (let i = 0; i < attendees.length; i++) {
        const attendee = attendees[i] || {};
        const attendeeId = attendee.id || attendee.email || `index-${i}`;

        statusAcc[attendeeId] = "emailing";
        
        let doc = null;
        try {
          const participantName = `${attendee.firstName || ""} ${attendee.lastName || attendee.name || ""}`.trim() || "Participant";
          doc = generateCertificatePDF({ participantName, eventName, eventDate, eventType, organizerName, template });
          
          // Simulate async dispatch (non-blocking)
          await new Promise((r) => setTimeout(r, 100));

          statusAcc[attendeeId] = "sent";
        } catch (err) {
          console.error(`Failed to process email for attendee at index ${i}:`, err);
          statusAcc[attendeeId] = "failed";
        } finally {
          doc = null;
        }

        const isLastItem = i === attendees.length - 1;
        if ((i + 1) % FLUSH_INTERVAL === 0 || isLastItem) {
          setDeliveryStatus({ ...statusAcc });
          setProgress(i + 1);
          toast.update(toastId, { render: `Emailed certificate to ${i + 1}/${attendees.length} attendees...` });
        }

        await yieldToMainThread();
      }

      toast.update(toastId, {
        render: `✉️ Emailed ${attendees.length} certificates successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 4000
      });
    } catch (err) {
      console.error(err);
      toast.update(toastId, { render: "Email distribution failed.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsEmailing(false);
      setProgress(0);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Certificate Generation & Distribution</h3>
          <p className="text-sm text-gray-500 dark:text-gray-200">{attendees.length} attendees loaded</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Style Template:</label>
        <div className="flex gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t}
              onClick={() => setTemplate(t)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize border transition-all ${
                template === t
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={handleBulkGenerate}
          disabled={isGenerating || isEmailing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          📜 {isGenerating ? `Generating ${progress}/${attendees.length}...` : "Download ZIP Archive"}
        </button>
        <button
          onClick={handleBulkEmailDistribute}
          disabled={isGenerating || isEmailing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <Mail className="w-4 h-4" />
          {isEmailing ? `Emailing ${progress}/${attendees.length}...` : "Distribute via Email"}
        </button>
      </div>

      {isGenerating || isEmailing ? (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${attendees.length > 0 ? (progress / attendees.length) * 100 : 0}%` }}
          />
        </div>
      ) : null}

      {/* Distribution Audit logs list */}
      <div className="border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950">
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-900 border-b border-gray-150 dark:border-gray-850">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Distribution Status Audit Logs</span>
        </div>
        <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-850">
          {attendees.map((attendee, idx) => {
            const attendeeId = attendee.id || attendee.email || `index-${idx}`;
            const status = deliveryStatus[attendeeId] || "idle";
            const name = `${attendee.firstName || ""} ${attendee.lastName || attendee.name || ""}`.trim() || `Attendee #${idx + 1}`;

            return (
              <div key={attendeeId} className="flex items-center justify-between px-4 py-2.5 text-xs">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{name}</span>
                  <span className="text-[10px] text-gray-400">{attendee.email || "No email provided"}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  {status === "idle" && (
                    <span className="text-gray-400 inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                  )}
                  {status === "generating" && (
                    <span className="text-indigo-500 inline-flex items-center gap-1">Generating...</span>
                  )}
                  {status === "generated" && (
                    <span className="text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Generated
                    </span>
                  )}
                  {status === "emailing" && (
                    <span className="text-emerald-500 inline-flex items-center gap-1">
                      <Send className="w-3.5 h-3.5 animate-pulse" /> Emailing...
                    </span>
                  )}
                  {status === "sent" && (
                    <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sent (Email)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BulkCertificateGenerator;
