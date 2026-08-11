import { describe, it, expect } from 'vitest';
import * as Tail from '../tail.js';

describe('tail', () => {
  it('exports a module', () => {
    expect(Tail).toBeDefined();
  });
});

