import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, CheckCircle, Server, Zap, Sparkles, HelpCircle } from "lucide-react";
import {
  isFileCached,
  getCachedFile,
  simulateServerDownload,
  P2PFileTransferCoordinator,
} from "../../utils/p2pFileTransfer";

const EventMaterials = ({ materials }) => {
  const [cachedStatus, setCachedStatus] = useState({});
  const [activeTransfer, setActiveTransfer] = useState({}); // Stores: { [fileId]: { state, progress, speed, peerCount, type } }

  // Check which files are already cached in IndexedDB on mount
  useEffect(() => {
    const checkCache = async () => {
      const status = {};
      for (const m of materials) {
        status[m.id] = await isFileCached(m.id);
      }
      setCachedStatus(status);
    };
    if (materials) {
      checkCache();
    }
  }, [materials]);

  if (!materials || materials.length === 0) return null;

  // Trigger local browser download using a compiled base64/data URI Blob from IndexDB
  const triggerLocalDownload = async (fileId, fileName) => {
    const chunks = await getCachedFile(fileId);
    if (!chunks) return;

    // Join chunk strings
    const fileContent = chunks.map((c) => c.data).join("");
    const blob = new Blob([fileContent], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Main download click orchestrator
  const handleDownloadClick = async (material) => {
    const fileId = material.id;
    const fileName = material.title;

    // 1. If already cached locally, trigger immediate browser download
    const isCached = await isFileCached(fileId);
    if (isCached) {
      triggerLocalDownload(fileId, fileName);
      return;
    }

    // 2. Start P2P Mesh Coordinator
    const coordinator = new P2PFileTransferCoordinator(fileId, fileName, (update) => {
      // onStateChange callback
      setActiveTransfer((prev) => ({
        ...prev,
        [fileId]: {
          state: update.state,
          progress: update.progress,
          speed: update.speed,
          peerCount: update.count || 0,
          type: "p2p",
        },
      }));
    });

    // 3. Search for nearby active peers
    const foundPeer = await coordinator.startP2PSearch();

    if (foundPeer) {
      // P2P transfer is now running asynchronously via RTCPeerConnection DataChannel.
      // Once completed, the coordinator will trigger state change, write chunks, and clean up.
      // Let's hook a check to trigger local file download once completed
      const checkCompletion = setInterval(async () => {
        const completed = await isFileCached(fileId);
        if (completed) {
          clearInterval(checkCompletion);
          triggerLocalDownload(fileId, fileName);
          setCachedStatus((prev) => ({ ...prev, [fileId]: true }));
          setTimeout(() => {
            setActiveTransfer((prev) => {
              const copy = { ...prev };
              delete copy[fileId];
              return copy;
            });
          }, 3000);
        }
      }, 500);
    } else {
      // 4. Fallback to simulated Server Download if no peer found
      setActiveTransfer((prev) => ({
        ...prev,
        [fileId]: {
          state: "transferring",
          progress: 0,
          speed: "2.4 MB/s",
          peerCount: 0,
          type: "server",
        },
      }));

      await simulateServerDownload(fileId, fileName, (progress) => {
        setActiveTransfer((prev) => ({
          ...prev,
          [fileId]: {
            state: progress === 100 ? "completed" : "transferring",
            progress,
            speed: "2.8 MB/s",
            peerCount: 0,
            type: "server",
          },
        }));
      });

      // Write complete and trigger download
      triggerLocalDownload(fileId, fileName);
      setCachedStatus((prev) => ({ ...prev, [fileId]: true }));

      setTimeout(() => {
        setActiveTransfer((prev) => {
          const copy = { ...prev };
          delete copy[fileId];
          return copy;
        });
      }, 3000);
    }
  };

  const getIcon = (type) => {
    if (type === "pdf") return "📄";
    if (type === "ppt") return "📊";
    if (type === "doc") return "📝";
    return "📎";
  };

  const getColor = (type) => {
    if (type === "pdf") return "text-red-500 bg-red-500/10";
    if (type === "ppt") return "text-amber-500 bg-amber-500/10";
    if (type === "doc") return "text-indigo-500 bg-indigo-500/10";
    return "text-zinc-500 bg-zinc-500/10";
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header Info */}
      <div className="mb-8 flex items-center gap-3.5">
        <div className="flex items-center justify-center rounded-2xl bg-indigo-600/10 p-3 text-2xl">
          📚
        </div>
        <div>
          <h3 className="flex items-center gap-2 text-xl font-bold text-gray-950 dark:text-white">
            Shared Material Resources
            <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-500 uppercase dark:bg-indigo-900/20 dark:text-indigo-400">
              P2P Mesh
            </span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Download materials peer-to-peer to conserve bandwidth and bypass latency
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {materials.map((material) => {
          const transfer = activeTransfer[material.id];
          const isCached = cachedStatus[material.id];

          return (
            <div
              key={material.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-950/20"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold ${getColor(material.type)}`}
                  >
                    {getIcon(material.type)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-950 dark:text-white">
                      {material.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${getColor(material.type)}`}
                      >
                        {material.type}
                      </span>
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        {material.size}
                      </span>
                      {isCached && (
                        <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase">
                          <CheckCircle size={10} /> Local Cache
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Download Action Trigger */}
                <button
                  type="button"
                  onClick={() => handleDownloadClick(material)}
                  disabled={
                    transfer && transfer.state !== "completed" && transfer.state !== "failed"
                  }
                  className={`flex cursor-pointer items-center gap-2 rounded-xl px-4.5 py-2 text-xs font-bold transition-all active:scale-[0.98] ${
                    isCached
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : transfer
                        ? "cursor-not-allowed bg-zinc-800 text-zinc-400"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                  style={{ cursor: transfer ? "not-allowed" : "pointer" }}
                >
                  {transfer && transfer.state !== "completed" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Transferring...</span>
                    </>
                  ) : isCached ? (
                    <>
                      <CheckCircle size={13} />
                      <span>Download</span>
                    </>
                  ) : (
                    <>
                      <Download size={13} />
                      <span>Get File</span>
                    </>
                  )}
                </button>
              </div>

              {/* High-Fidelity WebRTC Transfer Progress Overlay card */}
              <AnimatePresence>
                {transfer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 rounded-xl border border-zinc-800/80 bg-zinc-950/45 p-4"
                  >
                    {/* Header: Mode styling (Green P2P vs Purple Server) */}
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {transfer.type === "p2p" ? (
                          <div className="flex animate-pulse items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                            <Zap size={11} /> P2P Mesh Download (Faster)
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase">
                            <Server size={11} /> Server Download (Slower)
                          </div>
                        )}

                        {transfer.peerCount > 0 && (
                          <span className="text-[10px] font-bold text-zinc-500">
                            {transfer.peerCount} active peer seeds
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-zinc-400">{transfer.speed}</div>
                    </div>

                    {/* Progress Bar with mode color indicators */}
                    <div className="border-zinc-850 flex h-2.5 w-full overflow-hidden rounded-full border bg-zinc-900">
                      <motion.div
                        className={`h-full rounded-full ${
                          transfer.type === "p2p"
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                            : "bg-gradient-to-r from-indigo-500 to-purple-500"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${transfer.progress}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>

                    {/* Footer Progress metadata logs */}
                    <div className="mt-2.5 flex items-center justify-between text-[10px] font-bold tracking-wide text-zinc-500 uppercase">
                      <span>
                        Status: <span className="text-zinc-350">{transfer.state}</span>
                      </span>
                      <span>{transfer.progress}%</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="dark:border-zinc-850 mt-8 flex items-center justify-between border-t border-slate-100 pt-5 text-xs text-zinc-400">
        <div className="flex items-center gap-1">
          <Sparkles size={13} className="text-amber-400" />
          <span>Local peer-mesh network actively listening.</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
          <HelpCircle size={11} /> Open another tab to test real WebRTC cross-tab file streaming!
        </div>
      </div>
    </div>
  );
};

export default EventMaterials;
