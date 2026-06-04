/**
 * @hook useCollaboration
 *
 * @description
 * **⚠️ Stub implementation — not production-ready.**
 * Simulates a real-time collaborative session for the floor plan designer.
 * Connection, user presence, cursor sync, and change broadcasting are all
 * mocked with hardcoded data and timers. A real implementation would use
 * Yjs (CRDT) over y-webrtc or a WebSocket provider.
 *
 * @param {string} roomId - Unique room identifier. The effect re-runs whenever
 *                          this changes. Passing a falsy value skips connection.
 *
 * @returns {{ users, isConnected, syncStatus, updateCursor, broadcastChange }}
 *
 * @returns {Array<{id,name,color,cursor}>} users         - Hardcoded presence list.
 * @returns {boolean}                       isConnected   - True ~1.5 s after mount.
 * @returns {'disconnected'|'syncing'|'synced'} syncStatus
 * @returns {(x,y) => void}                 updateCursor  - Updates local cursor only; does not broadcast.
 * @returns {(action,data) => void}         broadcastChange - No-op; arguments are ignored.
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

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
    // Simulated broadcast
    setSyncStatus("syncing");
    setTimeout(() => setSyncStatus("synced"), 300);
  }, []);

  return {
    users,
    isConnected,
    syncStatus,
    updateCursor,
    broadcastChange
  };
};
