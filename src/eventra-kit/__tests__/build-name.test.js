import { describe, it, expect } from 'vitest';
import * as BuildName from '../build-name.js';

describe('build-name', () => {
  it('exports a module', () => {
    expect(BuildName).toBeDefined();
  });
});

