export const createCollaborationTransport = (
  roomId,
  {
    BroadcastChannelImpl = typeof BroadcastChannel === "undefined"
      ? null
      : BroadcastChannel,
    clientId = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `client-${Date.now()}`,
    onMessage,
  } = {},
) => {
  const channelName = `eventra-collaboration-${roomId}`;
  const channel = BroadcastChannelImpl ? new BroadcastChannelImpl(channelName) : null;

  if (channel && onMessage) {
    channel.onmessage = (event) => {
      if (event.data?.clientId !== clientId) onMessage(event.data);
    };
  }

  return {
    broadcast(action, data) {
      if (!channel || !action) return false;
      channel.postMessage({ action, data, roomId, clientId });
      return true;
    },
    close() {
      channel?.close();
    },
  };
};
