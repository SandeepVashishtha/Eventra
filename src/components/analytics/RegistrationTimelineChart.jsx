"use client";

import React, { useState } from "react";
import { TrendingUp, Calendar, Layers, BarChart2 } from "lucide-react";

export default function RegistrationTimelineChart({ timeline = [] }) {
  const [activeRange, setActiveRange] = useState("all");
  const [viewMode, setViewMode] = useState("cumulative"); // 'cumulative' | 'daily'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-zinc-200 text-zinc-500 text-xs">
        No timeline data recorded yet.
      </div>
    );
  }

  // Filter timeline based on active range
  const filteredData =
    activeRange === "7d"
      ? timeline.slice(-7)
      : activeRange === "14d"
      ? timeline.slice(-14)
      : timeline;

  const dataValues = filteredData.map((d) =>
    viewMode === "cumulative" ? d.cumulativeRegistrations : d.dailyRegistrations
  );
  const maxVal = Math.max(...dataValues, 10);
  const minVal = 0;

  // SVG dimensions
  const width = 700;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  // Compute coordinate points
  const points = filteredData.map((item, idx) => {
    const val = viewMode === "cumulative" ? item.cumulativeRegistrations : item.dailyRegistrations;
    const x =
      filteredData.length > 1
        ? paddingX + (idx / (filteredData.length - 1)) * innerWidth
        : paddingX + innerWidth / 2;
    const y = height - paddingY - (val / maxVal) * innerHeight;
    return { x, y, item, val };
  });

  // Construct SVG Path
  const linePath =
    points.length > 0
      ? `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`
      : "";

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`
      : "";

  return (
    <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#00b887] border border-emerald-200">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-900">
                Registration Timeline
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                {viewMode === "cumulative"
                  ? "Cumulative growth of attendees leading up to the event"
                  : "Daily registration velocity"}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl text-xs font-bold text-zinc-700">
            <button
              onClick={() => setViewMode("cumulative")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "cumulative"
                  ? "bg-white text-emerald-900 shadow-2xs font-extrabold"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#00b887]" />
              <span>Cumulative</span>
            </button>
            <button
              onClick={() => setViewMode("daily")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "daily"
                  ? "bg-white text-emerald-900 shadow-2xs font-extrabold"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-[#00b887]" />
              <span>Daily Delta</span>
            </button>
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl text-xs font-semibold text-zinc-600">
            <button
              onClick={() => setActiveRange("7d")}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeRange === "7d" ? "bg-[#00b887] text-white font-bold" : "hover:text-zinc-900"
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setActiveRange("14d")}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeRange === "14d" ? "bg-[#00b887] text-white font-bold" : "hover:text-zinc-900"
              }`}
            >
              14D
            </button>
            <button
              onClick={() => setActiveRange("all")}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeRange === "all" ? "bg-[#00b887] text-white font-bold" : "hover:text-zinc-900"
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-hidden pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 sm:h-64 overflow-visible"
        >
          <defs>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00b887" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#00b887" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00b887" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const yPos = height - paddingY - pct * innerHeight;
            const labelVal = Math.round(minVal + pct * maxVal);
            return (
              <g key={`grid-line-${i}`}>
                <line
                  x1={paddingX}
                  y1={yPos}
                  x2={width - paddingX}
                  y2={yPos}
                  stroke="#e4e4e7"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={yPos + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#a1a1aa"
                  fontFamily="monospace"
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#emeraldGradient)" />

          {/* Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineStroke)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, idx) => {
            const isHovered = hoveredPoint?.idx === idx;
            return (
              <g key={`point-${idx}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "6.5" : "4"}
                  fill="#ffffff"
                  stroke="#00b887"
                  strokeWidth={isHovered ? "3.5" : "2.5"}
                  className="transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredPoint({ ...p, idx })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* X Axis Label */}
                {(filteredData.length <= 8 || idx % Math.ceil(filteredData.length / 7) === 0 || idx === filteredData.length - 1) && (
                  <text
                    x={p.x}
                    y={height - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#71717a"
                    fontWeight="600"
                  >
                    {p.item.date}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-zinc-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl border border-zinc-700 animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `calc(${(hoveredPoint.x / width) * 100}% - 60px)`,
              top: `calc(${(hoveredPoint.y / height) * 100}% - 48px)`,
            }}
          >
            <div className="font-bold text-emerald-400">{hoveredPoint.item.date}</div>
            <div className="text-[11px] text-zinc-300">
              {viewMode === "cumulative" ? (
                <>
                  <span className="font-mono font-bold text-white">
                    {hoveredPoint.item.cumulativeRegistrations}
                  </span>{" "}
                  total registrations (+{hoveredPoint.item.dailyRegistrations} today)
                </>
              ) : (
                <>
                  <span className="font-mono font-bold text-white">
                    {hoveredPoint.item.dailyRegistrations}
                  </span>{" "}
                  registrations on this date
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
