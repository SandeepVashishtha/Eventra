import { describe, it, expect } from 'vitest';
import * as EnsureNode from '../ensure-node.js';

describe('ensure-node', () => {
  it('exports a module', () => {
    expect(EnsureNode).toBeDefined();
  });
});

