import React from "react";

export function CardSkeleton() {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-2xs space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-20 h-5 bg-zinc-200 rounded-full" />
        <div className="w-24 h-4 bg-zinc-150 rounded" />
      </div>
      <div className="w-3/4 h-6 bg-zinc-200 rounded" />
      <div className="space-y-2">
        <div className="w-full h-4 bg-zinc-150 rounded" />
        <div className="w-5/6 h-4 bg-zinc-150 rounded" />
      </div>
      <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
        <div className="w-24 h-4 bg-zinc-150 rounded" />
        <div className="w-20 h-4 bg-zinc-200 rounded" />
      </div>
    </div>
  );
}
