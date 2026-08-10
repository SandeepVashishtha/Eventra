
/**
 * adds a bottom-n helper.
 */
export function getBottom(array, n, key) {
  const sorted = [...array].sort((a, b) => {
    const av = key ? a[key] : a;
    const bv = key ? b[key] : b;
    return av - bv;
  });
  return sorted.slice(0, n);
}

