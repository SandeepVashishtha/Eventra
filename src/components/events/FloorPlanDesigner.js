import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Save, RotateCcw, Plus, Minus, Move, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { safeLocalStorage } from "../../utils/safeStorage";
import ConfirmationModal from "../../common/ConfirmationModal";
import ElementPalette from "./FloorPlan/ElementPalette";
import PropertiesPanel from "./FloorPlan/PropertiesPanel";
import { PRESETS } from "../../constants/floorPlanPresets";
import { checkCollision, getSeatPositions } from "../../utils/floorPlanGeometry";
import {
  exportAsSVG,
  exportAsPNG,
  downloadLayoutJSON,
  importLayoutJSON,
} from "../../utils/floorPlanExport";
import "./FloorPlanDesigner.css";

const FloorPlanDesigner = ({ eventId = "default", onDirtyChange }) => {
  const navigate = useNavigate();
  const [elements, setElements] = useState([]);
  const [lastSavedElementsStr, setLastSavedElementsStr] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [announcement, setAnnouncement] = useState("");
  const announce = useCallback((message) => {
    setAnnouncement("");
<<<<<<< HEAD
    setTimeout(() => { setAnnouncement(message); }, 50);
  }, []);
=======
    setTimeout(() => {
      setAnnouncement(message);
    }, 50);
  };
