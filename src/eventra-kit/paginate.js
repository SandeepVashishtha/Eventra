
/**
 * adds a pagination helper.
 */
export function paginate(array, page, perPage) {
  const start = (page - 1) * perPage;
  return array.slice(start, start + perPage);
}

export function pageCount(total, perPage) {
  return Math.ceil(total / perPage);
}

