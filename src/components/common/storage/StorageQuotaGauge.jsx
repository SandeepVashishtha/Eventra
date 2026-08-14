import React, { useEffect, useState } from "react";
import { HardDrive, RefreshCw } from "lucide-react";
import { queryStorageQuotaInfo } from "../../../utils/storage/storageQuotaUtils";
import CacheEvictionSettings from "./CacheEvictionSettings";

export default function StorageQuotaGauge() {
  const [quota, setQuota] = useState({ usageMb: 0, quotaMb: 0, percentage: 0 });

  const fetchQuota = async () => {
    const data = await queryStorageQuotaInfo();
    setQuota(data);
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white space-y-4">
      <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-3">
        <span className="font-bold flex items-center gap-1.5">
          <HardDrive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Disk Storage Quotas
        </span>
        <button onClick={fetchQuota} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2 p-4 rounded-2xl border border-gray-150 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-950/40">
          <div className="flex justify-between font-mono text-[10px] text-gray-400">
            <span>Disk Usage: {quota.usageMb} MB / {quota.quotaMb} MB</span>
            <span>{quota.percentage}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${quota.percentage}%` }} />
          </div>
        </div>

        <CacheEvictionSettings />
      </div>
    </div>
  );
}
