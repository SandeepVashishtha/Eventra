
/**
 * adds a url param reader.
 */
export function getQueryParam(name, search = window.location.search) {
  return new URLSearchParams(search).get(name);
}

export function hasQueryParam(name, search = window.location.search) {
  return new URLSearchParams(search).has(name);
}

