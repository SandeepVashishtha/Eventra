
/**
 * adds a plural rule helper.
 */
export function pluralRules(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

