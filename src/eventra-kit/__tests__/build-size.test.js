import { describe, it, expect } from 'vitest';
import * as BuildSize from '../build-size.js';

describe('build-size', () => {
  it('exports a module', () => {
    expect(BuildSize).toBeDefined();
  });
});

