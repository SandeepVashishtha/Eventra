import {
  Layout, Users, Grid, MapPin, Minimize2, RotateCcw,
   Image, Download, FileJson, Upload,
   Sparkles
} from "lucide-react";

const SNIPPET_TIP = "Place round tables, select them, then assign registered VIP guests in the right panel. Keep track of table occupancy dynamically!";

export default function ElementPalette({
  elements, totalOccupiedSeats, totalMaxSeats,
  snapToGrid, setSnapToGrid, onAddElement,
  // loadPreset, 
  handleExportPNG, handleExportSVG,
  handleDownloadJSON, handleImportJSON
}) {
  return (
    <aside className="fp-sidebar fp-sidebar-left" aria-label="Floor plan designer tools sidebar">
      <div className="fp-sidebar-section">
        <div className="fp-section-title">Object Toolbox</div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Click items to add them directly onto the seating designer grid canvas.</p>
        <div className="fp-tool-grid">
          <button className="fp-tool-item" aria-pressed="false" onClick={() => onAddElement("stage")}>
            <Layout className="fp-tool-icon" size={24} />
            <span className="fp-tool-label">Stage</span>
          </button>
          <button className="fp-tool-item" aria-pressed="false" onClick={() => onAddElement("round-table")}>
            <Users className="fp-tool-icon" size={24} />
            <span className="fp-tool-label">Round Table</span>
          </button>
          <button className="fp-tool-item" aria-pressed="false" onClick={() => onAddElement("rect-table")}>
            <Grid className="fp-tool-icon" size={24} />
            <span className="fp-tool-label">Rect Table</span>
          </button>
          <button className="fp-tool-item" aria-pressed="false" onClick={() => onAddElement("booth")}>
            <MapPin className="fp-tool-icon" size={24} />
            <span className="fp-tool-label">Stand/Booth</span>
          </button>
          <button className="fp-tool-item" aria-pressed="false" onClick={() => onAddElement("barrier")}>
            <Minimize2 className="fp-tool-icon" size={24} />
            <span className="fp-tool-label">Barrier</span>
          </button>
          <button className="fp-tool-item" onClick={() => onAddElement("exit")}>
            <RotateCcw className="fp-tool-icon rotate-45" size={24} />
            <span className="fp-tool-label">Exit Route</span>
          </button>
        </div>
      </div>
      <div className="fp-sidebar-section">
        <div className="fp-section-title">Designer Settings</div>
        <div className="fp-toggle-container mb-4">
          <span className="text-xs font-semibold text-gray-300 dark:text-gray-400">Snap to 20px Grid</span>
          <label className="fp-switch">
            <input type="checkbox" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} />
            <span className="fp-slider-round"></span>
          </label>
        </div>
        <div className="fp-stats-row">
          <div className="fp-stat-card">
            <div className="fp-stat-val">{elements.length}</div>
            <div className="fp-stat-label">Elements</div>
          </div>
          <div className="fp-stat-card">
            <div className="fp-stat-val">{totalOccupiedSeats} / {totalMaxSeats}</div>
            <div className="fp-stat-label">Seats Allocated</div>
          </div>
        </div>
      </div>
      <div className="fp-sidebar-section fp-portability-section">
        <div className="fp-section-title">Export & Portability</div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Export high-resolution images or portable layout configurations for sharing.</p>
        <div className="fp-portability-grid mb-4">
          <button className="fp-portability-btn font-semibold" onClick={handleExportPNG} title="Export as high-res PNG image" aria-label="button">
            <Image className="fp-portability-icon" size={16} />
            <span>Export PNG</span>
          </button>
          <button className="fp-portability-btn font-semibold" onClick={handleExportSVG} title="Export as vector SVG image" aria-label="button">
            <Download className="fp-portability-icon" size={16} />
            <span>Export SVG</span>
          </button>
        </div>
        <button className="fp-btn fp-btn-secondary w-full justify-center mb-3 text-xs" onClick={handleDownloadJSON} title="Download backup config JSON file" aria-label="button">
          <FileJson size={14} className="text-indigo-400" />
          <span>Backup Layout JSON</span>
        </button>
        <div className="fp-import-zone">
          <label className="fp-import-label cursor-pointer">
            <Upload size={18} className="text-indigo-400 mb-1.5" />
            <span className="text-[11px] font-bold text-gray-300 dark:text-gray-400">Restore Layout JSON</span>
            <span className="text-[9px] text-gray-500 dark:text-gray-500 mt-0.5 text-center">Click to browse and upload</span>
            <input type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
          </label>
        </div>
      </div>
      <div className="fp-sidebar-section mt-auto border-t border-gray-800">
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <div className="text-xs font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
            <Sparkles size={14} /> Seating Pro-Tip
          </div>
          <p className="text-[11px] leading-relaxed text-gray-400">{SNIPPET_TIP}</p>
        </div>
      </div>
    </aside>
  );
}
