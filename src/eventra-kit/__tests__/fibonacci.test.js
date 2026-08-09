import { describe, it, expect } from 'vitest';
import * as Fibonacci from '../fibonacci.js';

describe('fibonacci', () => {
  it('exports a module', () => {
    expect(Fibonacci).toBeDefined();
  });
});

