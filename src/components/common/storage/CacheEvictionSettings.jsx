import React, { useState } from "react";
import { ShieldAlert } from "lucide-react";

export default function CacheEvictionSettings() {
  const [evictVideos, setEvictVideos] = useState(true);

  return (
    <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 space-y-3 flex flex-col justify-center">
      <div className="flex items-center gap-1.5 font-bold text-gray-500">
        <ShieldAlert className="w-4 h-4 text-rose-500" /> Auto-Eviction policies
      </div>
      <label className="flex items-center gap-2 text-[10px] text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          checked={evictVideos}
          onChange={(e) => setEvictVideos(e.target.checked)}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span>Evict large video trailers first</span>
      </label>
    </div>
  );
}
