/**
 * TypeScript definitions for InMemoryLockManager and distributed-lock utilities
 */
export class InMemoryLockManager {
  private locks: Map<string, any[]>;
  constructor();
  acquire(key: string, ttlMs?: number): Promise<() => void>;
}

export function getLockManager(): InMemoryLockManager;

export function withLock<T>(
  key: string,
  fn: () => Promise<T> | T,
  ttlMs?: number
): Promise<T>;
