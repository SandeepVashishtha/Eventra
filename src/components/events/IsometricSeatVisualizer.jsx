import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, RotateCcw, ShieldAlert, CheckCircle, HelpCircle, Sparkles } from "lucide-react";

// Isometric Mathematics constants
const ISO_COS = 0.866; // cos(30 deg)
const ISO_SIN = 0.5;   // sin(30 deg)

// Cartesian to Isometric Projection
const toIsometric = (x, y, z = 0, scale = 1, panX = 0, panY = 0) => {
  const isoX = (x - y) * ISO_COS;
  const isoY = (x + y) * ISO_SIN - z;
  return {
    x: isoX * scale + panX,
    y: isoY * scale + panY
  };
};

// Isometric to Cartesian back-projection (for hit testing)
const toCartesian = (isoX, isoY, scale = 1, panX = 0, panY = 0) => {
  const xPrime = (isoX - panX) / scale;
  const yPrime = (isoY - panY) / scale;
  const x = (xPrime / ISO_COS + yPrime / ISO_SIN) / 2;
  const y = (yPrime / ISO_SIN - xPrime / ISO_COS) / 2;
  return { x, y };
};

export default function IsometricSeatVisualizer({ elements = [], selectedSeat = null, onSelectSeat = () => {}, readOnly = false }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Pan and Zoom viewport states
  const [zoom, setZoom] = useState(0.85);
  const [panOffset, setPanOffset] = useState({ x: 350, y: 150 });
  const [hoveredSeat, setHoveredSeat] = useState(null);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  // Generate seat chairs positions in 2D space (matching SpatialSeatSelector coordinate presets)
  const getSeatPositions = useCallback((el) => {
    const positions = [];
    const count = el.seatsCount;
    if (count <= 0) return positions;

    if (el.type === "round-table") {
      const radius = el.width / 2;
      const centerX = el.x + radius;
      const centerY = el.y + radius;
      const chairDistance = radius + 22;

      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count + (el.rotation * Math.PI) / 180;
        positions.push({
          x: centerX + chairDistance * Math.cos(angle),
          y: centerY + chairDistance * Math.sin(angle),
          index: i
        });
      }
    } else if (el.type === "rect-table") {
      const halfW = el.width / 2;
      const halfH = el.height / 2;
      const cX = el.x + halfW;
      const cY = el.y + halfH;

      const seatsPerSide = Math.ceil(count / 2);
      const spacingX = el.width / (seatsPerSide + 1);
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
          p = rotatePt(el.x + halfW + relativeX, el.y + el.height + 18);
        }

        positions.push({ x: p.x, y: p.y, index: i });
      }
    }
    return positions;
  }, []);

  // Seat verification utilities
  const isSeatSelected = (elId, idx) => {
    return selectedSeat && selectedSeat.elementId === elId && selectedSeat.seatIndex === idx;
  };

  // Find stage center coordinates to compute angle view to stage
  const stageCenter = useMemo(() => {
    const stage = elements.find(el => el.type === "stage");
    if (stage) {
      return {
        x: stage.x + stage.width / 2,
        y: stage.y + stage.height / 2
      };
    }
    return { x: 500, y: 110 }; // Fallback default stage center
  }, [elements]);

  // Compute view angle score (e.g. 0 deg is perfect frontal, 90 is absolute side view)
  const calculateViewAngle = (seatX, seatY) => {
    const dx = stageCenter.x - seatX;
    const dy = stageCenter.y - seatY;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = Math.abs(Math.round((angleRad * 180) / Math.PI));
    
    // Normalize to direct visibility percentages
    if (angleDeg < 30) return { pct: 95, label: "Optimal Direct Frontal View" };
    if (angleDeg < 60) return { pct: 80, label: "Clear Frontal View" };
    if (angleDeg < 110) return { pct: 60, label: "Partial Side View" };
    return { pct: 40, label: "Side Angular View" };
  };

  // Isometric drawing primitives
  const drawIsometricPrism = (ctx, x, y, width, height, zHeight, color, strokeColor) => {
    // 3D Isometric box points
    const p1 = toIsometric(x, y, 0, zoom, panOffset.x, panOffset.y);
    const p2 = toIsometric(x + width, y, 0, zoom, panOffset.x, panOffset.y);
    const p3 = toIsometric(x + width, y + height, 0, zoom, panOffset.x, panOffset.y);
    const p4 = toIsometric(x, y + height, 0, zoom, panOffset.x, panOffset.y);

    const p1Top = toIsometric(x, y, zHeight, zoom, panOffset.x, panOffset.y);
    const p2Top = toIsometric(x + width, y, zHeight, zoom, panOffset.x, panOffset.y);
    const p3Top = toIsometric(x + width, y + height, zHeight, zoom, panOffset.x, panOffset.y);
    const p4Top = toIsometric(x, y + height, zHeight, zoom, panOffset.x, panOffset.y);

    // 1. Draw Left Side Face
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.lineTo(p4Top.x, p4Top.y);
    ctx.lineTo(p1Top.x, p1Top.y);
    ctx.closePath();
    ctx.fillStyle = shadeColor(color, -15);
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    // 2. Draw Right Side Face
    ctx.beginPath();
    ctx.moveTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.lineTo(p4Top.x, p4Top.y);
    ctx.lineTo(p3Top.x, p3Top.y);
    ctx.closePath();
    ctx.fillStyle = shadeColor(color, -25);
    ctx.fill();
    ctx.stroke();

    // 3. Draw Top Face
    ctx.beginPath();
    ctx.moveTo(p1Top.x, p1Top.y);
    ctx.lineTo(p2Top.x, p2Top.y);
    ctx.lineTo(p3Top.x, p3Top.y);
    ctx.lineTo(p4Top.x, p4Top.y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
  };

  const drawIsometricCylinder = (ctx, x, y, radius, zHeight, color, strokeColor) => {
    // Round table represented as cylinder prism
    const segments = 16;
    const basePts = [];
    const topPts = [];

    for (let i = 0; i < segments; i++) {
      const angle = (i * 2 * Math.PI) / segments;
      const dx = radius * Math.cos(angle);
      const dy = radius * Math.sin(angle);

      basePts.push(toIsometric(x + radius + dx, y + radius + dy, 0, zoom, panOffset.x, panOffset.y));
      topPts.push(toIsometric(x + radius + dx, y + radius + dy, zHeight, zoom, panOffset.x, panOffset.y));
    }

    // Draw Cylinder side skirt
    ctx.beginPath();
    ctx.moveTo(basePts[0].x, basePts[0].y);
    for (let i = 0; i < segments; i++) {
      const nextIdx = (i + 1) % segments;
      ctx.lineTo(basePts[nextIdx].x, basePts[nextIdx].y);
    }
    for (let i = segments - 1; i >= 0; i--) {
      ctx.lineTo(topPts[i].x, topPts[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = shadeColor(color, -20);
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    // Draw Top Face ellipse
    ctx.beginPath();
    ctx.moveTo(topPts[0].x, topPts[0].y);
    for (let i = 1; i < segments; i++) {
      ctx.lineTo(topPts[i].x, topPts[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
  };

  // Hex color shading helper
  const shadeColor = (color, percent) => {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt((R * (100 + percent)) / 100);
    G = parseInt((G * (100 + percent)) / 100);
    B = parseInt((B * (100 + percent)) / 100);

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    const rHex = R.toString(16).padStart(2, "0");
    const gHex = G.toString(16).padStart(2, "0");
    const bHex = B.toString(16).padStart(2, "0");

    return `#${rHex}${gHex}${bHex}`;
  };

  // Main Canvas Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Support high DPI screens
    const dpr = window.devicePixelRatio || 1;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear background with neon grid blueprint styling
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, width, height);

    // Render Grid lines in isometric coordinates
    ctx.strokeStyle = "rgba(99, 102, 241, 0.04)";
    ctx.lineWidth = 1;
    
    // Draw 30 coordinate lines
    const step = 40;
    const range = 1000;
    for (let x = -range; x <= range; x += step) {
      ctx.beginPath();
      const pStart = toIsometric(x, -range, 0, zoom, panOffset.x, panOffset.y);
      const pEnd = toIsometric(x, range, 0, zoom, panOffset.x, panOffset.y);
      ctx.moveTo(pStart.x, pStart.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.stroke();

      ctx.beginPath();
      const pStart2 = toIsometric(-range, x, 0, zoom, panOffset.x, panOffset.y);
      const pEnd2 = toIsometric(range, x, 0, zoom, panOffset.x, panOffset.y);
      ctx.moveTo(pStart2.x, pStart2.y);
      ctx.lineTo(pEnd2.x, pEnd2.y);
      ctx.stroke();
    }

    // Render all structural elements
    elements.forEach((el) => {
      const isVIP = el.tier && el.tier.toLowerCase().includes("vip");

      if (el.type === "round-table") {
        const color = isVIP ? "#d97706" : "#4f46e5";
        drawIsometricCylinder(ctx, el.x, el.y, el.width / 2, 24, color, "rgba(255,255,255,0.1)");
      } else if (el.type === "rect-table") {
        const color = isVIP ? "#d97706" : "#4f46e5";
        drawIsometricPrism(ctx, el.x, el.y, el.width, el.height, 22, color, "rgba(255,255,255,0.1)");
      } else if (el.type === "stage") {
        drawIsometricPrism(ctx, el.x, el.y, el.width, el.height, 12, "#1e293b", "#475569");
      } else if (el.type === "booth") {
        drawIsometricPrism(ctx, el.x, el.y, el.width, el.height, 28, "#18181b", "#27272a");
      } else if (el.type === "barrier") {
        drawIsometricPrism(ctx, el.x, el.y, el.width, el.height, 8, "#374151", "#4b5563");
      }

      // Draw element labels floating on top face
      const pText = toIsometric(el.x + el.width / 2, el.y + el.height / 2, el.type === "round-table" || el.type === "rect-table" ? 25 : 14, zoom, panOffset.x, panOffset.y);
      ctx.fillStyle = isVIP ? "#fbbf24" : "#f8fafc";
      ctx.font = `bold ${Math.max(8, Math.round(11 * zoom))}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(el.label, pText.x, pText.y);

      // Render interactive seats as elevated floating 3D spheres
      const seats = getSeatPositions(el);
      seats.forEach((seat) => {
        const isOccupied = el.assignedAttendees[seat.index];
        const isSelected = isSeatSelected(el.id, seat.index);

        // 3D elevated coordinates for chairs (float at z = 12)
        const pSeat = toIsometric(seat.x, seat.y, 12, zoom, panOffset.x, panOffset.y);
        const radius = 8 * zoom;

        // Shadow under chair
        const pShadow = toIsometric(seat.x, seat.y, 0, zoom, panOffset.x, panOffset.y);
        ctx.beginPath();
        ctx.arc(pShadow.x, pShadow.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fill();

        // Connector leg to floor
        ctx.beginPath();
        ctx.moveTo(pShadow.x, pShadow.y);
        ctx.lineTo(pSeat.x, pSeat.y);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Dynamic elevated seat sphere
        ctx.beginPath();
        ctx.arc(pSeat.x, pSeat.y, radius, 0, 2 * Math.PI);
        
        let seatFill = "#4f46e5";
        let seatStroke = "#6366f1";
        
        if (isSelected) {
          seatFill = "#0891b2";
          seatStroke = "#22d3ee";
        } else if (isOccupied) {
          seatFill = "#27272a";
          seatStroke = "#18181b";
        } else if (isVIP) {
          seatFill = "#d97706";
          seatStroke = "#fbbf24";
        }

        ctx.fillStyle = seatFill;
        ctx.fill();
        ctx.strokeStyle = seatStroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Glowing radar pulse overlays in readOnly dashboard mode
        if (readOnly && isSelected) {
          const tNow = Date.now();
          const pulseRadius = radius + (tNow % 1200) / 40;
          ctx.beginPath();
          ctx.arc(pSeat.x, pSeat.y, pulseRadius, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(34, 211, 238, ${1 - (tNow % 1200) / 1200})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });
    });
  }, [elements, zoom, panOffset, selectedSeat, getSeatPositions, readOnly]);

  // RequestAnimationFrame animation tick for pulsing indicators in readOnly mode
  useEffect(() => {
    if (!readOnly || !selectedSeat) return;
    let animId;
    const tick = () => {
      animId = requestAnimationFrame(tick);
      // Re-trigger useEffect render loop
      setZoom(z => z);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [readOnly, selectedSeat]);

  // Handle pointer interactions (drag to pan)
  const handlePointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { x: panOffset.x, y: panOffset.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (isDraggingRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPanOffset({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy
      });
      return;
    }

    // Boundary hit testing for hovers
    let hovered = null;
    for (const el of elements) {
      if (el.seatsCount <= 0) continue;
      const seats = getSeatPositions(el);
      
      for (const seat of seats) {
        // Elevated isometric coords
        const pSeat = toIsometric(seat.x, seat.y, 12, zoom, panOffset.x, panOffset.y);
        const distance = Math.hypot(clientX - pSeat.x, clientY - pSeat.y);
        const radius = 10 * zoom;

        if (distance <= radius) {
          const isOccupied = el.assignedAttendees[seat.index];
          const seatLabel = (el.seatLabels && el.seatLabels[seat.index]) || `Seat ${seat.index + 1}`;
          const isVIP = el.tier && el.tier.toLowerCase().includes("vip");
          const seatTier = el.tier || (isVIP ? "VIP Front Row" : "General Seating");
          const pricing = isVIP ? "1200 INR" : "300 INR";
          const viewDetails = calculateViewAngle(seat.x, seat.y);

          hovered = {
            el,
            seatIdx: seat.index,
            label: seatLabel,
            tier: seatTier,
            price: pricing,
            viewRating: viewDetails,
            occupiedBy: isOccupied || null,
            x: pSeat.x,
            y: pSeat.y - 12
          };
          break;
        }
      }
      if (hovered) break;
    }
    setHoveredSeat(hovered);
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) {
      // Execute click handling on seat footprint release
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      for (const el of elements) {
        if (el.seatsCount <= 0) continue;
        const seats = getSeatPositions(el);
        
        for (const seat of seats) {
          const pSeat = toIsometric(seat.x, seat.y, 12, zoom, panOffset.x, panOffset.y);
          const distance = Math.hypot(clientX - pSeat.x, clientY - pSeat.y);
          const radius = 10 * zoom;

          if (distance <= radius) {
            const isOccupied = el.assignedAttendees[seat.index];
            if (isOccupied || readOnly) return;

            const seatLabel = (el.seatLabels && el.seatLabels[seat.index]) || `Seat ${seat.index + 1}`;
            const isVIP = el.tier && el.tier.toLowerCase().includes("vip");
            const seatTier = el.tier || (isVIP ? "VIP Front Row" : "General Seating");

            onSelectSeat({
              elementId: el.id,
              seatIndex: seat.index,
              seatLabel: `${el.label} - ${seatLabel}`,
              tier: seatTier
            });
            break;
          }
        }
      }
    }
    isDraggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.max(0.4, Math.min(2.5, prev * factor)));
  };

  return (
    <div className="ssp-viewport relative w-full h-[500px]" ref={containerRef}>
      {/* 3D Canvas element */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      />

      {/* Floating Zoom & Controls HUD */}
      <div className="ssp-viewport-controls">
        <button 
          type="button"
          className="ssp-ctrl-btn text-white bg-slate-900 border border-slate-800 p-2 rounded-lg" 
          title="Zoom In" 
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
        >
          <ZoomIn size={15} />
        </button>
        <div className="ssp-zoom-pct text-white text-[11px] font-black">{Math.round(zoom * 100)}%</div>
        <button 
          type="button"
          className="ssp-ctrl-btn text-white bg-slate-900 border border-slate-800 p-2 rounded-lg" 
          title="Zoom Out" 
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
        >
          <ZoomOut size={15} />
        </button>
        <div className="ssp-ctrl-divider w-[1px] h-4 bg-slate-800" />
        <button 
          type="button"
          className="ssp-ctrl-btn text-white bg-slate-900 border border-slate-800 p-2 rounded-lg" 
          title="Reset View" 
          onClick={() => { setZoom(0.85); setPanOffset({ x: 350, y: 150 }); }}
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Dynamic Floating Isometric Orthogonal Info Tooltip */}
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
              top: hoveredSeat.y - 12
            }}
          >
            <div className="ssp-pop-title flex items-center gap-1 font-black">
              <Sparkles size={11} className="text-yellow-400 shrink-0" />
              {hoveredSeat.el.label}
            </div>
            <div className="ssp-pop-seat">
              {hoveredSeat.label}
            </div>
            <div className="ssp-pop-divider" />
            <div className="ssp-pop-row">
              <span className="ssp-pop-label">Tier:</span>
              <span className={`ssp-pop-val font-black ${hoveredSeat.tier.toLowerCase().includes("vip") ? "text-amber-400" : "text-indigo-400"}`}>
                {hoveredSeat.tier}
              </span>
            </div>
            <div className="ssp-pop-row">
              <span className="ssp-pop-label">Ticket Cost:</span>
              <span className="ssp-pop-val text-zinc-300 font-bold">{hoveredSeat.price}</span>
            </div>
            <div className="ssp-pop-row">
              <span className="ssp-pop-label">Stage View:</span>
              <span className="ssp-pop-val text-cyan-400 font-black">{hoveredSeat.viewRating.pct}% — {hoveredSeat.viewRating.label}</span>
            </div>
            <div className="ssp-pop-row">
              <span className="ssp-pop-label">Status:</span>
              {hoveredSeat.occupiedBy ? (
                <span className="ssp-pop-val text-rose-500 font-black flex items-center gap-1">
                  <ShieldAlert size={10} /> Occupied
                </span>
              ) : (
                <span className="ssp-pop-val text-emerald-400 font-black flex items-center gap-1">
                  <CheckCircle size={10} /> Available
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
