import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Minus, Trash2, Save, RotateCcw, 
  Move, Grid, Users, Layout, MapPin, Minimize2 
} from "lucide-react";
import "./FloorPlanDesigner.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Preset layouts
const PRESETS = {
  empty: [],
  banquet: [
    { id: "stage-1", type: "stage", label: "Main Stage", x: 350, y: 50, width: 300, height: 120, rotation: 0, seatsCount: 0, assignedAttendees: {} },
    { id: "table-1", type: "round-table", label: "VIP Table A", x: 200, y: 300, width: 140, height: 140, rotation: 0, seatsCount: 8, assignedAttendees: { 0: "Amit Sharma", 1: "Priya Singh" } },
    { id: "table-2", type: "round-table", label: "VIP Table B", x: 660, y: 300, width: 140, height: 140, rotation: 0, seatsCount: 8, assignedAttendees: { 2: "Rohit Verma", 3: "Neha Kapoor" } },
    { id: "table-3", type: "round-table", label: "Table 1", x: 120, y: 520, width: 120, height: 120, rotation: 0, seatsCount: 6, assignedAttendees: {} },
    { id: "table-4", type: "round-table", label: "Table 2", x: 440, y: 520, width: 120, height: 120, rotation: 0, seatsCount: 6, assignedAttendees: {} },
    { id: "table-5", type: "round-table", label: "Table 3", x: 760, y: 520, width: 120, height: 120, rotation: 0, seatsCount: 6, assignedAttendees: {} },
    { id: "booth-1", type: "booth", label: "Sound & Lights", x: 450, y: 750, width: 100, height: 80, rotation: 0, seatsCount: 0, assignedAttendees: {} },
    { id: "barrier-1", type: "barrier", label: "Security Line", x: 250, y: 220, width: 500, height: 10, rotation: 0, seatsCount: 0, assignedAttendees: {} }
  ],
  conference: [
    { id: "stage-1", type: "stage", label: "Keynote Stage", x: 300, y: 60, width: 400, height: 130, rotation: 0, seatsCount: 0, assignedAttendees: {} },
    { id: "podium-1", type: "booth", label: "Presenter Stand", x: 480, y: 210, width: 40, height: 40, rotation: 0, seatsCount: 0, assignedAttendees: {} },
    { id: "rows-1", type: "rect-table", label: "Front Row A", x: 150, y: 340, width: 300, height: 60, rotation: 0, seatsCount: 10, assignedAttendees: {} },
    { id: "rows-2", type: "rect-table", label: "Front Row B", x: 550, y: 340, width: 300, height: 60, rotation: 0, seatsCount: 10, assignedAttendees: {} },
    { id: "rows-3", type: "rect-table", label: "Middle Row A", x: 150, y: 460, width: 300, height: 60, rotation: 0, seatsCount: 10, assignedAttendees: {} },
    { id: "rows-4", type: "rect-table", label: "Middle Row B", x: 550, y: 460, width: 300, height: 60, rotation: 0, seatsCount: 10, assignedAttendees: {} },
    { id: "rows-5", type: "rect-table", label: "Back Row A", x: 150, y: 580, width: 300, height: 60, rotation: 0, seatsCount: 10, assignedAttendees: {} },
    { id: "rows-6", type: "rect-table", label: "Back Row B", x: 550, y: 580, width: 300, height: 60, rotation: 0, seatsCount: 10, assignedAttendees: {} },
    { id: "exit-1", type: "exit", label: "Main Exit", x: 50, y: 800, width: 80, height: 20, rotation: 0, seatsCount: 0, assignedAttendees: {} },
    { id: "exit-2", type: "exit", label: "Emergency Exit", x: 870, y: 800, width: 80, height: 20, rotation: 0, seatsCount: 0, assignedAttendees: {} }
  ]
};

// Available registered mock attendees
const MOCK_ATTENDEES = [
  "Amit Sharma", "Priya Singh", "Rohit Verma", "Neha Kapoor", 
  "Vikram Rathore", "Siddharth Malhotra", "Kriti Sanon", "Varun Dhawan",
  "Aditi Rao", "Ranbir Kapoor", "Deepika Padukone", "Ranveer Singh",
  "Alia Bhatt", "Ayushmann Khurrana", "Rajkummar Rao", "Shraddha Kapoor"
];

