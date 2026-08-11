import { useState, useEffect, useRef, useCallback } from "react";
import WebRTCPeerManager from "../../../utils/webrtcPeerManager";

export function useWebRTCSignaling(roomId = "hackathon-room-1", user = null) {
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [activePeers, setActivePeers] = useState([]);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [incomingCodeDelta, setIncomingCodeDelta] = useState(null);
  const [incomingCanvasStroke, setIncomingCanvasStroke] = useState(null);
  const [peerCursors, setPeerCursors] = useState({});

  const peerIdRef = useRef(user?.id || `peer-${Math.random().toString(36).substr(2, 6)}`);
  const peerManagerRef = useRef(null);

  const handlePeerMessage = useCallback((senderId, data) => {
    if (!data || !data.type) return;

    switch (data.type) {
      case "CODE_DELTA":
        setIncomingCodeDelta({ senderId, payload: data.payload, timestamp: data.timestamp });
        break;

      case "CANVAS_STROKE":
        setIncomingCanvasStroke({ senderId, payload: data.payload, timestamp: data.timestamp });
        break;

      case "CURSOR_MOVE":
        setPeerCursors((prev) => ({
          ...prev,
          [senderId]: data.payload,
        }));
        break;

      default:
        break;
    }
  }, []);

  const handleStatusChange = useCallback((targetPeerId, status) => {
    setActivePeers((prev) => {
      const exists = prev.includes(targetPeerId);
      if (status === "connected" && !exists) {
        return [...prev, targetPeerId];
      }
      if ((status === "disconnected" || status === "failed" || status === "closed") && exists) {
        return prev.filter((id) => id !== targetPeerId);
      }
      return prev;
    });

    if (status === "connected") {
      setConnectionStatus("connected");
    }
  }, []);

  useEffect(() => {
    const manager = new WebRTCPeerManager(
      roomId,
      peerIdRef.current,
      handlePeerMessage,
      handleStatusChange
    );
    peerManagerRef.current = manager;

    // Simulate connecting to room & signaling setup
    const timer = setTimeout(() => {
      setConnectionStatus("connected");
      // Add mock peer for demo/collaboration fallback if offline
      setActivePeers(["peer-teammate-alex", "peer-teammate-sarah"]);
    }, 800);

    return () => {
      clearTimeout(timer);
      manager.destroy();
    };
  }, [roomId, handlePeerMessage, handleStatusChange]);

  const broadcastCodeChange = useCallback((code, language) => {
    if (peerManagerRef.current) {
      peerManagerRef.current.broadcast("CODE_DELTA", { code, language });
    }
  }, []);

  const broadcastCanvasStroke = useCallback((strokeData) => {
    if (peerManagerRef.current) {
      peerManagerRef.current.broadcast("CANVAS_STROKE", strokeData);
    }
  }, []);

  const broadcastCursorPosition = useCallback((cursorPos) => {
    if (peerManagerRef.current) {
      peerManagerRef.current.broadcast("CURSOR_MOVE", cursorPos);
    }
  }, []);

  const toggleMic = useCallback(async () => {
    if (peerManagerRef.current) {
      if (!peerManagerRef.current.localStream) {
        await peerManagerRef.current.initLocalStream(true, isVideoActive);
      }
      const active = peerManagerRef.current.toggleAudio();
      setIsAudioActive(active);
    }
  }, [isVideoActive]);

  const toggleCamera = useCallback(async () => {
    if (peerManagerRef.current) {
      if (!peerManagerRef.current.localStream) {
        await peerManagerRef.current.initLocalStream(isAudioActive, true);
      }
      const active = peerManagerRef.current.toggleVideo();
      setIsVideoActive(active);
    }
  }, [isAudioActive]);

  return {
    peerId: peerIdRef.current,
    connectionStatus,
    activePeers,
    isAudioActive,
    isVideoActive,
    incomingCodeDelta,
    incomingCanvasStroke,
    peerCursors,
    broadcastCodeChange,
    broadcastCanvasStroke,
    broadcastCursorPosition,
    toggleMic,
    toggleCamera,
  };
}

export default useWebRTCSignaling;
