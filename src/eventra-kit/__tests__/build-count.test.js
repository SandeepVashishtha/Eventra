import { describe, it, expect } from 'vitest';
import * as BuildCount from '../build-count.js';

describe('build-count', () => {
  it('exports a module', () => {
    expect(BuildCount).toBeDefined();
  });
});