const FloorPlanDesigner = ({ eventId = "default" }) => {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  
  // Canvas Zoom / Pan
  const [zoom, setZoom] = useState(0.8);
  const [panOffset, setPanOffset] = useState({ x: 50, y: 30 });
  const [isPanMode, setIsPanMode] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);

  // References
  const canvasRef = useRef(null);
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const elementStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  // Load layout from local storage or set preset
  useEffect(() => {
    const savedLayout = localStorage.getItem(`eventra_floorplan_${eventId}`);
    if (savedLayout) {
      try {
        setElements(JSON.parse(savedLayout));
      } catch (e) {
        setElements(PRESETS.banquet);
      }
    } else {
      setElements(PRESETS.banquet);
    }
  }, [eventId]);

  const saveLayout = () => {
    localStorage.setItem(`eventra_floorplan_${eventId}`, JSON.stringify(elements));
    toast.success("Venue floor plan successfully saved!");
  };

 const loadPreset = (presetName) => {
  toast(
    ({ closeToast }) => (
      <div>
        <p className="text-sm font-semibold mb-2">
          Load <span className="capitalize">{presetName}</span> layout?
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Current changes will be overwritten.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setElements(PRESETS[presetName]);
              setSelectedId(null);
              closeToast();
            }}
            className="px-3 py-1 bg-indigo-600 text-white text-xs rounded font-semibold hover:bg-indigo-700"
          >
            Yes, load it
          </button>
          <button
            onClick={closeToast}
            className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded font-semibold hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    { autoClose: false, closeOnClick: false }
  );
};

  const handleAddElement = (type) => {
    const id = `${type}-${Date.now()}`;
    let newElement = {
      id,
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")}`,
      x: 350,
      y: 350,
      width: type === "stage" ? 240 : type === "rect-table" ? 180 : type === "round-table" ? 120 : 80,
      height: type === "stage" ? 100 : type === "rect-table" ? 60 : type === "round-table" ? 120 : 80,
      rotation: 0,
      seatsCount: type.includes("table") ? 6 : 0,
      assignedAttendees: {}
    };

    setElements([...elements, newElement]);
    setSelectedId(id);
  };

  const handleDeleteSelected = () => {
    if (selectedId) {
      setElements(elements.filter(el => el.id !== selectedId));
      setSelectedId(null);
    }
  };

  const updateSelectedElement = (key, value) => {
    setElements(elements.map(el => {
      if (el.id === selectedId) {
        let updated = { ...el, [key]: value };
        // Reset assigned attendees if seats decrease
        if (key === "seatsCount") {
          const freshAssigned = {};
          Object.keys(el.assignedAttendees).forEach(k => {
            if (parseInt(k) < value) {
              freshAssigned[k] = el.assignedAttendees[k];
            }
          });
          updated.assignedAttendees = freshAssigned;
        }
        return updated;
      }
      return el;
    }));
  };

  const handleSeatAssign = (seatIndex, attendeeName) => {
    setElements(elements.map(el => {
      if (el.id === selectedId) {
        const nextAssignments = { ...el.assignedAttendees };
        if (attendeeName === "") {
          delete nextAssignments[seatIndex];
        } else {
          // Check if attendee is already assigned somewhere else, and unassign if so
          elements.forEach(otherEl => {
            Object.keys(otherEl.assignedAttendees).forEach(k => {
              if (otherEl.assignedAttendees[k] === attendeeName) {
                otherEl.assignedAttendees[k] = undefined;
                delete otherEl.assignedAttendees[k];
              }
            });
          });
          nextAssignments[seatIndex] = attendeeName;
        }
        return { ...el, assignedAttendees: nextAssignments };
      }
      return el;
    }));
  };

  // Event coordination
  const handleMouseDown = (e, elementId = null) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (isPanMode || !elementId) {
      isPanningRef.current = true;
      panStartRef.current = { x: clientX - panOffset.x, y: clientY - panOffset.y };
    } else if (elementId) {
      setSelectedId(elementId);
      isDraggingRef.current = true;
      
      const el = elements.find(item => item.id === elementId);
      if (el) {
        // Convert screen delta to actual SVG coordinates
        dragStartRef.current = { x: clientX, y: clientY };
        elementStartRef.current = { x: el.x, y: el.y };
      }
    }
  };

  const handleMouseMove = (e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (isPanningRef.current) {
      setPanOffset({
        x: clientX - panStartRef.current.x,
        y: clientY - panStartRef.current.y
      });
    } else if (isDraggingRef.current && selectedId) {
      const dx = (clientX - dragStartRef.current.x) / zoom;
      const dy = (clientY - dragStartRef.current.y) / zoom;

      let newX = elementStartRef.current.x + dx;
      let newY = elementStartRef.current.y + dy;

      if (snapToGrid) {
        newX = Math.round(newX / 20) * 20;
        newY = Math.round(newY / 20) * 20;
      }

      // Bound boundaries
      newX = Math.max(10, Math.min(990, newX));
      newY = Math.max(10, Math.min(990, newY));

      setElements(elements.map(el => {
        if (el.id === selectedId) {
          return { ...el, x: newX, y: newY };
        }
        return el;
      }));
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    isPanningRef.current = false;
  };

  const activeElement = elements.find(el => el.id === selectedId);

  // Math calculation of seat position around tables
  const getSeatPositions = (el) => {
    const positions = [];
    const count = el.seatsCount;
    if (count <= 0) return positions;

    if (el.type === "round-table") {
      const radius = el.width / 2;
      const centerX = el.x + radius;
      const centerY = el.y + radius;
      const chairDistance = radius + 22; // Distance of seats outside table boundary

      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count + (el.rotation * Math.PI) / 180;
        positions.push({
          x: centerX + chairDistance * Math.cos(angle),
          y: centerY + chairDistance * Math.sin(angle),
          index: i
        });
      }
    } else if (el.type === "rect-table") {
      // Linear rows along the top and bottom of the table
      const width = el.width;
      const height = el.height;
      const halfW = width / 2;
      const halfH = height / 2;
      const cX = el.x + halfW;
      const cY = el.y + halfH;

      const seatsPerSide = Math.ceil(count / 2);
      const spacingX = width / (seatsPerSide + 1);

      // We rotate seats relative to center and table rotation
      const rad = (el.rotation * Math.PI) / 180;

      const rotatePt = (px, py) => {
        const dx = px - cX;
        const dy = py - cY;
        return {
          x: cX + dx * Math.cos(rad) - dy * Math.sin(rad),
          y: cY + dx * Math.sin(rad) + dy * Math.cos(rad)
        };
      };

      for (let i = 0; i < count; i++) {
        const side = i < seatsPerSide ? "top" : "bottom";
        const sideIndex = i % seatsPerSide;
        const relativeX = spacingX * (sideIndex + 1) - halfW;
        
        let p;
        if (side === "top") {
          p = rotatePt(el.x + halfW + relativeX, el.y - 18);
        } else {
          p = rotatePt(el.x + halfW + relativeX, el.y + height + 18);
        }
        
        positions.push({ x: p.x, y: p.y, index: i });
      }
    }
    return positions;
  };

  // Get seats calculation count statistics
  const totalOccupiedSeats = elements.reduce((acc, el) => {
    return acc + Object.keys(el.assignedAttendees || {}).length;
  }, 0);

  const totalMaxSeats = elements.reduce((acc, el) => {
    return acc + (el.seatsCount || 0);
  }, 0);

  return (
    <div className="fp-container">
      {/* Top action controls */}
      <div className="fp-topbar">
        <div className="flex items-center gap-3">
          <Layout className="text-indigo-500" size={24} />
          <div>
            <div className="fp-topbar-title">Interactive Venue Seating & Floor Planner</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Design floors, place elements, and organize attendee seating slots</div>
          </div>
        </div>

        <div className="fp-topbar-actions">
          <div className="hidden md:flex items-center gap-1.5 bg-gray-900/60 border border-gray-800/80 px-2.5 py-1.5 rounded-lg mr-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Presets:</span>
            <button onClick={() => loadPreset("empty")} className="text-xs font-semibold px-2 py-0.5 hover:text-indigo-400 text-gray-300 transition-colors">Clear</button>
            <span className="text-gray-700">|</span>
            <button onClick={() => loadPreset("banquet")} className="text-xs font-semibold px-2 py-0.5 hover:text-indigo-400 text-gray-300 transition-colors">Banquet</button>
            <span className="text-gray-700">|</span>
            <button onClick={() => loadPreset("conference")} className="text-xs font-semibold px-2 py-0.5 hover:text-indigo-400 text-gray-300 transition-colors">Keynote</button>
          </div>

          <button onClick={saveLayout} className="fp-btn fp-btn-primary">
            <Save size={16} />
            Save Layout
          </button>
        </div>
      </div>

      <div className="fp-workspace" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        {/* Left Toolbox */}
        <div className="fp-sidebar fp-sidebar-left">
          <div className="fp-sidebar-section">
            <div className="fp-section-title">Object Toolbox</div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Click items to add them directly onto the seating designer grid canvas.</p>
            
            <div className="fp-tool-grid">
              <button className="fp-tool-item" onClick={() => handleAddElement("stage")}>
                <Layout className="fp-tool-icon" size={24} />
                <span className="fp-tool-label">Stage</span>
              </button>
              <button className="fp-tool-item" onClick={() => handleAddElement("round-table")}>
                <Users className="fp-tool-icon" size={24} />
                <span className="fp-tool-label">Round Table</span>
              </button>
              <button className="fp-tool-item" onClick={() => handleAddElement("rect-table")}>
                <Grid className="fp-tool-icon" size={24} />
                <span className="fp-tool-label">Rect Table</span>
              </button>
              <button className="fp-tool-item" onClick={() => handleAddElement("booth")}>
                <MapPin className="fp-tool-icon" size={24} />
                <span className="fp-tool-label">Stand/Booth</span>
              </button>
              <button className="fp-tool-item" onClick={() => handleAddElement("barrier")}>
                <Minimize2 className="fp-tool-icon" size={24} />
                <span className="fp-tool-label">Barrier</span>
              </button>
              <button className="fp-tool-item" onClick={() => handleAddElement("exit")}>
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

          <div className="fp-sidebar-section mt-auto border-t border-gray-800">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <div className="text-xs font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                💡 Seating Pro-Tip
              </div>
              <p className="text-[11px] leading-relaxed text-gray-400">
                Place round tables, select them, then assign registered VIP guests in the right panel. Keep track of table occupancy dynamically!
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Canvas Workspace */}
        <div className="fp-canvas-wrapper" onMouseDown={(e) => handleMouseDown(e, null)}>
          
          {/* Zoom & Pan floating controls */}
          <div className="fp-controls-floating">
            <button 
              className={`fp-control-btn ${isPanMode ? 'fp-control-btn-active' : ''}`}
              title="Pan Tool (Move screen)" 
              onClick={() => setIsPanMode(!isPanMode)}
            >
              <Move size={16} />
            </button>
            <span className="text-gray-700">|</span>
            <button className="fp-control-btn" title="Zoom In" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
              <Plus size={16} />
            </button>
            <div className="fp-zoom-display">{Math.round(zoom * 100)}%</div>
            <button className="fp-control-btn" title="Zoom Out" onClick={() => setZoom(Math.max(0.4, zoom - 0.1))}>
              <Minus size={16} />
            </button>
            <span className="text-gray-700">|</span>
            <button className="fp-control-btn" title="Reset view" onClick={() => { setZoom(0.8); setPanOffset({ x: 50, y: 30 }); }}>
              <RotateCcw size={16} />
            </button>
          </div>

          {/* Canvas grid render */}
          <svg
            ref={canvasRef}
            className="fp-canvas-svg"
            width={850}
            height={600}
            viewBox="0 0 1000 800"
            style={{
              transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transformOrigin: "center center",
              transition: isDraggingRef.current || isPanningRef.current ? "none" : "transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
            }}
          >
            {/* Grid background pattern */}
            <defs>
              <pattern id="canvas-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99, 102, 241, 0.04)" strokeWidth="1" />
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(99, 102, 241, 0.08)" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#canvas-grid)" />

            {/* Elements render */}
            {elements.map((el) => {
              const isSelected = el.id === selectedId;
              
              // Helper components for element render inside SVG
              return (
                <g 
                  key={el.id} 
                  transform={`rotate(${el.rotation}, ${el.x + el.width / 2}, ${el.y + el.height / 2})`}
                  onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, el.id); }}
                >
                  {/* Chairs rendered around tables */}
                  {getSeatPositions(el).map((seat) => {
                    const isOccupied = el.assignedAttendees[seat.index];
                    return (
                      <circle
                        key={`seat-${el.id}-${seat.index}`}
                        cx={seat.x}
                        cy={seat.y}
                        r={12}
                        fill={isOccupied ? "#6366f1" : "#1e1b4b"}
                        stroke={isOccupied ? "#818cf8" : "#4338ca"}
                        strokeWidth={1.5}
                        className="transition-colors duration-200"
                        title={isOccupied ? `Seat ${seat.index + 1}: ${isOccupied}` : `Seat ${seat.index + 1}: Empty`}
                      />
                    );
                  })}

                  {/* Main Element Shape */}
                  {el.type === "round-table" ? (
                    <circle
                      cx={el.x + el.width / 2}
                      cy={el.y + el.height / 2}
                      r={el.width / 2}
                      fill="rgba(30, 27, 75, 0.8)"
                      stroke={isSelected ? "#818cf8" : "#4f46e5"}
                      strokeWidth={2}
                      className={`fp-svg-element ${isSelected ? "fp-svg-element-selected" : ""}`}
                    />
                  ) : el.type === "stage" ? (
                    <rect
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      rx={8}
                      fill="rgba(17, 24, 39, 0.95)"
                      stroke={isSelected ? "#818cf8" : "#374151"}
                      strokeWidth={2.5}
                      className={`fp-svg-element ${isSelected ? "fp-svg-element-selected" : ""}`}
                    />
                  ) : el.type === "rect-table" ? (
                    <rect
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      rx={6}
                      fill="rgba(30, 27, 75, 0.8)"
                      stroke={isSelected ? "#818cf8" : "#4f46e5"}
                      strokeWidth={2}
                      className={`fp-svg-element ${isSelected ? "fp-svg-element-selected" : ""}`}
                    />
                  ) : el.type === "booth" ? (
                    <rect
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      rx={4}
                      fill="rgba(6, 78, 59, 0.8)"
                      stroke={isSelected ? "#34d399" : "#059669"}
                      strokeWidth={2}
                      className={`fp-svg-element ${isSelected ? "fp-svg-element-selected" : ""}`}
                    />
                  ) : el.type === "barrier" ? (
                    <rect
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      rx={2}
                      fill="#b91c1c"
                      opacity={0.8}
                      stroke={isSelected ? "#f87171" : "#991b1b"}
                      strokeWidth={1.5}
                      className={`fp-svg-element ${isSelected ? "fp-svg-element-selected" : ""}`}
                    />
                  ) : (
                    // Exit Route shape
                    <rect
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      rx={4}
                      fill="rgba(127, 29, 29, 0.7)"
                      stroke={isSelected ? "#f87171" : "#ef4444"}
                      strokeWidth={2}
                      className={`fp-svg-element ${isSelected ? "fp-svg-element-selected" : ""}`}
                    />
                  )}

                  {/* Element Inner Label Text */}
                  <text
                    x={el.x + el.width / 2}
                    y={el.y + el.height / 2 + 4}
                    textAnchor="middle"
                    fill="#e5e7eb"
                    fontSize={el.type === "stage" ? "14" : "11"}
                    fontWeight="700"
                    pointerEvents="none"
                    style={{ userSelect: "none" }}
                  >
                    {el.label}
                  </text>
                  
                  {/* Visual indication of occupied seating capacity */}
                  {el.seatsCount > 0 && (
                    <text
                      x={el.x + el.width / 2}
                      y={el.y + el.height / 2 + 18}
                      textAnchor="middle"
                      fill="#818cf8"
                      fontSize="9"
                      fontWeight="600"
                      pointerEvents="none"
                      style={{ userSelect: "none" }}
                    >
                      {Object.keys(el.assignedAttendees).length} / {el.seatsCount} Seats
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right Details Panel / Seating inspector */}
        <div className="fp-sidebar fp-sidebar-right">
          {activeElement ? (
            <>
              {/* Properties Section */}
              <div className="fp-sidebar-section">
                <div className="flex items-center justify-between mb-4">
                  <div className="fp-section-title">Element Details</div>
                  <button 
                    onClick={handleDeleteSelected}
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
                  <input
                    type="text"
                    className="fp-input"
                    value={activeElement.label}
                    onChange={(e) => updateSelectedElement("label", e.target.value)}
                    maxLength={24}
                  />
                </div>

                {/* Dimension adjusters */}
                <div className="fp-field">
                  <label className="fp-field-label">Rotation Angle</label>
                  <div className="fp-slider-group">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="15"
                      className="fp-slider"
                      value={activeElement.rotation}
                      onChange={(e) => updateSelectedElement("rotation", parseInt(e.target.value))}
                    />
                    <span className="fp-slider-value">{activeElement.rotation}°</span>
                  </div>
                </div>

                <div className="fp-field">
                  <label className="fp-field-label">Width Size</label>
                  <div className="fp-slider-group">
                    <input
                      type="range"
                      min={activeElement.type.includes("table") ? 60 : 20}
                      max={activeElement.type === "stage" ? 600 : 300}
                      className="fp-slider"
                      value={activeElement.width}
                      onChange={(e) => {
                        updateSelectedElement("width", parseInt(e.target.value));
                        if (activeElement.type === "round-table") {
                          updateSelectedElement("height", parseInt(e.target.value));
                        }
                      }}
                    />
                    <span className="fp-slider-value">{activeElement.width}px</span>
                  </div>
                </div>

                {!activeElement.type.includes("round") && (
                  <div className="fp-field">
                    <label className="fp-field-label">Height Size</label>
                    <div className="fp-slider-group">
                      <input
                        type="range"
                        min="20"
                        max={activeElement.type === "stage" ? 400 : 200}
                        className="fp-slider"
                        value={activeElement.height}
                        onChange={(e) => updateSelectedElement("height", parseInt(e.target.value))}
                      />
                      <span className="fp-slider-value">{activeElement.height}px</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Seating Assignment inspector */}
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
                      <input
                        type="range"
                        min="2"
                        max="12"
                        className="fp-slider"
                        value={activeElement.seatsCount}
                        onChange={(e) => updateSelectedElement("seatsCount", parseInt(e.target.value))}
                      />
                      <span className="fp-slider-value">{activeElement.seatsCount}</span>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-gray-400 mb-2">Assign registered attendees to table slots:</div>
                  <div className="fp-seating-grid">
                    {Array.from({ length: activeElement.seatsCount }).map((_, seatIdx) => {
                      const currentAssignee = activeElement.assignedAttendees[seatIdx];
                      return (
                        <div key={seatIdx} className="fp-seat-row">
                          <span className="fp-seat-number">Seat {seatIdx + 1}</span>
                          
                          <select
                            className="fp-attendee-select"
                            value={currentAssignee || ""}
                            onChange={(e) => handleSeatAssign(seatIdx, e.target.value)}
                          >
                            <option value="">-- Choose Attendee --</option>
                            {MOCK_ATTENDEES.map((attName) => {
                              // Enable choosing the attendee if they aren't assigned to another table or if they are assigned to THIS seat
                              const isAssignedElsewhere = elements.some(
                                el => Object.values(el.assignedAttendees).includes(attName) && 
                                !(el.id === activeElement.id && el.assignedAttendees[seatIdx] === attName)
                              );
                              return (
                                <option 
                                  key={attName} 
                                  value={attName}
                                  disabled={isAssignedElsewhere}
                                >
                                  {attName} {isAssignedElsewhere ? "(Booked)" : ""}
                                </option>
                              );
                            })}
                          </select>
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
            </>
          ) : (
            <div className="fp-guide-text">
              <Users className="mx-auto text-indigo-500 mb-3" size={32} />
              <div className="font-bold text-gray-300 dark:text-gray-400 mb-1">No Element Selected</div>
              <p className="text-xs">Click on any stage, booth, table, or exit shape inside the canvas grid to edit its details and manage seat registrations.</p>
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default FloorPlanDesigner;
