/**
 * adds url query helpers.
 */
export function parseQueryString(search) {
  const params = new URLSearchParams(search || window.location.search);
  const out = {};
  params.forEach((v, k) => {
    if (out[k]) {
      out[k] = Array.isArray(out[k]) ? [...out[k], v] : [out[k], v];
    } else {
      out[k] = v;
    }
  });
  return out;
}

export function buildQueryString(params) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach(item => usp.append(k, item));
    else usp.append(k, v);
  });
  return usp.toString();
}
