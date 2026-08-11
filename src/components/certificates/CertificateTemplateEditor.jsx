import React, { useState } from "react";
import { Layout, Palette, Type, Award } from "lucide-react";

export default function CertificateTemplateEditor({ onSaveTemplate = () => {} }) {
  const [title, setTitle] = useState("Certificate of Completion");
  const [subtitle, setSubtitle] = useState("Presented for outstanding achievement in Hackathon 2026");
  const [accentColor, setAccentColor] = useState("#6366f1");

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-xs">
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-bold text-sm text-gray-900 dark:text-white">
          Certificate Template Customizer
        </h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
            Certificate Header Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
            Subtitle Description
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
            Accent Brand Color
          </label>
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="h-10 w-20 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-700"
          />
        </div>
      </div>
    </div>
  );
}
