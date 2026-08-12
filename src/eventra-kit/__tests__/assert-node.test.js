import { describe, it, expect } from 'vitest';
import * as AssertNode from '../assert-node.js';

describe('assert-node', () => {
  it('exports a module', () => {
    expect(AssertNode).toBeDefined();
  });
});

