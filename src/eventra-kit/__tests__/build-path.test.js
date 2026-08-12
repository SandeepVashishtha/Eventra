import { describe, it, expect } from 'vitest';
import * as BuildPath from '../build-path.js';

describe('build-path', () => {
  it('exports a module', () => {
    expect(BuildPath).toBeDefined();
  });
});

