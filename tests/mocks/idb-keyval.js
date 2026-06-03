class SyncPromise {
  constructor(executor) {
    let resolvedValue;
    let rejectedError;
    let status = "pending";

    const resolve = (val) => {
      status = "fulfilled";
      resolvedValue = val;
    };
    const reject = (err) => {
      status = "rejected";
      rejectedError = err;
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }

    this.status = status;
    this.value = resolvedValue;
    this.error = rejectedError;
  }

  then(onFulfilled, onRejected) {
    if (this.status === "fulfilled") {
      if (!onFulfilled) return this;
      try {
        const nextVal = onFulfilled(this.value);
        if (nextVal && typeof nextVal.then === "function") {
          return nextVal;
        }
        return new SyncPromise((res) => res(nextVal));
      } catch (err) {
        if (onRejected) {
          try {
            const nextVal = onRejected(err);
            return new SyncPromise((res) => res(nextVal));
          } catch (e) {
            return new SyncPromise((res, rej) => rej(e));
          }
        }
        return new SyncPromise((res, rej) => rej(err));
      }
    }
    if (this.status === "rejected") {
      if (!onRejected) return this;
      try {
        const nextVal = onRejected(this.error);
        return new SyncPromise((res) => res(nextVal));
      } catch (e) {
        return new SyncPromise((res, rej) => rej(e));
      }
    }
    return this;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(onFinally) {
    try {
      onFinally();
    } catch (e) {
      // Ignore or propagate
    }
    return this;
  }
}

export function get(key) {
  return new SyncPromise((resolve) => {
    if (global.localStorage) {
      resolve(global.localStorage.getItem(key));
    } else {
      resolve(null);
    }
  });
}

export function set(key, value) {
  return new SyncPromise((resolve) => {
    if (global.localStorage) {
      global.localStorage.setItem(key, value);
    }
    resolve();
  });
}
