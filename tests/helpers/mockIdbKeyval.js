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
  const val = globalThis.localStorage.getItem(key);
  return makeSyncThenable(val);
};

export const set = (key, val) => {
  globalThis.localStorage.setItem(key, val);
  return makeSyncThenable(undefined);
};

export const del = (key) => {
  globalThis.localStorage.removeItem(key);
  return makeSyncThenable(undefined);
};

export default {
  get,
  set,
  del
};
