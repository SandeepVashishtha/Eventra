import React, { useState, useEffect, useRef, useCallback } from "react";
import { Headphones, MapPin, Volume2, VolumeX, Users } from "lucide-react";
import AvatarAudioNode from "./AvatarAudioNode";
import { SpatialAudioEngine } from "../../../utils/audio/spatialAudioEngine";

/**
 * Default participants for the spatial audio lounge
 */
const DEFAULT_PARTICIPANTS = [
  { id: "listener", name: "You", x: 150, y: 150, isMuted: false, isSpeaking: false },
  { id: "participant-1", name: "Alex", x: 80, y: 100, isMuted: false, isSpeaking: true },
  { id: "participant-2", name: "Sarah", x: 220, y: 120, isMuted: false, isSpeaking: false },
  { id: "participant-3", name: "David", x: 100, y: 200, isMuted: true, isSpeaking: false },
  { id: "participant-4", name: "Emma", x: 250, y: 220, isMuted: false, isSpeaking: true },
];

/**
 * SpatialLoungeCanvas - Interactive canvas floor plan for spatial audio positioning
 * 
 * This component provides a visual 2D floor plan where participants can move their avatars.
 * The spatial audio engine calculates real-time distance-based attenuation and stereo panning
 * for each participant based on their position relative to the listener.
 * 
 * @returns {JSX.Element} The spatial audio lounge canvas component
 */
