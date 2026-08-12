import { describe, it, expect } from 'vitest';
import * as DeepEqual from '../deep-equal.js';

describe('deep-equal', () => {
  it('exports a module', () => {
    expect(DeepEqual).toBeDefined();
  });
});

