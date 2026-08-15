import { describe, it, expect } from 'vitest';
import * as ExtractNode from '../extract-node.js';

describe('extract-node', () => {
  it('exports a module', () => {
    expect(ExtractNode).toBeDefined();
  });
});

