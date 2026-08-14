import React, { useState, useCallback } from "react";
import { Eye, Download, FileText, Sparkles, Clock } from "lucide-react";

/**
 * Certificate Preview Card with WASM-optimized PDF preview (#17704)
 * Displays a visual preview of the certificate before generation
 */
export default function CertificatePreviewCard({
  template = {
    title: "Certificate of Completion",
    subtitle: "Presented for outstanding achievement",
    recipient: "Alex Rivera",
    event: "Global Open Source Hackathon 2026",
    date: "August 14, 2026",
    accentColor: "#6366f1",
  },
  onPreview = () => {},
  onDownload = () => {},
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handlePreview = useCallback(() => {
    onPreview(template);
  }, [template, onPreview]);

  const handleDownload = useCallback(() => {
    onDownload(template);
  }, [template, onDownload]);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 text-xs">
      {/* Preview Card Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-semibold text-gray-900 dark:text-white">
            Certificate Preview
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono text-[10px]">
            WASM
          </span>
          <button
            onClick={handlePreview}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Certificate Preview Content */}
      <div
        className="relative p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden"
        style={{
          borderTop: `4px solid ${template.accentColor || "#6366f1"}`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" />

        {/* Certificate Content */}
        <div className="relative z-10 space-y-4">
          {/* Title */}
          <h3 className="text-lg font-serif font-bold text-center text-gray-900 dark:text-white">
            {template.title}
          </h3>

          {/* Subtitle */}
          <p className="text-center text-gray-600 dark:text-gray-400 text-[11px] italic">
            {template.subtitle}
          </p>

          {/* Recipient Name */}
          <div className="text-center py-4 border-t border-b border-gray-200 dark:border-gray-700">
            <h2
              className="text-xl font-black bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
              style={{
                background: `linear-gradient(135deg, ${template.accentColor || "#6366f1"} 0%, #8b5cf6 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {template.recipient}
            </h2>
            <p className="mt-2 text-[10px] text-gray-500 dark:text-gray-500">
              For participation in
            </p>
            <p className="font-bold text-gray-900 dark:text-gray-100 text-[11px]">
              {template.event}
            </p>
          </div>

          {/* Date */}
          <p className="text-center text-[10px] text-gray-400 dark:text-gray-600">
            {template.date}
          </p>

          {/* WASM Badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-semibold">
              <Sparkles className="w-3 h-3" />
              WASM Optimized
            </span>
          </div>

          {/* Hover Actions */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/10 dark:bg-white/5 flex items-center justify-center backdrop-blur-sm rounded-xl">
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold shadow-lg hover:scale-105 transition-transform"
              >
                <Eye className="w-4 h-4" />
                Full Preview
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Generate PDF
          <Clock className="w-3 h-3 opacity-70" />
        </button>
      </div>
    </div>
  );
}
