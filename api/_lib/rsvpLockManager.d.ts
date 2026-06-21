/**
 * TypeScript definitions for RsvpLockManager
 */
export class RsvpLockManager {
  private counters: Map<string, number>;
  constructor();
  increment(eventId: string): number;
  decrement(eventId: string): number;
  getCount(eventId: string): number;
  reset(): void;
}

export const rsvpLockManager: RsvpLockManager;
