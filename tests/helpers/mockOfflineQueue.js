export const getQueueIndexedDB = async () => {
  if (globalThis.mockGetQueueIndexedDB) {
    return globalThis.mockGetQueueIndexedDB();
  }
  return [];
};

export const setQueue = async (queue, userId = null) => {
  if (globalThis.mockSetQueue) {
    return globalThis.mockSetQueue(queue, userId);
  }
};

export const clearQueue = async (userId = null) => {
  if (globalThis.mockClearQueue) {
    return globalThis.mockClearQueue(userId);
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
  if (!currentSession) return [];
  return queue.reduce((validatedItems, item) => {
    if (!item.sessionId) {
      validatedItems.push({ ...item, sessionId: currentSession });
      return validatedItems;
    }
    if (item.sessionId !== currentSession) {
      return validatedItems;
    }
    validatedItems.push(item);
    return validatedItems;
  }, []);
};
