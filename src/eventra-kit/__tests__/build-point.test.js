import { describe, it, expect } from 'vitest';
import * as BuildPoint from '../build-point.js';

describe('build-point', () => {
  it('exports a module', () => {
    expect(BuildPoint).toBeDefined();
  });
});