export default function SpatialLoungeCanvas() {
  // State for participants
  const [participants, setParticipants] = useState(DEFAULT_PARTICIPANTS);
  
  // State for spatial audio engine
  const [engine] = useState(() => new SpatialAudioEngine("listener"));
  
  // State for audio controls
  const [isMuted, setIsMuted] = useState(false);
  const [maxDistance, setMaxDistance] = useState(200);
  const [rolloffFactor, setRolloffFactor] = useState(1.0);
  
  // Canvas ref for drawing
  const canvasRef = useRef(null);
  
  // Audio context ref
  const audioContextRef = useRef(null);
  
  // Initialize audio context and engine
  useEffect(() => {
    // Create audio context on user interaction (required by browsers)
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        
        // Initialize engine with audio context
        engine.initAudioContext(audioContextRef.current);
        
        // Update positions
        participants.forEach((p) => {
          engine.updatePosition(p.id, p.x, p.y);
        });
      }
    };
    
    // Try to initialize on mount, or wait for user interaction
    try {
      initAudioContext();
    } catch (e) {
      // Audio context creation requires user interaction
      const handleUserInteraction = () => {
        initAudioContext();
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
      };
      
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('keydown', handleUserInteraction);
    }
    
    return () => {
      // Cleanup
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close().catch(console.error);
      }
    };
  }, [engine, participants]);
  
  // Update engine positions when participants move
  useEffect(() => {
    participants.forEach((p) => {
      engine.updatePosition(p.id, p.x, p.y);
    });
    
    // Redraw canvas
    drawCanvas();
  }, [participants, engine, maxDistance]);
  
  // Draw the canvas floor plan
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Draw grid
    const gridSize = 20;
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw acoustic range circle for listener
    const listener = participants.find(p => p.id === "listener");
    if (listener) {
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(listener.x, listener.y, maxDistance, 0, Math.PI * 2);
      ctx.stroke();
      
      // Fill with gradient
      const gradient = ctx.createRadialGradient(
        listener.x, listener.y, 0,
        listener.x, listener.y, maxDistance
      );
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.1)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }, [participants, maxDistance]);
  
  // Handle canvas resize
  useEffect(() => {
    const observer = new ResizeObserver(drawCanvas);
    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }
    
    return () => observer.disconnect();
  }, [drawCanvas]);
  
  // Handle click on canvas to move listener
  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    // Update listener position
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === "listener" ? { ...p, x, y } : p
      )
    );
  }, []);
  
  // Handle participant movement
  const handleParticipantMove = useCallback((id, x, y) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, x, y } : p
      )
    );
  }, []);
  
  // Get acoustic coefficients for a participant
  const getAcousticCoefficients = useCallback((participantId) => {
    return engine.getAcousticCoefficients(participantId);
  }, [engine]);
  
  // Toggle mute for a participant
  const toggleParticipantMute = useCallback((id) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isMuted: !p.isMuted } : p
      )
    );
  }, []);
  
  // Toggle global mute
  const toggleGlobalMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);
  
  // Update max distance
  const handleMaxDistanceChange = useCallback((e) => {
    setMaxDistance(Number(e.target.value));
  }, []);
  
  // Update rolloff factor
  const handleRolloffChange = useCallback((e) => {
    setRolloffFactor(Number(e.target.value));
  }, []);
  
  // Apply settings to engine
  useEffect(() => {
    engine.setMaxDistance(maxDistance);
    engine.setRolloffFactor(rolloffFactor);
  }, [maxDistance, rolloffFactor, engine]);
  
  // Render participants
  const renderParticipants = () => {
    return participants.map((participant) => {
      const isListener = participant.id === "listener";
      const coefficients = isListener 
        ? { gain: 1.0, pan: 0.0 }
        : getAcousticCoefficients(participant.id);
      
      return (
        <AvatarAudioNode
          key={participant.id}
          participant={participant}
          isListener={isListener}
          acousticCoefficients={coefficients}
          onMove={handleParticipantMove}
          onToggleMute={toggleParticipantMute}
          maxDistance={maxDistance}
        />
      );
    });
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Headphones className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Real-Time Spatial Audio Distance Calculator
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Virtual Networking Lounge with 3D Positioning
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Global mute toggle */}
          <button
            onClick={toggleGlobalMute}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              isMuted
                ? "bg-rose-50 dark:bg-rose-950 text-rose-600 border border-rose-200 dark:border-rose-800"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            <span>{isMuted ? "Muted" : "Active"}</span>
          </button>
          
          {/* Participant count */}
          <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Users className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {participants.length}
            </span>
          </div>
        </div>
      </div>
      
      {/* Audio Settings Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Acoustic Settings
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Max Distance: {maxDistance}px
              </label>
              <input
                type="range"
                min="50"
                max="400"
                step="10"
                value={maxDistance}
                onChange={handleMaxDistanceChange}
                className="w-48 h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-indigo-600"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Rolloff Factor: {rolloffFactor}
              </label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={rolloffFactor}
                onChange={handleRolloffChange}
                className="w-48 h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-indigo-600"
              />
            </div>
          </div>
          
          <div className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
            <p className="text-xs text-indigo-700 dark:text-indigo-300">
              <strong>Tip:</strong> Adjust max distance to control how far audio travels. 
              Higher rolloff factor = faster volume drop-off with distance.
            </p>
          </div>
        </div>
        
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Controls
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                // Reset listener to center
                setParticipants((prev) =>
                  prev.map((p) =>
                    p.id === "listener" ? { ...p, x: 150, y: 150 } : p
                  )
                );
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium"
            >
              <MapPin className="w-4 h-4" />
              Reset Position
            </button>
            
            <button
              onClick={() => {
                // Add a new participant
                const newId = `participant-${participants.length}`;
                setParticipants((prev) => [
                  ...prev,
                  {
                    id: newId,
                    name: `User ${participants.length}`,
                    x: Math.random() * 200 + 50,
                    y: Math.random() * 200 + 50,
                    isMuted: false,
                    isSpeaking: Math.random() > 0.5
                  }
                ]);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors text-indigo-700 dark:text-indigo-300 font-medium"
            >
              <Users className="w-4 h-4" />
              Add Participant
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Canvas Floor Plan */}
      <div className="relative w-full h-[400px] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
        {/* Canvas element for background */}
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="absolute inset-0 cursor-pointer"
        />
        
        {/* Participant avatars (rendered above canvas) */}
        <div className="absolute inset-0">
          {renderParticipants()}
        </div>
        
        {/* Instruction overlay */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] font-mono text-slate-300">
            Click on the floor plan to move your avatar
          </span>
        </div>
        
        {/* Scale indicator */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700">
          <span className="text-[11px] font-mono text-slate-400">
            Scale: {maxDistance}px = 100% volume
          </span>
        </div>
      </div>
    </div>
  );
}
