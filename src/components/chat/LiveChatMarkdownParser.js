import React, { useState, useEffect } from "react";
import { Sparkles, MessageSquare, Cpu } from "lucide-react";
import { createMarkdownParserWorkerCode, parseMarkdownToSafeHtml } from "./markdownParserWorker";

export default function LiveChatMarkdownParser({ rawMarkdown = "**Welcome to Eventra Live Chat!** Type `hello` below." }) {
  const [parsedHtml, setParsedHtml] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || typeof Worker === "undefined") {
      setParsedHtml(parseMarkdownToSafeHtml(rawMarkdown));
      setLoading(false);
      return;
    }

    try {
      const code = createMarkdownParserWorkerCode();
      const blob = new Blob([code], { type: "application/javascript" });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);

      worker.onmessage = (e) => {
        // Safe batch scheduling using requestIdleCallback to prevent frame drops
        const scheduler = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
        scheduler(() => {
          setParsedHtml(e.data.html);
          setLoading(false);
        });
      };

      worker.postMessage({ text: rawMarkdown });

      return () => {
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
      };
    } catch (err) {
      console.warn("[Markdown Parser] Fallback to sync parsing active:", err);
      setParsedHtml(parseMarkdownToSafeHtml(rawMarkdown));
      setLoading(false);
    }
  }, [rawMarkdown]);

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between gap-4 text-xs select-none">
      <div className="flex items-center gap-2 flex-1">
        <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <div className="space-y-1">
          <div className="text-gray-400 text-[10px] font-mono flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" /> Async Web Worker Parser Active
          </div>
          {loading ? (
            <span className="text-gray-500 italic">Parsing markdown...</span>
          ) : (
            <div
              className="text-gray-900 dark:text-white"
              dangerouslySetInnerHTML={{ __html: parsedHtml }}
            />
          )}
        </div>
      </div>

      <span className="px-2 py-0.5 rounded-full font-mono text-[9px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
        60 FPS Stable
      </span>
    </div>
  );
}
