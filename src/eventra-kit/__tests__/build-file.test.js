import { describe, it, expect } from 'vitest';
import * as BuildFile from '../build-file.js';

describe('build-file', () => {
  it('exports a module', () => {
    expect(BuildFile).toBeDefined();
  });
});

