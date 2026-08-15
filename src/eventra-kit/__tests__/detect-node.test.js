import { describe, it, expect } from 'vitest';
import * as DetectNode from '../detect-node.js';

describe('detect-node', () => {
  it('exports a module', () => {
    expect(DetectNode).toBeDefined();
  });
});

