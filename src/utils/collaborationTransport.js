export const createCollaborationTransport = (
  roomId,
  {
    BroadcastChannelImpl =
      typeof BroadcastChannel === "undefined"
        ? null
        : BroadcastChannel,
    clientId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `client-${Date.now()}`,
    onMessage,
  } = {},
) => {
  const channelName = `eventra-collaboration-${roomId}`;
  const channel = BroadcastChannelImpl
    ? new BroadcastChannelImpl(channelName)
    : null;

  const isValidMessage = (message) => {
    if (!message || typeof message !== "object") return false;

    if (typeof message.action !== "string") return false;

    if (typeof message.roomId !== "string") return false;

    if (typeof message.clientId !== "string") return false;

    return true;
  };

  if (channel && onMessage) {
  channel.onmessage = (event) => {
    const message = event.data;

    if (!isValidMessage(message)) return;

    if (message.clientId !== clientId) {
      onMessage(message);
    }
  };
}

  return {
    broadcast(action, data) {
      if (!channel || !action) return false;

      channel.postMessage({
        action,
        data,
        roomId,
        clientId,
      });

      return true;
    },

    close() {
      channel?.close();
    },
  };
};
