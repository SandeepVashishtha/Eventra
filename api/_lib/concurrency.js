export function createConcurrencyLimiter(concurrency) {
  if (concurrency < 1) {
    throw new Error("Concurrency must be at least 1");
  }
  const queue = [];
  let activeCount = 0;

  function next() {
    activeCount--;
    if (queue.length > 0) {
      const entry = queue.shift();
      entry();
    }
  }

  async function run(fn) {
    if (activeCount >= concurrency) {
      await new Promise((resolve) => {
        queue.push(resolve);
      });
    }
    activeCount++;
    try {
      return await fn();
    } finally {
      next();
    }
  }

  return { run };
}

export async function runAll(limit, fns) {
  if (!Array.isArray(fns) || fns.length === 0) {
    return [];
  }
  const limiter = createConcurrencyLimiter(limit);
  return Promise.all(fns.map((fn) => limiter.run(fn)));
}
