import { describe, it, expect } from 'vitest';
import * as CountNode from '../count-node.js';

describe('count-node', () => {
  it('exports a module', () => {
    expect(CountNode).toBeDefined();
  });
});

