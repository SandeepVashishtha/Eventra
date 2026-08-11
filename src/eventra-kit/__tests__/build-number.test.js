import { describe, it, expect } from 'vitest';
import * as BuildNumber from '../build-number.js';

describe('build-number', () => {
  it('exports a module', () => {
    expect(BuildNumber).toBeDefined();
  });
});

