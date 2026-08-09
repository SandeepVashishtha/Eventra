
/**
 * adds an async retry helper.
 */
export async function retry(fn, { attempts = 3, delay = 1000, onError } = {}) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (onError) onError(err, i);
      if (i < attempts - 1) await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

