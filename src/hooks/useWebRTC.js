/**
 * useWebRTC.js
 * 
 * Custom hook to manage P2P media streams for virtual networking.
 * Simulates WebRTC signaling and stream management.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";

export const useWebRTC = (roomId) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isInCall, setIsInCall] = useState(false);
  const peersRef = useRef({});

  const startCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsInCall(true);
      
      // Simulate discovering other peers in the room
      setTimeout(() => {
        setRemoteStreams([
          { id: "p1", name: "Sarah", stream: null, muted: false },
          { id: "p2", name: "Alex", stream: null, muted: true }
        ]);
        toast.info("Connected to networking lounge");
      }, 1000);
    } catch (error) {
      toast.error("Failed to access camera/microphone");
    }
  }, []);

  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStreams([]);
    setIsInCall(false);
  }, [localStream]);

  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
    }
  }, [localStream]);

  return {
    localStream,
    remoteStreams,
    isInCall,
    startCall,
    endCall,
    toggleMute
  };
};
