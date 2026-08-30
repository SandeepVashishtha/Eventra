"use client";

import React from "react";
import { Globe, MapPin } from "lucide-react";

export default function GeographicBreakdown({ geographic = [] }) {
  if (!geographic || geographic.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-zinc-200 text-zinc-500 text-xs">
        No geographic data recorded yet.
      </div>
    );
  }

  const maxPercentage = Math.max(...geographic.map((g) => g.percentage), 1);

  return (
    <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#00b887] border border-emerald-200">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-900">
                Geographic Breakdown
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                Attendee demographic dispersion by city and country
              </p>
            </div>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
          {geographic.length} Regions
        </span>
      </div>

      {/* Region List Bars */}
      <div className="space-y-4 pt-1">
        {geographic.map((item, idx) => (
          <div key={`geo-item-${idx}`} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2 text-zinc-800">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-bold">{item.city}</span>
                <span className="text-zinc-400 font-normal">({item.country})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-zinc-500">{item.count} attendees</span>
                <span className="font-mono font-bold text-emerald-700 w-10 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>

            {/* Percentage Bar */}
            <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00b887] to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
