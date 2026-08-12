import { describe, it, expect } from 'vitest';
import * as VersionCompare from '../version-compare.js';

describe('version-compare', () => {
  it('exports a module', () => {
    expect(VersionCompare).toBeDefined();
  });
});

