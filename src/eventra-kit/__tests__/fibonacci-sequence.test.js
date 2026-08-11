import { describe, it, expect } from 'vitest';
import * as FibonacciSequence from '../fibonacci-sequence.js';

describe('fibonacci-sequence', () => {
  it('exports a module', () => {
    expect(FibonacciSequence).toBeDefined();
  });
});