>>>>>>> 7d75e43a (Add safe localStorage access with error handling)

  const [zoom, setZoom] = useState(0.8);
  const [panOffset, setPanOffset] = useState({ x: 50, y: 30 });
  const [isPanMode, setIsPanMode] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);

  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const zoomRef = useRef(zoom);
  const snapToGridRef = useRef(snapToGrid);
  const selectedIdRef = useRef(selectedId);
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const elementStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const elementsMapRef = useRef(new Map());

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  useEffect(() => {
    snapToGridRef.current = snapToGrid;
  }, [snapToGrid]);
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);
  useEffect(() => {
    elementsMapRef.current = new Map(elements.map((el) => [el.id, el]));
  }, [elements]);

  const updateSelectedElement = useCallback((key, value) => {
    const updates = typeof key === "object" ? key : { [key]: value };
    const currentSelectedId = selectedIdRef.current;
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === currentSelectedId) {
          let updated = { ...el, ...updates };
          if ("seatsCount" in updates) {
            const seatsCountVal = updates.seatsCount;
            const freshAssigned = {};
            Object.keys(el.assignedAttendees).forEach((k) => {
              if (parseInt(k, 10) < seatsCountVal) {
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
  }, []);

  const handleSeatAssign = (seatIndex, attendeeName) => {
    setElements(
      elements.map((el) => {
        const nextAssignments = { ...el.assignedAttendees };
        Object.keys(nextAssignments).forEach((k) => {
          if (nextAssignments[k] === attendeeName) {
            delete nextAssignments[k];
          }
        });
        if (el.id === selectedId) {
          if (attendeeName !== "") {
            nextAssignments[seatIndex] = attendeeName;
          } else {
            delete nextAssignments[seatIndex];
          }
          return { ...el, assignedAttendees: nextAssignments };
        }
        return { ...el, assignedAttendees: nextAssignments };
      })
    );
  };

  useEffect(() => {
    const savedLayout = safeLocalStorage.getItem(`eventra_floorplan_${eventId}`);
    let initialElements = [];
    if (savedLayout) {
      try {
        initialElements = JSON.parse(savedLayout);
      } catch (e) {
        toast.error("Invalid floor plan format");
        initialElements = PRESETS.banquet;
      }
    } else {
      initialElements = PRESETS.banquet;
    }
    setElements(initialElements);
    setLastSavedElementsStr(JSON.stringify(initialElements));
  }, [eventId]);

  const isDirty = !!(lastSavedElementsStr && JSON.stringify(elements) !== lastSavedElementsStr);

  useEffect(() => {
    if (onDirtyChange) onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes on your floor plan layout. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const saveLayout = () => {
    const serialized = JSON.stringify(elements);
    safeLocalStorage.setItem(`eventra_floorplan_${eventId}`, serialized);
    setLastSavedElementsStr(serialized);
    toast.success("Venue floor plan successfully saved!");
    announce("Venue floor plan successfully saved!");
  };

  const loadPreset = (presetName) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p className="text-sm font-semibold mb-2">Load {presetName} layout?</p>
          <p className="text-xs text-gray-500 mb-3">Current changes will be overwritten.</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setElements(PRESETS[presetName]);
                setSelectedId(null);
                toast.success(`${presetName} layout loaded!`);
                announce(`${presetName} layout loaded!`);
                closeToast();
              }}
              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Yes, Load
            </button>
            <button
              onClick={closeToast}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        position: "top-center",
      }
    );
  };

  const handleAddElement = (type) => {
    const id = `${type}-${Date.now()}`;
    const newElement = {
      id,
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")}`,
      x: 350,
      y: 350,
      width:
        type === "stage" ? 240 : type === "rect-table" ? 180 : type === "round-table" ? 120 : 80,
      height:
        type === "stage" ? 100 : type === "rect-table" ? 60 : type === "round-table" ? 120 : 80,
      rotation: 0,
      seatsCount: type.includes("table") ? 6 : 0,
      assignedAttendees: {},
    };
    setElements([...elements, newElement]);
    setSelectedId(id);
    announce(`New ${type.replace("-", " ")} added at position X 350, Y 350. Selected.`);
  };

  const handleDeleteSelected = useCallback(() => setIsDeleteModalOpen(true), []);

  const confirmDeleteSelected = () => {
    if (selectedId) {
      setElements(elements.filter((el) => el.id !== selectedId));
      setSelectedId(null);
      toast.success("Element deleted successfully!");
      announce("Element deleted successfully.");
    }
    setIsDeleteModalOpen(false);
  };

  const handleImport = (importedData) => {
    setElements(importedData);
    setSelectedId(null);
    toast.success("Floor plan layout imported successfully!");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "SELECT")
      )
        return;
      if (!selectedIdRef.current) return;
      const activeEl = elementsMapRef.current.get(selectedIdRef.current);
      if (!activeEl) return;
      const step = snapToGridRef.current ? 20 : 5;
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          updateSelectedElement("y", Math.max(0, activeEl.y - step));
          announce(`${activeEl.label} moved up to Y ${Math.max(0, activeEl.y - step)}.`);
          break;
        case "ArrowDown":
          e.preventDefault();
          updateSelectedElement("y", Math.min(800 - activeEl.height, activeEl.y + step));
          announce(
            `${activeEl.label} moved down to Y ${Math.min(800 - activeEl.height, activeEl.y + step)}.`
          );
          break;
        case "ArrowLeft":
          e.preventDefault();
          updateSelectedElement("x", Math.max(0, activeEl.x - step));
          announce(`${activeEl.label} moved left to X ${Math.max(0, activeEl.x - step)}.`);
          break;
        case "ArrowRight":
          e.preventDefault();
          updateSelectedElement("x", Math.min(1000 - activeEl.width, activeEl.x + step));
          announce(
            `${activeEl.label} moved right to X ${Math.min(1000 - activeEl.width, activeEl.x + step)}.`
          );
          break;
        case "r":
        case "R":
          e.preventDefault();
          const nextRotation = (activeEl.rotation + 15) % 360;
          updateSelectedElement("rotation", nextRotation);
          announce(`${activeEl.label} rotated to ${nextRotation} degrees.`);
          break;
        case "Delete":
        case "Backspace":
          e.preventDefault();
          handleDeleteSelected();
          break;
        case "+":
        case "=":
          e.preventDefault();
          updateSelectedElement({
            width: Math.min(activeEl.type === "stage" ? 600 : 300, activeEl.width + 10),
            height: activeEl.type.includes("round")
              ? Math.min(activeEl.type === "stage" ? 600 : 300, activeEl.width + 10)
              : Math.min(activeEl.type === "stage" ? 400 : 200, activeEl.height + 10),
          });
          break;
        case "-":
        case "_":
          e.preventDefault();
          const minSize = activeEl.type.includes("table") ? 60 : 20;
          updateSelectedElement({
            width: Math.max(minSize, activeEl.width - 10),
            height: activeEl.type.includes("round")
              ? Math.max(minSize, activeEl.width - 10)
              : Math.max(minSize, activeEl.height - 10),
          });
          break;
        case "Escape":
          e.preventDefault();
          setSelectedId(null);
          announce("Deselected floor plan element.");
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [updateSelectedElement, announce, handleDeleteSelected, setSelectedId]);

  const handleMouseDown = useCallback(
    (e, elementId = null) => {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      if (isPanMode || !elementId) {
        isPanningRef.current = true;
        panStartRef.current = { x: clientX - panOffset.x, y: clientY - panOffset.y };
      } else if (elementId) {
        setSelectedId(elementId);
        selectedIdRef.current = elementId;
        isDraggingRef.current = true;
        setElements((prev) => {
          const el = prev.find((item) => item.id === elementId);
          if (el) {
            dragStartRef.current = { x: clientX, y: clientY };
            elementStartRef.current = { x: el.x, y: el.y };
          }
          return prev;
        });
      }
    },
    [isPanMode, panOffset.x, panOffset.y]
  );

  const handleMouseMove = useCallback((e) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (isPanningRef.current) {
        setPanOffset({ x: clientX - panStartRef.current.x, y: clientY - panStartRef.current.y });
        return;
      }
      const currentSelectedId = selectedIdRef.current;
      if (isDraggingRef.current && currentSelectedId) {
        const currentZoom = zoomRef.current;
        const currentSnap = snapToGridRef.current;
        let newX = elementStartRef.current.x + (clientX - dragStartRef.current.x) / currentZoom;
        let newY = elementStartRef.current.y + (clientY - dragStartRef.current.y) / currentZoom;
        if (currentSnap) {
          newX = Math.round(newX / 20) * 20;
          newY = Math.round(newY / 20) * 20;
        }
        newX = Math.max(10, Math.min(990, newX));
        newY = Math.max(10, Math.min(990, newY));
        setElements((prev) =>
          prev.map((el) => (el.id === currentSelectedId ? { ...el, x: newX, y: newY } : el))
        );
      }
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    isPanningRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove, { passive: true });
    window.addEventListener("touchend", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [handleMouseMove, handleMouseUp]);

  const activeElement = useMemo(
    () => elements.find((el) => el.id === selectedId),
    [elements, selectedId]
  );

  const totalOccupiedSeats = useMemo(
    () => elements.reduce((acc, el) => acc + Object.keys(el.assignedAttendees || {}).length, 0),
    [elements]
  );
  const totalMaxSeats = useMemo(
    () => elements.reduce((acc, el) => acc + (el.seatsCount || 0), 0),
    [elements]
  );

  const [collisionMap, setCollisionMap] = useState(new Map());
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const collisions = new Map();
      const GRID_SIZE = 100;
      const buckets = new Map();
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        const bx = Math.floor(el.x / GRID_SIZE);
        const by = Math.floor(el.y / GRID_SIZE);
        const key = `${bx},${by}`;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(el);
      }
      for (const bucket of buckets.values()) {
        for (let i = 0; i < bucket.length; i++) {
          for (let j = i + 1; j < bucket.length; j++) {
            if (checkCollision(bucket[i], bucket[j])) {
              collisions.set(bucket[i].id, true);
              collisions.set(bucket[j].id, true);
            }
          }
        }
      }
      setCollisionMap(collisions);
    }, 150);
    return () => clearTimeout(timeoutId);
  }, [elements]);

  const anyCollision = collisionMap.size > 0;

  return (
    <div className="fp-container">
      <div
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: "0",
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: "0",
        }}
        aria-live="polite"
        role="status"
      >
        {announcement}
      </div>
      <div className="fp-topbar">
        <div className="flex items-center gap-3">
          <Layout className="text-indigo-500" size={24} />
          <div>
            <div className="fp-topbar-title">Interactive Venue Seating & Floor Planner</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Design floors, place elements, and organize attendee seating slots
            </div>
          </div>
        </div>
        <div className="fp-topbar-actions">
          <div className="hidden md:flex items-center gap-1.5 bg-gray-900/60 border border-gray-800/80 px-2.5 py-1.5 rounded-lg mr-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Presets:
            </span>
            <button
              onClick={() => loadPreset("empty")}
              className="text-xs font-semibold px-2 py-0.5 hover:text-indigo-400 text-gray-300 transition-colors"
            >
              Clear
            </button>
            <span className="text-gray-700">|</span>
            <button
              onClick={() => loadPreset("banquet")}
              className="text-xs font-semibold px-2 py-0.5 hover:text-indigo-400 text-gray-300 transition-colors"
            >
              Banquet
            </button>
            <span className="text-gray-700">|</span>
            <button
              onClick={() => loadPreset("conference")}
              className="text-xs font-semibold px-2 py-0.5 hover:text-indigo-400 text-gray-300 transition-colors"
            >
              Keynote
            </button>
          </div>
          <button
            onClick={() => navigate(`/events/${eventId}/virtual-venue-walkthrough`)}
            className="fp-btn fp-btn-primary"
            aria-label="3D Walkthrough"
          >
            3D Walkthrough
          </button>
          <button onClick={saveLayout} className="fp-btn fp-btn-primary" aria-label="button">
            <Save size={16} /> Save Layout
          </button>
        </div>
      </div>

      <div className="fp-workspace">
        <ElementPalette
          elements={elements}
          totalOccupiedSeats={totalOccupiedSeats}
          totalMaxSeats={totalMaxSeats}
          snapToGrid={snapToGrid}
          setSnapToGrid={setSnapToGrid}
          onAddElement={handleAddElement}
          loadPreset={loadPreset}
          handleExportPNG={() => exportAsPNG(canvasRef, eventId)}
          handleExportSVG={() => exportAsSVG(canvasRef, eventId)}
          handleDownloadJSON={() => downloadLayoutJSON(elements, eventId)}
          handleImportJSON={(e) => importLayoutJSON(e, handleImport)}
        />

        <div
          className="fp-canvas-wrapper"
          onMouseDown={(e) => handleMouseDown(e, null)}
          onTouchStart={(e) => {
            if (isPanMode && e.cancelable) e.preventDefault();
            handleMouseDown(e, null);
          }}
        >
          {anyCollision && (
            <div className="fp-collision-warning-badge">
              <AlertTriangle size={14} className="animate-pulse" />
              <span>OVERLAP COLLISION DETECTED</span>
            </div>
          )}

          <div className="fp-controls-floating">
            <button
              className={`fp-control-btn ${isPanMode ? "fp-control-btn-active" : ""}`}
              title="Pan Tool (Move screen)"
              onClick={() => setIsPanMode(!isPanMode)}
            >
              <Move size={16} />
            </button>
            <span className="text-gray-700">|</span>
            <button
              className="fp-control-btn"
              title="Zoom In"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            >
              <Plus size={16} />
            </button>
            <div className="fp-zoom-display">{Math.round(zoom * 100)}%</div>
            <button
              className="fp-control-btn"
              title="Zoom Out"
              onClick={() => setZoom(Math.max(0.4, zoom - 0.1))}
            >
              <Minus size={16} />
            </button>
            <span className="text-gray-700">|</span>
            <button
              className="fp-control-btn"
              title="Reset view"
              onClick={() => {
                setZoom(0.8);
                setPanOffset({ x: 50, y: 30 });
              }}
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <svg
            ref={canvasRef}
            className="fp-canvas-svg"
            width={850}
            height={600}
            viewBox="0 0 1000 800"
            style={{
              transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transformOrigin: "center center",
              transition:
                isDraggingRef.current || isPanningRef.current
                  ? "none"
                  : "transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            <defs>
              <pattern id="canvas-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(99, 102, 241, 0.04)"
                  strokeWidth="1"
                />
                <path
                  d="M 80 0 L 0 0 0 80"
                  fill="none"
                  stroke="rgba(99, 102, 241, 0.08)"
                  strokeWidth="1.5"
                />
              </pattern>
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
            {elements.map((el) => {
              const isSelected = el.id === selectedId;
              const isColliding = collisionMap.has(el.id);
              const projOffset = 10;
              return (
                <g
                  key={el.id}
                  data-element-id={el.id}
                  data-element-type={el.type}
                  transform={`rotate(${el.rotation}, ${el.x + el.width / 2}, ${el.y + el.height / 2})`}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e, el.id);
                  }}
                  onTouchStart={(e) => {
                    if (e.cancelable) e.preventDefault();
                    e.stopPropagation();
                    handleMouseDown(e, el.id);
                  }}
                  className="fp-element-group"
                  tabIndex={0}
                  role="button"
                  aria-label={`Floor plan element: ${el.label}, type: ${el.type.replace("-", " ")}, ${el.seatsCount > 0 ? `${Object.keys(el.assignedAttendees).length} of ${el.seatsCount} seats occupied` : "no seating"}, position: X ${Math.round(el.x)}, Y ${Math.round(el.y)}`}
                  aria-pressed={isSelected}
                  onFocus={() => {
                    setSelectedId(el.id);
                    selectedIdRef.current = el.id;
                    announce(
                      `${el.label} selected. Keyboard controls active: arrow keys to move, R to rotate, + or - to resize, Delete to delete.`
                    );
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(el.id);
                      selectedIdRef.current = el.id;
                    }
                  }}
                >
                  {getSeatPositions(el).map((seat) => {
                    const isOccupied = el.assignedAttendees[seat.index];
                    return (
                      <g
                        key={`seat-${el.id}-${seat.index}`}
                        className="fp-seat-25d"
                        data-seat-id={`${el.id}-${seat.index}`}
                      >
                        <circle cx={seat.x} cy={seat.y + 3} r={11} fill="rgba(0, 0, 0, 0.4)" />
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
                  {el.type === "round-table" ? (
                    <>
                      <path
                        d={`M ${el.x + el.width / 2 - el.width / 2} ${el.y + el.height / 2} A ${el.width / 2} ${el.height / 2} 0 0 0 ${el.x + el.width / 2 + el.width / 2} ${el.y + el.height / 2} L ${el.x + el.width / 2 + el.width / 2 - projOffset} ${el.y + el.height / 2 + projOffset} A ${el.width / 2} ${el.height / 2} 0 0 1 ${el.x + el.width / 2 - el.width / 2 - projOffset} ${el.y + el.height / 2 + projOffset} Z`}
                        fill="rgba(10, 8, 30, 0.95)"
                        stroke="rgba(255, 255, 255, 0.05)"
                      />
                      <circle
                        cx={el.x + el.width / 2 - projOffset}
                        cy={el.y + el.height / 2 - projOffset}
                        r={el.width / 2}
                        fill="url(#table-grad)"
                        stroke={isColliding ? "#ef4444" : isSelected ? "#818cf8" : "#4f46e5"}
                        strokeWidth={2}
                        className={`fp-svg-element ${isSelected ? "fp-svg-element-selected" : ""} ${isColliding ? "fp-svg-element-colliding" : ""}`}
                      />
                    </>
                  ) : (
                    <>
                      <path
                        d={`M ${el.x} ${el.y + el.height} L ${el.x - projOffset} ${el.y + el.height - projOffset} L ${el.x + el.width - projOffset} ${el.y + el.height - projOffset} L ${el.x + el.width} ${el.y + el.height} Z`}
                        fill="rgba(15, 12, 28, 0.95)"
                        stroke="rgba(255, 255, 255, 0.05)"
                      />
                      <path
                        d={`M ${el.x + el.width} ${el.y} L ${el.x + el.width - projOffset} ${el.y - projOffset} L ${el.x + el.width - projOffset} ${el.y + el.height - projOffset} L ${el.x + el.width} ${el.y + el.height} Z`}
                        fill="rgba(8, 6, 18, 0.95)"
                        stroke="rgba(255, 255, 255, 0.05)"
                      />
                      <rect
                        x={el.x - projOffset}
                        y={el.y - projOffset}
                        width={el.width}
                        height={el.height}
                        rx={el.type === "stage" ? 8 : el.type === "barrier" ? 2 : 6}
                        fill={
                          el.type === "stage"
                            ? "url(#stage-grad)"
                            : el.type === "booth"
                              ? "url(#booth-grad)"
                              : el.type === "barrier"
                                ? "url(#barrier-grad)"
                                : el.type === "exit"
                                  ? "url(#exit-grad)"
                                  : "url(#table-grad)"
                        }
                        stroke={isColliding ? "#ef4444" : isSelected ? "#818cf8" : "#4f46e5"}
                        strokeWidth={el.type === "stage" ? 2.5 : 2}
                        className={`fp-svg-element ${isSelected ? "fp-svg-element-selected" : ""} ${isColliding ? "fp-svg-element-colliding" : ""}`}
                      />
                    </>
                  )}
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
                  {isColliding && (
                    <g
                      transform={`translate(${el.x + el.width - projOffset - 24}, ${el.y - projOffset + 6})`}
                    >
                      <circle cx={8} cy={8} r={9} fill="#ef4444" />
                      <text
                        x={8}
                        y={11}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        !
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <PropertiesPanel
          activeElement={activeElement}
          elements={elements}
          onUpdateSelected={updateSelectedElement}
          onDeleteSelected={handleDeleteSelected}
          onSeatAssign={handleSeatAssign}
        />
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
