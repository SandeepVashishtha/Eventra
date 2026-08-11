
/**
 * adds an event guard helper.
 */
export function preventDefault(event) {
  event.preventDefault();
  return event;
}

export function stopPropagation(event) {
  event.stopPropagation();
  return event;
}

