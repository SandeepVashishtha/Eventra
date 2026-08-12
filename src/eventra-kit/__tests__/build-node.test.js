import { describe, it, expect } from 'vitest';
import * as BuildNode from '../build-node.js';

describe('build-node', () => {
  it('exports a module', () => {
    expect(BuildNode).toBeDefined();
  });
});

