import { describe, it, expect } from 'vitest';
import * as BuildEdge from '../build-edge.js';

describe('build-edge', () => {
  it('exports a module', () => {
    expect(BuildEdge).toBeDefined();
  });
});

