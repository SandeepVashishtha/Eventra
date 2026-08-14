/**
 * CollaborativeScheduler Component
 * A real-time collaborative event schedule builder using Yjs CRDTs.
 * Enables multiple co-organizers to build schedules together with automatic conflict resolution.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScheduleCRDTStore, createScheduleStore } from '../../../../utils/crdt/scheduleStore';
import CoOrganizerPresenceBar from './CoOrganizerPresenceBar';

/**
 * CollaborativeScheduler - Main component for collaborative schedule building
 * 
 * @param {Object} props - Component props
 * @param {string} props.eventId - Unique event identifier
 * @param {string} props.organizerId - Current user's organizer ID
 * @param {string} props.organizerName - Current user's name
 * @param {Array} props.initialSlots - Initial schedule slots to load
 * @param {Array} props.initialOrganizers - Initial organizers in the session
 * @param {string} props.websocketUrl - WebSocket URL for Yjs provider
 * @param {Function} props.onSave - Callback when schedule should be saved
 * @param {Function} props.onError - Callback when an error occurs
 */
const CollaborativeScheduler = ({
  eventId = 'default-event',
  organizerId = 'organizer-' + Math.random().toString(36).substr(2, 9),
  organizerName = 'Organizer',
  initialSlots = [],
  initialOrganizers = [],
  websocketUrl = 'wss://localhost:1234',
  onSave,
  onError
}) => {
  // State for CRDT store
  const [store, setStore] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState('disconnected');
  
  // State for schedule data
  const [slots, setSlots] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [cursors, setCursors] = useState({});
  
  // UI State
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    location: '',
    speaker: '',
    description: '',
    color: '#6366f1'
  });
  
  // Refs
  const canvasRef = useRef(null);
  const storeRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragSlot = useRef(null);
  
  // Generate unique slot ID
  const generateSlotId = useCallback(() => {
    return `slot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  }, []);

  // Initialize the CRDT store
  useEffect(() => {
    const initStore = async () => {
      try {
        const roomId = `schedule-${eventId}`;
        const newStore = createScheduleStore(roomId, websocketUrl);
        
        // Initialize the store
        await newStore.init();
        
        // Set up connection monitoring
        const checkConnection = () => {
          setIsConnected(newStore.isConnected());
          setSyncStatus(newStore.getSyncStatus());
        };
        
        // Check connection every 2 seconds
        const interval = setInterval(checkConnection, 2000);
        
        // Initial check
        checkConnection();
        
        // Load initial data
        loadInitialData(newStore);
        
        // Set up store observers
        setupStoreObservers(newStore);
        
        // Store references
        storeRef.current = newStore;
        setStore(newStore);
        
        return () => {
          clearInterval(interval);
          newStore.disconnect();
        };
      } catch (error) {
        console.error('Failed to initialize CRDT store:', error);
        if (onError) {
          onError('Failed to initialize collaborative session: ' + error.message);
        }
        
        // Fallback to mock implementation
        const fallbackStore = createScheduleStore(eventId, websocketUrl);
        storeRef.current = fallbackStore;
        setStore(fallbackStore);
        setSyncStatus('disconnected');
      }
    };
    
    const cleanup = initStore();
    return () => {
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(c => c && c());
      }
      if (storeRef.current) {
        storeRef.current.disconnect();
      }
    };
  }, [eventId, websocketUrl, onError]);

  // Load initial data into the store
  const loadInitialData = (storeInstance) => {
    // Add current organizer
    storeInstance.updateOrganizer(organizerId, {
      id: organizerId,
      name: organizerName,
      joinedAt: Date.now()
    });
    
    // Add initial organizers
    initialOrganizers.forEach(org => {
      storeInstance.updateOrganizer(org.id, org);
    });
    
    // Add initial slots
    initialSlots.forEach(slot => {
      storeInstance.updateSlot(slot.id || generateSlotId(), slot);
    });
  };

  // Set up observers for store changes
  const setupStoreObservers = (storeInstance) => {
    if (!storeInstance) return;
    
    // Poll for changes (in a real implementation, we'd use Yjs observers directly)
    const pollInterval = setInterval(() => {
      if (storeInstance.initialized) {
        const currentSlots = storeInstance.getAllSlots();
        const currentOrganizers = storeInstance.getAllOrganizers();
        const currentCursors = storeInstance.getAllCursors();
        
        setSlots(currentSlots);
        setOrganizers(currentOrganizers);
        setCursors(currentCursors);
      }
    }, 100);
    
    return () => clearInterval(pollInterval);
  };

  // Handle cursor position update
  const handleCursorUpdate = useCallback((position) => {
    if (storeRef.current && organizerId) {
      storeRef.current.updateCursor(organizerId, position);
    }
  }, [organizerId]);

  // Track canvas cursor position
  const handleCanvasMouseMove = useCallback((e) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const position = {
      x: x / zoomLevel,
      y: y / zoomLevel
    };
    
    setCanvasPosition(position);
    handleCursorUpdate(position);
  }, [zoomLevel, handleCursorUpdate]);

  // Handle mouse leave
  const handleCanvasMouseLeave = useCallback(() => {
    // Clear cursor when mouse leaves
    handleCursorUpdate({ x: 0, y: 0 });
  }, [handleCursorUpdate]);

  // Handle form input change
  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Handle slot selection
  const handleSlotSelect = useCallback((slot) => {
    setSelectedSlot(slot);
    setEditingSlot(slot);
    setFormData({
      title: slot.title || '',
      startTime: slot.startTime || '',
      endTime: slot.endTime || '',
      location: slot.location || '',
      speaker: slot.speaker || '',
      description: slot.description || '',
      color: slot.color || '#6366f1'
    });
    setShowSlotForm(true);
  }, []);

  // Handle add new slot
  const handleAddSlot = useCallback(() => {
    setEditingSlot(null);
    setFormData({
      title: '',
      startTime: '',
      endTime: '',
      location: '',
      speaker: '',
      description: '',
      color: '#6366f1'
    });
    setShowSlotForm(true);
    setSelectedSlot(null);
  }, []);

  // Handle form submission
  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    
    const slotData = {
      title: formData.title.trim(),
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location.trim(),
      speaker: formData.speaker.trim(),
      description: formData.description.trim(),
      color: formData.color
    };
    
    // Validate form
    if (!slotData.title) {
      alert('Please enter a title');
      return;
    }
    
    if (!slotData.startTime || !slotData.endTime) {
      alert('Please enter start and end times');
      return;
    }
    
    if (new Date(slotData.endTime) <= new Date(slotData.startTime)) {
      alert('End time must be after start time');
      return;
    }
    
    // Create or update slot
    if (editingSlot) {
      // Update existing slot
      storeRef.current?.updateSlot(editingSlot.id, {
        ...editingSlot,
        ...slotData
      });
    } else {
      // Create new slot
      const newSlotId = generateSlotId();
      storeRef.current?.updateSlot(newSlotId, {
        id: newSlotId,
        ...slotData,
        createdAt: Date.now(),
        createdBy: organizerId
      });
    }
    
    // Close form
    setShowSlotForm(false);
    setFormData({
      title: '',
      startTime: '',
      endTime: '',
      location: '',
      speaker: '',
      description: '',
      color: '#6366f1'
    });
    setEditingSlot(null);
    setSelectedSlot(null);
  }, [formData, editingSlot, organizerId, generateSlotId]);

  // Handle delete slot
  const handleDeleteSlot = useCallback((slot) => {
    if (!window.confirm(`Delete slot "${slot.title}"?`)) return;
    storeRef.current?.removeSlot(slot.id);
    setSelectedSlot(null);
    setEditingSlot(null);
    setShowSlotForm(false);
  }, []);

  // Handle canvas click (add new slot at position)
  const handleCanvasClick = useCallback((e) => {
    if (isDragging) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;
    
    // Add new slot at clicked position
    handleAddSlot();
  }, [isDragging, zoomLevel, handleAddSlot]);

  // Handle slot drag start
  const handleDragStart = useCallback((slot, e) => {
    if (!storeRef.current) return;
    
    e.stopPropagation();
    setIsDragging(true);
    dragSlot.current = slot;
    
    const rect = canvasRef.current.getBoundingClientRect();
    dragStartPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    // Add temporary drag indicator
    document.body.style.cursor = 'grabbing';
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((e) => {
    if (!isDragging || !dragSlot.current || !storeRef.current) return;
    
    e.stopPropagation();
    setIsDragging(false);
    document.body.style.cursor = '';
    
    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    
    const startX = dragStartPos.current.x;
    const startY = dragStartPos.current.y;
    
    // Only update if significant movement
    if (Math.abs(endX - startX) > 5 || Math.abs(endY - startY) > 5) {
      const newX = endX / zoomLevel;
      const newY = endY / zoomLevel;
      
      // Bind slot to canvas coordinates
      storeRef.current.bindToCanvas(dragSlot.current.id, {
        x: newX,
        y: newY,
        width: 200,
        height: 100
      });
    }
    
    dragSlot.current = null;
  }, [isDragging, zoomLevel]);

  // Handle canvas zoom
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  // Render slot element
  const renderSlot = (slot, index) => {
    const canvasCoords = storeRef.current?.getCanvasCoordinates(slot.id);
    const x = canvasCoords?.x || index * 250;
    const y = canvasCoords?.y || 50;
    
    return (
      <div
        key={slot.id}
        className={`absolute slot-item cursor-pointer transition-all duration-300 ${
          selectedSlot?.id === slot.id ? 'ring-4 ring-indigo-300 ring-opacity-50' : ''
        }`}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          transform: `scale(${zoomLevel})`,
          transformOrigin: '0 0',
          zIndex: selectedSlot?.id === slot.id ? 100 : index
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleSlotSelect(slot);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          handleSlotSelect(slot);
        }}
        onMouseDown={(e) => handleDragStart(slot, e)}
        onMouseUp={handleDragEnd}
        draggable={true}
      >
        <div 
          className="bg-white rounded-xl border-2 shadow-md p-4 w-48 hover:shadow-xl transition-shadow"
          style={{
            borderColor: slot.color || '#6366f1'
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-bold text-slate-800 text-sm truncate flex-1">
              {slot.title || 'Untitled'}
            </h4>
            <span 
              className="text-xs text-slate-400 font-mono ml-2"
              style={{ color: slot.color || '#6366f1' }}
            >
              {slot.startTime ? new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
          
          <div className="text-xs text-slate-500 space-y-1">
            {slot.location && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {slot.location}
              </div>
            )}
            
            {slot.speaker && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {slot.speaker}
              </div>
            )}
          </div>
          
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-400 truncate">
            {slot.description}
          </div>
          
          {/* Drag handle */}
          <div 
            className="absolute top-2 right-2 w-4 h-4 flex items-center justify-center text-slate-300 hover:text-indigo-500 cursor-move"
            onMouseDown={(e) => {
              e.stopPropagation();
              handleDragStart(slot, e);
            }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  // Render cursor indicators for other organizers
  const renderCursors = () => {
    return Object.entries(cursors).map(([orgId, cursor]) => {
      if (orgId === organizerId || !cursor?.x || !cursor?.y) return null;
      
      const organizer = organizers.find(o => o.id === orgId);
      if (!organizer) return null;
      
      return (
        <div
          key={`cursor-${orgId}`}
          className="absolute pointer-events-none"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            transform: `scale(${zoomLevel}) translate(-50%, -100%)`
          }}
        >
          <div className="flex flex-col items-center">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2-5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span className="text-xs bg-slate-800 text-white px-2 py-0.5 rounded-full mt-1 whitespace-nowrap">
              {organizer.name || orgId}
            </span>
          </div>
        </div>
      );
    });
  };

  // Render grid background
  const renderGrid = () => {
    if (!showGrid) return null;
    
    const gridSize = 50 * zoomLevel;
    const width = canvasRef.current?.offsetWidth || 800;
    const height = canvasRef.current?.offsetHeight || 600;
    
    return (
      <svg 
        className="absolute inset-0 pointer-events-none"
        width={width}
        height={height}
      >
        <defs>
          <pattern 
            id="grid" 
            width={gridSize} 
            height={gridSize} 
            patternUnits="userSpaceOnUse"
          >
            <path 
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} 
              fill="none" 
              stroke="#e2e8f0" 
              strokeWidth={1}
            />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />
      </svg>
    );
  };

  return (
    <div className="collaborative-scheduler-container relative w-full h-full bg-slate-50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-black text-slate-800">
            Collaborative Schedule Builder
          </h2>
          
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-500' : syncStatus === 'syncing' ? 'bg-amber-500' : 'bg-rose-500'} animate-pulse`} />
            <span className="text-xs text-slate-500 font-mono uppercase">
              {isConnected ? 'Live' : 'Offline'} - {syncStatus}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Controls */}
          <button 
            onClick={handleAddSlot}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-1"
            title="Add new time slot"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Slot
          </button>
          
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button 
              onClick={handleZoomOut}
              className="p-1 hover:bg-slate-200 rounded text-slate-600"
              disabled={zoomLevel <= 0.25}
              title="Zoom out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
            <span className="text-xs text-slate-500 font-mono px-2">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button 
              onClick={handleZoomIn}
              className="p-1 hover:bg-slate-200 rounded text-slate-600"
              disabled={zoomLevel >= 3}
              title="Zoom in"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
          </div>
          
          <button 
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 ${showGrid ? 'bg-slate-200' : ''}`}
            title={showGrid ? 'Hide grid' : 'Show grid'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          
          {onSave && (
            <button 
              onClick={() => onSave(slots)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-1"
              title="Save schedule"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1-4l-3 3m0 5l3-3m-3 3V4" />
              </svg>
              Save
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 overflow-hidden"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
        onMouseUp={handleDragEnd}
      >
        {/* Grid */}
        {renderGrid()}
        
        {/* Cursor indicators for other users */}
        {renderCursors()}
        
        {/* Schedule slots */}
        {slots.map((slot, index) => renderSlot(slot, index))}
        
        {/* Drop indicator */}
        {isDragging && (
          <div 
            className="absolute pointer-events-none border-2 border-indigo-300 border-dashed rounded-lg"
            style={{
              left: `${(canvasPosition.x - 100) / zoomLevel}px`,
              top: `${(canvasPosition.y - 50) / zoomLevel}px`,
              width: `${200 * zoomLevel}px`,
              height: `${100 * zoomLevel}px`,
              transform: `scale(${zoomLevel})`
            }}
          />
        )}
      </div>

      {/* Co-Organizer Presence Bar */}
      <CoOrganizerPresenceBar
        organizers={organizers}
        cursors={cursors}
        currentOrganizerId={organizerId}
        onCursorUpdate={handleCursorUpdate}
        syncStatus={syncStatus}
        isConnected={isConnected}
      />

      {/* Slot Form Modal */}
      {showSlotForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSlotForm(false);
            }
          }}
        >
          <form 
            onSubmit={handleFormSubmit}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-800">
                {editingSlot ? 'Edit Time Slot' : 'Add New Time Slot'}
              </h3>
              <button 
                type="button"
                onClick={() => setShowSlotForm(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Keynote Speech"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Main Stage"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Speaker
                </label>
                <input
                  type="text"
                  name="speaker"
                  value={formData.speaker}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                  placeholder="Description of the session..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleFormChange}
                  className="w-full h-8 rounded-lg border border-slate-200 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
              {editingSlot && (
                <button 
                  type="button"
                  onClick={() => handleDeleteSlot(editingSlot)}
                  className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-600 font-bold rounded-lg transition-colors text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
              
              <div className="flex-1" />
              
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setShowSlotForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1-4l-3 3m0 5l3-3m-3 3V4" />
                  </svg>
                  {editingSlot ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};



export default CollaborativeScheduler;
