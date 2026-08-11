import React, { useState, useEffect } from "react";
import { Grid, Sparkles, Download, RefreshCw, X } from "lucide-react";
import { solveFloorPlanLayout, PRESET_TEMPLATES } from "../../../utils/floorPlanSolver";
import { detectExitObstructions } from "../../../utils/floorPlanGeometry";
import InteractiveSVGCanvas from "./InteractiveSVGCanvas";
import SpatialClearanceInspector from "./SpatialClearanceInspector";

export default function FloorPlanAutoSolverModal({ onClose = () => {} }) {
  const [template, setTemplate] = useState("hackathon");
  const [attendees, setAttendees] = useState(120);
  const [venueWidth, setVenueWidth] = useState(30);
  const [venueHeight, setVenueHeight] = useState(20);
  const [layout, setLayout] = useState(null);
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    const generated = solveFloorPlanLayout({
      venueWidthMeters: venueWidth,
      venueHeightMeters: venueHeight,
      targetAttendees: attendees,
      template,
    });
    setLayout(generated);

    const check = detectExitObstructions(generated.tables, generated.exits);
    setWarnings(check);
  }, [template, attendees, venueWidth, venueHeight]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
            <Grid className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Dynamic Floor Plan Layout Auto-Solver
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Constraint-based table placement & fire clearance optimization engine
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-xs">
        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
            Preset Template
          </label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
          >
            {Object.entries(PRESET_TEMPLATES).map(([key, val]) => (
              <option key={key} value={key}>
                {val.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
            Target Attendees
          </label>
          <input
            type="number"
            value={attendees}
            onChange={(e) => setAttendees(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
            Venue Width (m)
          </label>
          <input
            type="number"
            value={venueWidth}
            onChange={(e) => setVenueWidth(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
            Venue Height (m)
          </label>
          <input
            type="number"
            value={venueHeight}
            onChange={(e) => setVenueHeight(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Main Canvas & Clearance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[480px]">
        <div className="lg:col-span-2 h-full">
          <InteractiveSVGCanvas layout={layout} warnings={warnings} />
        </div>

        <div className="h-full space-y-4">
          <SpatialClearanceInspector warnings={warnings} />

          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-2 text-xs">
            <span className="font-bold text-gray-700 dark:text-gray-300 block">
              Layout Summary
            </span>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Placed Seats:</span>
              <span className="font-bold font-mono">{layout?.totalPlacedSeats || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Tables:</span>
              <span className="font-bold font-mono">{layout?.tables?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
