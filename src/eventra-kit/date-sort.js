
/**
 * adds an ascending date sort.
 */
export function dateSort(array, key) {
  return [...array].sort((a, b) => {
    const av = key ? new Date(a[key]) : new Date(a);
    const bv = key ? new Date(b[key]) : new Date(b);
    return av.getTime() - bv.getTime();
  });
}

