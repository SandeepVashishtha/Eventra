import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import ComplianceMetricsCard from './ComplianceMetricsCard';
import {
  Plus,
  Trash2,
  MousePointer2,
  Move,
  Square,
  Circle,
  Type,
  Save,
  Load,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  X,
  Grid3X3,
  LayoutGrid,
} from 'lucide-react';

/**
 * InteractivePlanner Component
 * Real-time canvas-based venue spatial occupancy planner.
 * Features drag-and-drop table layouts, collision detection, and safety compliance checking.
 */
const InteractivePlanner = ({
  venueName = 'Venue Layout',
  maxCapacity = 1000,
  canvasWidth = 1200,
  canvasHeight = 800,
  onLayoutSave,
  onLayoutChange,
  className = '',
}) => {
  // State for canvas and objects
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [placedObjects, setPlacedObjects] = useState([]);
  const [safetyZones, setSafetyZones] = useState([]);
  const [currentAttendees, setCurrentAttendees] = useState(0);
  
  // Interaction state
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [selectedTableType, setSelectedTableType] = useState('rectangular');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [isDragPan, setIsDragPan] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState(null);

  // Canvas state
  const [ctx, setCtx] = useState(null);
  const [scale, setScale] = useState(1);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    setCtx(context);

    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Initial render
    renderCanvas(context, placedObjects, safetyZones, selectedObject, zoomLevel, panOffset, showGrid);

    return () => {
      // Cleanup
    };
  }, []);

  // Re-render canvas when dependencies change
  useEffect(() => {
    if (!ctx) return;
    renderCanvas(ctx, placedObjects, safetyZones, selectedObject, zoomLevel, panOffset, showGrid);
  }, [ctx, placedObjects, safetyZones, selectedObject, zoomLevel, panOffset, showGrid]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Could implement responsive canvas here
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle layout changes callback
  useEffect(() => {
    if (onLayoutChange && typeof onLayoutChange === 'function') {
      onLayoutChange({
        placedObjects,
        safetyZones,
        maxCapacity,
        currentAttendees,
      });
    }
  }, [placedObjects, safetyZones, currentAttendees, maxCapacity, onLayoutChange]);

  /**
   * Main canvas rendering function
   */
  const renderCanvas = useCallback((context, objects, zones, selected, zoom, offset, grid) => {
    if (!context) return;

    // Clear canvas
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // Apply zoom and pan
    context.save();
    context.scale(zoom, zoom);
    context.translate(offset.x, offset.y);

    // Draw background
    context.fillStyle = '#F8FAFC';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid
    if (grid) {
      drawGrid(context);
    }

    // Draw safety zones
    drawSafetyZones(context, zones);

    // Draw placed objects
    drawPlacedObjects(context, objects, selected);

    // Draw connections/aisles
    drawAislePathways(context, objects);

    // Draw selection indicator
    if (selected) {
      drawSelectionIndicator(context, selected);
    }

    context.restore();
  }, []);

  /**
   * Draw grid on canvas
   */
  const drawGrid = useCallback((context) => {
    const gridSize = 40;
    const gridColor = '#E2E8F0';

    context.strokeStyle = gridColor;
    context.lineWidth = 1;

    // Draw vertical lines
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvasHeight);
      context.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvasWidth, y);
      context.stroke();
    }
  }, []);

  /**
   * Draw safety zones
   */
  const drawSafetyZones = useCallback((context, zones) => {
    zones.forEach(zone => {
      const colors = {
        emergencyExit: { fill: '#FEE2E2', stroke: '#EF4444' },
        fireSafety: { fill: '#FEF3C7', stroke: '#F59E0B' },
        accessibility: { fill: '#DBEAFE', stroke: '#3B82F6' },
        aisle: { fill: '#D1FAE5', stroke: '#10B981' },
      };

      const zoneColor = colors[zone.type] || { fill: '#F3F4F6', stroke: '#9CA3AF' };

      // Draw zone background
      context.fillStyle = zoneColor.fill;
      context.fillRect(zone.x, zone.y, zone.width, zone.height);

      // Draw zone border
      context.strokeStyle = zoneColor.stroke;
      context.lineWidth = 2;
      context.strokeRect(zone.x, zone.y, zone.width, zone.height);

      // Draw zone label
      context.fillStyle = zoneColor.stroke;
      context.font = '12px sans-serif';
      context.textAlign = 'center';
      context.fillText(
        zone.type.replace(/([A-Z])/g, ' $1').trim(),
        zone.x + zone.width / 2,
        zone.y + zone.height / 2 + 4
      );

      // Draw buffer zone (dotted)
      if (zone.buffer > 0) {
        context.strokeStyle = zoneColor.stroke;
        context.lineWidth = 1;
        context.setLineDash([5, 5]);
        context.strokeRect(
          zone.x - zone.buffer,
          zone.y - zone.buffer,
          zone.width + zone.buffer * 2,
          zone.height + zone.buffer * 2
        );
        context.setLineDash([]);
      }
    });
  }, []);

  /**
   * Draw placed objects (tables, etc.)
   */
  const drawPlacedObjects = useCallback((context, objects, selected) => {
    objects.forEach(obj => {
      const isSelected = selected?.id === obj.id;
      const opacity = isSelected ? 1 : 0.8;

      // Set shadow for selection
      if (isSelected) {
        context.shadowColor = obj.color || '#3B82F6';
        context.shadowBlur = 10;
      }

      // Draw table based on type
      switch (obj.tableType) {
        case 'round':
          drawRoundTable(context, obj, isSelected);
          break;
        case 'square':
          drawSquareTable(context, obj, isSelected);
          break;
        case 'booth':
          drawBoothTable(context, obj, isSelected);
          break;
        default: // rectangular
          drawRectangularTable(context, obj, isSelected);
      }

      // Reset shadow
      context.shadowBlur = 0;

      // Draw object label with capacity
      context.fillStyle = '#FFFFFF';
      context.font = 'bold 12px sans-serif';
      context.textAlign = 'center';
      context.fillText(
        `${obj.id.split('_')[0] || 'T'}${obj.capacity || ''}`,
        obj.x + obj.width / 2,
        obj.y + obj.height / 2 + 4
      );

      // Draw capacity number
      context.fillStyle = '#374151';
      context.font = '10px sans-serif';
      context.fillText(
        `${obj.capacity || 0}`,
        obj.x + obj.width / 2,
        obj.y + obj.height / 2 + 16
      );
    });
  }, []);

  /**
   * Draw round table
   */
  const drawRoundTable = useCallback((context, obj, isSelected) => {
    context.fillStyle = isSelected 
      ? (obj.color || '#3B82F6') 
      : addAlpha(obj.color || '#3B82F6', 0.8);
    context.beginPath();
    context.arc(
      obj.x + obj.width / 2,
      obj.y + obj.height / 2,
      obj.width / 2,
      0,
      Math.PI * 2
    );
    context.fill();

    context.strokeStyle = isSelected ? '#FFFFFF' : '#374151';
    context.lineWidth = isSelected ? 4 : 2;
    context.stroke();
  }, []);

  /**
   * Draw square table
   */
  const drawSquareTable = useCallback((context, obj, isSelected) => {
    context.fillStyle = isSelected 
      ? (obj.color || '#8B5CF6') 
      : addAlpha(obj.color || '#8B5CF6', 0.8);
    context.fillRect(obj.x, obj.y, obj.width, obj.height);

    context.strokeStyle = isSelected ? '#FFFFFF' : '#374151';
    context.lineWidth = isSelected ? 4 : 2;
    context.strokeRect(obj.x, obj.y, obj.width, obj.height);
  }, []);

  /**
   * Draw rectangular table
   */
  const drawRectangularTable = useCallback((context, obj, isSelected) => {
    context.fillStyle = isSelected 
      ? (obj.color || '#10B981') 
      : addAlpha(obj.color || '#10B981', 0.8);
    
    // Draw table with rounded corners
    const radius = 10;
    context.beginPath();
    context.moveTo(obj.x + radius, obj.y);
    context.lineTo(obj.x + obj.width - radius, obj.y);
    context.quadraticCurveTo(obj.x + obj.width, obj.y, obj.x + obj.width, obj.y + radius);
    context.lineTo(obj.x + obj.width, obj.y + obj.height - radius);
    context.quadraticCurveTo(obj.x + obj.width, obj.y + obj.height, obj.x + obj.width - radius, obj.y + obj.height);
    context.lineTo(obj.x + radius, obj.y + obj.height);
    context.quadraticCurveTo(obj.x, obj.y + obj.height, obj.x, obj.y + obj.height - radius);
    context.lineTo(obj.x, obj.y + radius);
    context.quadraticCurveTo(obj.x, obj.y, obj.x + radius, obj.y);
    context.closePath();
    context.fill();

    context.strokeStyle = isSelected ? '#FFFFFF' : '#374151';
    context.lineWidth = isSelected ? 4 : 2;
    context.stroke();
  }, []);

  /**
   * Draw booth table
   */
  const drawBoothTable = useCallback((context, obj, isSelected) => {
    context.fillStyle = isSelected 
      ? (obj.color || '#F59E0B') 
      : addAlpha(obj.color || '#F59E0B', 0.8);
    context.fillRect(obj.x, obj.y, obj.width, obj.height);

    // Draw booth decoration (semi-circle on one side)
    context.fillStyle = addAlpha('#FFFFFF', 0.3);
    context.beginPath();
    context.arc(
      obj.x + obj.width / 2,
      obj.y - 10,
      20,
      0,
      Math.PI
    );
    context.fill();

    context.strokeStyle = isSelected ? '#FFFFFF' : '#374151';
    context.lineWidth = isSelected ? 4 : 2;
    context.strokeRect(obj.x, obj.y, obj.width, obj.height);
  }, []);

  /**
   * Draw aisle pathways
   */
  const drawAislePathways = useCallback((context, objects) => {
    // Import utility function
    const { generateAislePathways } = require('../../../../utils/canvas/occupancyCollision.js');
    const pathways = generateAislePathways(objects, canvasWidth, canvasHeight);

    pathways.forEach(pathway => {
      context.fillStyle = pathway.isValid 
        ? addAlpha('#10B981', 0.3) 
        : addAlpha('#EF4444', 0.3);
      context.fillRect(pathway.x, pathway.y, pathway.width, pathway.height);

      context.strokeStyle = pathway.isValid ? '#10B981' : '#EF4444';
      context.lineWidth = 1;
      context.strokeRect(pathway.x, pathway.y, pathway.width, pathway.height);
    });
  }, []);

  /**
   * Draw selection indicator
   */
  const drawSelectionIndicator = useCallback((context, obj) => {
    // Draw handles
    const handleSize = 10;
    const handles = [
      { x: obj.x, y: obj.y, cursor: 'nwse-resize' }, // Top-left
      { x: obj.x + obj.width / 2, y: obj.y, cursor: 'ns-resize' }, // Top-center
      { x: obj.x + obj.width, y: obj.y, cursor: 'nesw-resize' }, // Top-right
      { x: obj.x, y: obj.y + obj.height / 2, cursor: 'ew-resize' }, // Center-left
      { x: obj.x + obj.width, y: obj.y + obj.height / 2, cursor: 'ew-resize' }, // Center-right
      { x: obj.x, y: obj.y + obj.height, cursor: 'nesw-resize' }, // Bottom-left
      { x: obj.x + obj.width / 2, y: obj.y + obj.height, cursor: 'ns-resize' }, // Bottom-center
      { x: obj.x + obj.width, y: obj.y + obj.height, cursor: 'nwse-resize' }, // Bottom-right
    ];

    handles.forEach(handle => {
      context.fillStyle = '#FFFFFF';
      context.fillRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize
      );
      context.strokeStyle = obj.color || '#3B82F6';
      context.lineWidth = 2;
      context.strokeRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize
      );
    });
  }, []);

  /**
   * Add alpha to hex color
   */
  const addAlpha = useCallback((color, alpha) => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

  /**
   * Get canvas position from mouse event
   */
  const getCanvasPosition = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX - panOffset.x;
    const y = (e.clientY - rect.top) * scaleY - panOffset.y;

    // Apply inverse zoom
    return {
      x: x / zoomLevel,
      y: y / zoomLevel,
    };
  }, [panOffset, zoomLevel]);

  /**
   * Handle canvas mouse down
   */
  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getCanvasPosition(e);

    // Check if we're clicking on an object
    const clickedObject = placedObjects.findLast(obj => 
      pos.x >= obj.x &&
      pos.x <= obj.x + obj.width &&
      pos.y >= obj.y &&
      pos.y <= obj.y + obj.height
    );

    if (clickedObject) {
      setSelectedObject(clickedObject);
      setIsDragging(true);
      setIsDrawing(false);
      return;
    }

    // Check if we're panning with middle mouse or spacebar
    if (e.button === 1 || e.altKey || e.ctrlKey || e.metaKey) {
      setIsDragPan(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    // Handle tool-based actions
    switch (selectedTool) {
      case 'select':
        setSelectedObject(null);
        break;
      case 'add':
        // Add new object
        addNewObject(pos);
        break;
      case 'safetyZone':
        setIsDrawing(true);
        break;
      default:
        setSelectedObject(null);
    }
  }, [placedObjects, selectedTool, getCanvasPosition]);

  /**
   * Add new table object at position
   */
  const addNewObject = useCallback((pos) => {
    const { createTableObject } = require('../../../../utils/canvas/occupancyCollision.js');
    
    const newObj = createTableObject(
      'table',
      pos.x,
      pos.y,
      selectedTableType
    );

    // Check for collisions before placing
    const { canPlaceObject, findValidPlacement } = require('../../../../utils/canvas/occupancyCollision.js');
    
    const placementTest = canPlaceObject(newObj, placedObjects);
    if (!placementTest.canPlace) {
      // Try to find a valid position nearby
      const validPos = findValidPlacement(
        newObj,
        placedObjects,
        { x: pos.x, y: pos.y }
      );
      if (validPos) {
        newObj.x = validPos.x;
        newObj.y = validPos.y;
        toast.success('Table placed with auto-adjustment');
      } else {
        toast.warning('Cannot place table: no valid position found');
        return;
      }
    }

    setPlacedObjects(prev => [...prev, newObj]);
    setSelectedObject(newObj);
  }, [placedObjects, selectedTableType]);

  /**
   * Handle canvas mouse move
   */
  const handleMouseMove = useCallback((e) => {
    if (!isDragging && !isDrawing && !isDragPan) return;

    if (isDragPan && lastPanPoint) {
      setPanOffset(prev => ({
        x: prev.x + (e.clientX - lastPanPoint.x) / zoomLevel,
        y: prev.y + (e.clientY - lastPanPoint.y) / zoomLevel,
      }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isDragging && selectedObject) {
      const pos = getCanvasPosition(e);
      
      // Calculate new position
      const newX = pos.x - selectedObject.width / 2;
      const newY = pos.y - selectedObject.height / 2;

      // Check for collisions
      const { canPlaceObject, findValidPlacement } = require('../../../../utils/canvas/occupancyCollision.js');
      
      const testObj = { ...selectedObject, x: newX, y: newY };
      const placementTest = canPlaceObject(testObj, placedObjects.filter(o => o.id !== selectedObject.id));

      if (placementTest.canPlace) {
        // Update position if valid
        setPlacedObjects(prev => 
          prev.map(obj => 
            obj.id === selectedObject.id 
              ? { ...obj, x: newX, y: newY } 
              : obj
          )
        );
      } else {
        // Try to find valid position
        const validPos = findValidPlacement(
          testObj,
          placedObjects.filter(o => o.id !== selectedObject.id),
          { x: newX, y: newY }
        );
        if (validPos) {
          setPlacedObjects(prev => 
            prev.map(obj => 
              obj.id === selectedObject.id 
                ? { ...obj, x: validPos.x, y: validPos.y } 
                : obj
            )
          );
        }
      }
    }

    if (isDrawing) {
      // Drawing mode - could be for safety zones
    }
  }, [isDragging, isDrawing, isDragPan, selectedObject, getCanvasPosition, placedObjects, zoomLevel, lastPanPoint]);

  /**
   * Handle canvas mouse up
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsDrawing(false);
    setIsDragPan(false);
    setLastPanPoint(null);
  }, []);

  /**
   * Handle canvas mouse leave
   */
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setIsDrawing(false);
    setIsDragPan(false);
    setLastPanPoint(null);
  }, []);

  /**
   * Handle canvas double click
   */
  const handleDoubleClick = useCallback((e) => {
    const pos = getCanvasPosition(e);
    addNewObject(pos);
  }, [addNewObject, getCanvasPosition]);

  /**
   * Handle canvas wheel (zoom)
   */
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoomLevel * delta));
    setZoomLevel(newZoom);
  }, [zoomLevel]);

  /**
   * Delete selected object
   */
  const deleteSelectedObject = useCallback(() => {
    if (!selectedObject) return;
    
    setPlacedObjects(prev => prev.filter(obj => obj.id !== selectedObject.id));
    setSelectedObject(null);
    toast.success('Object removed');
  }, [selectedObject]);

  /**
   * Clear all objects
   */
  const clearAllObjects = useCallback(() => {
    if (placedObjects.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear all objects?')) {
      setPlacedObjects([]);
      setSelectedObject(null);
      toast.success('All objects cleared');
    }
  }, [placedObjects.length]);

  /**
   * Save current layout
   */
  const saveLayout = useCallback(() => {
    if (!onLayoutSave) return;
    
    const layout = {
      venueName,
      maxCapacity,
      placedObjects,
      safetyZones,
      currentAttendees,
      timestamp: new Date().toISOString(),
    };
    
    onLayoutSave(layout);
    toast.success('Layout saved');
  }, [onLayoutSave, venueName, maxCapacity, placedObjects, safetyZones, currentAttendees]);

  /**
   * Load layout from file or data
   */
  const loadLayout = useCallback((layout) => {
    if (layout) {
      setPlacedObjects(layout.placedObjects || []);
      setSafetyZones(layout.safetyZones || []);
      setCurrentAttendees(layout.currentAttendees || 0);
      toast.success('Layout loaded');
    }
  }, []);

  /**
   * Add safety zone
   */
  const addSafetyZone = useCallback((type, x, y, width, height) => {
    const { createSafetyZone } = require('../../../../utils/canvas/occupancyCollision.js');
    
    const newZone = createSafetyZone(type, x, y, width, height);
    setSafetyZones(prev => [...prev, newZone]);
    toast.success(`Added ${type} safety zone`);
  }, []);

  /**
   * Reset zoom and pan
   */
  const resetView = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  /**
   * Get table types from utility
   */
  const getTableTypes = useCallback(() => {
    const { getTableTypes, getTableConfig } = require('../../../../utils/canvas/occupancyCollision.js');
    return getTableTypes().map(type => ({
      id: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      config: getTableConfig(type),
    }));
  }, []);

  // Available table types
  const tableTypes = useMemo(() => getTableTypes(), [getTableTypes]);

  return (
    <div className={`flex flex-col lg:flex-row gap-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-xl ${className}`}>
      {/* Toolbar */}
      <div className="flex-shrink-0 w-full lg:w-64 space-y-4">
        {/* Venue Info */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow">
          <h3 className="font-bold text-lg mb-3">{venueName}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Canvas Size:</span>
              <span className="font-medium">{canvasWidth}x{canvasHeight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Max Capacity:</span>
              <span className="font-medium">{maxCapacity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Current:</span>
              <span className="font-medium">{currentAttendees}</span>
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <MousePointer2 className="w-4 h-4" /> Tools
          </h4>
          <div className="space-y-2">
            <ToolButton
              icon={<Move className="w-4 h-4" />}
              label="Select"
              active={selectedTool === 'select'}
              onClick={() => setSelectedTool('select')}
            />
            <ToolButton
              icon={<Plus className="w-4 h-4" />}
              label="Add Table"
              active={selectedTool === 'add'}
              onClick={() => setSelectedTool('add')}
            />
            <ToolButton
              icon={<Square className="w-4 h-4" />}
              label="Safety Zone"
              active={selectedTool === 'safetyZone'}
              onClick={() => setSelectedTool('safetyZone')}
            />
          </div>
        </div>

        {/* Table Types */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" /> Table Types
          </h4>
          <select
            value={selectedTableType}
            onChange={(e) => setSelectedTableType(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
          >
            {tableTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.label} ({type.config.capacity} ppl)
              </option>
            ))}
          </select>
          <div className="mt-3 space-y-1 text-xs">
            {tableTypes.map(type => (
              <div key={type.id} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: getTableColor(type.id) }}
                />
                <span>{type.label}</span>
                <span className="text-gray-500">{type.config.width}x{type.config.height}</span>
              </div>
            ))}
          </div>
        </div>

        {/* View Controls */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" /> View
          </h4>
          <div className="space-y-2">
            <ToolButton
              icon={<Grid3X3 className="w-4 h-4" />}
              label="Toggle Grid"
              active={showGrid}
              onClick={() => setShowGrid(!showGrid)}
            />
            <ToolButton
              icon={<RotateCcw className="w-4 h-4" />}
              label="Reset View"
              onClick={resetView}
            />
            <div className="flex items-center gap-2 pt-2">
              <ToolButton
                icon={<ZoomIn className="w-4 h-4" />}
                label="Zoom In"
                onClick={() => setZoomLevel(prev => Math.min(3, prev * 1.2))}
              />
              <ToolButton
                icon={<ZoomOut className="w-4 h-4" />}
                label="Zoom Out"
                onClick={() => setZoomLevel(prev => Math.max(0.1, prev / 1.2))}
              />
            </div>
            <div className="text-xs text-gray-500 pt-1">
              Zoom: {Math.round(zoomLevel * 100)}%
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Type className="w-4 h-4" /> Actions
          </h4>
          <div className="space-y-2">
            <ToolButton
              icon={<Save className="w-4 h-4" />}
              label="Save Layout"
              onClick={saveLayout}
              variant="primary"
            />
            <ToolButton
              icon={<Trash2 className="w-4 h-4" />}
              label="Clear All"
              onClick={clearAllObjects}
              variant="danger"
            />
            {selectedObject && (
              <ToolButton
                icon={<X className="w-4 h-4" />}
                label="Delete Selected"
                onClick={deleteSelectedObject}
                variant="danger"
              />
            )}
          </div>
        </div>

        {/* Selected Object Info */}
        {selectedObject && (
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 shadow border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Move className="w-4 h-4 text-blue-600" /> Selected Object
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="font-medium">{selectedObject.tableType || selectedObject.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Position:</span>
                <span className="font-medium">({Math.round(selectedObject.x)}, {Math.round(selectedObject.y)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Capacity:</span>
                <span className="font-medium">{selectedObject.capacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Size:</span>
                <span className="font-medium">{selectedObject.width}x{selectedObject.height}</span>
              </div>
            </div>
          </div>
        )}

        {/* Attendee Controls */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow">
          <h4 className="font-semibold mb-3">Attendee Count</h4>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentAttendees(prev => Math.max(0, prev - 1))}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 -btn"
            >
              -
            </button>
            <input
              type="number"
              value={currentAttendees}
              onChange={(e) => setCurrentAttendees(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-16 text-center p-2 border border-gray-300 rounded text-sm"
              min="0"
            />
            <button
              onClick={() => setCurrentAttendees(prev => prev + 1)}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Compliance Metrics */}
        <ComplianceMetricsCard
          placedObjects={placedObjects}
          safetyZones={safetyZones}
          maxCapacity={maxCapacity}
          currentAttendees={currentAttendees}
        />

        {/* Canvas Container */}
        <div
          ref={containerRef}
          className="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden relative border border-gray-200 dark:border-gray-700"
        >
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="w-full h-full cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onDoubleClick={handleDoubleClick}
            onWheel={handleWheel}
          />

          {/* Canvas Overlay with Instructions */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {placedObjects.length === 0 && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Double-click to add tables, or select a tool from the sidebar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ToolButton - Reusable button component for tools
 */
const ToolButton = ({ icon, label, active = false, onClick, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700',
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2 p-2 rounded text-sm font-medium transition-colors ${variants[variant]} ${active ? 'ring-2 ring-blue-500' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

/**
 * Get table color based on type
 */
const getTableColor = (type) => {
  const colors = {
    round: '#3B82F6',
    rectangular: '#10B981',
    square: '#8B5CF6',
    booth: '#F59E0B',
  };
  return colors[type] || '#6B7280';
};

export default InteractivePlanner;
