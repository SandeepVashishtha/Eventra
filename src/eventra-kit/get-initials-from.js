
/**
 * adds a names initials helper.
 */
export function getInitialsFrom(names) {
  return names.map((n) => n.split(/\s+/).map((w) => w[0].toUpperCase()).join(''));
}

