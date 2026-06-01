import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle,
  ShieldAlert,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import "./SpatialSeatSelector.css";

// Fallback presets if no venue layout is stored yet
const DEFAULT_PRESETS = {
  banquet: [
    {
      id: "stage-1",
      type: "stage",
      label: "Main Stage",
      x: 350,
      y: 50,
      width: 300,
      height: 120,
      rotation: 0,
      seatsCount: 0,
      assignedAttendees: {},
    },
    {
      id: "table-1",
      type: "round-table",
      label: "VIP Table A",
      x: 200,
      y: 300,
      width: 140,
      height: 140,
      rotation: 0,
      seatsCount: 8,
      tier: "VIP Front Row",
      assignedAttendees: { 0: "Amit Sharma", 1: "Priya Singh" },
    },
    {
      id: "table-2",
      type: "round-table",
      label: "VIP Table B",
      x: 660,
      y: 300,
      width: 140,
      height: 140,
      rotation: 0,
      seatsCount: 8,
      tier: "VIP Front Row",
      assignedAttendees: { 2: "Rohit Verma", 3: "Neha Kapoor" },
    },
    {
      id: "table-3",
      type: "round-table",
      label: "Table 1",
      x: 120,
      y: 520,
      width: 120,
      height: 120,
      rotation: 0,
      seatsCount: 6,
      tier: "General Seating",
      assignedAttendees: {},
    },
    {
      id: "table-4",
      type: "round-table",
      label: "Table 2",
      x: 440,
      y: 520,
      width: 120,
      height: 120,
      rotation: 0,
      seatsCount: 6,
      tier: "General Seating",
      assignedAttendees: {},
    },
    {
      id: "table-5",
      type: "round-table",
      label: "Table 3",
      x: 760,
      y: 520,
      width: 120,
      height: 120,
      rotation: 0,
      seatsCount: 6,
      tier: "General Seating",
      assignedAttendees: {},
    },
    {
      id: "booth-1",
      type: "booth",
      label: "Sound & Lights",
      x: 450,
      y: 750,
      width: 100,
      height: 80,
      rotation: 0,
      seatsCount: 0,
      assignedAttendees: {},
    },
    {
      id: "barrier-1",
      type: "barrier",
      label: "Security Line",
      x: 250,
      y: 220,
      width: 500,
      height: 10,
      rotation: 0,
      seatsCount: 0,
      assignedAttendees: {},
    },
  ],
};

