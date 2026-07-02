export const getQueueIndexedDB = async () => {
  if (globalThis.mockGetQueueIndexedDB) {
    return globalThis.mockGetQueueIndexedDB();
  }
  return [];
};

export const setQueue = async (queue) => {
  if (globalThis.mockSetQueue) {
    return globalThis.mockSetQueue(queue);
  }
};

export const clearQueue = async () => {
  if (globalThis.mockClearQueue) {
    return globalThis.mockClearQueue();
  }
};

export const filterQueueByOwnership = (queue, userId) => {
  if (globalThis.mockFilterQueueByOwnership) {
    return globalThis.mockFilterQueueByOwnership(queue, userId);
  }
  return queue.filter((item) => item.userId === userId);
};

export const validateQueueSession = (queue, currentSession) => {
  if (globalThis.mockValidateQueueSession) {
    return globalThis.mockValidateQueueSession(queue, currentSession);
  }
  return queue.filter((item) => !item.sessionId || item.sessionId === currentSession);
};
