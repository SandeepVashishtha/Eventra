import { describe, it, expect } from 'vitest';
import * as BuildKey from '../build-key.js';

describe('build-key', () => {
  it('exports a module', () => {
    expect(BuildKey).toBeDefined();
  });
});

