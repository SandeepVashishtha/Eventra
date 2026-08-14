import React, { useState } from "react";
import { Folder, Upload, Trash2, Shield, Eye, Download } from "lucide-react";
import VaultItem from "./VaultItem";
import "./vault.css";

export default function FileVault({ teamId = "team-alpha" }) {
  const [files, setFiles] = useState([
    { id: 1, name: "pitch-deck.pdf", size: "4.2 MB", uploader: "Raj Patel", type: "pdf" },
    { id: 2, name: "landing-page-screenshot.png", size: "1.8 MB", uploader: "Priya Shah", type: "image" },
    { id: 3, name: "mock-backend-responses.json", size: "350 KB", uploader: "Siddharth S.", type: "code" }
  ]);

  const deleteFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleFileUpload = (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) return;

    const newFile = {
      id: Date.now(),
      name: uploaded.name,
      size: (uploaded.size / (1024 * 1024)).toFixed(1) + " MB",
      uploader: "You",
      type: uploaded.type.includes("image") ? "image" : "code"
    };

    setFiles((prev) => [...prev, newFile]);
  };

  return (
    <div className="file-vault-container p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg max-w-4xl mx-auto my-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Folder className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
            Hackathon Team File Vault
          </h2>
          <p className="text-xs text-slate-500 mt-1">Secure repository sharing for project code, designs, and files</p>
        </div>

        <label className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors shadow-md shadow-indigo-650/15">
          <Upload className="w-4 h-4" /> Upload Asset
          <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      <div className="file-list-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {files.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400 font-medium">No assets uploaded yet.</div>
        ) : (
          files.map((file) => (
            <VaultItem key={file.id} file={file} onDelete={() => deleteFile(file.id)} />
          ))
        )}
      </div>
    </div>
  );
}
