import { describe, it, expect } from 'vitest';
import * as BuildGraph from '../build-graph.js';

describe('build-graph', () => {
  it('exports a module', () => {
    expect(BuildGraph).toBeDefined();
  });
});

