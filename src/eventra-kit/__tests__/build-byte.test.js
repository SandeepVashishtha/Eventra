import { describe, it, expect } from 'vitest';
import * as BuildByte from '../build-byte.js';

describe('build-byte', () => {
  it('exports a module', () => {
    expect(BuildByte).toBeDefined();
  });
});

