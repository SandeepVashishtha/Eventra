import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Maximize, MousePointer2 } from 'lucide-react';

const POINT_TYPES = [
  { id: 'booth', label: 'Booth', color: '#6366f1' }, // indigo-500
  { id: 'stage', label: 'Stage', color: '#ec4899' }, // pink-500
  { id: 'facility', label: 'Facility', color: '#10b981' }, // emerald-500
];

export default function VirtualVenueEditor({ venueMap = [], onChange }) {
  const [points, setPoints] = useState(venueMap);
  const [selectedPointId, setSelectedPointId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef(null);

  // Sync internal state if props change (though usually one-way)
  useEffect(() => {
    setPoints(venueMap || []);
  }, [venueMap]);

  const handleAddPoint = (typeId) => {
    const newPoint = {
      id: `point-${Date.now()}`,
      type: typeId,
      label: `New ${POINT_TYPES.find((t) => t.id === typeId).label}`,
      x: 50,
      y: 50,
    };
    const newPoints = [...points, newPoint];
    setPoints(newPoints);
    onChange(newPoints);
    setSelectedPointId(newPoint.id);
  };

  const handleRemovePoint = (id) => {
    const newPoints = points.filter((p) => p.id !== id);
    setPoints(newPoints);
    onChange(newPoints);
    if (selectedPointId === id) setSelectedPointId(null);
  };

  const handlePointerDown = (e, id) => {
    e.stopPropagation();
    setSelectedPointId(id);
    setIsDragging(true);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e, id) => {
    if (!isDragging || selectedPointId !== id) return;
    
    if (svgRef.current) {
      const CTM = svgRef.current.getScreenCTM();
      const x = (e.clientX - CTM.e) / CTM.a;
      const y = (e.clientY - CTM.f) / CTM.d;

      // Constrain within 0-100 viewBox
      const constrainedX = Math.max(0, Math.min(100, x));
      const constrainedY = Math.max(0, Math.min(100, y));

      setPoints((prev) => {
        const newPoints = prev.map((p) =>
          p.id === id ? { ...p, x: constrainedX, y: constrainedY } : p
        );
        onChange(newPoints);
        return newPoints;
      });
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    if (e.target.hasPointerCapture) {
        e.target.releasePointerCapture(e.pointerId);
    }
  };

  const handleLabelChange = (id, newLabel) => {
    setPoints((prev) => {
      const newPoints = prev.map((p) => (p.id === id ? { ...p, label: newLabel } : p));
      onChange(newPoints);
      return newPoints;
    });
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Maximize className="w-5 h-5 text-indigo-500" />
            Interactive Venue Map
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drag and drop points of interest onto the virtual map area.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {POINT_TYPES.map((pt) => (
            <button
              key={pt.id}
              type="button"
              onClick={() => handleAddPoint(pt.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: pt.color }}
            >
              <Plus className="w-4 h-4" />
              {pt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Editor Canvas */}
        <div className="flex-grow bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 relative overflow-hidden aspect-video">
          <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            className="w-full h-full cursor-crosshair touch-none"
            onPointerUp={() => setSelectedPointId(null)}
          >
            {/* Grid Pattern */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-800" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />

            {/* Venue Points */}
            {points.map((point) => {
              const typeConfig = POINT_TYPES.find((t) => t.id === point.type);
              const isSelected = selectedPointId === point.id;
              
              return (
                <g
                  key={point.id}
                  transform={`translate(${point.x}, ${point.y})`}
                  className={`cursor-move outline-none ${isDragging && isSelected ? 'opacity-80' : ''}`}
                  onPointerDown={(e) => handlePointerDown(e, point.id)}
                  onPointerMove={(e) => handlePointerMove(e, point.id)}
                  onPointerUp={handlePointerUp}
                >
                  <circle
                    r="4"
                    fill={typeConfig?.color || '#000'}
                    className={`transition-all duration-200 ${isSelected ? 'stroke-white dark:stroke-gray-900 stroke-[0.5] filter drop-shadow-md' : ''}`}
                  />
                  {isSelected && (
                    <circle
                      r="6"
                      fill="none"
                      stroke={typeConfig?.color || '#000'}
                      strokeWidth="0.5"
                      strokeDasharray="1 1"
                      className="animate-spin-slow"
                    />
                  )}
                  <text
                    y="8"
                    textAnchor="middle"
                    className="text-[3px] font-medium fill-gray-900 dark:fill-gray-100 pointer-events-none select-none"
                    style={{ textShadow: '0px 0px 2px rgba(255,255,255,0.8), 0px 0px 2px rgba(255,255,255,0.8)' }}
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {points.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <MousePointer2 className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-gray-400 font-medium">Add points using the buttons above</p>
              </div>
            </div>
          )}
        </div>

        {/* Selected Point Properties */}
        <div className="w-full md:w-64 flex flex-col gap-3">
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">Properties</h4>
          {selectedPointId ? (
            (() => {
              const selectedPoint = points.find((p) => p.id === selectedPointId);
              if (!selectedPoint) return null;
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={selectedPoint.label}
                      onChange={(e) => handleLabelChange(selectedPoint.id, e.target.value)}
                      className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        X Position
                      </label>
                      <input
                        type="number"
                        disabled
                        value={Math.round(selectedPoint.x)}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-gray-100 dark:bg-gray-800/50 text-gray-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Y Position
                      </label>
                      <input
                        type="number"
                        disabled
                        value={Math.round(selectedPoint.y)}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-gray-100 dark:bg-gray-800/50 text-gray-500"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleRemovePoint(selectedPoint.id)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Point
                  </button>
                </motion.div>
              );
            })()
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 border-dashed text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select a point on the map to edit its properties.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
