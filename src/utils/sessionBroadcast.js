// src/utils/sessionBroadcast.js

export const SESSION_CHANNEL_NAME = "eventra_session";
export const SESSION_TERMINATED = "SESSION_TERMINATED";

let _channel = null;

export const getSessionChannel = () => {
  if (!_channel && typeof window !== "undefined" && "BroadcastChannel" in window) {
    _channel = new BroadcastChannel(SESSION_CHANNEL_NAME);
  }
  return _channel;
};

export const broadcastSessionTerminated = () => {
  const ch = getSessionChannel();
  if (ch) {
    ch.postMessage({ type: SESSION_TERMINATED });
  }
};

export const closeSessionChannel = () => {
  if (_channel) {
    _channel.close();
    _channel = null;
  }
};
