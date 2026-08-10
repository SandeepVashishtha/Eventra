
/**
 * adds a url join helper.
 */
export function combineUrl(base, path) {
  return `${base.replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`;
}

