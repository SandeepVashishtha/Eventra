import { describe, it, expect } from 'vitest';
import * as BuildEntry from '../build-entry.js';

describe('build-entry', () => {
  it('exports a module', () => {
    expect(BuildEntry).toBeDefined();
  });
});

