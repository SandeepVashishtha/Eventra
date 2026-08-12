import { describe, it, expect } from 'vitest';
import * as BuildSpace from '../build-space.js';

describe('build-space', () => {
  it('exports a module', () => {
    expect(BuildSpace).toBeDefined();
  });
});

