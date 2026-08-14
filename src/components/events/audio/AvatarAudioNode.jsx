import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, User, Move } from "lucide-react";

/**
 * AvatarAudioNode - Individual participant avatar with audio visualization
 * 
 * This component represents a participant in the spatial audio lounge. It displays
 * the participant's avatar, name, mute status, and real-time acoustic coefficients
 * (volume gain and stereo pan).
 * 
 * @param {Object} props - Component props
 * @param {Object} props.participant - Participant data (id, name, x, y, isMuted, isSpeaking)
 * @param {boolean} props.isListener - Whether this is the listener (current user)
 * @param {Object} props.acousticCoefficients - Audio coefficients (gain, pan)
 * @param {Function} props.onMove - Callback for participant movement
 * @param {Function} props.onToggleMute - Callback for mute toggle
 * @param {number} props.maxDistance - Maximum audio distance
 * @returns {JSX.Element} The avatar audio node component
 */
export default function AvatarAudioNode({
  participant = { id: "user-1", name: "Alex", x: 100, y: 120, isMuted: false, isSpeaking: false },
  isListener = false,
  acousticCoefficients = { gain: 1.0, pan: 0.0 },
  onMove,
  onToggleMute,
  maxDistance = 200,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef(null);
  
  // Calculate distance from listener for visualization
  const distanceFromListener = useRef(0);
  
  // Update distance when position changes
  useEffect(() => {
    if (nodeRef.current && !isListener) {
      const listener = document.querySelector('[data-participant-id="listener"]');
      if (listener) {
        const rect = nodeRef.current.getBoundingClientRect();
        const listenerRect = listener.getBoundingClientRect();
        const dx = rect.left + rect.width / 2 - (listenerRect.left + listenerRect.width / 2);
        const dy = rect.top + rect.height / 2 - (listenerRect.top + listenerRect.height / 2);
        distanceFromListener.current = Math.sqrt(dx * dx + dy * dy);
      }
    }
  }, [participant.x, participant.y, isListener]);
  
  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e) => {
    if (!onMove) return;
    
    setIsDragging(true);
    
    // Calculate offset from top-left corner
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    
    e.stopPropagation();
    e.preventDefault();
  }, [onMove]);
  
  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !onMove || !nodeRef.current) return;
    
    const canvas = nodeRef.current.parentElement?.parentElement;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left - dragOffset.x);
    const y = Math.round(e.clientY - rect.top - dragOffset.y);
    
    // Call onMove with new position
    onMove(participant.id, x, y);
  }, [isDragging, onMove, participant.id, dragOffset]);
  
  // Handle mouse up for dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  // Calculate volume percentage
  const volumePercent = Math.round(acousticCoefficients.gain * 100);
  
  // Calculate pan direction
  const panDirection = acousticCoefficients.pan > 0 ? "Right" : acousticCoefficients.pan < 0 ? "Left" : "Center";
  
  // Determine avatar color based on role and state
  const getAvatarColor = () => {
    if (isListener) {
      return "bg-indigo-600 ring-4 ring-indigo-400/50";
    }
    if (participant.isSpeaking) {
      return "bg-emerald-600 ring-2 ring-emerald-400/60 animate-pulse";
    }
    if (participant.isMuted) {
      return "bg-slate-600 ring-2 ring-slate-400/30";
    }
    return "bg-emerald-600 ring-2 ring-emerald-400/30";
  };
  
  // Calculate distance-based opacity
  const getOpacity = () => {
    if (isListener) return 1.0;
    const normalizedDistance = Math.min(1.0, distanceFromListener.current / maxDistance);
    return 0.7 + 0.3 * (1.0 - normalizedDistance);
  };
  
  return (
    <div
      ref={nodeRef}
      data-participant-id={participant.id}
      className={`absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none transition-all duration-200 ${
        isDragging ? "z-50 scale-110" : "z-10"
      }`}
      style={{
        left: `${participant.x}px`,
        top: `${participant.y}px`,
        opacity: getOpacity(),
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Avatar Circle */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-transform ${
          getAvatarColor()
        } ${isDragging ? "shadow-xl scale-105" : "hover:scale-110"}`}
      >
        {participant.name.split(' ')[0][0].toUpperCase()}
      </div>
      
      {/* Drag handle indicator (shown when hoverable) */}
      {onMove && !isListener && (
        <div className="absolute -top-2 -right-2 p-0.5 rounded-full bg-slate-800 border border-slate-700 text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <Move className="w-3 h-3 text-indigo-400" />
        </div>
      )}
      
      {/* Label and Audio Info */}
      <div className="mt-2 px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-[10px] text-white flex flex-col items-center gap-0.5 opacity-90">
        <span className="font-semibold">
          {participant.name} {isListener && "(You)"}
        </span>
        
        {/* Audio coefficients display */}
        {!isListener && (
          <>
            {/* Volume and Pan */}
            <div className="flex gap-1 text-[9px] text-indigo-300 font-mono">
              <span>Vol: {volumePercent}%</span>
              <span className="text-slate-400">|</span>
              <span>Pan: {acousticCoefficients.pan.toFixed(2)}</span>
            </div>
            
            {/* Direction indicator */}
            <div className="text-[8px] text-slate-400">
              {panDirection}
            </div>
          </>
        )}
        
        {/* Distance indicator */}
        {!isListener && distanceFromListener.current > 0 && (
          <div className="text-[8px] text-slate-500">
            {Math.round(distanceFromListener.current)}px away
          </div>
        )}
      </div>
      
      {/* Mic Status Icon */}
      <div 
        className={`absolute -top-1 -right-1 p-0.5 rounded-full backdrop-blur-sm border transition-all ${
          isListener 
            ? "bg-indigo-600/20 border-indigo-400/30" 
            : participant.isMuted 
              ? "bg-rose-600/20 border-rose-400/30" 
              : "bg-emerald-600/20 border-emerald-400/30"
        }`}
        onClick={(e) => {
          if (onToggleMute && !isListener) {
            onToggleMute(participant.id);
            e.stopPropagation();
          }
        }}
      >
        {participant.isMuted ? (
          <MicOff className="w-3 h-3 text-rose-400" />
        ) : (
          <Mic className={`w-3 h-3 transition-colors ${
            participant.isSpeaking ? "text-emerald-400" : "text-emerald-500"
          }`} />
        )}
      </div>
      
      {/* Mute button overlay (for non-listener participants) */}
      {onToggleMute && !isListener && (
        <button
          onClick={(e) => {
            onToggleMute(participant.id);
            e.stopPropagation();
          }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] text-slate-300 hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 whitespace-nowrap"
        >
          {participant.isMuted ? "Unmute" : "Mute"}
        </button>
      )}
    </div>
  );
}
