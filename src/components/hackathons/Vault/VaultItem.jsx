import React from "react";
import { FileText, Image, FileCode, Trash2, Download } from "lucide-react";

export default function VaultItem({ file, onDelete }) {
  const getIcon = () => {
    switch (file.type) {
      case "pdf":
        return <FileText className="w-8 h-8 text-red-500" />;
      case "image":
        return <Image className="w-8 h-8 text-blue-500" />;
      case "code":
        return <FileCode className="w-8 h-8 text-emerald-500" />;
      default:
        return <FileText className="w-8 h-8 text-slate-500" />;
    }
  };

  return (
    <div className="vault-item p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col justify-between hover:shadow-sm transition-shadow relative group">
      <div>
        <div className="mb-3">{getIcon()}</div>
        <h4 className="text-xs font-bold text-slate-850 dark:text-white truncate" title={file.name}>
          {file.name}
        </h4>
        <span className="text-[10px] text-slate-400 block mt-1">Uploader: {file.uploader}</span>
      </div>

      <div className="flex justify-between items-center mt-4 border-t border-slate-100 dark:border-slate-850 pt-3">
        <span className="text-[10px] font-bold text-slate-400">{file.size}</span>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 transition-colors">
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-950 text-slate-600 dark:text-slate-400 hover:text-red-650 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
