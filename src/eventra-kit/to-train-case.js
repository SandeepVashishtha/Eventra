
/**
 * adds a train-case converter.
 */
export function toTrainCase(str) {
  return String(str).replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\s_-]+/g, '-').toLowerCase().replace(/(^|-)(\w)/g, (m) => m.toUpperCase());
}

