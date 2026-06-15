export class ConcurrencyLimiter {
  concurrency: number;
  queue: Array<() => void>;
  activeCount: number;
  constructor(concurrency: number);
  run<T>(fn: () => Promise<T> | T): Promise<T>;
  private _next(): void;
}

export function createConcurrencyLimiter(concurrency: number): {
  run<T>(fn: () => Promise<T> | T): Promise<T>;
};

export function runAll<T>(limit: number, fns: Array<() => Promise<T> | T>): Promise<T[]>;
