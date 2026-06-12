const makeSyncThenable = (value, isError = false) => {
  const thenable = {
    then(onFulfilled, onRejected) {
      try {
        if (!isError) {
          const res = onFulfilled ? onFulfilled(value) : value;
          return makeSyncThenable(res);
        } else {
          const res = onRejected ? onRejected(value) : undefined;
          return makeSyncThenable(res);
        }
      } catch (err) {
        return makeSyncThenable(err, true);
      }
    },
    catch(onRejected) {
      if (isError) {
        try {
          const res = onRejected ? onRejected(value) : undefined;
          return makeSyncThenable(res);
        } catch (err) {
          return makeSyncThenable(err, true);
        }
      }
      return this;
    },
    finally(onFinally) {
      if (onFinally) onFinally();
      return this;
    }
  };
  return thenable;
};

export const get = (key) => {
  if (globalThis._mockIdbStore) {
    const val = globalThis._mockIdbStore[key];
    return makeSyncThenable(val !== undefined ? val : null);
  }
  const val = globalThis.localStorage.getItem(key);
  return makeSyncThenable(val);
};

export const set = (key, val) => {
  if (globalThis._mockIdbStore) {
    globalThis._mockIdbStore[key] = val;
    return makeSyncThenable(undefined);
  }
  globalThis.localStorage.setItem(key, val);
  return makeSyncThenable(undefined);
};

export const del = (key) => {
  if (globalThis._mockIdbStore) {
    delete globalThis._mockIdbStore[key];
    return makeSyncThenable(undefined);
  }
  globalThis.localStorage.removeItem(key);
  return makeSyncThenable(undefined);
};

export const clear = () => {
  if (globalThis._mockIdbStore) {
    for (const k of Object.keys(globalThis._mockIdbStore)) {
      delete globalThis._mockIdbStore[k];
    }
    return makeSyncThenable(undefined);
  }
  globalThis.localStorage.clear();
  return makeSyncThenable(undefined);
};

export default {
  get,
  set,
  del,
  clear
};
