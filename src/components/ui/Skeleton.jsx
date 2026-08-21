import React from "react";

export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 animate-pulse">
      <div className="aspect-[16/10] w-full rounded-xl bg-neutral-200" />
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="w-1/2 h-4 bg-neutral-200 rounded" />
          <div className="w-1/6 h-3 bg-neutral-200 rounded" />
        </div>
        <div className="w-2/3 h-3 bg-neutral-200/70 rounded" />
      </div>
    </div>
  );
}
