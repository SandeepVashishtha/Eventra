import { describe, it, expect } from 'vitest';
import * as NormalizePath from '../normalize-path.js';

describe('normalize-path', () => {
  it('exports a module', () => {
    expect(NormalizePath).toBeDefined();
  });
});

