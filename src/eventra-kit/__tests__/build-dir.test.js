import { describe, it, expect } from 'vitest';
import * as BuildDir from '../build-dir.js';

describe('build-dir', () => {
  it('exports a module', () => {
    expect(BuildDir).toBeDefined();
  });
});

