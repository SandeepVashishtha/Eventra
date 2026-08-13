
/**
 * adds a promise timeout wrapper.
 */
export function withTimeout(promise, ms, message = 'Operation timed out') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

