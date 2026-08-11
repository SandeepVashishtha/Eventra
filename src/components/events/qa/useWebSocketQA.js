import { useState, useEffect } from "react";
import { WebSocketConnectionManager } from "./WebSocketConnectionManager";

export default function useWebSocketQA(streamUrl) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!streamUrl) return;

    const manager = new WebSocketConnectionManager(streamUrl);

    manager.connect(
      () => setConnected(true),
      () => setConnected(false)
    );

    return () => {
      manager.cleanup();
    };
  }, [streamUrl]);

  return {
    messages,
    connected,
  };
}
