import { describe, it, expect } from 'vitest';
import * as BuildTree from '../build-tree.js';

describe('build-tree', () => {
  it('exports a module', () => {
    expect(BuildTree).toBeDefined();
  });
});

