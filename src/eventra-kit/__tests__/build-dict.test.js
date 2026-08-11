import { describe, it, expect } from 'vitest';
import * as BuildDict from '../build-dict.js';

describe('build-dict', () => {
  it('exports a module', () => {
    expect(BuildDict).toBeDefined();
  });
});

