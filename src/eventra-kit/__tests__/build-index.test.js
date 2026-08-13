import { describe, it, expect } from 'vitest';
import * as BuildIndex from '../build-index.js';

describe('build-index', () => {
  it('exports a module', () => {
    expect(BuildIndex).toBeDefined();
  });
});

