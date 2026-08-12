import { describe, it, expect } from 'vitest';
import * as SeededRandom from '../seeded-random.js';

describe('seeded-random', () => {
  it('exports a module', () => {
    expect(SeededRandom).toBeDefined();
  });
});

