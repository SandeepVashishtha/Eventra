
/**
 * adds a polling helper.
 */
export async function waitFor(predicate, { timeout = 10000, interval = 100 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await predicate()) return true;
    await new Promise(r => setTimeout(r, interval));
  }
  return false;
}

