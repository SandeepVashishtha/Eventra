import { describe, it, expect } from 'vitest';
import * as ShuffleDeterministic from '../shuffle-deterministic.js';

describe('shuffle-deterministic', () => {
  it('exports a module', () => {
    expect(ShuffleDeterministic).toBeDefined();
  });
});

