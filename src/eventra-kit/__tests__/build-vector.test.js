import { describe, it, expect } from 'vitest';
import * as BuildVector from '../build-vector.js';

describe('build-vector', () => {
  it('exports a module', () => {
    expect(BuildVector).toBeDefined();
  });
});