const SpatialSeatSelector = ({
  eventId = "default",
  selectedSeat = null,
  onSelectSeat = () => {},
  readOnly = false,
}) => {
  const [elements, setElements] = useState([]);
  const [zoom, setZoom] = useState(0.85);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [hoveredSeat, setHoveredSeat] = useState(null);

  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  // Load venue floor plan layout
  useEffect(() => {
    const savedLayout = localStorage.getItem(`eventra_floorplan_${eventId}`);
    let initialElements = [];
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        if (Array.isArray(parsed)) {
          // Strict schema validation and sanitization
          initialElements = parsed.map((el) => ({
            ...el,
            id:
              typeof el.id === "string" || typeof el.id === "number"
                ? String(el.id)
                : Math.random().toString(36).substring(2, 9),
            type: typeof el.type === "string" ? el.type : "round-table",
            label: typeof el.label === "string" ? el.label : "Unknown",
            x: Number(el.x) || 0,
            y: Number(el.y) || 0,
            width: Number(el.width) || 100,
            height: Number(el.height) || 100,
            rotation: Number(el.rotation) || 0,
            seatsCount: Number(el.seatsCount) || 0,
            tier: typeof el.tier === "string" ? el.tier : "General Seating",
            assignedAttendees:
              typeof el.assignedAttendees === "object" && el.assignedAttendees !== null
                ? el.assignedAttendees
                : {},
            seatLabels:
              typeof el.seatLabels === "object" && el.seatLabels !== null ? el.seatLabels : {},
          }));
        } else {
          initialElements = DEFAULT_PRESETS.banquet;
        }
      } catch (e) {
        initialElements = DEFAULT_PRESETS.banquet;
      }
    } else {
      initialElements = DEFAULT_PRESETS.banquet;
    }
    setElements(initialElements);
  }, [eventId]);

  // Stable math projection function for seat coordinates
  const getSeatPositions = useCallback((el) => {
    const positions = [];
    const count = el.seatsCount;
    if (count <= 0) return positions;

    const projOffset = 10;

    if (el.type === "round-table") {
      const radius = el.width / 2;
      const centerX = el.x + radius - projOffset;
      const centerY = el.y + radius - projOffset;
      const chairDistance = radius + 22;

      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count + (el.rotation * Math.PI) / 180;
        positions.push({
          x: centerX + chairDistance * Math.cos(angle),
          y: centerY + chairDistance * Math.sin(angle),
          index: i,
        });
      }
    } else if (el.type === "rect-table") {
      const width = el.width;
      const height = el.height;
      const halfW = width / 2;
      const halfH = height / 2;

      const cX = el.x + halfW - projOffset;
      const cY = el.y + halfH - projOffset;

      const seatsPerSide = Math.ceil(count / 2);
      const spacingX = width / (seatsPerSide + 1);
      const rad = (el.rotation * Math.PI) / 180;

      const rotatePt = (px, py) => {
        const dx = px - cX;
        const dy = py - cY;
        return {
          x: cX + dx * Math.cos(rad) - dy * Math.sin(rad),
          y: cY + dx * Math.sin(rad) + dy * Math.cos(rad),
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
  }, []);

  // Compute all available and total seat statistics
  const seatStats = useMemo(() => {
    let total = 0;
    let occupied = 0;
    elements.forEach((el) => {
      if (el.seatsCount > 0) {
        total += el.seatsCount;
        occupied += Object.keys(el.assignedAttendees || {}).length;
      }
    });
    return { total, occupied, available: total - occupied };
  }, [elements]);

  // Pre-calculate seat positions to avoid massive CPU spikes during pan/zoom renders
  const elementSeatPositions = useMemo(() => {
    const map = new Map();
    elements.forEach((el) => {
      map.set(el.id, getSeatPositions(el));
    });
    return map;
  }, [elements, getSeatPositions]);

  // Auto-center and zoom to highlighted seat in read-only dashboard view
  useEffect(() => {
    if (readOnly && selectedSeat && elements.length > 0) {
      const el = elements.find((item) => item.id === selectedSeat.elementId);
      if (el) {
        const positions = getSeatPositions(el);
        const seat = positions.find((s) => s.index === selectedSeat.seatIndex);
        if (seat) {
          setZoom(1.3);
          setPanOffset({
            x: 500 - seat.x,
            y: 400 - seat.y,
          });
        }
      }
    }
  }, [readOnly, selectedSeat, elements, getSeatPositions]);

  // Imperatively attach non-passive wheel event listener to avoid console intervention error
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom((prev) => Math.max(0.4, Math.min(2.5, prev * factor)));
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Pointer drag panning handlers
  const handlePointerDown = (e) => {
    // Left click or single touch only
    if (e.button && e.button !== 0) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { x: panOffset.x, y: panOffset.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Check if a specific seat index on an element is selected
  const isSeatSelected = (elId, idx) => {
    return selectedSeat && selectedSeat.elementId === elId && selectedSeat.seatIndex === idx;
  };

  // Selection callback
  const handleSeatClick = (el, seat, seatIdx) => {
    if (readOnly) return;
    const isOccupied = el.assignedAttendees[seatIdx];
    if (isOccupied) return;

    const label = (el.seatLabels && el.seatLabels[seatIdx]) || `Seat ${seatIdx + 1}`;
    const tier = el.tier || "General Seating";

    onSelectSeat({
      elementId: el.id,
      seatIndex: seatIdx,
      seatLabel: `${el.label} - ${label}`,
      tier: tier,
    });
  };

  return (
    <div className="ssp-container">
      {/* Premium Statistics Header */}
      {!readOnly && (
        <div className="ssp-stats-header">
          <div className="ssp-stat-pill">
            <Sparkles size={14} className="text-amber-400" />
            <span>Interactive Floor Seating</span>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-xs text-zinc-400">
              Available: <span className="font-bold text-emerald-400">{seatStats.available}</span> /{" "}
              {seatStats.total}
            </div>
            <div className="text-xs text-zinc-400">
              Occupied: <span className="font-bold text-indigo-400">{seatStats.occupied}</span>
            </div>
          </div>
        </div>
      )}

      {/* Seating Viewport */}
      <div
        ref={containerRef}
        className="ssp-viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <svg
          className="ssp-blueprint-svg"
          width="100%"
          height="100%"
          viewBox="0 0 1000 800"
          style={{
            transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: "center center",
            transition: isDraggingRef.current
              ? "none"
              : "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {/* Visual Defs and Gradients */}
          <defs>
            <pattern id="blueprint-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke="rgba(99, 102, 241, 0.03)"
                strokeWidth="1"
              />
            </pattern>

            {/* VIP/Premium Seat Gradients */}
            <radialGradient id="ssp-vip-avail" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </radialGradient>

            {/* General Admission Gradients */}
            <radialGradient id="ssp-gen-avail" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </radialGradient>

            {/* Selection Gradients */}
            <radialGradient id="ssp-selected" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0891b2" />
            </radialGradient>
          </defs>

          {/* Grid Background */}
          <rect width="1000" height="800" fill="url(#blueprint-grid)" rx="8" />

          {/* Render Room elements */}
          {elements.map((el) => {
            const isVIP = el.tier && el.tier.toLowerCase().includes("vip");
            const projOffset = 10;

            return (
              <g
                key={el.id}
                transform={`rotate(${el.rotation}, ${el.x + el.width / 2}, ${el.y + el.height / 2})`}
              >
                {/* Oblique 2.5D extrusion base walls */}
                {el.type === "round-table" ? (
                  <>
                    <path
                      d={`M ${el.x + el.width / 2 - el.width / 2} ${el.y + el.height / 2} 
                          A ${el.width / 2} ${el.height / 2} 0 0 0 ${el.x + el.width / 2 + el.width / 2} ${el.y + el.height / 2} 
                          L ${el.x + el.width / 2 + el.width / 2 - projOffset} ${el.y + el.height / 2 + projOffset} 
                          A ${el.width / 2} ${el.height / 2} 0 0 1 ${el.x + el.width / 2 - el.width / 2 - projOffset} ${el.y + el.height / 2 + projOffset} Z`}
                      fill="rgba(8, 7, 24, 0.9)"
                      stroke="rgba(255, 255, 255, 0.03)"
                    />
                    <circle
                      cx={el.x + el.width / 2 - projOffset}
                      cy={el.y + el.height / 2 - projOffset}
                      r={el.width / 2}
                      fill="rgba(18, 16, 45, 0.95)"
                      stroke={isVIP ? "#d97706" : "#4f46e5"}
                      strokeWidth={1.5}
                    />
                  </>
                ) : el.type !== "stage" &&
                  el.type !== "barrier" &&
                  el.type !== "exit" &&
                  el.type !== "booth" ? (
                  <>
                    <path
                      d={`M ${el.x} ${el.y + el.height} 
                          L ${el.x - projOffset} ${el.y + el.height - projOffset} 
                          L ${el.x + el.width - projOffset} ${el.y + el.height - projOffset} 
                          L ${el.x + el.width} ${el.y + el.height} Z`}
                      fill="rgba(8, 7, 24, 0.9)"
                    />
                    <rect
                      x={el.x - projOffset}
                      y={el.y - projOffset}
                      width={el.width}
                      height={el.height}
                      rx={6}
                      fill="rgba(18, 16, 45, 0.95)"
                      stroke={isVIP ? "#d97706" : "#4f46e5"}
                      strokeWidth={1.5}
                    />
                  </>
                ) : (
                  // Background/Static venue layouts (Stage, exits, etc)
                  <rect
                    x={el.x - projOffset}
                    y={el.y - projOffset}
                    width={el.width}
                    height={el.height}
                    rx={el.type === "stage" ? 8 : 2}
                    fill={
                      el.type === "stage"
                        ? "rgba(30, 41, 59, 0.85)"
                        : el.type === "exit"
                          ? "rgba(220, 38, 38, 0.15)"
                          : "rgba(31, 41, 55, 0.5)"
                    }
                    stroke={
                      el.type === "stage" ? "#475569" : el.type === "exit" ? "#dc2626" : "#374151"
                    }
                    strokeWidth={el.type === "stage" ? 2 : 1}
                  />
                )}

                {/* Table or block Text Label */}
                <text
                  x={el.x + el.width / 2 - projOffset}
                  y={el.y + el.height / 2 - projOffset + 4}
                  textAnchor="middle"
                  fill={isVIP ? "#fbbf24" : "#e2e8f0"}
                  fontSize={el.type === "stage" ? "14" : "11"}
                  fontWeight="bold"
                  pointerEvents="none"
                  style={{ userSelect: "none", opacity: 0.8 }}
                >
                  {el.label}
                </text>

                {/* Render Interactive Chair elements */}
                {(elementSeatPositions.get(el.id) || []).map((seat) => {
                  const isOccupied = el.assignedAttendees[seat.index];
                  const isSelected = isSeatSelected(el.id, seat.index);
                  const seatLabel =
                    (el.seatLabels && el.seatLabels[seat.index]) || `Seat ${seat.index + 1}`;
                  const seatTier = el.tier || (isVIP ? "VIP Front Row" : "General Seating");

                  // Glow effect for selected seat or active highlight
                  const glowClass = isSelected ? "ssp-seat-glowing" : "";

                  return (
                    <g
                      key={`seat-${el.id}-${seat.index}`}
                      className={`ssp-interactive-seat ${glowClass}`}
                      onClick={() => handleSeatClick(el, seat, seat.index)}
                      onMouseEnter={(e) => {
                        const bbox = e.currentTarget.getBoundingClientRect();
                        const vrect = containerRef.current.getBoundingClientRect();
                        setHoveredSeat({
                          el,
                          seatIdx: seat.index,
                          label: seatLabel,
                          tier: seatTier,
                          occupiedBy: isOccupied || null,
                          x: bbox.left - vrect.left + bbox.width / 2,
                          y: bbox.top - vrect.top - 10,
                        });
                      }}
                      onMouseLeave={() => setHoveredSeat(null)}
                      style={{ cursor: isOccupied ? "not-allowed" : "pointer" }}
                    >
                      {/* 2.5D Chair base drop shadow */}
                      <circle cx={seat.x} cy={seat.y + 3} r={11} fill="rgba(0, 0, 0, 0.45)" />

                      {/* Main Interactive Seat circle */}
                      <circle
                        cx={seat.x}
                        cy={seat.y}
                        r={11}
                        fill={
                          isSelected
                            ? "url(#ssp-selected)"
                            : isOccupied
                              ? "#27272a"
                              : isVIP
                                ? "url(#ssp-vip-avail)"
                                : "url(#ssp-gen-avail)"
                        }
                        stroke={
                          isSelected
                            ? "#67e8f9"
                            : isOccupied
                              ? "#18181b"
                              : isVIP
                                ? "#f59e0b"
                                : "#6366f1"
                        }
                        strokeWidth={1.5}
                        style={{
                          transition:
                            "fill 0.25s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />

                      {/* RADAR pulsing overlay loop animation inside dashboard view */}
                      {readOnly && isSelected && (
                        <circle
                          cx={seat.x}
                          cy={seat.y}
                          r={28}
                          fill="none"
                          stroke="#22d3ee"
                          strokeWidth={2}
                          className="ssp-radar-pulse"
                          pointerEvents="none"
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Viewport Zoom & Reset Controls floating overlay */}
        <div className="ssp-viewport-controls">
          <button
            type="button"
            className="ssp-ctrl-btn"
            title="Zoom In"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
          >
            <ZoomIn size={15} />
          </button>
          <div className="ssp-zoom-pct">{Math.round(zoom * 100)}%</div>
          <button
            type="button"
            className="ssp-ctrl-btn"
            title="Zoom Out"
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
          >
            <ZoomOut size={15} />
          </button>
          <div className="ssp-ctrl-divider" />
          <button
            type="button"
            className="ssp-ctrl-btn"
            title="Reset View"
            onClick={() => {
              setZoom(0.85);
              setPanOffset({ x: 0, y: 0 });
            }}
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Dynamic Seating Hover POPUP Indicator Card */}
        <AnimatePresence>
          {hoveredSeat && (
            <motion.div
              className="ssp-hover-popup"
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              transition={{ duration: 0.15 }}
              style={{
                left: hoveredSeat.x,
                top: hoveredSeat.y,
              }}
            >
              <div className="ssp-pop-title">{hoveredSeat.el.label}</div>
              <div className="ssp-pop-seat">{hoveredSeat.label}</div>
              <div className="ssp-pop-divider" />
              <div className="ssp-pop-row">
                <span className="ssp-pop-label">Tier:</span>
                <span
                  className={`ssp-pop-val ${hoveredSeat.tier.toLowerCase().includes("vip") ? "text-amber-400 font-bold" : "text-indigo-300"}`}
                >
                  {hoveredSeat.tier}
                </span>
              </div>
              <div className="ssp-pop-row">
                <span className="ssp-pop-label">Status:</span>
                {hoveredSeat.occupiedBy ? (
                  <span className="ssp-pop-val text-red-400 flex items-center gap-1">
                    <ShieldAlert size={10} /> Occupied
                  </span>
                ) : (
                  <span className="ssp-pop-val text-emerald-400 flex items-center gap-1">
                    <CheckCircle size={10} /> Available
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Guide Legend Row */}
      <div className="ssp-legend-row">
        <div className="ssp-legend-item">
          <span className="ssp-leg-dot ssp-leg-vip" />
          <span>VIP Available</span>
        </div>
        <div className="ssp-legend-item">
          <span className="ssp-leg-dot ssp-leg-gen" />
          <span>Regular Available</span>
        </div>
        <div className="ssp-legend-item">
          <span className="ssp-leg-dot ssp-leg-occ" />
          <span>Occupied</span>
        </div>
        <div className="ssp-legend-item">
          <span className="ssp-leg-dot ssp-leg-sel" />
          <span>Selected</span>
        </div>
        {!readOnly && (
          <div className="ssp-legend-tip ml-auto text-[10px] text-zinc-500 flex items-center gap-1">
            <HelpCircle size={11} /> Scroll wheel to zoom, drag mouse to pan
          </div>
        )}
      </div>
    </div>
  );
};

export default SpatialSeatSelector;
