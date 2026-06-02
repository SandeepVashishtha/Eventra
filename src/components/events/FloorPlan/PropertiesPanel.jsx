import { Trash2, Users } from "lucide-react";
import { MOCK_ATTENDEES } from "../../../constants/floorPlanPresets";

export default function PropertiesPanel({
  activeElement, elements, onUpdateSelected, onDeleteSelected,
  onSeatAssign
}) {
  if (!activeElement) {
    return (
      <aside className="fp-sidebar fp-sidebar-right" aria-label="Element properties and seating configuration sidebar">
        <div className="fp-guide-text">
          <Users className="mx-auto text-indigo-500 mb-3" size={32} />
          <div className="font-bold text-gray-300 dark:text-gray-400 mb-1">No Element Selected</div>
          <p className="text-xs">Click on any stage, booth, table, or exit shape inside the canvas grid to edit its details and manage seat registrations.</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="fp-sidebar fp-sidebar-right" aria-label="Element properties and seating configuration sidebar">
      <div className="fp-sidebar-section">
        <div className="flex items-center justify-between mb-4">
          <div className="fp-section-title">Element Details</div>
          <button
            onClick={onDeleteSelected}
            aria-label="Delete selected floor plan element"
            className="p-1.5 text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-colors cursor-pointer"
            title="Delete item"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="fp-field">
          <label className="fp-field-label">Object Type</label>
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 rounded-md px-2 py-1 inline-block">
            {activeElement.type.replace("-", " ")}
          </div>
        </div>

        <div className="fp-field">
          <label className="fp-field-label">Label Name</label>
          <input type="text" className="fp-input" value={activeElement.label}
            onChange={(e) => onUpdateSelected("label", e.target.value)} maxLength={24} />
        </div>

        <div className="fp-field border-t border-white/5 pt-3 mt-3">
          <div className="fp-toggle-container">
            <span className="text-xs font-semibold text-gray-300">Mark as Sponsor Booth</span>
            <label className="fp-switch">
              <input type="checkbox" checked={!!activeElement.isSponsorBooth}
                onChange={(e) => onUpdateSelected("isSponsorBooth", e.target.checked)} />
              <span className="fp-slider-round"></span>
            </label>
          </div>
        </div>

        {activeElement.isSponsorBooth && (
          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 mb-4 space-y-3">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Sponsor Settings</div>
            <div className="fp-field mb-2">
              <label className="fp-field-label text-[10px]">Sponsor Logo URL</label>
              <input type="text" className="fp-input text-xs py-1" value={activeElement.sponsorLogo || ""}
                onChange={(e) => onUpdateSelected("sponsorLogo", e.target.value)}
                placeholder="https://example.com/logo.png" />
            </div>
            <div className="fp-field mb-2">
              <label className="fp-field-label text-[10px]">Representative Contact</label>
              <input type="text" className="fp-input text-xs py-1" value={activeElement.sponsorContact || ""}
                onChange={(e) => onUpdateSelected("sponsorContact", e.target.value)}
                placeholder="rep@sponsor.com or Name" />
            </div>
            <div className="fp-field mb-2">
              <label className="fp-field-label text-[10px]">Sponsor Description</label>
              <textarea className="fp-input text-xs py-1 h-16 resize-none" value={activeElement.sponsorDescription || ""}
                onChange={(e) => onUpdateSelected("sponsorDescription", e.target.value)}
                placeholder="Brief summary about the sponsor..." />
            </div>
            <div className="fp-field mb-0">
              <label className="fp-field-label text-[10px]">Job Openings (comma sep.)</label>
              <input type="text" className="fp-input text-xs py-1" value={activeElement.sponsorJobs || ""}
                onChange={(e) => onUpdateSelected("sponsorJobs", e.target.value)}
                placeholder="React Dev, Product Designer" />
            </div>
          </div>
        )}

        <div className="fp-field">
          <label className="fp-field-label">Rotation Angle</label>
          <div className="fp-slider-group">
            <input type="range" min="0" max="360" step="15" className="fp-slider"
              value={activeElement.rotation}
              onChange={(e) => onUpdateSelected("rotation", parseInt(e.target.value))} />
            <span className="fp-slider-value">{activeElement.rotation}°</span>
          </div>
        </div>

        <div className="fp-field">
          <label className="fp-field-label">Width Size</label>
          <div className="fp-slider-group">
            <input type="range" min={activeElement.type.includes("table") ? 60 : 20}
              max={activeElement.type === "stage" ? 600 : 300} className="fp-slider"
              value={activeElement.width}
              onChange={(e) => {
                onUpdateSelected("width", parseInt(e.target.value));
                if (activeElement.type === "round-table") {
                  onUpdateSelected("height", parseInt(e.target.value));
                }
              }} />
            <span className="fp-slider-value">{activeElement.width}px</span>
          </div>
        </div>

        {!activeElement.type.includes("round") && (
          <div className="fp-field">
            <label className="fp-field-label">Height Size</label>
            <div className="fp-slider-group">
              <input type="range" min="20" max={activeElement.type === "stage" ? 400 : 200} className="fp-slider"
                value={activeElement.height}
                onChange={(e) => onUpdateSelected("height", parseInt(e.target.value))} />
              <span className="fp-slider-value">{activeElement.height}px</span>
            </div>
          </div>
        )}
      </div>

      {activeElement.seatsCount > 0 ? (
        <div className="fp-sidebar-section">
          <div className="flex items-center justify-between mb-2">
            <div className="fp-section-title">Seat Allocations</div>
            <span className={`fp-seat-indicator ${Object.keys(activeElement.assignedAttendees).length === activeElement.seatsCount ? 'fp-seat-indicator-full' : 'fp-seat-indicator-available'}`}>
              {Object.keys(activeElement.assignedAttendees).length} / {activeElement.seatsCount} Full
            </span>
          </div>

          <div className="fp-field mb-4">
            <label className="fp-field-label">Chairs Quantity</label>
            <div className="fp-slider-group">
              <input type="range" min="2" max="12" className="fp-slider"
                value={activeElement.seatsCount}
                onChange={(e) => onUpdateSelected("seatsCount", parseInt(e.target.value))} />
              <span className="fp-slider-value">{activeElement.seatsCount}</span>
            </div>
          </div>

          <div className="fp-field mb-4">
            <label className="fp-field-label">Seat Tier Tag</label>
            <input type="text" className="fp-input" value={activeElement.tier || ""}
              onChange={(e) => onUpdateSelected("tier", e.target.value)}
              placeholder="e.g. VIP Front Row, Balcony Box" />
          </div>

          <div className="text-xs font-semibold text-gray-400 mb-2">Assign registered attendees to table slots:</div>
          <div className="fp-seating-grid">
            {Array.from({ length: activeElement.seatsCount }).map((_, seatIdx) => {
              const currentAssignee = activeElement.assignedAttendees[seatIdx];
              const seatLabel = (activeElement.seatLabels && activeElement.seatLabels[seatIdx]) || `Seat ${seatIdx + 1}`;
              return (
                <div key={seatIdx} className="fp-seat-row flex-col items-stretch gap-2.5" style={{ display: "flex", flexDirection: "column", height: "auto" }}>
                  <div className="flex items-center justify-between gap-2" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="fp-seat-number">{seatLabel}</span>
                    <input type="text" className="fp-input py-0.5 px-2 text-xs w-28 h-6 text-right bg-white/5 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded"
                      value={activeElement.seatLabels?.[seatIdx] || ""}
                      onChange={(e) => {
                        const nextLabels = { ...(activeElement.seatLabels || {}) };
                        if (e.target.value) {
                          nextLabels[seatIdx] = e.target.value;
                        } else {
                          delete nextLabels[seatIdx];
                        }
                        onUpdateSelected("seatLabels", nextLabels);
                      }}
                      placeholder="Rename Seat" />
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="text-[10px] text-gray-500">Attendee:</span>
                    <select className="fp-attendee-select text-xs py-0.5"
                      value={currentAssignee || ""}
                      onChange={(e) => onSeatAssign(seatIdx, e.target.value)}>
                      <option value="">-- Choose Attendee --</option>
                      {MOCK_ATTENDEES.map((attName) => {
                        const isAssignedElsewhere = elements.some(
                          el => Object.values(el.assignedAttendees).includes(attName) &&
                            !(el.id === activeElement.id && el.assignedAttendees[seatIdx] === attName)
                        );
                        return (
                          <option key={attName} value={attName} disabled={isAssignedElsewhere}>
                            {attName} {isAssignedElsewhere ? "(Booked)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="fp-sidebar-section">
          <div className="fp-section-title">Seat Allocations</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 italic">
            This element type ({activeElement.type}) does not support seating capacity. Seat allocation is supported on Round Tables and Rectangular Tables.
          </div>
        </div>
      )}
    </aside>
  );
}
