import React, { useState, useEffect } from "react";
import { HardDrive, Trash2, X, ShieldCheck } from "lucide-react";
import { getStorageQuotaEstimate } from "../../utils/storage/storageQuotaUtils";
import {
  getDownloadedOfflinePacks,
  deleteOfflinePack,
  clearAllOfflinePacks,
} from "../../utils/storage/offlineCacheManager";

export default function StorageQuotaManagerModal({
  isOpen = false,
  onClose = () => {},
}) {
  const [quota, setQuota] = useState({ usageMB: 0, quotaMB: 2048, percentUsed: 0 });
  const [packs, setPacks] = useState([]);

  useEffect(() => {
    async function loadInfo() {
      const q = await getStorageQuotaEstimate();
      setQuota(q);
      setPacks(getDownloadedOfflinePacks());
    }
    if (isOpen) {
      loadInfo();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDeletePack = (eventId) => {
    deleteOfflinePack(eventId);
    setPacks(getDownloadedOfflinePacks());
  };

  const handleClearAll = () => {
    clearAllOfflinePacks();
    setPacks([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-gray-900 dark:text-white select-none">
      <div className="relative w-full max-w-lg rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-base">Offline Storage & Quota Manager</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quota Usage Gauge */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 space-y-2 text-xs">
          <div className="flex justify-between font-bold">
            <span>Device Storage Usage</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400">
              {quota.usageMB} MB / {quota.quotaMB} MB ({quota.percentUsed}%)
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, quota.percentUsed)}%` }}
            />
          </div>
        </div>

        {/* Saved Offline Packs List */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between font-bold text-gray-700 dark:text-gray-300">
            <span>Downloaded Offline Event Media Packs ({packs.length})</span>
            {packs.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-rose-500 hover:underline font-semibold"
              >
                Clear All Packs
              </button>
            )}
          </div>

          {packs.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              No offline event media packs saved yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {packs.map((p) => (
                <div
                  key={p.eventId}
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/40"
                >
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{p.title}</h4>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {p.sizeMB} MB • Saved {new Date(p.downloadedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeletePack(p.eventId)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
