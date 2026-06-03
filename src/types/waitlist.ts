/**
 * waitlist.ts
 * TypeScript type definitions for the Event Waitlist System.
 */

export type WaitlistStatus = 'waiting' | 'promoted' | 'removed';

export interface WaitlistRecord {
  id?: number | string;
  userId: string;
  userEmail?: string;
  userName?: string;
  eventId: number;
  joinedAt: string;
  status: WaitlistStatus;
  promotedAt?: string;
  removedAt?: string;
}

export interface WaitlistQueueInfo {
  eventId: number;
  queuePosition: number; // 1-indexed, or -1 if not waiting
  record: WaitlistRecord | null;
}
