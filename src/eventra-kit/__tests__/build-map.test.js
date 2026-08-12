import { describe, it, expect } from 'vitest';
import * as BuildMap from '../build-map.js';

describe('build-map', () => {
  it('exports a module', () => {
    expect(BuildMap).toBeDefined();
  });
});

