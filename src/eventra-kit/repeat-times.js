
/**
 * adds a repeat helper.
 */
export function repeatTimes(count, fn) {
  for (let i = 0; i < count; i++) fn(i);
}

