/**
 * useCollaboration.js
 * 
 * Custom hook to handle real-time WebRTC and CRDT (Yjs) synchronization.
 * This simulates the multiplayer connection for the floor plan designer.
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { createCollaborationTransport } from "../utils/collaborationTransport";

export const useCollaboration = (roomId) => {
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState("disconnected"); // disconnected, syncing, synced

  useEffect(() => {
    if (!roomId) return;
    
    // Simulate connection
    setSyncStatus("syncing");
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
      setSyncStatus("synced");
      setUsers([
        { id: "u1", name: "You", color: "#6366f1", cursor: { x: 0, y: 0 } },
        { id: "u2", name: "Alex T.", color: "#ec4899", cursor: { x: 100, y: 200 } },
        { id: "u3", name: "Samira K.", color: "#10b981", cursor: { x: 300, y: 150 } }
      ]);
      toast.success("Connected to collaborative session");
    }, 1500);

    return () => {
      clearTimeout(connectTimer);
      setIsConnected(false);
      setUsers([]);
      setSyncStatus("disconnected");
    };
  }, [roomId]);

  const updateCursor = useCallback((x, y) => {
    // In a real app, this would broadcast cursor position via WebRTC/WebSockets
    setUsers(prev => prev.map(u => u.id === "u1" ? { ...u, cursor: { x, y } } : u));
  }, []);

  const broadcastChange = useCallback((action, data) => {
    const transport = createCollaborationTransport(roomId);
    setSyncStatus("syncing");
    const delivered = transport.broadcast(action, data);
    transport.close();
    setSyncStatus(delivered ? "synced" : "disconnected");
    return delivered;
  }, [roomId]);

  return {
    users,
    isConnected,
    syncStatus,
    updateCursor,
    broadcastChange
  };
};
