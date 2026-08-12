import React, { useState } from "react";
import { UploadCloud, Image as ImageIcon, Sparkles, RefreshCw } from "lucide-react";
import { compressImageWasm } from "../../utils/wasmCompressor/wasmLoader";
import ImageQualityPreviewModal from "./ImageQualityPreviewModal";

export default function ImageUploadCompressor({
  onImageSelected = () => {},
  label = "Upload Event Banner or Badge Asset",
  maxWidth = 1920,
  maxHeight = 1080,
}) {
  const [originalFile, setOriginalFile] = useState(null);
  const [compressedResult, setCompressedResult] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalFile(file);
    setIsCompressing(true);

    try {
      const result = await compressImageWasm(file, 0.8, maxWidth, maxHeight);
      setCompressedResult(result);
      setShowPreviewModal(true);
    } catch (err) {
      console.error("[ImageCompressor] Error compressing image:", err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleQualityChange = async (newQuality) => {
    if (!originalFile) return;
    try {
      const result = await compressImageWasm(originalFile, newQuality, maxWidth, maxHeight);
      setCompressedResult(result);
    } catch (err) {
      console.error("[ImageCompressor] Quality recalculation failed:", err);
    }
  };

  const handleConfirm = (finalResult) => {
    setShowPreviewModal(false);
    onImageSelected(finalResult);
  };

  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-36 px-4 transition border-2 border-dashed rounded-2xl cursor-pointer border-indigo-200 dark:border-indigo-900 bg-indigo-50/20 dark:bg-indigo-950/20 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/40 border-gray-300 dark:border-gray-700">
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center space-y-2">
          {isCompressing ? (
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          ) : (
            <UploadCloud className="w-8 h-8 text-indigo-500" />
          )}
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {isCompressing ? "Compressing WebP via WASM..." : label}
          </div>
          <p className="text-[11px] text-gray-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" /> Zero-server client compression (PNG/JPG to WebP)
          </p>
        </div>
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          disabled={isCompressing}
          className="hidden"
        />
      </label>

      {showPreviewModal && (
        <ImageQualityPreviewModal
          originalFile={originalFile}
          compressedResult={compressedResult}
          onClose={() => setShowPreviewModal(false)}
          onConfirm={handleConfirm}
          onQualityChange={handleQualityChange}
        />
      )}
    </div>
  );
}
