/**
 * @file registrationLocks.js
 * @module utils/registrationLocks
 *
 * @description
 * Module-level `Map` singleton used as a double-submit guard for event
 * registration.  Because this Map lives at module scope it is shared across
 * **all** component instances and hook invocations, which means that even
 * two separate browser tabs registering for the same event will share the
 * same lock.
 *
 * Usage:
 * ```js
 * import registrationLocks from "../../utils/registrationLocks";
 *
 * registrationLocks.set(eventId, true);
 * // … async work …
 * registrationLocks.delete(eventId);
 * ```
 *
 * @type {Map<string|number, boolean>}
 */
const registrationLocks = new Map();

export default registrationLocks;
