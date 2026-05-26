import React, { useState, useEffect, useRef } from "react";
import ConfirmationModal from "../common/ConfirmationModal";
import {
  Plus, Minus, Trash2, Save, RotateCcw,
  Move, Grid, Users, Layout, MapPin, Minimize2,
  Download, Upload, Image, FileJson, AlertTriangle
} from "lucide-react";
import { toast } from "react-toastify";
import "./FloorPlanDesigner.css";
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

// Simple bounding box intersection (AABB) collision algorithm
const checkCollision = (el1, el2) => {
  if (!el1 || !el2 || el1.id === el2.id) return false;
  const buffer = 4; // allow tiny safe overlap margin
  return (
    el1.x < el2.x + el2.width - buffer &&
    el1.x + el1.width > el2.x + buffer &&
    el1.y < el2.y + el2.height - buffer &&
    el1.y + el1.height > el2.y + buffer
  );
};

const FloorPlanDesigner = ({ eventId = "default" }) => {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
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
    if (window.confirm(`Are you sure you want to load the ${presetName} layout? Current changes will be overwritten.`)) {
      setElements(PRESETS[presetName]);
      setSelectedId(null);
    }
  };

  // Helper to prepare the SVG for export by cloning and stripping specific attributes/styles
  const getCleanExportSvgString = () => {
    const svgElement = canvasRef.current;
    if (!svgElement) return "";

    const clonedSvg = svgElement.cloneNode(true);

    // Reset transform style so export is the full canvas without panning and zooming
    clonedSvg.style.transform = "none";
    clonedSvg.style.transformOrigin = "initial";
    clonedSvg.style.transition = "none";

    // Set width and height explicitly to matching the viewBox dimensions for high resolution
    clonedSvg.setAttribute("width", "1000");
    clonedSvg.setAttribute("height", "800");

    // Restore selected shape's default stroke so it looks clean in the exported snapshot
    const selectedShape = clonedSvg.querySelector(".fp-svg-element-selected");
    if (selectedShape) {
      selectedShape.classList.remove("fp-svg-element-selected");
    }

    const serializer = new XMLSerializer();
    return serializer.serializeToString(clonedSvg);
  };

  // Export as SVG
  const handleExportSVG = () => {
    try {
      const svgString = getCleanExportSvgString();
      if (!svgString) return;

      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `eventra-floorplan-${eventId}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("SVG Export failed:", error);
      toast.error("Failed to export as SVG. Please try again.");
    }
  };

  // Export as PNG
  const handleExportPNG = () => {
    try {
      const svgElement = canvasRef.current;
      if (!svgElement) return;

      const svgString = getCleanExportSvgString();
      if (!svgString) return;

      // Get computed background color of the SVG to draw on the canvas
      const computedStyle = window.getComputedStyle(svgElement);
      const bgColor = computedStyle.backgroundColor || "#0b0b14";

      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1000;
        canvas.height = 800;
        const ctx = canvas.getContext("2d");

        // Fill background first
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 1000, 800);

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, 1000, 800);

        // Convert canvas to png and trigger download
        canvas.toBlob((pngBlob) => {
          if (!pngBlob) {
            toast.error("Failed to generate PNG image.");
            return;
          }
          const pngUrl = URL.createObjectURL(pngBlob);
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = `eventra-floorplan-${eventId}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
          URL.revokeObjectURL(url);
        }, "image/png");
      };

      img.onerror = () => {
        toast.error("Failed to render floor plan workspace onto image canvas.");
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (error) {
      console.error("PNG Export failed:", error);
      toast.error("Failed to export as PNG. Please try again.");
    }
  };

  // Download Layout JSON
  const handleDownloadJSON = () => {
    try {
      const jsonBlob = new Blob([JSON.stringify(elements, null, 2)], { type: "application/json" });
      const jsonUrl = URL.createObjectURL(jsonBlob);

      const link = document.createElement("a");
      link.href = jsonUrl;
      link.download = `eventra-floorplan-${eventId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(jsonUrl);
    } catch (error) {
      console.error("JSON Export failed:", error);
      toast.error("Failed to download layout configuration.");
    }
  };

  // Import Layout JSON
  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        if (!Array.isArray(importedData)) {
          throw new Error("Floor plan config layout must be a valid JSON array.");
        }

        // Schema validation
        const isValid = importedData.every(el =>
          el && typeof el === "object" && "id" in el && "type" in el && "x" in el && "y" in el
        );

        if (!isValid) {
          throw new Error("One or more grid elements are missing mandatory properties (id, type, x, y).");
        }

        setElements(importedData);
        setSelectedId(null);
        toast.success("Floor plan layout imported successfully!");
      } catch (err) {
        toast.error(`Failed to import floor plan: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input
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
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSelected = () => {
    if (selectedId) {
      setElements(elements.filter(el => el.id !== selectedId));
      setSelectedId(null);
      toast.success("Element deleted successfully!");
    }

    setIsDeleteModalOpen(false);
  };

  const updateSelectedElement = (key, value) => {
    const updates = typeof key === "object" ? key : { [key]: value };
    setElements((prevElements) =>
      prevElements.map((el) => {
        if (el.id === selectedId) {
          let updated = { ...el, ...updates };
          // Reset assigned attendees if seats decrease
          if ("seatsCount" in updates) {
            const seatsCountVal = updates.seatsCount;
            const freshAssigned = {};
            Object.keys(el.assignedAttendees).forEach((k) => {
              if (parseInt(k) < seatsCountVal) {
                freshAssigned[k] = el.assignedAttendees[k];
              }
            });
            updated.assignedAttendees = freshAssigned;
          }
          return updated;
        }
        return el;
      })
    );
  };

  const handleSeatAssign = (seatIndex, attendeeName) => {
    setElements(elements.map(el => {
      // 1. Create a clean copy of the assignedAttendees object for this element
      const nextAssignments = { ...el.assignedAttendees };

      // 2. Unassign this attendee if they are currently assigned to any seat on this table
      Object.keys(nextAssignments).forEach(k => {
        if (nextAssignments[k] === attendeeName) {
          delete nextAssignments[k];
        }
      });

      if (el.id === selectedId) {
        // 3. If this is the selected table, assign the attendee to the new seat slot
        if (attendeeName !== "") {
          nextAssignments[seatIndex] = attendeeName;
        } else {
          delete nextAssignments[seatIndex];
        }
        return { ...el, assignedAttendees: nextAssignments };
      } else {
        // 4. For other tables, just return the element with the attendee cleanly removed
        return { ...el, assignedAttendees: nextAssignments };
      }
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

    // Apply offset for 2.5D visual projection top coordinates
    const projOffset = 10;

    if (el.type === "round-table") {
      const radius = el.width / 2;
      const centerX = el.x + radius - projOffset;
      const centerY = el.y + radius - projOffset;
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

      // Calculate top face projection center
      const cX = el.x + halfW - projOffset;
      const cY = el.y + halfH - projOffset;

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
          p = rotatePt(el.x - projOffset + halfW + relativeX, el.y - projOffset - 18);
        } else {
          p = rotatePt(el.x - projOffset + halfW + relativeX, el.y - projOffset + height + 18);
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

  // Computes whether there is ANY overlap / collision currently detected on the canvas
  const anyCollision = elements.some(el =>
    elements.some(other => other.id !== el.id && checkCollision(el, other))
  );

  return (
    <div className="fp-container">
      {/* Top action controls */}
      <div className="fp-topbar">
        <div className="flex items-center gap-3">
          <Layout className="text-indigo-500" size={24} />
          <div>
            <div className="fp-topbar-title">Interactive Venue Seating & Floor Planner</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Design floors, place elements, and organize attendee seating slots</div>
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
        <aside
          className="fp-sidebar fp-sidebar-left"
          aria-label="Floor plan designer tools sidebar"
        >
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

          <div className="fp-sidebar-section fp-portability-section">
            <div className="fp-section-title">Export & Portability</div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              Export high-resolution images or portable layout configurations for sharing.
            </p>

            <div className="fp-portability-grid mb-4">
              <button className="fp-portability-btn font-semibold" onClick={handleExportPNG} title="Export as high-res PNG image">
                <Image className="fp-portability-icon" size={16} />
                <span>Export PNG</span>
              </button>
              <button className="fp-portability-btn font-semibold" onClick={handleExportSVG} title="Export as vector SVG image">
                <Download className="fp-portability-icon" size={16} />
                <span>Export SVG</span>
              </button>
            </div>

            <button className="fp-btn fp-btn-secondary w-full justify-center mb-3 text-xs" onClick={handleDownloadJSON} title="Download backup config JSON file">
              <FileJson size={14} className="text-indigo-400" />
              <span>Backup Layout JSON</span>
            </button>

            <div className="fp-import-zone">
              <label className="fp-import-label cursor-pointer">
                <Upload size={18} className="text-indigo-400 mb-1.5" />
                <span className="text-[11px] font-bold text-gray-300 dark:text-gray-400">Restore Layout JSON</span>
                <span className="text-[9px] text-gray-500 dark:text-gray-500 mt-0.5 text-center">Click to browse and upload</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportJSON}
                />
              </label>
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
        </aside>

        {/* Dynamic Canvas Workspace */}
        <div className="fp-canvas-wrapper" onMouseDown={(e) => handleMouseDown(e, null)}>

          {/* Real-time active collision notification */}
          {anyCollision && (
            <div className="fp-collision-warning-badge">
              <AlertTriangle size={14} className="animate-pulse" />
              <span>OVERLAP COLLISION DETECTED</span>
            </div>
          )}

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
            {/* Grid background pattern & Dynamic visual themes */}
            <defs>
              <pattern id="canvas-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99, 102, 241, 0.04)" strokeWidth="1" />
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(99, 102, 241, 0.08)" strokeWidth="1.5" />
              </pattern>

              {/* Dynamic Gradients for premium 2.5D visual depth */}
              <radialGradient id="seat-occupied" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </radialGradient>
              <radialGradient id="seat-empty" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2e2b5c" />
                <stop offset="100%" stopColor="#12102e" />
              </radialGradient>

              <linearGradient id="stage-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#374151" />
                <stop offset="100%" stopColor="#111827" />
              </linearGradient>
              <linearGradient id="table-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2e2b54" />
                <stop offset="100%" stopColor="#16133a" />
              </linearGradient>
              <linearGradient id="booth-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#065f46" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
              <linearGradient id="barrier-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>
              <linearGradient id="exit-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#b91c1c" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#canvas-grid)" />

            {/* Elements render */}
            {elements.map((el) => {
              const isSelected = el.id === selectedId;
              const isColliding = elements.some(other => other.id !== el.id && checkCollision(el, other));

              // 2.5D visual projection offsets
              const projOffset = 10;

              return (
                <g
                  key={el.id}
                  data-element-id={el.id}
                  data-element-type={el.type}
                  transform={`rotate(${el.rotation}, ${el.x + el.width / 2}, ${el.y + el.height / 2})`}
                  onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, el.id); }}
                  className="fp-element-group"
                >
                  {/* Chairs rendered around tables */}
                  {getSeatPositions(el).map((seat) => {
                    const isOccupied = el.assignedAttendees[seat.index];
                    return (
                      <g key={`seat-${el.id}-${seat.index}`} className="fp-seat-25d">
                        {/* 2.5D Chair shadow/extrusion base */}
                        <circle
                          cx={seat.x}
                          cy={seat.y + 3}
                          r={11}
                          fill="rgba(0, 0, 0, 0.4)"
                        />
                        {/* Chair top face */}
                        <circle
                          cx={seat.x}
                          cy={seat.y}
                          r={11}
                          fill={isOccupied ? "url(#seat-occupied)" : "url(#seat-empty)"}
                          stroke={isOccupied ? "#a5b4fc" : "#3b3870"}
                          strokeWidth={1.5}
                          className="transition-colors duration-200"
                        />
                      </g>
                    );
                  })}

                  {/* 2.5D Extrusions base and side projections */}
                  {el.type === "round-table" ? (
                    <>
                      {/* Cylindrical extrusion side wall */}
                      <path
                        d={`M ${el.x + el.width / 2 - el.width / 2} ${el.y + el.height / 2} 
                            A ${el.width / 2} ${el.height / 2} 0 0 0 ${el.x + el.width / 2 + el.width / 2} ${el.y + el.height / 2} 
                            L ${el.x + el.width / 2 + el.width / 2 - projOffset} ${el.y + el.height / 2 + projOffset} 
                            A ${el.width / 2} ${el.height / 2} 0 0 1 ${el.x + el.width / 2 - el.width / 2 - projOffset} ${el.y + el.height / 2 + projOffset} Z`}
                        fill="rgba(10, 8, 30, 0.95)"
                        stroke="rgba(255, 255, 255, 0.05)"
                      />
                      {/* Circular Table Top Face */}
                      <circle
                        cx={el.x + el.width / 2 - projOffset}
                        cy={el.y + el.height / 2 - projOffset}
                        r={el.width / 2}
                        fill="url(#table-grad)"
                        stroke={isColliding ? "#ef4444" : (isSelected ? "#818cf8" : "#4f46e5")}
                        strokeWidth={2}
                        className={`fp-svg-element ${isSelected ? "fp-svg-element-selected" : ""} ${isColliding ? "fp-svg-element-colliding" : ""}`}
                      />
                    </>
                  ) : (
                    // Rectangular visual elements (Stage, Booth, Barrier, Rect table, Exit)
                    <>
                      {/* Oblique extrusion base walls */}
                      {/* Front Extrusion Face */}
                      <path
                        d={`M ${el.x} ${el.y + el.height} 
                            L ${el.x - projOffset} ${el.y + el.height - projOffset} 
                            L ${el.x + el.width - projOffset} ${el.y + el.height - projOffset} 
                            L ${el.x + el.width} ${el.y + el.height} Z`}
                        fill="rgba(15, 12, 28, 0.95)"
                        stroke="rgba(255, 255, 255, 0.05)"
                      />
                      {/* Side Extrusion Face */}
                      <path
                        d={`M ${el.x + el.width} ${el.y} 
                            L ${el.x + el.width - projOffset} ${el.y - projOffset} 
                            L ${el.x + el.width - projOffset} ${el.y + el.height - projOffset} 
                            L ${el.x + el.width} ${el.y + el.height} Z`}
                        fill="rgba(8, 6, 18, 0.95)"
                        stroke="rgba(255, 255, 255, 0.05)"
                      />

                      {/* Top Face element rendering */}
                      <rect
                        x={el.x - projOffset}
                        y={el.y - projOffset}
                        width={el.width}
                        height={el.height}
                        rx={el.type === "stage" ? 8 : (el.type === "barrier" ? 2 : 6)}
                        fill={
                          el.type === "stage" ? "url(#stage-grad)" :
                            el.type === "booth" ? "url(#booth-grad)" :
                              el.type === "barrier" ? "url(#barrier-grad)" :
                                el.type === "exit" ? "url(#exit-grad)" : "url(#table-grad)"
                        }
                        stroke={isColliding ? "#ef4444" : (isSelected ? "#818cf8" : "#4f46e5")}
                        strokeWidth={el.type === "stage" ? 2.5 : 2}
                        className={`fp-svg-element ${isSelected ? "fp-svg-element-selected" : ""} ${isColliding ? "fp-svg-element-colliding" : ""}`}
                      />
                    </>
                  )}

                  {/* Element Inner Label Text */}
                  <text
                    x={el.x + el.width / 2 - projOffset}
                    y={el.y + el.height / 2 - projOffset + 4}
                    textAnchor="middle"
                    fill="#f3f4f6"
                    fontSize={el.type === "stage" ? "14" : "11"}
                    fontWeight="700"
                    pointerEvents="none"
                    style={{ userSelect: "none", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
                  >
                    {el.label}
                  </text>

                  {/* Visual indication of occupied seating capacity */}
                  {el.seatsCount > 0 && (
                    <text
                      x={el.x + el.width / 2 - projOffset}
                      y={el.y + el.height / 2 - projOffset + 18}
                      textAnchor="middle"
                      fill="#a5b4fc"
                      fontSize="9"
                      fontWeight="600"
                      pointerEvents="none"
                      style={{ userSelect: "none" }}
                    >
                      {Object.keys(el.assignedAttendees).length} / {el.seatsCount} Seats
                    </text>
                  )}

                  {/* Overlay warning icon if colliding */}
                  {isColliding && (
                    <g transform={`translate(${el.x + el.width - projOffset - 24}, ${el.y - projOffset + 6})`}>
                      <circle cx={8} cy={8} r={9} fill="#ef4444" />
                      <text x={8} y={11} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">!</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right Details Panel / Seating inspector */}
        <aside
          className="fp-sidebar fp-sidebar-right"
          aria-label="Element properties and seating configuration sidebar"
        >
          {activeElement ? (
            <>
              {/* Properties Section */}
              <div className="fp-sidebar-section">
                <div className="flex items-center justify-between mb-4">
                  <div className="fp-section-title">Element Details</div>
                  <button 
                    <button
                    onClick={handleDeleteSelected}
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
        </aside>
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteSelected}
        title="Delete Element"
        message="Are you sure you want to delete this floor plan element? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default FloorPlanDesigner;
