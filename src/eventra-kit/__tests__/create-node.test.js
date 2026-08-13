import { describe, it, expect } from 'vitest';
import * as CreateNode from '../create-node.js';

describe('create-node', () => {
  it('exports a module', () => {
    expect(CreateNode).toBeDefined();
  });
});

