import { describe, it, expect } from 'vitest';
import * as BuildSet from '../build-set.js';

describe('build-set', () => {
  it('exports a module', () => {
    expect(BuildSet).toBeDefined();
  });
});

